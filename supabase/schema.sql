-- ============================================================
-- CampusEvents — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- 1. Profiles table (extends Supabase Auth)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null default '',
  email text not null default '',
  college text default '',
  role text not null default 'participant' check (role in ('participant', 'admin')),
  created_at timestamptz default now()
);

-- 2. Events table
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text default '',
  date timestamptz not null,
  location text not null default '',
  capacity integer not null default 100,
  category text not null default 'General',
  image_url text default '',
  tags text[] default '{}',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Registrations table
create table if not exists registrations (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references events(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  registered_at timestamptz default now(),
  unique(event_id, user_id)
);

-- ============================================================
-- Auto-create profile when a user signs up
-- ============================================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, college, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'college', ''),
    'participant'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Auto-update updated_at on events
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists update_events_updated_at on events;
create trigger update_events_updated_at
  before update on events
  for each row execute function update_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table events enable row level security;
alter table registrations enable row level security;

-- Profiles: anyone can read, users update own, admins update any
create policy "Anyone can view profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Admins can update any profile"
  on profiles for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Events: anyone can read, admins can CUD
create policy "Anyone can view events"
  on events for select using (true);

create policy "Admins can create events"
  on events for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update events"
  on events for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete events"
  on events for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Registrations: users see own, admins see all, users can register/cancel
create policy "Users can view own registrations"
  on registrations for select using (auth.uid() = user_id);

create policy "Admins can view all registrations"
  on registrations for select using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can register"
  on registrations for insert with check (auth.uid() = user_id);

create policy "Users can cancel own registration"
  on registrations for delete using (auth.uid() = user_id);

create policy "Admins can delete any registration"
  on registrations for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );
