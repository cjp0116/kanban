import { Pool, PoolClient } from 'pg';
import postgres from 'postgres';

export const sql = postgres(`postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`)


// Database configuration
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'kanban_test',
  password: process.env.POSTGRES_PASSWORD || '',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Utility function to get a client from the pool
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

// Utility function to execute a query
export const db = {
  async getBoards(userId?: string) {
    const defaultUserId = "550e8400-e29b-41d4-a716-446655440000"
    const result = await sql`
      SELECT * FROM boards WHERE user_id = ${userId || defaultUserId}
      ORDER BY created_at DESC
    `
    return result;
  },

  async getBoardWithData(boardId: string) {
    const [board] = await sql`SELECT * FROM boards WHERE id =${boardId}`;
    if (!board) throw new Error("Board not found");
    const columnns = await sql`
  SELECT
        c.id,
        c.title,
        c.color,
        c.position,
        COALESCE(
          json_agg(
            json_build_object(
              'id', t.id,
              'title', t.title,
              'description', t.description,
              'status', t.status,
              'dueDate', t.due_date,
              'position', t.position,
              'createdAt', t.created_at,
              'subtasks', t.subtasks,
              'customFields', t.custom_fields
            ) ORDER BY t.position
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as tasks
      FROM columns c
      LEFT JOIN (
        SELECT
          t.*,
          COALESCE(
            json_agg(
              json_build_object(
                'id', s.id,
                'title', s.title,
                'completed', s.completed
              ) ORDER BY s.position
            ) FILTER (WHERE s.id IS NOT NULL),
            '[]'::json
          ) as subtasks,
          COALESCE(
            json_agg(
              json_build_object(
                'id', cf.id,
                'name', cf.name,
                'value', cf.value
              ) ORDER BY cf.id
            ) FILTER (WHERE cf.id IS NOT NULL),
            '[]'::json
          ) as custom_fields
        FROM tasks t
        LEFT JOIN subtasks s ON t.id = s.task_id
        LEFT JOIN custom_fields cf ON t.id = cf.task_id
        WHERE t.board_id = ${boardId}
        GROUP BY t.id, t.title, t.description, t.status, t.due_date, t.position, t.column_id, t.created_at
      ) t ON c.id = t.column_id
      WHERE c.board_id = ${boardId}
      GROUP BY c.id, c.title, c.color, c.position
      ORDER BY c.position
    `;
    return {
      board,
      columns: columnns.map(col => ({
        ...col,
        tasks: col.tasks || []
      }))
    }
  },

  async getAutomationRules(boardId: string) {
    const rules = await sql`
      SELECT 
        id,
        name,
        enabled,
        json_build_object(
          'type', condition_type,
          'operator', condition_operator,
          'field', condition_field,
          'value', condition_value
        ) as condition,
        json_build_object(
          'type', action_type,
          'targetColumnId', action_target_column_id
        ) as action
      FROM automation_rules
      WHERE board_id = ${boardId}
      ORDER BY created_at
    `
    return rules
  },

  // Create a new task
  async createTask(task: {
    title: string
    description?: string
    columnId: string
    boardId: string
    dueDate?: string | null
  }) {
    // Get the next position in the column
    const [{ max_position }] = await sql`
      SELECT COALESCE(MAX(position), -1) + 1 as max_position
      FROM tasks 
      WHERE column_id = ${task.columnId}
    `

    // Get column title for status
    const [column] = await sql`
      SELECT title FROM columns WHERE id = ${task.columnId}
    `

    const [newTask] = await sql`
      INSERT INTO tasks (title, description, status, due_date, position, column_id, board_id)
      VALUES (${task.title}, ${task.description || null}, ${column.title}, ${task.dueDate || null}, ${max_position}, ${task.columnId}, ${task.boardId})
      RETURNING *
    `

    return {
      ...newTask,
      dueDate: newTask.due_date,
      createdAt: newTask.created_at,
      subtasks: [],
      customFields: [],
    }
  },


  async updateTask(
    taskId: string,
    updates: {
      title?: string
      description?: string
      status?: string
      dueDate?: string | null
      columnId?: string
    },
  ) {
   
    let query = sql`UPDATE tasks SET updated_at = NOW()`

    if (updates.title !== undefined) {
      query = sql`${query}, title = ${updates.title}`
    }
    if (updates.description !== undefined) {
      query = sql`${query}, description = ${updates.description}`
    }
    if (updates.status !== undefined) {
      query = sql`${query}, status = ${updates.status}`
    }
    if (updates.dueDate !== undefined) {
      query = sql`${query}, due_date = ${updates.dueDate}`
    }
    if (updates.columnId !== undefined) {
      query = sql`${query}, column_id = ${updates.columnId}`
    }

    const [updatedTask] = await sql`${query} WHERE id = ${taskId} RETURNING *`

    return {
      ...updatedTask,
      dueDate: updatedTask.due_date,
      createdAt: updatedTask.created_at,
    }
  },

  async deleteTask(taskId: string) {
    await sql`DELETE FROM tasks WHERE id = ${taskId}`
  },

  // Move task to different column
  async moveTask(taskId: string, targetColumnId: string, position: number) {
    // Get target column title
    const [column] = await sql`
      SELECT title FROM columns WHERE id = ${targetColumnId}
    `

    await sql`
      UPDATE tasks 
      SET column_id = ${targetColumnId}, status = ${column.title}, position = ${position}, updated_at = NOW()
      WHERE id = ${taskId}
    `
  },

  // Create/update subtask
  async upsertSubtask(subtask: {
    id?: string
    title: string
    completed: boolean
    taskId: string
    position: number
  }) {
    if (subtask.id) {
      // Update existing subtask with valid UUID
      await sql`
        UPDATE subtasks 
        SET title = ${subtask.title}, completed = ${subtask.completed}, position = ${subtask.position}
        WHERE id = ${subtask.id}
      `
    } else {
      // Create new subtask
      await sql`
        INSERT INTO subtasks (title, completed, position, task_id)
        VALUES (${subtask.title}, ${subtask.completed}, ${subtask.position}, ${subtask.taskId})
      `
    }
  },

  // Delete subtask
  async deleteSubtask(subtaskId: string) {
    await sql`DELETE FROM subtasks WHERE id = ${subtaskId}`
  },

  // Create/update custom field
  async upsertCustomField(field: {
    id?: string
    name: string
    value: string
    taskId: string
  }) {
    if (field.id) {
      // Update existing custom field with valid UUID
      await sql`
        UPDATE custom_fields 
        SET name = ${field.name}, value = ${field.value}
        WHERE id = ${field.id}
      `
    } else {
      // Create new custom field
      await sql`
        INSERT INTO custom_fields (name, value, task_id)
        VALUES (${field.name}, ${field.value}, ${field.taskId})
      `
    }
  },

  // Delete custom field
  async deleteCustomField(fieldId: string) {
    await sql`DELETE FROM custom_fields WHERE id = ${fieldId}`
  },

  // Create column
  async createColumn(column: {
    title: string
    color?: string
    boardId: string
  }) {
    const [{ max_position }] = await sql`
      SELECT COALESCE(MAX(position), -1) + 1 as max_position
      FROM columns 
      WHERE board_id = ${column.boardId}
    `

    const [newColumn] = await sql`
      INSERT INTO columns (title, color, position, board_id)
      VALUES (${column.title}, ${column.color || null}, ${max_position}, ${column.boardId})
      RETURNING *
    `

    return {
      ...newColumn,
      tasks: [],
    }
  },

  // Update column
  async updateColumn(
    columnId: string,
    updates: {
      title?: string
      color?: string
    },
  ) {
    // Build the update query conditionally
    let query = sql`UPDATE columns SET updated_at = NOW()`

    if (updates.title !== undefined) {
      query = sql`${query}, title = ${updates.title}`
    }
    if (updates.color !== undefined) {
      query = sql`${query}, color = ${updates.color}`
    }

    await sql`${query} WHERE id = ${columnId}`
  },

  async deleteColumn(columnId: string) {
    // Check if column has tasks
    const [{ count }] = await sql`
      SELECT COUNT(*) as count FROM tasks WHERE column_id = ${columnId}
    `

    if (count > 0) {
      throw new Error("Cannot delete column with tasks")
    }

    await sql`DELETE FROM columns WHERE id = ${columnId}`
  },

  async createAutomationRule(rule: {
    name: string
    enabled: boolean
    conditionType: string
    conditionOperator: string
    conditionField?: string
    conditionValue?: string
    actionType: string
    actionTargetColumnId: string
    boardId: string
  }) {
    const [newRule] = await sql`
      INSERT INTO automation_rules (
        name, enabled, condition_type, condition_operator, condition_field, condition_value,
        action_type, action_target_column_id, board_id
      )
      VALUES (
        ${rule.name}, ${rule.enabled}, ${rule.conditionType}, ${rule.conditionOperator},
        ${rule.conditionField || null}, ${rule.conditionValue || null},
        ${rule.actionType}, ${rule.actionTargetColumnId}, ${rule.boardId}
      )
      RETURNING *
    `

    return {
      id: newRule.id,
      name: newRule.name,
      enabled: newRule.enabled,
      condition: {
        type: newRule.condition_type,
        operator: newRule.condition_operator,
        field: newRule.condition_field,
        value: newRule.condition_value,
      },
      action: {
        type: newRule.action_type,
        targetColumnId: newRule.action_target_column_id,
      },
    }
  },

  async updateAutomationRule(
    ruleId: string,
    updates: {
      name?: string
      enabled?: boolean
    },
  ) {
    // Build the update query conditionally
    let query = sql`UPDATE automation_rules SET updated_at = NOW()`

    if (updates.name !== undefined) {
      query = sql`${query}, name = ${updates.name}`
    }
    if (updates.enabled !== undefined) {
      query = sql`${query}, enabled = ${updates.enabled}`
    }

    await sql`${query} WHERE id = ${ruleId}`
  },

  async deleteAutomationRule(ruleId: string) {
    await sql`DELETE FROM automation_rules WHERE id = ${ruleId}`
  },
}

export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

process.on('SIGINT', () => {
  pool.end();
});

