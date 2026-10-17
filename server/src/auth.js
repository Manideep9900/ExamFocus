import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { db } from './db.js';
import { config } from './config.js';

const router = Router();

const COOKIE = 'ef_token';
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Used to keep login timing similar when the email does not exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const cookieOptions = {
httpOnly: true,
sameSite: 'lax',
secure: config.isProd,
maxAge: WEEK_MS,
};

const limiter = rateLimit({
windowMs: 15 * 60 * 1000,
limit: 30,
standardHeaders: true,
legacyHeaders: false,
message: { error: 'Too many attempts. Try again in a few minutes.' },
});

function validate(body) {
const email = String(body?.email ?? '').trim().toLowerCase();
const password = String(body?.password ?? '');

if (!/^[^\s@]+@[^\s@]+.[^\s@]{2,}$/.test(email) || email.length > 120) {
return { error: 'Enter a valid email address.' };
}

if (password.length < 8 || password.length > 72) {
return { error: 'Password must be 8 to 72 characters.' };
}

return { email, password };
}

function startSession(res, userId) {
const token = jwt.sign(
{ uid: userId },
config.jwtSecret,
{ expiresIn: '7d' }
);

res.cookie(COOKIE, token, cookieOptions);
}

export function requireAuth(req, res, next) {
try {
const token = req.cookies?.[COOKIE];
req.userId = jwt.verify(token, config.jwtSecret).uid;
next();
} catch {
res.status(401).json({ error: 'Please log in.' });
}
}

// Register a new user.
router.post('/register', limiter, async (req, res, next) => {
try {
const v = validate(req.body);
if (v.error) {
return res.status(400).json({ error: v.error });
}

const hash = await bcrypt.hash(v.password, 10);

try {
  const result = await db.query(
  'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
  [v.email, hash]
);

  const id = Number(result.rows[0].id);

  startSession(res, id);

  res.status(201).json({
    user: { id, email: v.email },
  });
} catch (e) {
  if (e.code === '23505') {
    return res.status(409).json({
      error: 'An account with this email already exists.',
    });
  }

  throw e;
}

} catch (e) {
next(e);
}
});

// Log in an existing user.
router.post('/login', limiter, async (req, res, next) => {
try {
const v = validate(req.body);
if (v.error) {
return res.status(400).json({ error: v.error });
}

const result = await db.query(
  'SELECT id, password_hash FROM users WHERE email = $1',
  [v.email]
);

const row = result.rows[0];

const ok = await bcrypt.compare(
  v.password,
  row ? row.password_hash : DUMMY_HASH
);

if (!row || !ok) {
  return res.status(401).json({
    error: 'Wrong email or password.',
  });
}

const id = Number(row.id);

startSession(res, id);

res.json({
  user: { id, email: v.email },
});

} catch (e) {
next(e);
}
});

// Log out.
router.post('/logout', (_req, res) => {
res.clearCookie(COOKIE, {
...cookieOptions,
maxAge: undefined,
});

res.json({ ok: true });
});

// Return the current user.
router.get('/me', requireAuth, async (req, res, next) => {
try {
const result = await db.query(
'SELECT id, email FROM users WHERE id = $1',
[req.userId]
);

const row = result.rows[0];

if (!row) {
  return res.status(401).json({ error: 'Please log in.' });
}

res.json({
  user: {
    id: Number(row.id),
    email: row.email,
  },
});

} catch (e) {
next(e);
}
});

// Delete the account. PostgreSQL cascades the deletion to its analyses.
router.delete('/account', requireAuth, async (req, res, next) => {
try {
await db.query(
'DELETE FROM users WHERE id = $1',
[req.userId]
);

res.clearCookie(COOKIE, {
  ...cookieOptions,
  maxAge: undefined,
});

res.json({ ok: true });

} catch (e) {
next(e);
}
});

export default router;
