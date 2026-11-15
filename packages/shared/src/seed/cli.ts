import { MongoClient } from 'mongodb';
import { seedCards } from './seeder.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bunker_disco';

export async function runCli(): Promise<void> {
  console.log(`[Seed CLI] Connecting to MongoDB at ${MONGO_URI}...`);
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();
    const db = client.db();
    console.log('[Seed CLI] Connected successfully. Starting card seeding...');

    const startTime = Date.now();
    const result = await seedCards(db);
    const durationMs = Date.now() - startTime;

    console.log(`[Seed CLI] Completed in ${durationMs}ms.`);
    console.log(`[Seed CLI] Total cards processed: ${result.seeded}`);
    console.log('[Seed CLI] Breakdown by origin tags:', JSON.stringify(result.tags, null, 2));
    console.log('[Seed CLI] Breakdown by categories:', JSON.stringify(result.categories, null, 2));
  } catch (error) {
    console.error('[Seed CLI] Seeding failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

// Execute if run directly
if (process.argv[1] && process.argv[1].endsWith('cli.ts')) {
  runCli().catch((err) => {
    console.error('[Seed CLI] Fatal error:', err);
    process.exit(1);
  });
}
