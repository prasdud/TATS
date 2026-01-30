import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

async function verify() {
  console.log('Testing database connection...');

  // Test basic query
  const result = await sql`SELECT version()`;
  console.log('Postgres version:', result[0].version);

  // Check if tables exist
  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  console.log('Tables found:', tables.map((t: any) => t.table_name));

  // Count rows in each table
  for (const table of tables) {
    const count = await sql`SELECT COUNT(*) as count FROM ${sql(table.table_name)}`;
    console.log(`  ${table.table_name}: ${count[0].count} rows`);
  }

  console.log('Database connection verified!');
  process.exit(0);
}

verify().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
