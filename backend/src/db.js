import { MongoClient, GridFSBucket } from 'mongodb';
import { config } from './config.js';

let client;
let db;
let notesBucket;

export const connectDb = async (uri = config.mongoUri) => {
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  db = client.db(config.dbName);
  notesBucket = new GridFSBucket(db, { bucketName: 'note_files' });
  await ensureIndexes();
  return db;
};

export const getDb = () => {
  if (!db) throw new Error('Database not connected');
  return db;
};

export const getNotesBucket = () => notesBucket;

export const closeDb = async () => {
  await client?.close();
};

const ensureIndexes = async () => {
  const users = db.collection('users');
  await users.createIndex({ email: 1 }, { unique: true, sparse: true });
  await users.createIndex({ phone: 1 }, { unique: true, sparse: true });
  await users.createIndex({ username: 1 }, { unique: true, sparse: true });
  await users.createIndex({ studentId: 1 }, { sparse: true });
  await users.createIndex({ _updatedAt: 1 });
};
