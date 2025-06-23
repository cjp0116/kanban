
import postgres from "postgres";

import { NextResponse } from "next/server";

const sql = postgres(process.env.POSTGRES_URL!, { prepare: false });

async function createUsersTable() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  await sql`
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  `;
  
}

async function createBoardsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`
}

async function createColumnsTable() {
  await sql`
CREATE TABLE IF NOT EXISTS columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  color VARCHAR(100),
  position INTEGER NOT NULL DEFAULT 0,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
  `
}

async function createTasksTable() {
  await sql`
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(100) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE,
  position INTEGER NOT NULL DEFAULT 0,
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
  `;
}

async function createSubtasksTable() {
  await sql`
CREATE TABLE IF NOT EXISTS subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  position INTEGER NOT NULL DEFAULT 0,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`;
}

async function createCustomFieldsTable() {
  await sql`
CREATE TABLE IF NOT EXISTS custom_fields(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  value TEXT,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
  `
}

async function createAutomationRulesTable() {
  await sql`
  CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  condition_type VARCHAR(50) NOT NULL,
  -- 'due-date', 'subtasks-completed', 'custom-field'
  condition_operator VARCHAR(50) NOT NULL,
  -- 'is-overdue', 'all-completed', 'equals', etc.
  condition_field VARCHAR(255),
  -- for custom field conditions
  condition_value TEXT,
  -- for custom field conditions
  action_type VARCHAR(50) NOT NULL,
  -- 'move-to-column'
  action_target_column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
  `;
}

async function createIndexes() {
  await sql`
  CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_columns_position ON columns(position);
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_board_id ON tasks(board_id);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_subtasks_task_id ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_custom_fields_task_id ON custom_fields(task_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_board_id ON automation_rules(board_id);
  `
}

export async function GET() {
  try {
    await createUsersTable();
    await createBoardsTable();
    await createColumnsTable();
    await createTasksTable();
    await createSubtasksTable();
    await createCustomFieldsTable();
    await createAutomationRulesTable();
    await createIndexes();

    return NextResponse.json({ message: "Database tables created successfully" });
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
