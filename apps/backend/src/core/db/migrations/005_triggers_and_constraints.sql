-- Prevent self-bidding
CREATE OR REPLACE FUNCTION fn_prevent_self_bid()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM tasks WHERE id = NEW.task_id AND created_by = NEW.user_id
  ) THEN
    RAISE EXCEPTION 'ERR_SELF_BID: User cannot bid on their own task';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_self_bid ON bids;
CREATE TRIGGER trg_prevent_self_bid
  BEFORE INSERT ON bids
  FOR EACH ROW EXECUTE FUNCTION fn_prevent_self_bid();

-- Prevent bidding when task is not open
CREATE OR REPLACE FUNCTION fn_require_task_open()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM tasks WHERE id = NEW.task_id AND status = 'open'
  ) THEN
    RAISE EXCEPTION 'ERR_BIDDING_CLOSED: Task is not accepting bids';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_require_task_open ON bids;
CREATE TRIGGER trg_require_task_open
  BEFORE INSERT ON bids
  FOR EACH ROW EXECUTE FUNCTION fn_require_task_open();

-- Prevent status from moving backward
CREATE OR REPLACE FUNCTION fn_enforce_status_forward()
RETURNS TRIGGER AS $$
DECLARE
  status_order TEXT[] := ARRAY[
    'draft','open','bidding_closed','assigned','in_progress','review','done'
  ];
BEGIN
  IF array_position(status_order, NEW.status::TEXT) < array_position(status_order, OLD.status::TEXT) THEN
    IF OLD.status = 'bidding_closed' AND NEW.status = 'open' THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'ERR_STATUS_BACKWARD: Cannot move task from % to %', OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_status_forward ON tasks;
CREATE TRIGGER trg_enforce_status_forward
  BEFORE UPDATE OF status ON tasks
  FOR EACH ROW EXECUTE FUNCTION fn_enforce_status_forward();

-- Audit log for task changes
CREATE OR REPLACE FUNCTION fn_audit_task()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs(entity_type, entity_id, field_changed, old_value, new_value)
    VALUES ('task', NEW.id, 'status', to_jsonb(OLD.status::TEXT), to_jsonb(NEW.status::TEXT));
  END IF;
  IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
    INSERT INTO audit_logs(entity_type, entity_id, field_changed, old_value, new_value)
    VALUES ('task', NEW.id, 'assigned_to', to_jsonb(OLD.assigned_to), to_jsonb(NEW.assigned_to));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_task ON tasks;
CREATE TRIGGER trg_audit_task
  AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION fn_audit_task();

-- Audit log for bid changes
CREATE OR REPLACE FUNCTION fn_audit_bid()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs(entity_type, entity_id, field_changed, old_value, new_value)
    VALUES ('bid', NEW.id, 'status', NULL, to_jsonb(NEW.status::TEXT));
  ELSIF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO audit_logs(entity_type, entity_id, field_changed, old_value, new_value)
    VALUES ('bid', NEW.id, 'status', to_jsonb(OLD.status::TEXT), to_jsonb(NEW.status::TEXT));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_bid ON bids;
CREATE TRIGGER trg_audit_bid
  AFTER INSERT OR UPDATE ON bids
  FOR EACH ROW EXECUTE FUNCTION fn_audit_bid();
