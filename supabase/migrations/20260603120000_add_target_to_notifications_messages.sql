-- Record who the notification was intended for (routing intent, not per-user state)
ALTER TABLE notifications_messages
  ADD COLUMN target_role     TEXT,
  ADD COLUMN target_office_id UUID REFERENCES offices(id) ON DELETE SET NULL;

CREATE INDEX idx_notifications_messages_target_role
  ON notifications_messages(target_role);
