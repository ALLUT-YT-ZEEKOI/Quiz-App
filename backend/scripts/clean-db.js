import { config } from '../src/config.js';
import { connectDb, getDb, closeDb } from '../src/db.js';

async function cleanDatabase() {
  console.log('Connecting to MongoDB...');
  await connectDb();
  const db = getDb();

  const collectionsToClear = [
    'curriculum_subjects',
    'curriculum_attempts',
    'subscriptions',
    'examinations',
    'exam_attempts',
    'exam_monitoring',
    'retests',
    'doubts',
    'notifications',
    'students',
    'questions',
    'quizzes',
    'quiz_attempts',
    'difficulty_levels',
    'fs.files',
    'fs.chunks',
    'screenshots'
  ];

  console.log('Clearing all dummy / sample collections...');
  for (const name of collectionsToClear) {
    try {
      const res = await db.collection(name).deleteMany({});
      console.log(` - ${name}: ${res.deletedCount} items deleted`);
    } catch (e) {
      console.log(` - ${name}: (skipped, does not exist)`);
    }
  }

  // Remove all non-admin users (test students, dummy accounts)
  const delUsers = await db.collection('users').deleteMany({ role: { $ne: 'admin' } });
  console.log(`Removed non-admin test users: ${delUsers.deletedCount} deleted`);

  // Ensure database is marked as initialized so prototype import banners never show
  await db.collection('meta').updateOne(
    { _id: 'initialized' },
    { $set: { initializedAt: new Date(), version: 'production-clean' } },
    { upsert: true }
  );
  console.log('Database marked as initialized.');

  // Print Admin status
  const admin = await db.collection('users').findOne({ role: 'admin' }, { projection: { passwordHash: 0 } });
  console.log('Admin account preserved:', JSON.stringify(admin, null, 2));

  await closeDb();
  console.log('Database clean-up finished successfully.');
}

cleanDatabase().catch((err) => {
  console.error('Error cleaning database:', err);
  process.exit(1);
});
