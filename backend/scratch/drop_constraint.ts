import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  console.log("Connecting to database to drop known cross-schema foreign keys...");
  try {
    const queries = [
      'ALTER TABLE public.recommendations DROP CONSTRAINT IF EXISTS recommendations_user_id_fkey;',
      'ALTER TABLE public.user_assessments DROP CONSTRAINT IF EXISTS user_assessments_user_id_fkey;',
      'ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;',
      'ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;'
    ];

    for (const q of queries) {
      console.log(`Executing: ${q}`);
      await pool.query(q);
    }
    console.log("Success! Constraints dropped.");
  } catch (error) {
    console.error("Error executing drops:", error);
  } finally {
    await pool.end();
  }
}

run();
