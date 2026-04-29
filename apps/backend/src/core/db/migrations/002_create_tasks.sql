DO $$ BEGIN
  CREATE TYPE task_status AS ENUM (
    'draft', 'open', 'bidding_closed', 'assigned', 'in_progress', 'review', 'done'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  complexity  SMALLINT NOT NULL CHECK (complexity BETWEEN 1 AND 5),
  status      task_status NOT NULL DEFAULT 'draft',
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  deadline    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_deadline   ON tasks(deadline) WHERE deadline IS NOT NULL;
