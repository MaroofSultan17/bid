CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  hourly_rate   NUMERIC(10,2) NOT NULL DEFAULT 0,
  current_workload_hours NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (current_workload_hours >= 0),
  max_capacity_hours     NUMERIC(10,2) NOT NULL DEFAULT 40 CHECK (max_capacity_hours > 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT workload_within_capacity CHECK (current_workload_hours <= max_capacity_hours)
);
