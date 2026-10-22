-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- 1. Ensure profiles table exists
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

-- Ensure email column exists
alter table public.profiles add column if not exists email text not null default '';

-- 2. Backfill email for any existing users from auth.users
update public.profiles p
set email = coalesce(u.email, '')
from auth.users u
where p.id = u.id and (p.email is null or p.email = '');

-- 3. Update the handle_new_user function to automatically capture email and metadata
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Momentum Member'),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', null)
  )
  on conflict (id) do update set
    full_name = case when public.profiles.full_name = '' or public.profiles.full_name is null then excluded.full_name else public.profiles.full_name end,
    email = case when public.profiles.email = '' or public.profiles.email is null then coalesce(excluded.email, '') else public.profiles.email end,
    avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);
  return new;
end;
$$;

-- 4. Recreate the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();
