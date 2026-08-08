-- ============================================================
-- FFK WARS — Database Schema
-- Run this whole file in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- TABLES ----------

create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  email text unique not null,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

create table if not exists tournaments (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  number int not null,
  date date not null,
  status text not null default 'upcoming' check (status in ('upcoming','live','completed')),
  total_matches int not null default 0,
  current_match int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  team_name text not null,
  team_code text not null,
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  match_number int not null,
  map text,
  status text not null default 'upcoming' check (status in ('upcoming','live','completed')),
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz not null default now(),
  unique (tournament_id, match_number)
);

create table if not exists scoring_rules (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references tournaments(id) on delete cascade,
  placement int not null,
  points numeric not null default 0,
  unique (tournament_id, placement)
);

create table if not exists tournament_settings (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null unique references tournaments(id) on delete cascade,
  kill_point_value numeric not null default 1
);

create table if not exists match_results (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  team_id uuid not null references teams(id) on delete cascade,
  placement int,
  kills int not null default 0,
  placement_points numeric not null default 0,
  kill_points numeric not null default 0,
  total_points numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique (match_id, team_id)
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references admins(id) on delete set null,
  action text not null,
  team_id uuid,
  match_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

-- ---------- HELPER: is caller an admin? ----------

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from admins where auth_id = auth.uid()
  );
$$;

-- ---------- AUTO POINT CALCULATION ----------
-- Whenever placement/kills change on match_results, recompute points
-- using that match's tournament scoring_rules + tournament_settings.

create or replace function calculate_match_result_points()
returns trigger
language plpgsql
security definer
as $$
declare
  v_tournament_id uuid;
  v_placement_points numeric := 0;
  v_kill_point_value numeric := 1;
begin
  select tournament_id into v_tournament_id from matches where id = new.match_id;

  select points into v_placement_points
  from scoring_rules
  where tournament_id = v_tournament_id and placement = new.placement;

  if v_placement_points is null then
    v_placement_points := 0;
  end if;

  select kill_point_value into v_kill_point_value
  from tournament_settings
  where tournament_id = v_tournament_id;

  if v_kill_point_value is null then
    v_kill_point_value := 1;
  end if;

  new.placement_points := v_placement_points;
  new.kill_points := coalesce(new.kills,0) * v_kill_point_value;
  new.total_points := new.placement_points + new.kill_points;
  new.updated_at := now();

  return new;
end;
$$;

drop trigger if exists trg_calc_points on match_results;
create trigger trg_calc_points
before insert or update of placement, kills on match_results
for each row execute function calculate_match_result_points();

-- ---------- ROW LEVEL SECURITY ----------

alter table admins enable row level security;
alter table tournaments enable row level security;
alter table teams enable row level security;
alter table matches enable row level security;
alter table scoring_rules enable row level security;
alter table tournament_settings enable row level security;
alter table match_results enable row level security;
alter table audit_logs enable row level security;

-- Public (anon) READ-ONLY on tournament data
drop policy if exists "public read tournaments" on tournaments;
create policy "public read tournaments" on tournaments for select using (true);

drop policy if exists "public read teams" on teams;
create policy "public read teams" on teams for select using (true);

drop policy if exists "public read matches" on matches;
create policy "public read matches" on matches for select using (true);

drop policy if exists "public read scoring_rules" on scoring_rules;
create policy "public read scoring_rules" on scoring_rules for select using (true);

drop policy if exists "public read tournament_settings" on tournament_settings;
create policy "public read tournament_settings" on tournament_settings for select using (true);

drop policy if exists "public read match_results" on match_results;
create policy "public read match_results" on match_results for select using (true);

-- admins/audit_logs are NOT publicly readable
drop policy if exists "admin read admins" on admins;
create policy "admin read admins" on admins for select using (is_admin());

drop policy if exists "admin read audit_logs" on audit_logs;
create policy "admin read audit_logs" on audit_logs for select using (is_admin());

-- Admin-only WRITE on everything
drop policy if exists "admin write tournaments" on tournaments;
create policy "admin write tournaments" on tournaments for insert with check (is_admin());
drop policy if exists "admin update tournaments" on tournaments;
create policy "admin update tournaments" on tournaments for update using (is_admin());
drop policy if exists "admin delete tournaments" on tournaments;
create policy "admin delete tournaments" on tournaments for delete using (is_admin());

drop policy if exists "admin write teams" on teams;
create policy "admin write teams" on teams for insert with check (is_admin());
drop policy if exists "admin update teams" on teams;
create policy "admin update teams" on teams for update using (is_admin());
drop policy if exists "admin delete teams" on teams;
create policy "admin delete teams" on teams for delete using (is_admin());

drop policy if exists "admin write matches" on matches;
create policy "admin write matches" on matches for insert with check (is_admin());
drop policy if exists "admin update matches" on matches;
create policy "admin update matches" on matches for update using (is_admin());
drop policy if exists "admin delete matches" on matches;
create policy "admin delete matches" on matches for delete using (is_admin());

drop policy if exists "admin write scoring_rules" on scoring_rules;
create policy "admin write scoring_rules" on scoring_rules for insert with check (is_admin());
drop policy if exists "admin update scoring_rules" on scoring_rules;
create policy "admin update scoring_rules" on scoring_rules for update using (is_admin());
drop policy if exists "admin delete scoring_rules" on scoring_rules;
create policy "admin delete scoring_rules" on scoring_rules for delete using (is_admin());

drop policy if exists "admin write tournament_settings" on tournament_settings;
create policy "admin write tournament_settings" on tournament_settings for insert with check (is_admin());
drop policy if exists "admin update tournament_settings" on tournament_settings;
create policy "admin update tournament_settings" on tournament_settings for update using (is_admin());

drop policy if exists "admin write match_results" on match_results;
create policy "admin write match_results" on match_results for insert with check (is_admin());
drop policy if exists "admin update match_results" on match_results;
create policy "admin update match_results" on match_results for update using (is_admin());
drop policy if exists "admin delete match_results" on match_results;
create policy "admin delete match_results" on match_results for delete using (is_admin());

drop policy if exists "admin write audit_logs" on audit_logs;
create policy "admin write audit_logs" on audit_logs for insert with check (is_admin());

-- admins table: only admins manage admins (bootstrap the first row manually, see README)
drop policy if exists "admin manage admins" on admins;
create policy "admin manage admins" on admins for all using (is_admin()) with check (is_admin());

-- ---------- REALTIME ----------
-- Make sure these tables broadcast changes to subscribed clients.
alter publication supabase_realtime add table tournaments;
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table match_results;

-- ---------- STORAGE (team logos) ----------
insert into storage.buckets (id, name, public)
values ('team-logos', 'team-logos', true)
on conflict (id) do nothing;

drop policy if exists "public read team logos" on storage.objects;
create policy "public read team logos" on storage.objects
  for select using (bucket_id = 'team-logos');

drop policy if exists "admin upload team logos" on storage.objects;
create policy "admin upload team logos" on storage.objects
  for insert with check (bucket_id = 'team-logos' and is_admin());

drop policy if exists "admin update team logos" on storage.objects;
create policy "admin update team logos" on storage.objects
  for update using (bucket_id = 'team-logos' and is_admin());

drop policy if exists "admin delete team logos" on storage.objects;
create policy "admin delete team logos" on storage.objects
  for delete using (bucket_id = 'team-logos' and is_admin());
