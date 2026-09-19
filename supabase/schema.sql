-- TreeTrack Supabase schema — PostgreSQL + PostGIS
-- Run in Supabase SQL editor

-- Enable PostGIS and UUID
create extension if not exists postgis;
create extension if not exists "uuid-ossp";

-- profiles (linked to auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text check (role in ('admin','manager','field_officer','viewer')) default 'viewer',
  created_at timestamptz default now()
);

-- projects
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  organization text,
  boundary geometry(Polygon, 4326),
  total_area_hectares double precision,
  expected_tree_count integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- plots
create table if not exists plots (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects(id) on delete cascade,
  plot_code text not null,
  geometry geometry(Polygon, 4326) not null,
  area_hectares double precision not null,
  expected_tree_count integer,
  estimated_tree_count integer,
  health_score double precision,
  risk_score double precision,
  status text check (status in ('active','monitoring','at_risk','critical','archived')) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(project_id, plot_code)
);
create index if not exists plots_project_id_idx on plots(project_id);
create index if not exists plots_geometry_gix on plots using gist(geometry);

-- vegetation_observations
create table if not exists vegetation_observations (
  id uuid primary key default uuid_generate_v4(),
  plot_id uuid not null references plots(id) on delete cascade,
  observation_date date not null,
  ndvi double precision,
  vegetation_coverage double precision,
  canopy_density double precision,
  estimated_tree_count integer,
  health_score double precision,
  source text default 'satellite',
  created_at timestamptz default now()
);
create index if not exists veg_obs_plot_date_idx on vegetation_observations(plot_id, observation_date desc);

-- imagery
create table if not exists imagery (
  id uuid primary key default uuid_generate_v4(),
  plot_id uuid not null references plots(id) on delete cascade,
  captured_at timestamptz not null,
  source text not null,
  image_url text not null,
  thumbnail_url text,
  analysis_status text check (analysis_status in ('pending','processing','completed','failed')) default 'pending',
  metadata jsonb,
  created_at timestamptz default now()
);
create index if not exists imagery_plot_idx on imagery(plot_id);

-- vision_analyses
create table if not exists vision_analyses (
  id uuid primary key default uuid_generate_v4(),
  imagery_id uuid not null references imagery(id) on delete cascade,
  vegetation_coverage double precision,
  canopy_density double precision,
  bare_soil_percentage double precision,
  water_percentage double precision,
  estimated_tree_count integer,
  confidence double precision,
  detected_changes jsonb,
  created_at timestamptz default now()
);

-- environmental_events
create table if not exists environmental_events (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete set null,
  plot_id uuid references plots(id) on delete set null,
  event_type text not null,
  severity text check (severity in ('low','medium','high','critical')) not null,
  description text,
  location geometry(Point, 4326),
  reported_by text,
  source text,
  status text check (status in ('open','investigating','resolved','dismissed')) default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- field_reports
create table if not exists field_reports (
  id uuid primary key default uuid_generate_v4(),
  plot_id uuid references plots(id) on delete set null,
  reporter_name text not null,
  reporter_phone text not null,
  event_type text not null,
  severity text check (severity in ('low','medium','high','critical')) not null,
  description text not null,
  location geometry(Point, 4326),
  image_url text,
  status text check (status in ('pending','verified','rejected')) default 'pending',
  created_at timestamptz default now()
);
create index if not exists field_reports_plot_idx on field_reports(plot_id);

-- alerts
create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete set null,
  plot_id uuid references plots(id) on delete set null,
  alert_type text not null,
  severity text check (severity in ('low','medium','high','critical')) not null,
  title text not null,
  description text,
  risk_score double precision,
  status text check (status in ('open','acknowledged','resolved','dismissed')) default 'open',
  created_at timestamptz default now(),
  resolved_at timestamptz
);
create index if not exists alerts_status_idx on alerts(status);
create index if not exists alerts_plot_idx on alerts(plot_id);

-- notifications
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  alert_id uuid references alerts(id) on delete set null,
  recipient text not null,
  channel text check (channel in ('sms','ussd','email')) not null,
  message text not null,
  status text check (status in ('pending','sent','simulated','failed','delivered')) default 'pending',
  provider_message_id text,
  created_at timestamptz default now()
);

-- Storage buckets
insert into storage.buckets (id, name, public) values ('imagery','imagery', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('field-reports','field-reports', true) on conflict (id) do nothing;

-- RLS — enable, allow authenticated demo access, anon read for hackathon demo
alter table projects enable row level security;
alter table plots enable row level security;
alter table vegetation_observations enable row level security;
alter table imagery enable row level security;
alter table vision_analyses enable row level security;
alter table environmental_events enable row level security;
alter table field_reports enable row level security;
alter table alerts enable row level security;
alter table notifications enable row level security;
alter table profiles enable row level security;

-- Simple permissive policies for demo (tighten later)
do $$ begin
  if not exists (select 1 from pg_policies where policyname='allow_all_projects') then
    create policy allow_all_projects on projects for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_all_plots') then
    create policy allow_all_plots on plots for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_all_veg') then
    create policy allow_all_veg on vegetation_observations for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_all_imagery') then
    create policy allow_all_imagery on imagery for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_all_vision') then
    create policy allow_all_vision on vision_analyses for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_all_events') then
    create policy allow_all_events on environmental_events for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_all_reports') then
    create policy allow_all_reports on field_reports for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_all_alerts') then
    create policy allow_all_alerts on alerts for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_all_notifications') then
    create policy allow_all_notifications on notifications for all using (true) with check (true);
  end if;
  if not exists (select 1 from pg_policies where policyname='allow_all_profiles') then
    create policy allow_all_profiles on profiles for all using (true) with check (true);
  end if;
end $$;

-- Storage RLS (public buckets) — PG <14 compatible (no IF NOT EXISTS on CREATE POLICY)
do $$ begin
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='public read imagery') then
    create policy "public read imagery" on storage.objects for select using (bucket_id='imagery');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='allow upload imagery') then
    create policy "allow upload imagery" on storage.objects for insert with check (bucket_id='imagery');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='public read field-reports') then
    create policy "public read field-reports" on storage.objects for select using (bucket_id='field-reports');
  end if;
  if not exists (select 1 from pg_policies where schemaname='storage' and tablename='objects' and policyname='allow upload field-reports') then
    create policy "allow upload field-reports" on storage.objects for insert with check (bucket_id='field-reports');
  end if;
end $$;

-- updated_at trigger
create or replace function update_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;
drop trigger if exists trg_projects_updated on projects;
create trigger trg_projects_updated before update on projects for each row execute function update_updated_at();
drop trigger if exists trg_plots_updated on plots;
create trigger trg_plots_updated before update on plots for each row execute function update_updated_at();
