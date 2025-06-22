# PostgreSQL Setup for Kanban Project

This project uses PostgreSQL as the database. Here's how to set it up and use it.

## Prerequisites

1. **Install PostgreSQL** on your system:
   - **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
   - **macOS**: `brew install postgresql`
   - **Linux**: `sudo apt-get install postgresql postgresql-contrib`

2. **Start PostgreSQL service**:
   - **Windows**: PostgreSQL service should start automatically
   - **macOS**: `brew services start postgresql`
   - **Linux**: `sudo systemctl start postgresql`

## Setup

1. **Create a `.env.local` file** in your project root:
   ```bash
   cp env.example .env.local
   ```

2. **Update the environment variables** in `.env.local`:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_HOST=localhost
   POSTGRES_DB=kanban
   POSTGRES_PASSWORD=your_actual_password
   POSTGRES_PORT=5432
   ```

3. **Create the database**:
   ```bash
   # Connect to PostgreSQL as the postgres user
   psql -U postgres
   
   # Create the database
   CREATE DATABASE kanban;
   
   # Exit psql
   \q
   ```

4. **Initialize the database schema**:
   ```bash
   npm run db:init
   ```

## Usage

### Basic Database Operations

The database utilities are available in `src/lib/db.ts`:

```typescript
import { query, transaction, getClient } from '@/lib/db';

// Simple query
const result = await query('SELECT * FROM boards');

// Transaction
await transaction(async (client) => {
  await client.query('INSERT INTO boards (name) VALUES ($1)', ['New Board']);
  await client.query('UPDATE boards SET updated_at = NOW() WHERE name = $1', ['New Board']);
});
```

### API Routes

Example API route using PostgreSQL:

```typescript
// src/app/api/boards/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT * FROM boards ORDER BY created_at DESC');
    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
```

## Database Schema

The project includes a basic kanban board schema with:

- **boards**: Main kanban boards
- **columns**: Columns within each board (To Do, In Progress, Done, etc.)
- **cards**: Individual tasks/cards within columns

## Testing the Connection

You can test your database connection by visiting:
```
http://localhost:3000/api/test-db
```

This will return a JSON response indicating whether the connection is successful.

## Troubleshooting

1. **Connection refused**: Make sure PostgreSQL is running
2. **Authentication failed**: Check your password in `.env.local`
3. **Database does not exist**: Create the database manually or check the database name
4. **Permission denied**: Make sure your PostgreSQL user has the necessary permissions

## Production Deployment

For production, consider using:
- **Vercel Postgres** (if deploying on Vercel)
- **Supabase** (PostgreSQL with additional features)
- **AWS RDS** or **Google Cloud SQL**

Update your environment variables accordingly for production. 