const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function main() {
  const client = new Client({
    host: 'ep-blue-art-a1ym0ofn-pooler.ap-southeast-1.aws.neon.tech',
    port: 5432,
    user: 'neondb_owner',
    password: 'npg_7EMRCyNBQz4l',
    database: 'neondb',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to Neon database');

  const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

  const statements = schemaSQL.split(';').filter(s => s.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await client.query(statement);
        const preview = statement.replace(/\s+/g, ' ').substring(0, 60);
        console.log('✓ Executed:', preview, '...');
      } catch (err) {
        console.error('✗ Error:', err.message);
      }
    }
  }

  // Verify tables were created
  const tables = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name NOT LIKE 'pg_%'
    AND table_name NOT LIKE 'sql_%'
    ORDER BY table_name
  `);

  console.log('\n=== CREATED TABLES ===');
  for (const row of tables.rows) {
    console.log(row.table_name);
  }

  await client.end();
  console.log('\nSchema creation complete!');
}

main().catch(console.error);