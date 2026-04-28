-- Migration: Fix Notifications and Activity Logs
-- This migration ensures the tables exist and adds the necessary improvements.

-- 1. Ensure notifications table exists
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  type text NOT NULL CHECK (type IN ('project_created', 'comment_added', 'meeting_created', 'meeting_updated', 'file_uploaded', 'file_deleted', 'general')),
  title text NOT NULL,
  message text,
  related_project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  related_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  related_meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  related_file_id uuid REFERENCES project_files(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Ensure activity_logs table exists
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('project_created', 'project_updated', 'client_created', 'comment_added', 'comment_updated', 'meeting_created', 'meeting_updated', 'file_uploaded', 'file_deleted')),
  title text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Add last_seen_activity_at to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_activity_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Enable Realtime for notifications and activity_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

-- Add tables to the publication (using exception handling in case they are already added)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'notifications table already in publication or error occurred';
  END;
  
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
  EXCEPTION WHEN others THEN
    RAISE NOTICE 'activity_logs table already in publication or error occurred';
  END;
END $$;

-- 5. Ensure indices for performance
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- 6. Enable RLS and Policies if they were missing
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (recipient_id = auth.uid());
DROP POLICY IF EXISTS "Admin can insert notifications" ON notifications;
CREATE POLICY "Admin can insert notifications" ON notifications FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (recipient_id = auth.uid());

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin can view all activity" ON activity_logs;
CREATE POLICY "Admin can view all activity" ON activity_logs FOR SELECT USING (public.get_current_user_role() = 'admin');
DROP POLICY IF EXISTS "Clients can view activity for accessible projects" ON activity_logs;
CREATE POLICY "Clients can view activity for accessible projects" ON activity_logs FOR SELECT USING (public.user_can_access_project(project_id));
DROP POLICY IF EXISTS "Admin can insert activity" ON activity_logs;
CREATE POLICY "Admin can insert activity" ON activity_logs FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');
