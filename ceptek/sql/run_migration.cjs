const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'aws-1-us-east-1.pooler.supabase.com',
  port: 5432,
  database: 'postgres',
  user: 'postgres.igrimqmpcjtkavabtjcr',
  password: 'Control1981@2026',
  ssl: { rejectUnauthorized: false }
});

async function runMigration(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Running: ${fileName}`);
  console.log(`${'='.repeat(60)}`);
  
  try {
    await client.query(sql);
    console.log(`SUCCESS: ${fileName} executed completely.`);
    return true;
  } catch (err) {
    console.error(`ERROR in ${fileName}:`);
    console.error(`  Position: ${err.position || 'unknown'}`);
    console.error(`  Message: ${err.message}`);
    console.error(`  Detail: ${err.detail || 'none'}`);
    return false;
  }
}

async function main() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');
    
    const files = [
      path.join(__dirname, '001_employees_module.sql'),
      path.join(__dirname, '002_suppliers_module.sql')
    ];
    
    let allOk = true;
    for (const file of files) {
      const ok = await runMigration(file);
      if (!ok) {
        allOk = false;
        console.log('\nStopping due to error. Fix the issue and re-run.');
        break;
      }
    }
    
    if (allOk) {
      console.log(`\n${'='.repeat(60)}`);
      console.log('VERIFICATION: Listing all public tables');
      console.log(`${'='.repeat(60)}`);
      
      const res = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `);
      
      console.log(`\nTotal tables: ${res.rows.length}`);
      res.rows.forEach((r, i) => console.log(`  ${i+1}. ${r.table_name}`));
    }
    
  } catch (err) {
    console.error('Connection error:', err.message);
  } finally {
    await client.end();
    console.log('\nConnection closed.');
  }
}

main();
