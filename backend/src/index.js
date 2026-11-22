import { startServer } from './server.js';

startServer().catch((err) => {
  console.error('❌ Could not start the server:', err.message);
  process.exit(1);
});
