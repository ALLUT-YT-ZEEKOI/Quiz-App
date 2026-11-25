import express, { json } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { syncRouter } from './routes/sync.js';
import { examsRouter } from './routes/exams.js';
import { adminRouter } from './routes/admin.js';
import { filesRouter } from './routes/files.js';
import { mockTestsRouter } from './routes/mockTests.js';

export const createApp = () => {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // behind the Vercel/Render proxy (needed for rate limiting by IP)

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow same-origin / server-to-server requests (no Origin header) and configured frontends
        if (
          !origin ||
          config.clientOrigins.includes(origin) ||
          config.clientOrigins.includes('*') ||
          origin.includes('vercel.app') ||
          origin.includes('localhost')
        ) return cb(null, true);
        cb(new Error(`Origin ${origin} is not allowed. Add it to CLIENT_ORIGINS.`));
      }
    })
  );

  // JSON bodies (payment screenshots and cover images are sent as base64; the app shrinks them first)
  const jsonParser = json({ limit: '25mb' });
  app.use((req, res, next) =>
    req.path.startsWith('/api/files') || req.path.startsWith('/files') || req.path === '/api/admin/import' ? next() : jsonParser(req, res, next)
  );

  const mountRoutes = (prefix = '') => {
    app.get(`${prefix}/health`, (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
    app.use(`${prefix}/auth`, authRouter);
    app.use(`${prefix}/sync`, syncRouter);
    app.use(`${prefix}/exams`, examsRouter);
    app.use(`${prefix}/admin`, adminRouter);
    app.use(`${prefix}/files`, filesRouter);
    app.use(`${prefix}/mock-tests`, mockTestsRouter);
  };

  mountRoutes('/api');
  mountRoutes('');

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'The upload is too large.' });
    if (err?.message?.startsWith('Origin ')) return res.status(403).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  });

  return app;
};
