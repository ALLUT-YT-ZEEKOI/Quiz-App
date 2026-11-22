// Try the API without MongoDB Atlas: starts a temporary in-memory MongoDB.
// Data is lost when you stop it. Usage: npm run dev:memory
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongo = await MongoMemoryServer.create();
process.env.MONGODB_URI = mongo.getUri();
process.env.JWT_SECRET ||= 'dev-only-secret-change-me-dev-only-secret-change-me';
process.env.ADMIN_PASSWORD ||= 'admin12345';
console.log('🧪 In-memory MongoDB started (data is temporary).');
console.log(`   Admin login: ${process.env.ADMIN_USERNAME || 'admin'} / ${process.env.ADMIN_PASSWORD}`);

const { startServer } = await import('../src/server.js');
await startServer();

const stop = async () => {
  await mongo.stop();
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
