-- Migration: UI Improvements RLS
-- Allow admins to delete any comment

-- 1. Update comments policy
DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
DROP POLICY IF EXISTS "Admin can delete any comment" ON comments;

-- This policy allows users to delete their own comments OR admins to delete any comment
CREATE POLICY "Users can delete own comments or admin manage" ON comments
FOR DELETE USING (
  author_id = auth.uid() OR 
  public.get_current_user_role() = 'admin'
);

-- 2. Ensure admin can view all activity (already exists, but just in case)
DROP POLICY IF EXISTS "Admin can view all activity" ON activity_logs;
CREATE POLICY "Admin can view all activity" ON activity_logs FOR SELECT USING (public.get_current_user_role() = 'admin');
