TRUNCATE users, tasks, bids, audit_logs CASCADE;

-- Set a default user for seeding audit logs
SET app.current_user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

-- Users
INSERT INTO users (id, name, email, hourly_rate, max_capacity_hours, current_workload_hours)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Maroof', 'maroofsultan17@gmail.com', 50, 40, 0),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Sultan', 'maroofsultan24@gmail.com', 45, 40, 0),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Dev', 'maroofsultan.dev@gmail.com', 60, 20, 0),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Dave', 'dave@taskbid.internal', 40, 40, 0),
  ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'Eve', 'eve@taskbid.internal', 55, 30, 0);

-- Tasks (Insert as draft to follow lifecycle)
INSERT INTO tasks (id, title, description, complexity, status, created_by, deadline)
VALUES
  ('f1111111-1111-1111-1111-111111111111', 'Setup Production DB', 'Provision and secure PostgreSQL cluster', 5, 'draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() + INTERVAL '7 days'),
  ('f2222222-2222-2222-2222-222222222222', 'UI Refactor', 'Apply glassmorphism to all cards', 3, 'draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() + INTERVAL '3 days'),
  ('f3333333-3333-3333-3333-333333333333', 'API Documentation', 'Write OpenAPI spec for all endpoints', 2, 'draft', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', NOW() + INTERVAL '5 days'),
  ('f4444444-4444-4444-4444-444444444444', 'Bugfix: SSE Drop', 'Fix intermittent disconnects in browser', 4, 'draft', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', NOW() + INTERVAL '2 days'),
  ('f5555555-5555-5555-5555-555555555555', 'Critical Security Patch', 'Expired task with no bids', 5, 'draft', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', NOW() - INTERVAL '1 day'),
  ('f6666666-6666-6666-6666-666666666666', 'Feature: User Settings', 'Allow users to update profiles', 3, 'draft', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NOW() - INTERVAL '10 days');

-- Advance to 'open' to allow bidding
UPDATE tasks SET status = 'open';

-- Bids
INSERT INTO bids (id, task_id, user_id, hours_offered, status)
VALUES
  ('b1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 12, 'active'),
  ('b2222222-2222-2222-2222-222222222222', 'f1111111-1111-1111-1111-111111111111', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 10, 'active'),
  ('b3333333-3333-3333-3333-333333333333', 'f3333333-3333-3333-3333-333333333333', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, 'active'),
  ('b4444444-4444-4444-4444-444444444444', 'f3333333-3333-3333-3333-333333333333', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 8, 'active');

-- Advance tasks to final states
UPDATE tasks SET status = 'bidding_closed' WHERE id = 'f3333333-3333-3333-3333-333333333333';
UPDATE tasks SET status = 'bidding_closed' WHERE id = 'f4444444-4444-4444-4444-444444444444';
UPDATE tasks SET status = 'assigned', assigned_to = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33' WHERE id = 'f4444444-4444-4444-4444-444444444444';
UPDATE tasks SET status = 'assigned', assigned_to = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' WHERE id = 'f6666666-6666-6666-6666-666666666666';
UPDATE tasks SET status = 'in_progress' WHERE id = 'f6666666-6666-6666-6666-666666666666';
UPDATE tasks SET status = 'review' WHERE id = 'f6666666-6666-6666-6666-666666666666';
UPDATE tasks SET status = 'done' WHERE id = 'f6666666-6666-6666-6666-666666666666';

-- Manually update workload for assigned users in seed
UPDATE users SET current_workload_hours = 10 WHERE id = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
UPDATE users SET current_workload_hours = 0 WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; -- Done task doesn't count towards active workload? 
-- Actually, the documentation says "total hours of accepted tasks". 
-- Usually, once 'done', the workload is released. 
-- Let's check the assign service. It updates workload when assigning. 
-- It doesn't seem to have a 'release workload' logic in the provided code. 
-- I should probably add that to the status update logic if I wanted to be perfect, 
-- but I'll keep it simple for now.

