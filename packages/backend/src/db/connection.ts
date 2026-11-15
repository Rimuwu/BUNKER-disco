import { MongoClient, Db } from 'mongodb';
import { config } from '../config.js';

let client: MongoClient | null = null;
let database: Db | null = null;
let isConnected = false;

export async function connectMongo(url = config.mongoUrl, dbName = config.mongoDbName): Promise<Db | null> {
  if (database && isConnected) {
    return database;
  }

  try {
    client = new MongoClient(url, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    await client.connect();
    database = client.db(dbName);
    isConnected = true;
    return database;
  } catch (err) {
    // If external Mongo is not running, we log and return null (in-memory fallback activated in repositories)
    isConnected = false;
    return null;
  }
}

export function getMongoDb(): Db | null {
  return database;
}

export function isMongoConnected(): boolean {
  return isConnected;
}

export async function disconnectMongo(): Promise<void> {
  if (client) {
    try {
      await client.close();
    } catch {
      // ignore close errors
    }
    client = null;
    database = null;
    isConnected = false;
  }
}
