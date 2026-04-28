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
