-- ==============================================================================
-- FLAME IN FREEFALL — PRODUCTION DATABASE MIGRATION
-- Migration Version: 20261115000001
-- Scope: Relational Schema, RLS Policies, NASA Engine Seeds, Automatic Profile Trigger
-- ==============================================================================

-- Enable required cryptographic and UUID extensions
create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;

-- ==============================================================================
-- 1. PROFILES TABLE (Linked directly to Supabase auth.users)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text not null default 'Aerospace Explorer',
  experience_role text not null default 'beginner' check (experience_role in ('beginner', 'researcher')),
  organization text default 'Space Academy Training Facility',
  avatar_url text,
  preferences jsonb not null default '{"smartHoverGuide": true, "detailedExplanations": true, "scientificNotes": true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 2. VERIFIED NASA ENGINES CATALOGUE
-- ==============================================================================
create table if not exists public.engines (
  id text primary key,
  engine_name text not null,
  manufacturer text not null,
  engine_category text not null,
  propellant text not null,
  oxidizer text,
  cycle text,
  chamber_pressure numeric,
  thrust numeric,
  specific_impulse numeric,
  mass_flow_rate numeric,
  nozzle_expansion_ratio numeric,
  exit_velocity numeric,
  source_url text,
  source_publication text,
  verification_status text not null default 'NASA Verified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 3. EXPERIMENTS TABLE
-- ==============================================================================
create table if not exists public.experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  experiment_name text not null check (char_length(experiment_name) between 1 and 255),
  experiment_type text not null default 'rocket_propulsion' check (experiment_type in ('rocket_propulsion', 'microgravity_droplet', 'diffusion_flame', 'soot_morphology', 'extinction_limits')),
  description text default '',
  configuration jsonb not null default '{}'::jsonb,
  status text not null default 'configured' check (status in ('draft', 'configured', 'running', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 4. SIMULATION RUNS TABLE
-- ==============================================================================
create table if not exists public.simulation_runs (
  id uuid primary key default gen_random_uuid(),
  experiment_id uuid references public.experiments(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  solver_name text not null default 'NASA CEA Supersonic Equilibrium',
  solver_version text not null default '3.0.0',
  input_parameters jsonb not null,
  simulation_status text not null default 'completed' check (simulation_status in ('pending', 'running', 'completed', 'failed', 'cancelled')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  results_summary jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 5. SIMULATION RESULTS TABLE (Time-series and field solutions)
-- ==============================================================================
create table if not exists public.simulation_results (
  id uuid primary key default gen_random_uuid(),
  simulation_run_id uuid not null references public.simulation_runs(id) on delete cascade,
  result_type text not null check (result_type in ('time_series', 'spatial_field', 'species_equilibrium', 'shock_diamonds', 'plume_contour')),
  result_data jsonb not null,
  units text,
  source_type text not null default 'physics_solver' check (source_type in ('physics_solver', 'nasa_cea', 'analytical_model', 'procedural_gpu')),
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 6. SAVED EXPERIMENT CONFIGURATIONS
-- ==============================================================================
create table if not exists public.saved_configurations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  configuration_name text not null check (char_length(configuration_name) between 1 and 255),
  configuration_data jsonb not null,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 7. EXPERIMENT COMPARISONS TABLE
-- ==============================================================================
create table if not exists public.experiment_comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  comparison_name text not null check (char_length(comparison_name) between 1 and 255),
  experiment_ids jsonb not null default '[]'::jsonb,
  comparison_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 8. RESEARCH DOCUMENTS TABLE (NASA publications & user papers)
-- ==============================================================================
create table if not exists public.research_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  document_name text not null,
  document_type text not null default 'pdf' check (document_type in ('pdf', 'markdown', 'text', 'json')),
  storage_path text not null,
  extracted_text text,
  source_url text,
  processing_status text not null default 'completed' check (processing_status in ('pending', 'processing', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 9. RESEARCH CONVERSATIONS TABLE
-- ==============================================================================
create table if not exists public.research_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Combustion Inquiry',
  mode text not null default 'beginner' check (mode in ('beginner', 'guided', 'expert')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==============================================================================
-- 10. RESEARCH MESSAGES TABLE
-- ==============================================================================
create table if not exists public.research_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.research_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  message_content text not null,
  provenance_type text default 'ai_explanation',
  citation text,
  references jsonb default '[]'::jsonb,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 11. GENERATED REPORTS TABLE
-- ==============================================================================
create table if not exists public.generated_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  report_name text not null,
  report_type text not null default 'pdf' check (report_type in ('pdf', 'excel', 'csv', 'json')),
  storage_path text not null,
  report_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- INDEXES FOR SCIENTIFIC QUERY PERFORMANCE
-- ==============================================================================
create index if not exists idx_experiments_user on public.experiments(user_id, created_at desc);
create index if not exists idx_simulation_runs_user on public.simulation_runs(user_id, started_at desc);
create index if not exists idx_simulation_runs_exp on public.simulation_runs(experiment_id);
create index if not exists idx_simulation_results_run on public.simulation_results(simulation_run_id);
create index if not exists idx_saved_configs_user on public.saved_configurations(user_id, updated_at desc);
create index if not exists idx_research_messages_conv on public.research_messages(conversation_id, created_at asc);
create index if not exists idx_engines_category on public.engines(engine_category);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.engines enable row level security;
alter table public.experiments enable row level security;
alter table public.simulation_runs enable row level security;
alter table public.simulation_results enable row level security;
alter table public.saved_configurations enable row level security;
alter table public.experiment_comparisons enable row level security;
alter table public.research_documents enable row level security;
alter table public.research_conversations enable row level security;
alter table public.research_messages enable row level security;
alter table public.generated_reports enable row level security;

-- Profiles Policies
create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Engines Policies (Public reference catalogue readable by all users)
create policy "Anyone can read verified NASA engine data"
  on public.engines for select using (true);
create policy "Only service role can modify engine records"
  on public.engines for all using (auth.jwt() ->> 'role' = 'service_role');

-- Experiments Policies
create policy "Users can manage their own experiments"
  on public.experiments for all using (auth.uid() = user_id);

-- Simulation Runs Policies
create policy "Users can manage their own simulation runs"
  on public.simulation_runs for all using (auth.uid() = user_id);

-- Simulation Results Policies
create policy "Users can access their own simulation results"
  on public.simulation_results for select
  using (exists (
    select 1 from public.simulation_runs r
    where r.id = simulation_results.simulation_run_id and r.user_id = auth.uid()
  ));
create policy "Users can insert their own simulation results"
  on public.simulation_results for insert
  with check (exists (
    select 1 from public.simulation_runs r
    where r.id = simulation_results.simulation_run_id and r.user_id = auth.uid()
  ));

-- Saved Configurations Policies
create policy "Users can manage their own configurations"
  on public.saved_configurations for all using (auth.uid() = user_id);

-- Comparisons Policies
create policy "Users can manage their comparisons"
  on public.experiment_comparisons for all using (auth.uid() = user_id);

-- Research Documents Policies
create policy "Users can manage their documents"
  on public.research_documents for all using (auth.uid() = user_id);

-- Research Conversations & Messages Policies
create policy "Users can manage their conversations"
  on public.research_conversations for all using (auth.uid() = user_id);
create policy "Users can manage their messages"
  on public.research_messages for all using (auth.uid() = user_id);

-- Generated Reports Policies
create policy "Users can manage their reports"
  on public.generated_reports for all using (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, experience_role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'experience_role', 'beginner')
  )
  on conflict (id) do update set
    email = excluded.email,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if already exists then recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- VERIFIED NASA PROPULSION ENGINES SEED DATA
-- ==============================================================================
insert into public.engines (
  id, engine_name, manufacturer, engine_category, propellant, oxidizer, cycle,
  chamber_pressure, thrust, specific_impulse, mass_flow_rate, nozzle_expansion_ratio,
  exit_velocity, source_url, source_publication, verification_status
) values
(
  'nasa-ssme-rs25',
  'RS-25 (Space Shuttle Main Engine / SLS Core)',
  'Aerojet Rocketdyne / NASA MSFC',
  'Liquid rocket engines',
  'Liquid Hydrogen (LH2)',
  'Liquid Oxygen (LOX)',
  'Fuel-Rich Staged Combustion',
  203.7, 2279.0, 452.3, 514.0, 77.5, 4436.0,
  'https://ntrs.nasa.gov/citations/19900010738',
  'NASA SP-8110 / NASA TM-100398',
  'NASA Documented'
),
(
  'nasa-rl10b2',
  'RL10B-2 (Centaur Upper Stage / SLS EUS)',
  'Pratt & Whitney / Aerojet Rocketdyne / NASA GRC',
  'Liquid rocket engines',
  'Liquid Hydrogen (LH2)',
  'Liquid Oxygen (LOX)',
  'Closed Expander Cycle',
  43.5, 110.0, 462.5, 24.2, 285.0, 4536.0,
  'https://ntrs.nasa.gov/citations/19950017482',
  'NASA CR-195449',
  'NASA Documented'
),
(
  'nasa-f1-saturn',
  'F-1 (Saturn V Apollo Booster)',
  'Rocketdyne / NASA MSFC',
  'Liquid rocket engines',
  'RP-1 (Kerosene)',
  'Liquid Oxygen (LOX)',
  'Gas-Generator Cycle',
  69.1, 7770.0, 304.0, 2578.0, 16.0, 2982.0,
  'https://ntrs.nasa.gov/citations/19810016518',
  'NASA SP-4206',
  'NASA Documented'
),
(
  'nasa-apollo-lmde',
  'Apollo LMDE (Lunar Module Descent Engine)',
  'TRW Systems / NASA JSC',
  'Bipropellant spacecraft thrusters',
  'Aerozine 50',
  'Nitrogen Tetroxide (N2O4)',
  'Pressure-Fed Pintle Throttleable',
  6.8, 43.9, 311.0, 14.4, 47.0, 3050.0,
  'https://ntrs.nasa.gov/citations/19760023194',
  'NASA SP-8089',
  'NASA Documented'
),
(
  'nasa-shuttle-oms',
  'Space Shuttle OMS (Orbital Maneuvering System)',
  'Aerojet / NASA JSC',
  'Bipropellant spacecraft thrusters',
  'Monomethylhydrazine (MMH)',
  'Nitrogen Tetroxide (N2O4)',
  'Pressure-Fed Regeneratively Cooled',
  8.6, 26.7, 316.0, 8.6, 55.0, 3100.0,
  'https://ntrs.nasa.gov/citations/19830005721',
  'NASA CR-167812',
  'NASA Documented'
),
(
  'nasa-next-ion',
  'NEXT (NASA Evolutionary Xenon Thruster)',
  'NASA Glenn Research Center / Aerojet',
  'Electric propulsion systems',
  'Xenon Plasma (Xe)',
  null,
  'Electrostatic Gridded Ion',
  null, 0.236, 4190.0, 0.0000057, null, 41000.0,
  'https://ntrs.nasa.gov/citations/20100021345',
  'NASA TM-2010-216773',
  'NASA Documented'
)
on conflict (id) do update set
  engine_name = excluded.engine_name,
  manufacturer = excluded.manufacturer,
  propellant = excluded.propellant,
  oxidizer = excluded.oxidizer,
  chamber_pressure = excluded.chamber_pressure,
  thrust = excluded.thrust,
  specific_impulse = excluded.specific_impulse,
  exit_velocity = excluded.exit_velocity,
  source_publication = excluded.source_publication;
