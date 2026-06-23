import pg from 'pg';
import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

const connectionString = process.env.NEXT_DATABASE_URI || process.env.DATABASE_URL;

async function run() {
  const pool = new pg.Pool({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    console.log('Dropping problematic columns...');
    await pool.query('ALTER TABLE "journeys_locales" DROP COLUMN IF EXISTS "title"');
    await pool.query('ALTER TABLE "journeys_locales" DROP COLUMN IF EXISTS "description"');
    console.log('Successfully dropped columns.');
  } catch (err) {
    console.error('Error dropping columns:', err);
  } finally {
    await pool.end();
  }
}

run();
