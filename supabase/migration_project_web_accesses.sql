-- ==========================================
-- MIGRACIÓN COMPLETA: Tablas y Funciones Faltantes
-- Ejecutar en Supabase SQL Editor
-- ==========================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- FUNCIONES HELPER (necesarias para RLS)
-- ==========================================

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_project(project_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM projects p
    JOIN clients c ON c.id = p.client_id
    WHERE p.id = project_uuid
    AND (
      public.get_current_user_role() = 'admin'
      OR c.profile_id = auth.uid()
    )
  );
$$;

-- Función para updated_at (sin extensiones externas)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- TABLA: project_web_accesses
-- ==========================================

CREATE TABLE IF NOT EXISTS public.project_web_accesses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    website_url text NOT NULL,
    access_username text NOT NULL DEFAULT '',
    access_password text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_web_accesses_project_id ON public.project_web_accesses(project_id);

ALTER TABLE public.project_web_accesses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view web accesses of their assigned projects" ON public.project_web_accesses;
DROP POLICY IF EXISTS "Admins can insert web accesses" ON public.project_web_accesses;
DROP POLICY IF EXISTS "Admins can update web accesses" ON public.project_web_accesses;
DROP POLICY IF EXISTS "Admins can delete web accesses" ON public.project_web_accesses;
DROP POLICY IF EXISTS "Users can view web accesses for accessible projects" ON public.project_web_accesses;
DROP POLICY IF EXISTS "Only admin can insert web accesses" ON public.project_web_accesses;
DROP POLICY IF EXISTS "Only admin can update web accesses" ON public.project_web_accesses;
DROP POLICY IF EXISTS "Only admin can delete web accesses" ON public.project_web_accesses;

CREATE POLICY "Users can view web accesses for accessible projects" ON public.project_web_accesses
    FOR SELECT USING (public.user_can_access_project(project_id));

CREATE POLICY "Only admin can insert web accesses" ON public.project_web_accesses
    FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admin can update web accesses" ON public.project_web_accesses
    FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admin can delete web accesses" ON public.project_web_accesses
    FOR DELETE USING (public.get_current_user_role() = 'admin');

DROP TRIGGER IF EXISTS set_project_web_accesses_updated_at ON public.project_web_accesses;
CREATE TRIGGER set_project_web_accesses_updated_at
    BEFORE UPDATE ON public.project_web_accesses
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ==========================================
-- TABLA: project_maintenance_logs
-- ==========================================

CREATE TABLE IF NOT EXISTS public.project_maintenance_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    maintenance_date date NOT NULL,
    notes text,
    duration_months integer,
    start_date date,
    expires_at date,
    created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_maintenance_logs_project_id ON public.project_maintenance_logs(project_id);

ALTER TABLE public.project_maintenance_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view maintenance logs for accessible projects" ON public.project_maintenance_logs;
DROP POLICY IF EXISTS "Only admin can insert maintenance logs" ON public.project_maintenance_logs;
DROP POLICY IF EXISTS "Only admin can update maintenance logs" ON public.project_maintenance_logs;
DROP POLICY IF EXISTS "Only admin can delete maintenance logs" ON public.project_maintenance_logs;

CREATE POLICY "Users can view maintenance logs for accessible projects" ON public.project_maintenance_logs
    FOR SELECT USING (public.user_can_access_project(project_id));

CREATE POLICY "Only admin can insert maintenance logs" ON public.project_maintenance_logs
    FOR INSERT WITH CHECK (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admin can update maintenance logs" ON public.project_maintenance_logs
    FOR UPDATE USING (public.get_current_user_role() = 'admin');

CREATE POLICY "Only admin can delete maintenance logs" ON public.project_maintenance_logs
    FOR DELETE USING (public.get_current_user_role() = 'admin');

-- ==========================================
-- TABLA: comments
-- ==========================================

CREATE TABLE IF NOT EXISTS public.comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    author_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_edited boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view comments for accessible projects" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments for accessible projects" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

CREATE POLICY "Users can view comments for accessible projects" ON public.comments
    FOR SELECT USING (public.user_can_access_project(project_id));

CREATE POLICY "Users can create comments for accessible projects" ON public.comments
    FOR INSERT WITH CHECK (public.user_can_access_project(project_id) AND author_id = auth.uid());

CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING (author_id = auth.uid());

-- ==========================================
-- TABLA: project_files
-- ==========================================

CREATE TABLE IF NOT EXISTS public.project_files (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    uploaded_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name text NOT NULL,
    file_path text NOT NULL,
    file_type text,
    file_size bigint,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);

ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view files for accessible projects" ON public.project_files;
DROP POLICY IF EXISTS "Users can insert files for accessible projects" ON public.project_files;
DROP POLICY IF EXISTS "Users can delete own files" ON public.project_files;
DROP POLICY IF EXISTS "Admin can delete any file" ON public.project_files;

CREATE POLICY "Users can view files for accessible projects" ON public.project_files
    FOR SELECT USING (public.user_can_access_project(project_id));

CREATE POLICY "Users can insert files for accessible projects" ON public.project_files
    FOR INSERT WITH CHECK (public.user_can_access_project(project_id) AND uploaded_by = auth.uid());

CREATE POLICY "Users can delete own files" ON public.project_files
    FOR DELETE USING (uploaded_by = auth.uid());

CREATE POLICY "Admin can delete any file" ON public.project_files
    FOR DELETE USING (public.get_current_user_role() = 'admin');

-- ==========================================
-- TABLA: meetings (asegura columna created_by)
-- ==========================================

ALTER TABLE public.meetings
    ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ==========================================
-- NOTIFICAR A POSTGREST PARA RECARGAR SCHEMA
-- ==========================================

NOTIFY pgrst, 'reload schema';
