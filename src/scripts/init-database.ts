import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';
import { query } from '@/lib/database';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function executeSqlFile(filePath: string, description: string) {
  try {
    console.log(`Executing ${description}...`);
    const sqlContent = readFileSync(filePath, 'utf8');

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        await query(statement, []);
        // await sql.unsafe(statement);
        console.log(`✓ Executed: ${statement.substring(0, 50)}...`);
      }
    }

    console.log(`✓ ${description} completed successfully!`);
  } catch (error) {
    console.error(`Error executing ${description}:`, error);
    throw error;
  }
}

async function initDatabase() {
  try {
    console.log('🚀 Initializing database...');

    // Get the scripts directory path
    const scriptsDir = join(process.cwd(), '../../src/scripts');

    // Execute SQL files in order
    await executeSqlFile(
      join(scriptsDir, '001-create-tables.sql'),
      'Table creation'
    );

    await executeSqlFile(
      join(scriptsDir, '002-seed-demo-data.sql'),
      'Demo data seeding'
    );

    await executeSqlFile(
      join(scriptsDir, '003-create-views.sql'),
      'View creation'
    );

    await executeSqlFile(
      join(scriptsDir, '004-create-functions.sql'),
      'Function creation'
    );

    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 Your Kanban board is ready with demo data!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization if this script is executed directly
if (require.main === module) {
  initDatabase();
}

export default initDatabase; 