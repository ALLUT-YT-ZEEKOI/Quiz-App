// Vercel Serverless Function entry point for unified deployment.
// Routes all /api/* requests to the Express app with MongoDB connection caching.
import { createApp } from '../backend/src/app.js';
import { connectDb } from '../backend/src/db.js';
import { ensureAdmin, ensureCollectionIndexes } from '../backend/src/setup.js';

const app = createApp();
let ready = null;

const init = () => {
  if (!ready) {
    ready = (async () => {
      await connectDb();
      await ensureCollectionIndexes();
      await ensureAdmin();
    })().catch((err) => {
      ready = null; // retry on next request
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
    res.end(
      JSON.stringify({
        error: 'The server cannot reach the database right now. Please check MONGODB_URI and IP whitelist in MongoDB Atlas.'
      })
    );
    return;
  }
  return app(req, res);
}
