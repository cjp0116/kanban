import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '@/lib/database';

async function initDatabase() {
  try {
    console.log('Initializing database...');

    // Read the SQL file
    const sqlPath = join(process.cwd(), 'src', 'scripts', 'init-db.sql');
    const sqlContent = readFileSync(sqlPath, 'utf8');

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }

    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initDatabase();
}

export default initDatabase; 