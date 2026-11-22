import { config } from './config.js';
import { connectDb, closeDb } from './db.js';
import { createApp } from './app.js';
import { ensureAdmin, ensureCollectionIndexes } from './setup.js';

export const startServer = async (mongoUri) => {
  await connectDb(mongoUri);
  await ensureCollectionIndexes();
  await ensureAdmin();
  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`🚀 CohesionTech API running on http://localhost:${config.port}/api`);
    console.log(`   Allowed frontends: ${config.clientOrigins.join(', ')}`);
  });

  const shutdown = async () => {
    server.close();
    await closeDb();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
  return server;
};
