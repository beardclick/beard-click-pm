-- Migration to fix column and table names to match schema.sql and MASTER.md

DO $$
BEGIN
    -- 1. Fix comments table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'comments' AND column_name = 'profile_id') THEN
        ALTER TABLE comments RENAME COLUMN profile_id TO author_id;
    END IF;

    -- 2. Fix activity_logs table
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'profile_id') THEN
        ALTER TABLE activity_logs RENAME COLUMN profile_id TO actor_id;
    END IF;

    -- 3. Fix files -> project_files
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'files') THEN
        ALTER TABLE files RENAME TO project_files;
    END IF;

    -- 4. Fix project_files columns
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_files' AND column_name = 'profile_id') THEN
        ALTER TABLE project_files RENAME COLUMN profile_id TO uploaded_by;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_files' AND column_name = 'name') THEN
        ALTER TABLE project_files RENAME COLUMN name TO file_name;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_files' AND column_name = 'url') THEN
        ALTER TABLE project_files RENAME COLUMN url TO file_path;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_files' AND column_name = 'type') THEN
        ALTER TABLE project_files RENAME COLUMN type TO file_type;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project_files' AND column_name = 'size') THEN
        ALTER TABLE project_files RENAME COLUMN size TO file_size;
    END IF;

END $$;

-- 5. Create project_web_accesses if it doesn't exist
CREATE TABLE IF NOT EXISTS project_web_accesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  website_url text NOT NULL,
  access_username text NOT NULL DEFAULT '',
  access_password text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_web_accesses_project_id ON project_web_accesses(project_id);

-- 6. Add defaults to existing columns (if table already existed without defaults)
ALTER TABLE project_web_accesses ALTER COLUMN access_username SET DEFAULT '';
ALTER TABLE project_web_accesses ALTER COLUMN access_password SET DEFAULT '';

-- 7. Create project_maintenance_logs if it doesn't exist
CREATE TABLE IF NOT EXISTS project_maintenance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  maintenance_date date NOT NULL,
  notes text,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_maintenance_logs_project_id ON project_maintenance_logs(project_id);
