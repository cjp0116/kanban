-- Create useful views for the Kanban Board
-- View for tasks with their column information
CREATE OR REPLACE VIEW task_details AS
SELECT t.id,
  t.title,
  t.description,
  t.status,
  t.due_date,
  t.position as task_position,
  t.created_at,
  t.updated_at,
  c.id as column_id,
  c.title as column_title,
  c.color as column_color,
  c.position as column_position,
  b.id as board_id,
  b.title as board_title,
  -- Count subtasks
  (
    SELECT COUNT(*)
    FROM subtasks
    WHERE task_id = t.id
  ) as total_subtasks,
  (
    SELECT COUNT(*)
    FROM subtasks
    WHERE task_id = t.id
      AND completed = TRUE
  ) as completed_subtasks,
  -- Check if overdue
  CASE
    WHEN t.due_date IS NOT NULL
    AND t.due_date < NOW()
    AND t.status != 'Completed' THEN TRUE
    ELSE FALSE
  END as is_overdue
FROM tasks t
  JOIN columns c ON t.column_id = c.id
  JOIN boards b ON t.board_id = b.id;
-- View for board statistics
CREATE OR REPLACE VIEW board_stats AS
SELECT b.id as board_id,
  b.title as board_title,
  COUNT(t.id) as total_tasks,
  COUNT(
    CASE
      WHEN t.status = 'Completed' THEN 1
    END
  ) as completed_tasks,
  COUNT(
    CASE
      WHEN t.due_date IS NOT NULL
      AND t.due_date < NOW()
      AND t.status != 'Completed' THEN 1
    END
  ) as overdue_tasks,
  COUNT(
    CASE
      WHEN t.status = 'Blocked' THEN 1
    END
  ) as blocked_tasks,
  COUNT(
    CASE
      WHEN t.status = 'In Progress' THEN 1
    END
  ) as in_progress_tasks,
  ROUND(
    CASE
      WHEN COUNT(t.id) > 0 THEN (
        COUNT(
          CASE
            WHEN t.status = 'Completed' THEN 1
          END
        )::DECIMAL / COUNT(t.id)
      ) * 100
      ELSE 0
    END,
    2
  ) as completion_percentage
FROM boards b
  LEFT JOIN tasks t ON b.id = t.board_id
GROUP BY b.id,
  b.title;
-- View for task activity (recent changes)
CREATE OR REPLACE VIEW recent_task_activity AS
SELECT t.id,
  t.title,
  t.status,
  t.updated_at,
  c.title as column_title,
  b.title as board_title,
  CASE
    WHEN t.created_at = t.updated_at THEN 'created'
    ELSE 'updated'
  END as activity_type
FROM tasks t
  JOIN columns c ON t.column_id = c.id
  JOIN boards b ON t.board_id = b.id
ORDER BY t.updated_at DESC
LIMIT 50;
-- View for automation rule details
CREATE OR REPLACE VIEW automation_rule_details AS
SELECT ar.id,
  ar.name,
  ar.enabled,
  ar.condition_type,
  ar.condition_operator,
  ar.condition_field,
  ar.condition_value,
  ar.action_type,
  c.title as target_column_title,
  b.title as board_title,
  ar.created_at,
  ar.updated_at
FROM automation_rules ar
  JOIN columns c ON ar.action_target_column_id = c.id
  JOIN boards b ON ar.board_id = b.id;