import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

const sql = neon(process.env.DATABASE_URL);

async function checkColumns() {
    console.log('Checking columns for candidates table...');

    const columns = await sql`
    SELECT column_name, data_type, udt_name
    FROM information_schema.columns
    WHERE table_name = 'candidates'
    ORDER BY column_name
  `;

    const output = columns.map((c: any) => `${c.column_name} | ${c.data_type} | ${c.udt_name}`).join('\n');
    const fs = require('fs');
    fs.writeFileSync('verification_result.txt', output);
    process.exit(0);
}

checkColumns().catch((err) => {
    console.error('Check failed:', err);
    process.exit(1);
});
