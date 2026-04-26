-- ==========================================
-- Beard Click Design - Schema Completo
-- ==========================================

-- Habilitar extensión para UUIDs
create extension if not exists "pgcrypto";

-- 1. Tablas

-- Tabla profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in ('admin', 'client')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  company text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla projects
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'paused', 'completed', 'cancelled')),
  start_date date,
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla comments
create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  is_edited boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla meetings
create table if not exists meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  description text,
  meeting_url text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tabla project_files
create table if not exists project_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  uploaded_by uuid not null references profiles(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

-- Tabla notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references profiles(id) on delete cascade,
  actor_id uuid references profiles(id) on delete set null,
  type text not null check (type in ('project_created', 'comment_added', 'meeting_created', 'meeting_updated', 'file_uploaded', 'file_deleted', 'general')),
  title text not null,
  message text,
  related_project_id uuid references projects(id) on delete cascade,
  related_comment_id uuid references comments(id) on delete cascade,
  related_meeting_id uuid references meetings(id) on delete cascade,
  related_file_id uuid references project_files(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Tabla activity_logs
create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  project_id uuid references projects(id) on delete cascade,
  client_id uuid references clients(id) on delete cascade,
  type text not null check (type in ('project_created', 'project_updated', 'client_created', 'comment_added', 'comment_updated', 'meeting_created', 'meeting_updated', 'file_uploaded', 'file_deleted')),
  title text not null,
  description text,
  created_at timestamptz not null default now()
);

-- ==========================================
-- 2. Funciones Helpers
-- ==========================================

create or replace function public.get_current_user_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.user_can_access_project(project_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from projects p
    join clients c on c.id = p.client_id
    where p.id = project_uuid
    and (
      public.get_current_user_role() = 'admin'
      or c.profile_id = auth.uid()
    )
  );
$$;

-- ==========================================
-- 3. Row Level Security (RLS)
-- ==========================================

-- PROFILES
alter table profiles enable row level security;
drop policy if exists "Users can view own profile" on profiles;
drop policy if exists "Admin can view all profiles" on profiles;
drop policy if exists "Admin can insert profiles" on profiles;
drop policy if exists "Admin can update profiles" on profiles;
drop policy if exists "Admin can delete profiles" on profiles;

create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Admin can view all profiles" on profiles for select using (public.get_current_user_role() = 'admin');
create policy "Admin can insert profiles" on profiles for insert with check (public.get_current_user_role() = 'admin');
create policy "Admin can update profiles" on profiles for update using (public.get_current_user_role() = 'admin');
create policy "Admin can delete profiles" on profiles for delete using (public.get_current_user_role() = 'admin');

-- CLIENTS
alter table clients enable row level security;
drop policy if exists "Admin can manage all clients" on clients;
drop policy if exists "Clients can view own client record" on clients;

create policy "Admin can manage all clients" on clients for all using (public.get_current_user_role() = 'admin');
create policy "Clients can view own client record" on clients for select using (profile_id = auth.uid());

-- PROJECTS
alter table projects enable row level security;
drop policy if exists "Admin can manage all projects" on projects;
drop policy if exists "Clients can view own projects" on projects;

create policy "Admin can manage all projects" on projects for all using (public.get_current_user_role() = 'admin');
create policy "Clients can view own projects" on projects for select using (
  exists (
    select 1 from clients c where c.id = projects.client_id and c.profile_id = auth.uid()
  )
);

-- COMMENTS
alter table comments enable row level security;
drop policy if exists "Users can view comments for accessible projects" on comments;
drop policy if exists "Users can create comments for accessible projects" on comments;
drop policy if exists "Users can update own comments" on comments;
drop policy if exists "Users can delete own comments" on comments;

create policy "Users can view comments for accessible projects" on comments for select using (public.user_can_access_project(project_id));
create policy "Users can create comments for accessible projects" on comments for insert with check (
  public.user_can_access_project(project_id) and author_id = auth.uid()
);
create policy "Users can update own comments" on comments for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "Users can delete own comments" on comments for delete using (author_id = auth.uid());

-- MEETINGS
alter table meetings enable row level security;
drop policy if exists "Users can view meetings for accessible projects" on meetings;
drop policy if exists "Only admin can insert meetings" on meetings;
drop policy if exists "Only admin can update meetings" on meetings;
drop policy if exists "Only admin can delete meetings" on meetings;

create policy "Users can view meetings for accessible projects" on meetings for select using (public.user_can_access_project(project_id));
create policy "Only admin can insert meetings" on meetings for insert with check (public.get_current_user_role() = 'admin');
create policy "Only admin can update meetings" on meetings for update using (public.get_current_user_role() = 'admin');
create policy "Only admin can delete meetings" on meetings for delete using (public.get_current_user_role() = 'admin');

-- PROJECT FILES
alter table project_files enable row level security;
drop policy if exists "Users can view files for accessible projects" on project_files;
drop policy if exists "Users can insert files for accessible projects" on project_files;
drop policy if exists "Users can delete own files" on project_files;
drop policy if exists "Admin can delete any file" on project_files;

create policy "Users can view files for accessible projects" on project_files for select using (public.user_can_access_project(project_id));
create policy "Users can insert files for accessible projects" on project_files for insert with check (
  public.user_can_access_project(project_id) and uploaded_by = auth.uid()
);
create policy "Users can delete own files" on project_files for delete using (uploaded_by = auth.uid());
create policy "Admin can delete any file" on project_files for delete using (public.get_current_user_role() = 'admin');

-- NOTIFICATIONS
alter table notifications enable row level security;
drop policy if exists "Users can view own notifications" on notifications;
drop policy if exists "Admin can insert notifications" on notifications;
drop policy if exists "Users can update own notifications" on notifications;

create policy "Users can view own notifications" on notifications for select using (recipient_id = auth.uid());
create policy "Admin can insert notifications" on notifications for insert with check (public.get_current_user_role() = 'admin');
create policy "Users can update own notifications" on notifications for update using (recipient_id = auth.uid());

-- ACTIVITY LOGS
alter table activity_logs enable row level security;
drop policy if exists "Admin can view all activity" on activity_logs;
drop policy if exists "Clients can view activity for accessible projects" on activity_logs;
drop policy if exists "Admin can insert activity" on activity_logs;

create policy "Admin can view all activity" on activity_logs for select using (public.get_current_user_role() = 'admin');
create policy "Clients can view activity for accessible projects" on activity_logs for select using (public.user_can_access_project(project_id));
create policy "Admin can insert activity" on activity_logs for insert with check (public.get_current_user_role() = 'admin');

-- ==========================================
-- 4. Storage Bucket RLS (Para correr después de crear bucket en panel)
-- ==========================================
/*
insert into storage.buckets (id, name, public) values ('project-files', 'project-files', false);

create policy "Users can select their project files" on storage.objects for select using (
  bucket_id = 'project-files' and public.user_can_access_project((storage.foldername(name))[1]::uuid)
);
create policy "Users can upload their project files" on storage.objects for insert with check (
  bucket_id = 'project-files' and public.user_can_access_project((storage.foldername(name))[1]::uuid)
);
create policy "Users can delete their own files" on storage.objects for delete using (
  bucket_id = 'project-files' and (auth.uid() = owner or public.get_current_user_role() = 'admin')
);
*/
