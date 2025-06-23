-- Useful functions for the Kanban Board
-- Function to get tasks that should be moved by automation rules
CREATE OR REPLACE FUNCTION get_tasks_for_automation() RETURNS TABLE (
    task_id UUID,
    rule_id UUID,
    rule_name VARCHAR,
    current_column_id UUID,
    target_column_id UUID,
    reason TEXT
  ) AS $$ BEGIN RETURN QUERY
SELECT t.id as task_id,
  ar.id as rule_id,
  ar.name as rule_name,
  t.column_id as current_column_id,
  ar.action_target_column_id as target_column_id,
  CASE
    WHEN ar.condition_type = 'due_date'
    AND ar.condition_operator = 'is_overdue' THEN 'Task is overdue'
    WHEN ar.condition_type = 'subtasks_completed'
    AND ar.condition_operator = 'all_completed' THEN 'All subtasks completed'
    WHEN ar.condition_type = 'custom_field' THEN 'Custom field condition met: ' || ar.condition_field || ' ' || ar.condition_operator || ' ' || COALESCE(ar.condition_value, '')
    ELSE 'Unknown condition'
  END as reason
FROM tasks t
  JOIN automation_rules ar ON t.board_id = ar.board_id
WHERE ar.enabled = TRUE
  AND t.column_id != ar.action_target_column_id -- Don't move if already in target column
  AND (
    -- Due date conditions
    (
      ar.condition_type = 'due_date'
      AND ar.condition_operator = 'is_overdue'
      AND t.due_date IS NOT NULL
      AND t.due_date < NOW()
      AND t.status != 'Completed'
    )
    OR -- Subtasks completed conditions
    (
      ar.condition_type = 'subtasks_completed'
      AND ar.condition_operator = 'all_completed'
      AND EXISTS (
        SELECT 1
        FROM subtasks
        WHERE task_id = t.id
      )
      AND NOT EXISTS (
        SELECT 1
        FROM subtasks
        WHERE task_id = t.id
          AND completed = FALSE
      )
    )
    OR -- Custom field conditions
    (
      ar.condition_type = 'custom_field'
      AND ar.condition_field IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM custom_fields cf
        WHERE cf.task_id = t.id
          AND cf.name = ar.condition_field
          AND (
            (
              ar.condition_operator = 'equal'
              AND cf.value = ar.condition_value
            )
            OR (
              ar.condition_operator = 'not_equal'
              AND cf.value != ar.condition_value
            )
            OR (
              ar.condition_operator = 'contain'
              AND cf.value ILIKE '%' || ar.condition_value || '%'
            )
          )
      )
    )
  );
END;
$$ LANGUAGE plpgsql;
-- Function to move a task to a different column
CREATE OR REPLACE FUNCTION move_task_to_column(
    p_task_id UUID,
    p_target_column_id UUID
  ) RETURNS BOOLEAN AS $$
DECLARE target_column_title VARCHAR;
task_count INTEGER;
BEGIN -- Get the target column title
SELECT title INTO target_column_title
FROM columns
WHERE id = p_target_column_id;
IF target_column_title IS NULL THEN RAISE EXCEPTION 'Target column not found';
END IF;
-- Get the current max position in the target column
SELECT COALESCE(MAX(position), -1) + 1 INTO task_count
FROM tasks
WHERE column_id = p_target_column_id;
-- Update the task
UPDATE tasks
SET column_id = p_target_column_id,
  status = target_column_title,
  position = task_count,
  updated_at = NOW()
WHERE id = p_task_id;
RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
-- Function to get board summary
CREATE OR REPLACE FUNCTION get_board_summary(p_board_id UUID) RETURNS JSON AS $$
DECLARE result JSON;
BEGIN
SELECT json_build_object(
    'board_id',
    b.id,
    'board_title',
    b.title,
    'total_tasks',
    COUNT(t.id),
    'completed_tasks',
    COUNT(
      CASE
        WHEN t.status = 'Completed' THEN 1
      END
    ),
    'overdue_tasks',
    COUNT(
      CASE
        WHEN t.due_date IS NOT NULL
        AND t.due_date < NOW()
        AND t.status != 'Completed' THEN 1
      END
    ),
    'blocked_tasks',
    COUNT(
      CASE
        WHEN t.status = 'Blocked' THEN 1
      END
    ),
    'completion_percentage',
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
    ),
    'columns',
    json_agg(
      json_build_object(
        'id',
        c.id,
        'title',
        c.title,
        'task_count',
        c.task_count
      )
      ORDER BY c.position
    )
  ) INTO result
FROM boards b
  LEFT JOIN tasks t ON b.id = t.board_id
  LEFT JOIN (
    SELECT c.id,
      c.title,
      c.position,
      COUNT(t.id) as task_count
    FROM columns c
      LEFT JOIN tasks t ON c.id = t.column_id
    WHERE c.board_id = p_board_id
    GROUP BY c.id,
      c.title,
      c.position
  ) c ON TRUE
WHERE b.id = p_board_id
GROUP BY b.id,
  b.title;
RETURN result;
END;
$$ LANGUAGE plpgsql;