-- Momentum Supabase Cloud Schema & Migration
-- Fully idempotently sets up tables, triggers, functions, RLS policies, and realtime.
create extension if not exists pgcrypto;

-- 1. PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  avatar_url text,
  title text not null default 'Momentum member',
  role text not null default 'Member',
  bio text not null default '',
  streak_days integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Ensure newly added columns exist if table already existed
alter table public.profiles add column if not exists email text not null default '';
alter table public.profiles add column if not exists title text not null default 'Momentum member';
alter table public.profiles add column if not exists role text not null default 'Member';
alter table public.profiles add column if not exists bio text not null default '';
alter table public.profiles add column if not exists streak_days integer not null default 0;

-- 2. WORKSPACES
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 80),
  description text not null default '',
  owner_id uuid not null references auth.users(id) on delete restrict,
  icon text not null default 'Sparkles',
  color text not null default '#1E3A2F',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workspaces add column if not exists icon text not null default 'Sparkles';
alter table public.workspaces add column if not exists color text not null default '#1E3A2F';
alter table public.workspaces add column if not exists updated_at timestamptz not null default now();

-- 3. WORKSPACE MEMBERS
create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- 4. WORKSPACE INVITATIONS
create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  code_hash text not null unique,
  expires_at timestamptz not null,
  max_uses integer not null default 10 check (max_uses between 1 and 100),
  use_count integer not null default 0 check (use_count >= 0),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

