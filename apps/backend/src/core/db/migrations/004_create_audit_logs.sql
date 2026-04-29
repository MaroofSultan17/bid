CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  TEXT NOT NULL,
  entity_id    UUID NOT NULL,
  changed_by   UUID REFERENCES users(id) ON DELETE SET NULL,
  field_changed TEXT NOT NULL,
  old_value    JSONB,
  new_value    JSONB,
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_entity     ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_changed_at ON audit_logs(changed_at DESC);
