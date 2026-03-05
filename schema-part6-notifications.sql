-- ================================================================
-- Notifications Table + RLS
-- Run this in Supabase SQL Editor
-- ================================================================

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid () PRIMARY KEY,
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "Users can read own notifications" ON notifications FOR
SELECT USING (auth.uid () = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
FOR UPDATE
    USING (auth.uid () = user_id);

CREATE POLICY "Service role can insert notifications" ON notifications FOR INSERT
WITH
    CHECK (true);

-- 4. Index for fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (user_id, read);

-- 5. Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;