import { Router } from 'express';
import multer from 'multer';
import { db } from './db.js';
import { config } from './config.js';
import { requireAuth } from './auth.js';
import { extractFile, groupFiles } from './gemini.js';

const router = Router();
router.use(requireAuth);

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png'];

const upload = multer({
storage: multer.memoryStorage(),
limits: {
fileSize: 10 * 1024 * 1024,
files: 6,
},
fileFilter: (_req, file, cb) => {
cb(null, ALLOWED.includes(file.mimetype));
},
});

// Count today's analyses using the database's current date.
const usedToday = async (userId) => {
const result = await db.query(
`SELECT COUNT(*) AS n
     FROM analyses
     WHERE user_id = $1
       AND created_at >= CURRENT_DATE
       AND created_at < CURRENT_DATE + INTERVAL '1 day'`,
[userId]
);

return Number(result.rows[0].n);
};

router.post(
'/',
(req, res, next) =>
upload.array('files', 6)(req, res, (err) => {
if (!err) return next();

  const big = err.code === 'LIMIT_FILE_SIZE';

  res.status(400).json({
    error: big
      ? 'Each file must be under 10 MB.'
      : 'Upload failed. Use up to 6 files.',
  });
}),

async (req, res, next) => {
let reservedId = null;

try {
  const files = req.files ?? [];

  if (!files.length) {
    return res.status(400).json({
      error: 'Add at least one PDF, JPG or PNG file.',
    });
  }

  // Reserve a database row before analysis starts.
  const insert = await db.query(
  'INSERT INTO analyses (user_id, result) VALUES ($1, $2) RETURNING id',
  [req.userId, '{"pending":true}']
);

  reservedId = Number(insert.rows[0].id);

  if ((await usedToday(req.userId)) > config.dailyLimit) {
    await db.query(
      'DELETE FROM analyses WHERE id = $1 AND user_id = $2',
      [reservedId, req.userId]
    );

    reservedId = null;

    return res.status(429).json({
      error: 'Daily analysis limit reached. Try again tomorrow.',
    });
  }

  const parts = [];

  for (const file of files) {
    parts.push({
      file: file.originalname,
      data: await extractFile(file),
    });
  }

  const result = await groupFiles(parts);
  const subject = String(
    result.subject ?? 'Unknown subject'
  ).slice(0, 100);

  await db.query(
    `UPDATE analyses
     SET subject = $1, result = $2
     WHERE id = $3 AND user_id = $4`,
    [subject, JSON.stringify(result), reservedId, req.userId]
  );

  const left = Math.max(
    0,
    config.dailyLimit - (await usedToday(req.userId))
  );

  res.json({
    id: reservedId,
    result,
    remainingToday: left,
  });
} catch (e) {
  if (reservedId !== null) {
    await db.query(
      'DELETE FROM analyses WHERE id = $1 AND user_id = $2',
      [reservedId, req.userId]
    ).catch(() => {});
  }

  console.error('[analyze]', e.message);

  res.status(502).json({
    error: 'Could not analyze these files. Please try again.',
    details: config.isProd ? undefined : e.message,
  });
}

}
);

// List saved analyses.
router.get('/', async (req, res, next) => {
try {
const result = await db.query(
`SELECT id, subject, created_at
       FROM analyses
       WHERE user_id = $1
         AND result != $2
       ORDER BY id DESC
       LIMIT 50`,
[req.userId, '{"pending":true}']
);

const left = Math.max(
  0,
  config.dailyLimit - (await usedToday(req.userId))
);

res.json({
  analyses: result.rows.map((row) => ({
    id: Number(row.id),
    subject: row.subject,
    createdAt: row.created_at,
  })),
  remainingToday: left,
});

} catch (e) {
next(e);
}
});

// Retrieve a saved analysis belonging to the logged-in user.
router.get('/:id', async (req, res, next) => {
try {
const id = Number(req.params.id);

if (!Number.isSafeInteger(id) || id <= 0) {
  return res.status(404).json({ error: 'Not found.' });
}

const result = await db.query(
  `SELECT id, result
   FROM analyses
   WHERE id = $1 AND user_id = $2`,
  [id, req.userId]
);

const row = result.rows[0];

if (!row) {
  return res.status(404).json({ error: 'Not found.' });
}

res.json({
  id: Number(row.id),
  result: JSON.parse(row.result),
});

} catch (e) {
next(e);
}
});

// Delete a saved analysis belonging to the logged-in user.
router.delete('/:id', async (req, res, next) => {
try {
const id = Number(req.params.id);

if (!Number.isSafeInteger(id) || id <= 0) {
  return res.status(404).json({ error: 'Not found.' });
}

await db.query(
  'DELETE FROM analyses WHERE id = $1 AND user_id = $2',
  [id, req.userId]
);

res.json({ ok: true });

} catch (e) {
next(e);
}
});

export default router;
