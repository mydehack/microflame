create extension if not exists pgcrypto with schema extensions;
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;
grant usage on schema app_private to authenticated, service_role;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,24}$'),
  full_name text not null check (char_length(full_name) between 1 and 100),
  college text not null check (char_length(college) between 1 and 180),
  account_type text not null default 'student' check (account_type in ('student', 'ai')),
  is_platform_badge boolean not null default false,
  bio text not null default '' check (char_length(bio) <= 500),
  avatar_path text,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  profile_fields_visible boolean not null default true,
  contact_preference text not null default 'connections' check (contact_preference in ('connections', 'followers', 'nobody')),
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ai_badge_only check (account_type = 'ai' or is_platform_badge = false)
);
create table public.education (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  degree text not null default '', specialization text not null default '',
  academic_year smallint check (academic_year between 1 and 10),
  graduation_year smallint check (graduation_year between 2000 and 2200),
  learning_level text not null default '', updated_at timestamptz not null default now()
);
create table public.student_skills (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  proficiency smallint not null default 1 check (proficiency between 1 and 5), wants_to_learn boolean not null default false,
  created_at timestamptz not null default now(), unique (user_id, name, wants_to_learn)
);
create table public.interests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80), created_at timestamptz not null default now(), unique (user_id, name)
);
create table public.student_goals (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160), description text not null default '' check (char_length(description) <= 3000),
  goal_type text not null default 'career' check (goal_type in ('career','skill','project','study','other')),
  visibility text not null default 'private' check (visibility in ('private','public')),
  status text not null default 'active' check (status in ('active','paused','completed')),
  start_date date not null default current_date, target_date date,
  weekly_minutes integer check (weekly_minutes is null or weekly_minutes between 0 and 10080),
  reminder_enabled boolean not null default false, progress_percent smallint not null default 0 check (progress_percent between 0 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (target_date is null or target_date >= start_date)
);
create table public.goal_milestones (
  id uuid primary key default gen_random_uuid(), goal_id uuid not null references public.student_goals(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160), position integer not null default 0,
  status text not null default 'todo' check (status in ('todo','in_progress','done')), target_date date, created_at timestamptz not null default now()
);
create table public.goal_tasks (
  id uuid primary key default gen_random_uuid(), milestone_id uuid not null references public.goal_milestones(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240), notes text not null default '' check (char_length(notes) <= 2000),
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes between 1 and 100000), position integer not null default 0,
  status text not null default 'todo' check (status in ('todo','in_progress','done')), completed_at timestamptz, created_at timestamptz not null default now()
);
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  followed_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (follower_id, followed_id), check (follower_id <> followed_id)
);
create index follows_followed_idx on public.follows(followed_id, created_at desc);
create table public.follow_requests (
  id uuid primary key default gen_random_uuid(), requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','cancelled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (requester_id, recipient_id), check (requester_id <> recipient_id)
);
create table public.connections (
  id uuid primary key default gen_random_uuid(), requester_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','cancelled')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (requester_id, recipient_id), check (requester_id <> recipient_id)
);
create table public.blocks (
  blocker_id uuid not null references public.profiles(id) on delete cascade,
  blocked_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (blocker_id, blocked_id), check (blocker_id <> blocked_id)
);
create table public.posts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null default '' check (char_length(content) <= 5000),
  post_type text not null default 'update' check (post_type in ('update','project','achievement','resource')),
  visibility text not null default 'public' check (visibility in ('public','followers','private')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), deleted_at timestamptz,
  check (char_length(content) > 0 or post_type <> 'update')
);
create index posts_feed_idx on public.posts(created_at desc) where deleted_at is null;
create index posts_user_idx on public.posts(user_id, created_at desc) where deleted_at is null;
create table public.post_media (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
  storage_path text not null unique, media_type text not null check (media_type in ('image','video')),
  alt_text text not null default '' check (char_length(alt_text) <= 300), position integer not null default 0, created_at timestamptz not null default now()
);
create table public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (post_id, user_id)
);
create table public.comments (
  id uuid primary key default gen_random_uuid(), post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade, parent_id uuid references public.comments(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000), created_at timestamptz not null default now(), deleted_at timestamptz
);
create index comments_post_idx on public.comments(post_id, created_at) where deleted_at is null;
create table public.recommendations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  recommended_user_id uuid not null references public.profiles(id) on delete cascade,
  score smallint not null check (score between 0 and 100), explanation text not null check (char_length(explanation) between 1 and 300),
  dismissed_at timestamptz, created_at timestamptz not null default now(), unique (user_id, recommended_user_id), check (user_id <> recommended_user_id)
);
create table public.communities (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100), description text not null default '' check (char_length(description) <= 1000),
  visibility text not null default 'public' check (visibility in ('public','private')), created_at timestamptz not null default now()
);
create table public.community_members (
  community_id uuid not null references public.communities(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','moderator','member')),
  status text not null default 'pending' check (status in ('pending','accepted','rejected')),
  joined_at timestamptz not null default now(), primary key (community_id, user_id)
);
create table public.conversations (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade, user_id uuid not null references public.profiles(id) on delete cascade,
  last_read_at timestamptz, joined_at timestamptz not null default now(), primary key (conversation_id, user_id)
);
create table public.messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade, content text not null check (char_length(content) between 1 and 5000),
  created_at timestamptz not null default now(), read_at timestamptz
);
create index messages_conversation_idx on public.messages(conversation_id, created_at desc);
create table public.ai_conversations (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  persona text not null check (persona in ('career','study','project','accountability','communication','research')),
  title text not null default 'New conversation' check (char_length(title) <= 160), share_with_ai_personalization boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.ai_messages (
  id uuid primary key default gen_random_uuid(), conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant')), content text not null check (char_length(content) between 1 and 12000), model text, created_at timestamptz not null default now()
);
create index ai_messages_conversation_idx on public.ai_messages(conversation_id, created_at);
create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  notification_type text not null check (notification_type in ('follow','follow_request','connection','like','comment','message','goal_reminder','match','system')),
  entity_id uuid, body text not null check (char_length(body) <= 500), read_at timestamptz, created_at timestamptz not null default now()
);
create index notifications_user_idx on public.notifications(user_id, created_at desc);
create table public.reports (
  id uuid primary key default gen_random_uuid(), reporter_id uuid not null references public.profiles(id) on delete cascade,
  reported_user_id uuid references public.profiles(id) on delete set null, post_id uuid references public.posts(id) on delete set null,
  reason text not null check (reason in ('spam','harassment','unsafe','impersonation','other')),
  details text not null default '' check (char_length(details) <= 2000), status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now()
);
create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade, language text not null default 'en',
  timezone text not null default 'Asia/Kolkata', reminder_opt_in boolean not null default false,
  match_notifications boolean not null default false, weekly_review_opt_in boolean not null default false,
  ai_personalization boolean not null default false, ai_notifications boolean not null default false,
  updated_at timestamptz not null default now()
);
create table public.collaboration_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  collaboration_types text[] not null default '{}',
  group_size text not null default 'small' check (group_size in ('solo','small','medium','open')),
  collaboration_style text not null default '',
  preferred_language text not null default 'en',
  discoverable boolean not null default true,
  updated_at timestamptz not null default now()
);
