-- Enable extensions
create extension if not exists "uuid-ossp";

-- Users profile (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  plan text default 'free' check (plan in ('free', 'seed', 'bloom', 'ascend')),
  stripe_customer_id text,
  stripe_subscription_id text,
  dosha text,
  mtc_type text,
  spiritual_archetype text,
  onboarding_completed boolean default false,
  golden_hour_enabled boolean default true,
  sound_enabled boolean default true,
  notifications_enabled boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Programme vivant
create table public.programmes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade,
  goal text,
  level text,
  challenges text[],
  time_available text,
  spiritual_practices text[],
  morning_practices jsonb default '[]',
  afternoon_practices jsonb default '[]',
  evening_practices jsonb default '[]',
  active_pillars text[] default '{}',
  active_techniques jsonb default '{}',
  ia_message text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Daily check-ins
create table public.daily_checkins (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade,
  date date default current_date,
  completed_practices jsonb default '[]',
  sleep_score integer check (sleep_score between 0 and 100),
  energy_score integer check (energy_score between 0 and 100),
  nutrition_score integer check (nutrition_score between 0 and 100),
  practice_score integer check (practice_score between 0 and 100),
  overall_score integer check (overall_score between 0 and 100),
  mood text,
  notes text,
  lunar_phase text,
  season text,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Chat with IA
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade,
  messages jsonb default '[]',
  context text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- PRANA Scan results
create table public.scan_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade,
  dosha text,
  mtc_type text,
  microbiome_profile text,
  nutritional_gaps text[],
  stress_level text,
  spiritual_archetype text,
  full_analysis jsonb,
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.programmes enable row level security;
alter table public.daily_checkins enable row level security;
alter table public.conversations enable row level security;
alter table public.scan_results enable row level security;

-- Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can view own programme" on public.programmes for all using (auth.uid() = user_id);
create policy "Users can manage own checkins" on public.daily_checkins for all using (auth.uid() = user_id);
create policy "Users can manage own conversations" on public.conversations for all using (auth.uid() = user_id);
create policy "Users can view own scans" on public.scan_results for all using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
