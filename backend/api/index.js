// Vercel entry point: every request is sent here (see vercel.json) and handled by the Express app.
// The database connection and setup run once per server instance and are reused between requests.
import { createApp } from '../src/app.js';
import { connectDb } from '../src/db.js';
import { ensureAdmin, ensureCollectionIndexes } from '../src/setup.js';

const app = createApp();
let ready = null;

const init = () => {
  if (!ready) {
    ready = (async () => {
      await connectDb();
      await ensureCollectionIndexes();
      await ensureAdmin();
    })().catch((err) => {
      ready = null; // try again on the next request
      throw err;
    });
  }
  return ready;
};

export default async function handler(req, res) {
  try {
    await init();
  } catch (err) {
    console.error('Database connection failed:', err);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'The server cannot reach the database right now. Please try again shortly.' }));
    return;
  }
  return app(req, res);
}