-- 5. GOALS
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text not null default '',
  goal_type text not null default 'personal' check (goal_type in ('personal','group')),
  visibility text not null default 'private' check (visibility in ('private','workspace','friends')),
  status text not null default 'active' check (status in ('active','completed','archived')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  category text not null default 'Personal',
  start_date date default current_date,
  due_date date,
  milestones jsonb not null default '[]'::jsonb,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals add column if not exists archived boolean not null default false;
alter table public.goals add column if not exists start_date date default current_date;

-- 6. TASKS
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  goal_id uuid references public.goals(id) on delete set null,
  creator_id uuid not null references auth.users(id) on delete cascade,
  assignee_id uuid references auth.users(id) on delete set null,
  title text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  status text not null default 'todo' check (status in ('backlog','todo','in_progress','in_review','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  due_date date,
  labels text[] not null default '{}',
  checklist jsonb not null default '[]'::jsonb,
  is_private boolean not null default false,
  is_today_focus boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks add column if not exists is_today_focus boolean not null default false;

-- 7. NOTES
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled note',
  content text not null default '',
  visibility text not null default 'private' check (visibility in ('private','workspace')),
  is_pinned boolean not null default false,
  tags text[] not null default '{}',
  linked_goal_id uuid references public.goals(id) on delete set null,
  linked_task_id uuid references public.tasks(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notes add column if not exists is_pinned boolean not null default false;
alter table public.notes add column if not exists tags text[] not null default '{}';
alter table public.notes add column if not exists linked_goal_id uuid references public.goals(id) on delete set null;
alter table public.notes add column if not exists linked_task_id uuid references public.tasks(id) on delete set null;

-- 8. ACTIVITY EVENTS
create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  description text not null,
  entity_id text,
  entity_type text,
  created_at timestamptz not null default now()
);

-- 9. WEEKLY REVIEWS
create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start_date date not null default current_date,
  completed_task_ids jsonb not null default '[]'::jsonb,
  unfinished_task_ids jsonb not null default '[]'::jsonb,
  blockers text not null default '',
  next_week_priorities jsonb not null default '[]'::jsonb,
  reflection text not null default '',
  created_at timestamptz not null default now()
);

-- ========================================================
-- SECURITY DEFINER HELPER FUNCTIONS
-- ========================================================

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace and wm.user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_admin(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
      and wm.role in ('owner','admin')
  );
$$;

-- Atomic Workspace Creation
create or replace function public.create_workspace(workspace_name text, workspace_description text default '')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare new_workspace_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if char_length(trim(workspace_name)) < 2 or char_length(trim(workspace_name)) > 80 then
    raise exception 'Workspace name must be between 2 and 80 characters';
  end if;
  insert into public.workspaces (name, description, owner_id)
  values (trim(workspace_name), coalesce(workspace_description, ''), auth.uid())
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, auth.uid(), 'owner');

  return new_workspace_id;
end;
$$;
revoke all on function public.create_workspace(text, text) from public;
grant execute on function public.create_workspace(text, text) to authenticated;

-- Ensure User Has a Workspace
create or replace function public.ensure_user_workspace()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_ws uuid;
  user_name text;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  
  select workspace_id into existing_ws
  from public.workspace_members
  where user_id = auth.uid()
  limit 1;
  
  if existing_ws is not null then
    return existing_ws;
  end if;

  select coalesce(nullif(full_name, ''), 'My Workspace') into user_name
  from public.profiles
  where id = auth.uid();

  if user_name is null or user_name = 'My Workspace' then
    user_name := 'Personal Space';
  else
    user_name := user_name || '''s Space';
  end if;

  insert into public.workspaces (name, description, owner_id)
  values (user_name, 'Personal and team accountability workspace', auth.uid())
  returning id into existing_ws;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (existing_ws, auth.uid(), 'owner')
  on conflict (workspace_id, user_id) do nothing;

  return existing_ws;
end;
$$;
revoke all on function public.ensure_user_workspace() from public;
grant execute on function public.ensure_user_workspace() to authenticated;

-- Create Secure Invitation Code
create or replace function public.create_workspace_invitation(target_workspace uuid, validity_hours integer default 72, allowed_uses integer default 10)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare raw_code text;
begin
  if auth.uid() is null or not public.is_workspace_admin(target_workspace) then
    raise exception 'Only workspace admins can create invitations';
  end if;
  if validity_hours < 1 or validity_hours > 720 or allowed_uses < 1 or allowed_uses > 100 then
    raise exception 'Invalid invitation settings';
  end if;
  raw_code := encode(gen_random_bytes(18), 'hex');
  insert into public.workspace_invitations (workspace_id, created_by, code_hash, expires_at, max_uses)
  values (target_workspace, auth.uid(), encode(digest(raw_code, 'sha256'), 'hex'), now() + make_interval(hours => validity_hours), allowed_uses);
  return raw_code;
end;
$$;
revoke all on function public.create_workspace_invitation(uuid, integer, integer) from public;
grant execute on function public.create_workspace_invitation(uuid, integer, integer) to authenticated;

-- Join Workspace via Invitation Code
create or replace function public.join_workspace(invitation_code text)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare invitation public.workspace_invitations%rowtype;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  if invitation_code is null or char_length(invitation_code) < 16 or char_length(invitation_code) > 100 then
    raise exception 'Invalid invitation code';
  end if;
  select * into invitation
  from public.workspace_invitations
  where code_hash = encode(digest(trim(invitation_code), 'sha256'), 'hex')
    and revoked_at is null
    and expires_at > now()
    and use_count < max_uses
  for update;
  if not found then raise exception 'Invitation is invalid, expired, or fully used'; end if;
  
  insert into public.workspace_members (workspace_id, user_id, role)
  values (invitation.workspace_id, auth.uid(), 'member')
  on conflict (workspace_id, user_id) do nothing;
  
  update public.workspace_invitations set use_count = use_count + 1 where id = invitation.id;
  return invitation.workspace_id;
end;
$$;
revoke all on function public.join_workspace(text) from public;
grant execute on function public.join_workspace(text) to authenticated;

-- Automatic Profile Creation Trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  )
  on conflict (id) do update set
    full_name = case when public.profiles.full_name = '' then excluded.full_name else public.profiles.full_name end,
    email = case when public.profiles.email = '' or public.profiles.email is null then coalesce(excluded.email, '') else public.profiles.email end,
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.workspace_invitations enable row level security;
alter table public.goals enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.activity_events enable row level security;
alter table public.weekly_reviews enable row level security;

-- PROFILES POLICIES
drop policy if exists "profile read self and teammates" on public.profiles;
drop policy if exists "profile read self" on public.profiles;
create policy "profile read self and teammates" on public.profiles for select to authenticated using (
  id = auth.uid() or exists (
    select 1 from public.workspace_members wm1
    join public.workspace_members wm2 on wm1.workspace_id = wm2.workspace_id
    where wm1.user_id = auth.uid() and wm2.user_id = profiles.id
  )
);
drop policy if exists "profile insert self" on public.profiles;
create policy "profile insert self" on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists "profile update self" on public.profiles;
create policy "profile update self" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- WORKSPACES POLICIES
drop policy if exists "workspace members can read workspace" on public.workspaces;
create policy "workspace members can read workspace" on public.workspaces for select to authenticated using (public.is_workspace_member(id));
drop policy if exists "authenticated users create workspace" on public.workspaces;
create policy "authenticated users create workspace" on public.workspaces for insert to authenticated with check (owner_id = auth.uid());
drop policy if exists "workspace admins update workspace" on public.workspaces;
create policy "workspace admins update workspace" on public.workspaces for update to authenticated using (public.is_workspace_admin(id)) with check (public.is_workspace_admin(id));
drop policy if exists "workspace owner deletes workspace" on public.workspaces;
create policy "workspace owner deletes workspace" on public.workspaces for delete to authenticated using (owner_id = auth.uid());

-- WORKSPACE MEMBERS POLICIES
drop policy if exists "members read member list" on public.workspace_members;
create policy "members read member list" on public.workspace_members for select to authenticated using (public.is_workspace_member(workspace_id));
drop policy if exists "admins manage memberships" on public.workspace_members;
create policy "admins manage memberships" on public.workspace_members for all to authenticated using (public.is_workspace_admin(workspace_id)) with check (public.is_workspace_admin(workspace_id));

-- WORKSPACE INVITATIONS POLICIES
drop policy if exists "admins manage invitations" on public.workspace_invitations;
create policy "admins manage invitations" on public.workspace_invitations for all to authenticated using (public.is_workspace_admin(workspace_id)) with check (public.is_workspace_admin(workspace_id));

-- GOALS POLICIES
drop policy if exists "goal owner or authorized workspace member reads goal" on public.goals;
create policy "goal owner or authorized workspace member reads goal" on public.goals for select to authenticated using (
  owner_id = auth.uid() or (visibility = 'workspace' and workspace_id is not null and public.is_workspace_member(workspace_id))
);
drop policy if exists "goal owner creates goal" on public.goals;
create policy "goal owner creates goal" on public.goals for insert to authenticated with check (
  owner_id = auth.uid() and (workspace_id is null or public.is_workspace_member(workspace_id))
);
drop policy if exists "goal owner or workspace admin updates goal" on public.goals;
create policy "goal owner or workspace admin updates goal" on public.goals for update to authenticated using (
  owner_id = auth.uid() or (workspace_id is not null and public.is_workspace_admin(workspace_id))
) with check (owner_id = auth.uid() or (workspace_id is not null and public.is_workspace_admin(workspace_id)));
drop policy if exists "goal owner or workspace admin deletes goal" on public.goals;
create policy "goal owner or workspace admin deletes goal" on public.goals for delete to authenticated using (
  owner_id = auth.uid() or (workspace_id is not null and public.is_workspace_admin(workspace_id))
);

-- TASKS POLICIES
drop policy if exists "task owner assignee or workspace member reads task" on public.tasks;
create policy "task owner assignee or workspace member reads task" on public.tasks for select to authenticated using (
  creator_id = auth.uid() or assignee_id = auth.uid() or (not is_private and workspace_id is not null and public.is_workspace_member(workspace_id))
);
drop policy if exists "authorized user creates task" on public.tasks;
create policy "authorized user creates task" on public.tasks for insert to authenticated with check (
  creator_id = auth.uid() and (workspace_id is null or public.is_workspace_member(workspace_id))
);
drop policy if exists "authorized user updates task" on public.tasks;
create policy "authorized user updates task" on public.tasks for update to authenticated using (
  creator_id = auth.uid() or assignee_id = auth.uid() or (workspace_id is not null and public.is_workspace_member(workspace_id))
) with check (creator_id = auth.uid() or assignee_id = auth.uid() or (workspace_id is not null and public.is_workspace_member(workspace_id)));
drop policy if exists "creator or workspace admin deletes task" on public.tasks;
create policy "creator or workspace admin deletes task" on public.tasks for delete to authenticated using (
  creator_id = auth.uid() or (workspace_id is not null and public.is_workspace_admin(workspace_id))
);

-- NOTES POLICIES
drop policy if exists "note owner or shared workspace member reads note" on public.notes;
create policy "note owner or shared workspace member reads note" on public.notes for select to authenticated using (
  owner_id = auth.uid() or (visibility = 'workspace' and workspace_id is not null and public.is_workspace_member(workspace_id))
);
drop policy if exists "note owner creates note" on public.notes;
create policy "note owner creates note" on public.notes for insert to authenticated with check (owner_id = auth.uid() and (workspace_id is null or public.is_workspace_member(workspace_id)));
drop policy if exists "note owner updates note" on public.notes;
create policy "note owner updates note" on public.notes for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
drop policy if exists "note owner deletes note" on public.notes;
create policy "note owner deletes note" on public.notes for delete to authenticated using (owner_id = auth.uid() or (workspace_id is not null and public.is_workspace_admin(workspace_id)));

-- ACTIVITY EVENTS POLICIES
drop policy if exists "workspace members read activity" on public.activity_events;
create policy "workspace members read activity" on public.activity_events for select to authenticated using (user_id = auth.uid() or (workspace_id is not null and public.is_workspace_member(workspace_id)));
drop policy if exists "authenticated user creates own activity" on public.activity_events;
create policy "authenticated user creates own activity" on public.activity_events for insert to authenticated with check (user_id = auth.uid() and (workspace_id is null or public.is_workspace_member(workspace_id)));

-- WEEKLY REVIEWS POLICIES
drop policy if exists "weekly reviews read" on public.weekly_reviews;
create policy "weekly reviews read" on public.weekly_reviews for select to authenticated using (
  user_id = auth.uid() or (workspace_id is not null and public.is_workspace_member(workspace_id))
);
drop policy if exists "weekly reviews insert" on public.weekly_reviews;
create policy "weekly reviews insert" on public.weekly_reviews for insert to authenticated with check (
  user_id = auth.uid() and (workspace_id is null or public.is_workspace_member(workspace_id))
);
drop policy if exists "weekly reviews update" on public.weekly_reviews;
create policy "weekly reviews update" on public.weekly_reviews for update to authenticated using (
  user_id = auth.uid()
) with check (user_id = auth.uid());
drop policy if exists "weekly reviews delete" on public.weekly_reviews;
create policy "weekly reviews delete" on public.weekly_reviews for delete to authenticated using (
  user_id = auth.uid()
);

-- INDEXES FOR PERFORMANCE
create index if not exists goals_owner_idx on public.goals(owner_id);
create index if not exists goals_workspace_idx on public.goals(workspace_id);
create index if not exists tasks_workspace_status_idx on public.tasks(workspace_id, status);
create index if not exists tasks_assignee_idx on public.tasks(assignee_id);
create index if not exists notes_owner_idx on public.notes(owner_id);
create index if not exists activity_workspace_created_idx on public.activity_events(workspace_id, created_at desc);
create index if not exists weekly_reviews_workspace_idx on public.weekly_reviews(workspace_id, week_start_date desc);

-- REALTIME CONFIGURATION
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end $$;

alter publication supabase_realtime add table public.goals, public.tasks, public.notes, public.activity_events, public.workspace_members;
