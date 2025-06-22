-- Seed demo data for Kanban Board
-- Insert demo user
INSERT INTO users (id, email, name)
VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'demo@example.com',
    'Demo User'
  ) ON CONFLICT (email) DO NOTHING;
-- Insert demo board
INSERT INTO boards (id, title, description, user_id)
VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'Product Development Board',
    'Main board for tracking product development tasks',
    '550e8400-e29b-41d4-a716-446655440000'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert columns
INSERT INTO columns (id, title, color, position, board_id)
VALUES (
    '550e8400-e29b-41d4-a716-446655440010',
    'To Do',
    'bg-blue-50 dark:bg-blue-900/30',
    0,
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440011',
    'In Progress',
    'bg-yellow-50 dark:bg-yellow-900/30',
    1,
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    'Blocked',
    'bg-red-50 dark:bg-red-900/30',
    2,
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440013',
    'Completed',
    'bg-green-50 dark:bg-green-900/30',
    3,
    '550e8400-e29b-41d4-a716-446655440001'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert tasks for "To Do" column
INSERT INTO tasks (
    id,
    title,
    description,
    status,
    due_date,
    position,
    column_id,
    board_id,
    created_at
  )
VALUES (
    '550e8400-e29b-41d4-a716-446655440020',
    'Research competitor products',
    'Analyze top 5 competitor products and create a comparison report',
    'To Do',
    NOW() + INTERVAL '5 days',
    0,
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '2 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440021',
    'Design new landing page',
    'Create wireframes and mockups for the new product landing page',
    'To Do',
    NOW() + INTERVAL '7 days',
    1,
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '1 day'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440022',
    'Update documentation',
    'Update the user documentation with the latest features',
    'To Do',
    NOW() + INTERVAL '3 days',
    2,
    '550e8400-e29b-41d4-a716-446655440010',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '3 days'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert tasks for "In Progress" column
INSERT INTO tasks (
    id,
    title,
    description,
    status,
    due_date,
    position,
    column_id,
    board_id,
    created_at
  )
VALUES (
    '550e8400-e29b-41d4-a716-446655440030',
    'Implement authentication flow',
    'Create login, registration, and password reset functionality',
    'In Progress',
    NOW() + INTERVAL '2 days',
    0,
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '5 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440031',
    'Optimize database queries',
    'Improve performance of slow database queries on the dashboard',
    'In Progress',
    NOW() + INTERVAL '1 day',
    1,
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '4 days'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert tasks for "Blocked" column
INSERT INTO tasks (
    id,
    title,
    description,
    status,
    due_date,
    position,
    column_id,
    board_id,
    created_at
  )
VALUES (
    '550e8400-e29b-41d4-a716-446655440040',
    'Fix payment integration',
    'Resolve issues with the Stripe payment integration',
    'Blocked',
    NOW() - INTERVAL '1 day',
    0,
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '7 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440041',
    'Finalize third-party integrations',
    'Complete integration with analytics and marketing tools',
    'Blocked',
    NOW() - INTERVAL '2 days',
    1,
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '6 days'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert tasks for "Completed" column
INSERT INTO tasks (
    id,
    title,
    description,
    status,
    due_date,
    position,
    column_id,
    board_id,
    created_at
  )
VALUES (
    '550e8400-e29b-41d4-a716-446655440050',
    'Create project proposal',
    'Draft and finalize the project proposal document',
    'Completed',
    NOW() - INTERVAL '5 days',
    0,
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '10 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440051',
    'Set up development environment',
    'Configure development, staging, and production environments',
    'Completed',
    NOW() - INTERVAL '8 days',
    1,
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '12 days'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440052',
    'Initial user research',
    'Conduct interviews and surveys with potential users',
    'Completed',
    NOW() - INTERVAL '15 days',
    2,
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '20 days'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert subtasks for "Research competitor products" task
INSERT INTO subtasks (id, title, completed, position, task_id)
VALUES (
    '550e8400-e29b-41d4-a716-446655440060',
    'Identify top competitors',
    FALSE,
    0,
    '550e8400-e29b-41d4-a716-446655440020'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440061',
    'Create comparison criteria',
    FALSE,
    1,
    '550e8400-e29b-41d4-a716-446655440020'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440062',
    'Gather product information',
    FALSE,
    2,
    '550e8400-e29b-41d4-a716-446655440020'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert subtasks for "Design new landing page" task
INSERT INTO subtasks (id, title, completed, position, task_id)
VALUES (
    '550e8400-e29b-41d4-a716-446655440063',
    'Research design trends',
    FALSE,
    0,
    '550e8400-e29b-41d4-a716-446655440021'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440064',
    'Create wireframes',
    FALSE,
    1,
    '550e8400-e29b-41d4-a716-446655440021'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert subtasks for "Implement authentication flow" task
INSERT INTO subtasks (id, title, completed, position, task_id)
VALUES (
    '550e8400-e29b-41d4-a716-446655440065',
    'Design authentication screens',
    TRUE,
    0,
    '550e8400-e29b-41d4-a716-446655440030'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440066',
    'Implement login functionality',
    TRUE,
    1,
    '550e8400-e29b-41d4-a716-446655440030'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440067',
    'Implement registration',
    FALSE,
    2,
    '550e8400-e29b-41d4-a716-446655440030'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440068',
    'Implement password reset',
    FALSE,
    3,
    '550e8400-e29b-41d4-a716-446655440030'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert subtasks for "Optimize database queries" task
INSERT INTO subtasks (id, title, completed, position, task_id)
VALUES (
    '550e8400-e29b-41d4-a716-446655440069',
    'Identify slow queries',
    TRUE,
    0,
    '550e8400-e29b-41d4-a716-446655440031'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440070',
    'Add indexes',
    FALSE,
    1,
    '550e8400-e29b-41d4-a716-446655440031'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440071',
    'Rewrite complex queries',
    FALSE,
    2,
    '550e8400-e29b-41d4-a716-446655440031'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert subtasks for "Fix payment integration" task
INSERT INTO subtasks (id, title, completed, position, task_id)
VALUES (
    '550e8400-e29b-41d4-a716-446655440072',
    'Investigate error logs',
    TRUE,
    0,
    '550e8400-e29b-41d4-a716-446655440040'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440073',
    'Contact Stripe support',
    TRUE,
    1,
    '550e8400-e29b-41d4-a716-446655440040'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440074',
    'Update API integration',
    FALSE,
    2,
    '550e8400-e29b-41d4-a716-446655440040'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert subtasks for "Finalize third-party integrations" task
INSERT INTO subtasks (id, title, completed, position, task_id)
VALUES (
    '550e8400-e29b-41d4-a716-446655440075',
    'Set up Google Analytics',
    TRUE,
    0,
    '550e8400-e29b-41d4-a716-446655440041'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440076',
    'Integrate Mailchimp',
    FALSE,
    1,
    '550e8400-e29b-41d4-a716-446655440041'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert subtasks for completed tasks
INSERT INTO subtasks (id, title, completed, position, task_id)
VALUES (
    '550e8400-e29b-41d4-a716-446655440077',
    'Research market needs',
    TRUE,
    0,
    '550e8400-e29b-41d4-a716-446655440050'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440078',
    'Define project scope',
    TRUE,
    1,
    '550e8400-e29b-41d4-a716-446655440050'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440079',
    'Create budget estimate',
    TRUE,
    2,
    '550e8400-e29b-41d4-a716-446655440050'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440080',
    'Set up local environment',
    TRUE,
    0,
    '550e8400-e29b-41d4-a716-446655440051'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440081',
    'Configure staging server',
    TRUE,
    1,
    '550e8400-e29b-41d4-a716-446655440051'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440082',
    'Set up CI/CD pipeline',
    TRUE,
    2,
    '550e8400-e29b-41d4-a716-446655440051'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440083',
    'Create research questions',
    TRUE,
    0,
    '550e8400-e29b-41d4-a716-446655440052'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440084',
    'Recruit participants',
    TRUE,
    1,
    '550e8400-e29b-41d4-a716-446655440052'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440085',
    'Analyze results',
    TRUE,
    2,
    '550e8400-e29b-41d4-a716-446655440052'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert custom fields
INSERT INTO custom_fields (id, name, value, task_id)
VALUES -- Research competitor products
  (
    '550e8400-e29b-41d4-a716-446655440100',
    'Priority',
    'High',
    '550e8400-e29b-41d4-a716-446655440020'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440101',
    'Estimated Hours',
    '8',
    '550e8400-e29b-41d4-a716-446655440020'
  ),
  -- Design new landing page
  (
    '550e8400-e29b-41d4-a716-446655440102',
    'Priority',
    'Medium',
    '550e8400-e29b-41d4-a716-446655440021'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440103',
    'Assigned To',
    'Sarah',
    '550e8400-e29b-41d4-a716-446655440021'
  ),
  -- Update documentation
  (
    '550e8400-e29b-41d4-a716-446655440104',
    'Priority',
    'Low',
    '550e8400-e29b-41d4-a716-446655440022'
  ),
  -- Implement authentication flow
  (
    '550e8400-e29b-41d4-a716-446655440105',
    'Priority',
    'High',
    '550e8400-e29b-41d4-a716-446655440030'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440106',
    'Assigned To',
    'Michael',
    '550e8400-e29b-41d4-a716-446655440030'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440107',
    'Story Points',
    '8',
    '550e8400-e29b-41d4-a716-446655440030'
  ),
  -- Optimize database queries
  (
    '550e8400-e29b-41d4-a716-446655440108',
    'Priority',
    'High',
    '550e8400-e29b-41d4-a716-446655440031'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440109',
    'Estimated Hours',
    '6',
    '550e8400-e29b-41d4-a716-446655440031'
  ),
  -- Fix payment integration
  (
    '550e8400-e29b-41d4-a716-446655440110',
    'Priority',
    'Critical',
    '550e8400-e29b-41d4-a716-446655440040'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440111',
    'Blocker',
    'Waiting for API documentation',
    '550e8400-e29b-41d4-a716-446655440040'
  ),
  -- Finalize third-party integrations
  (
    '550e8400-e29b-41d4-a716-446655440112',
    'Priority',
    'Medium',
    '550e8400-e29b-41d4-a716-446655440041'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440113',
    'Blocker',
    'Waiting for API keys',
    '550e8400-e29b-41d4-a716-446655440041'
  ),
  -- Create project proposal
  (
    '550e8400-e29b-41d4-a716-446655440114',
    'Priority',
    'High',
    '550e8400-e29b-41d4-a716-446655440050'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440115',
    'Completed On',
    (NOW() - INTERVAL '6 days')::DATE::TEXT,
    '550e8400-e29b-41d4-a716-446655440050'
  ),
  -- Set up development environment
  (
    '550e8400-e29b-41d4-a716-446655440116',
    'Priority',
    'Medium',
    '550e8400-e29b-41d4-a716-446655440051'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440117',
    'Completed By',
    'David',
    '550e8400-e29b-41d4-a716-446655440051'
  ),
  -- Initial user research
  (
    '550e8400-e29b-41d4-a716-446655440118',
    'Priority',
    'High',
    '550e8400-e29b-41d4-a716-446655440052'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440119',
    'Participants',
    '12',
    '550e8400-e29b-41d4-a716-446655440052'
  ) ON CONFLICT (id) DO NOTHING;
-- Insert automation rules
INSERT INTO automation_rules (
    id,
    name,
    enabled,
    condition_type,
    condition_operator,
    action_type,
    action_target_column_id,
    board_id
  )
VALUES (
    '550e8400-e29b-41d4-a716-446655440200',
    'Move overdue tasks to Blocked',
    TRUE,
    'due-date',
    'is-overdue',
    'move-to-column',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440001'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440201',
    'Move completed tasks when all subtasks done',
    TRUE,
    'subtasks-completed',
    'all-completed',
    'move-to-column',
    '550e8400-e29b-41d4-a716-446655440013',
    '550e8400-e29b-41d4-a716-446655440001'
  ) ON CONFLICT (id) DO NOTHING;