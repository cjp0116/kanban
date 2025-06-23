import { config } from 'dotenv';
import { query } from '@/lib/database';

// Load environment variables from .env.local
config({ path: '../../.env.local' });

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');

    // Test basic connection
    const result = await query(`SELECT version()`, []);
    console.log('✓ Database connection successful!');
    console.log(`📊 PostgreSQL version: ${result.rows[0].version}`);

    // Test if tables exist
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `, []);

    console.log('📋 Available tables:');
    tables.rows.forEach((table: { table_name: string }) => {
      console.log(`  - ${table.table_name}`);
    });

    // Test if we have data
      const taskCount = await query(`SELECT COUNT(*) as count FROM tasks`, []);
    const columnCount = await query(`SELECT COUNT(*) as count FROM columns`, []);
    const boardCount = await query(`SELECT COUNT(*) as count FROM boards`, []);

    console.log('📊 Data summary:');
    console.log(`  - Boards: ${boardCount.rows[0].count}`);
    console.log(`  - Columns: ${columnCount.rows[0].count}`);
    console.log(`  - Tasks: ${taskCount.rows[0].count}`);

    console.log('🎉 Database test completed successfully!');
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testConnection();
}

export default testConnection; 