DO $$ BEGIN
  CREATE TYPE bid_status AS ENUM ('active', 'won', 'outbid', 'invalid');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS bids (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id       UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hours_offered NUMERIC(10,2) NOT NULL CHECK (hours_offered > 0),
  status        bid_status NOT NULL DEFAULT 'active',
  placed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (task_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_bids_task_id ON bids(task_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_hours   ON bids(task_id, hours_offered ASC) WHERE status = 'active';
