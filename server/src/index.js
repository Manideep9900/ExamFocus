import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import express from 'express';
import cookieParser from 'cookie-parser';
import { config } from './config.js';
import { initDb } from './db.js';
import authRoutes from './auth.js';
import analyzeRoutes from './analyze.js';

const app = express();
app.set('trust proxy', 1); // needed behind the hosting provider's proxy
app.disable('x-powered-by');
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/analyses', analyzeRoutes);
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

// In production the built frontend is served by this same server.
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  console.error('[server]', err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

await initDb();
app.listen(config.port, () => console.log(`Exam Focus server on port ${config.port}`));
