import { MongoClient, MongoError } from 'mongodb';
import type { Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectMongo(): Promise<Db | undefined> {
  if (db) return db;

  const mongoUrl = process.env.MONGO_URI;
  if (!mongoUrl) {
    console.error('[MongoDB] MONGO_URI not defined — user routes unavailable');
    return undefined;
  }

  try {
    client = new MongoClient(mongoUrl);
    await client.connect();
    db = client.db();
    console.info(`MongoDB connected (${process.env.NODE_ENV})`);
    return db;
  } catch (error) {
    if (error instanceof MongoError) {
      console.error('[MongoDB] Connection failed — user routes unavailable:', error.name);
    }
    client = null;
    return undefined;
  }
}

export function getDb(): Db {
  if (!db) throw new MongoError('Database not initialized');
  return db;
}

export async function closeMongo(): Promise<void> {
  await client?.close();
  client = null;
  db = null;
}
