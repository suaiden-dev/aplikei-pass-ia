-- Notification messages (one record per notification event)
CREATE TABLE notifications_messages (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_user_id   UUID        REFERENCES user_accounts(id) ON DELETE SET NULL,
  status           TEXT        NOT NULL DEFAULT 'pending',
  category         TEXT,
  action           TEXT,
  process_id       UUID        REFERENCES user_services(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification recipients (one row per user that should receive a message)
CREATE TABLE notifications_groups (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id  UUID        NOT NULL REFERENCES notifications_messages(id) ON DELETE CASCADE,
  user_id          UUID        NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  role             TEXT,
  office_id        UUID        REFERENCES offices(id) ON DELETE SET NULL,
  viewed           BOOLEAN     NOT NULL DEFAULT FALSE,
  email_sent       BOOLEAN     NOT NULL DEFAULT FALSE
);

-- Indexes for common query patterns
CREATE INDEX idx_notifications_groups_user_id       ON notifications_groups(user_id);
CREATE INDEX idx_notifications_groups_notification  ON notifications_groups(notification_id);
CREATE INDEX idx_notifications_messages_process     ON notifications_messages(process_id);
CREATE INDEX idx_notifications_messages_sender      ON notifications_messages(sender_user_id);

-- RLS
ALTER TABLE notifications_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications_groups   ENABLE ROW LEVEL SECURITY;

-- Users can read messages where they are a recipient
CREATE POLICY "users can read own notifications_messages"
  ON notifications_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM notifications_groups ng
      WHERE ng.notification_id = notifications_messages.id
        AND ng.user_id = auth.uid()
    )
  );

-- Users can read their own notification group rows
CREATE POLICY "users can read own notifications_groups"
  ON notifications_groups FOR SELECT
  USING (user_id = auth.uid());

-- Users can mark their own notifications as viewed
CREATE POLICY "users can update own notifications_groups"
  ON notifications_groups FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Service role bypass (for server-side inserts)
CREATE POLICY "service role full access notifications_messages"
  ON notifications_messages FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "service role full access notifications_groups"
  ON notifications_groups FOR ALL
  USING (auth.role() = 'service_role');
