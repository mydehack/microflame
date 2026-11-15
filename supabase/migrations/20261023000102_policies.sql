create table app_private.auth_attempt_windows (
  key_hash text primary key, window_started_at timestamptz not null, attempts integer not null
);

create or replace function public.consume_auth_rate_limit(p_key_hash text, p_limit integer, p_window_seconds integer)
returns boolean language plpgsql security definer set search_path = pg_catalog, app_private as $$
declare allowed boolean;
begin
  if p_key_hash !~ '^[a-f0-9]{64}$' or p_limit < 1 or p_window_seconds < 1 then return false; end if;
  insert into app_private.auth_attempt_windows(key_hash, window_started_at, attempts) values (p_key_hash, now(), 1)
  on conflict (key_hash) do update set
    window_started_at = case when app_private.auth_attempt_windows.window_started_at < now() - make_interval(secs => p_window_seconds) then now() else app_private.auth_attempt_windows.window_started_at end,
    attempts = case when app_private.auth_attempt_windows.window_started_at < now() - make_interval(secs => p_window_seconds) then 1 else app_private.auth_attempt_windows.attempts + 1 end;
  select attempts <= p_limit into allowed from app_private.auth_attempt_windows where key_hash = p_key_hash;
  return allowed;
end;
$$;
revoke all on function public.consume_auth_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_auth_rate_limit(text, integer, integer) to service_role;

create or replace function app_private.is_blocked_between(p_other_user_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public as $$
  select auth.uid() is not null and exists (
    select 1 from public.blocks b where (b.blocker_id = auth.uid() and b.blocked_id = p_other_user_id)
      or (b.blocker_id = p_other_user_id and b.blocked_id = auth.uid())
  );
$$;
create or replace function app_private.can_view_profile(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public, app_private as $$
  select auth.uid() is not null and (p_profile_id = auth.uid() or (
    not app_private.is_blocked_between(p_profile_id) and exists (
      select 1 from public.profiles p where p.id = p_profile_id and (
        p.visibility = 'public' or exists (select 1 from public.follows f where f.follower_id = auth.uid() and f.followed_id = p.id)
      )
    )
  ));
$$;
create or replace function app_private.is_follower(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public, app_private as $$
  select auth.uid() is not null and not app_private.is_blocked_between(p_profile_id)
    and exists (select 1 from public.follows f where f.follower_id = auth.uid() and f.followed_id = p_profile_id);
$$;
create or replace function app_private.is_private_profile(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public as $$
  select auth.uid() is not null and exists (select 1 from public.profiles p where p.id = p_profile_id and p.visibility = 'private');
$$;
create or replace function app_private.accepts_connection_requests(p_profile_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public, app_private as $$
  select auth.uid() is not null and not app_private.is_blocked_between(p_profile_id)
    and app_private.can_view_profile(p_profile_id)
    and exists (select 1 from public.profiles p where p.id = p_profile_id and (
      p.contact_preference = 'connections'
      or (p.contact_preference = 'followers' and exists (select 1 from public.follows f where f.follower_id = auth.uid() and f.followed_id = p.id))
    ));
$$;
create or replace function app_private.can_join_community(p_community_id uuid, p_status text)
returns boolean language sql stable security definer set search_path = pg_catalog, public as $$
  select auth.uid() is not null and exists (
    select 1 from public.communities c where c.id = p_community_id
      and ((c.visibility = 'public' and p_status = 'accepted') or (c.visibility = 'private' and p_status = 'pending'))
  );
$$;
create or replace function app_private.can_view_post(p_owner_id uuid, p_visibility text)
returns boolean language sql stable security definer set search_path = pg_catalog, public, app_private as $$
  select auth.uid() is not null and (p_owner_id = auth.uid() or (not app_private.is_blocked_between(p_owner_id) and (
    (p_visibility = 'public' and app_private.can_view_profile(p_owner_id))
    or (p_visibility = 'followers' and app_private.is_follower(p_owner_id))
  )));
$$;
create or replace function app_private.can_view_post_id(p_post_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public, app_private as $$
  select exists (select 1 from public.posts p where p.id = p_post_id and p.deleted_at is null and app_private.can_view_post(p.user_id, p.visibility));
$$;
create or replace function app_private.can_access_conversation(p_conversation_id uuid)
returns boolean language sql stable security definer set search_path = pg_catalog, public as $$
  select auth.uid() is not null
    and exists (select 1 from public.conversation_members cm where cm.conversation_id = p_conversation_id and cm.user_id = auth.uid())
    and not exists (select 1 from public.blocks b join public.conversation_members cm on cm.conversation_id = p_conversation_id
      where (b.blocker_id = auth.uid() and b.blocked_id = cm.user_id) or (b.blocker_id = cm.user_id and b.blocked_id = auth.uid()));
$$;
grant execute on function app_private.is_blocked_between(uuid) to authenticated;
grant execute on function app_private.can_view_profile(uuid) to authenticated;
grant execute on function app_private.is_follower(uuid) to authenticated;
grant execute on function app_private.is_private_profile(uuid) to authenticated;
grant execute on function app_private.accepts_connection_requests(uuid) to authenticated;
grant execute on function app_private.can_join_community(uuid, text) to authenticated;
grant execute on function app_private.can_view_post(uuid, text) to authenticated;
grant execute on function app_private.can_view_post_id(uuid) to authenticated;
grant execute on function app_private.can_access_conversation(uuid) to authenticated;

create or replace function app_private.handle_new_auth_user()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  -- app_metadata can only be set by a trusted Supabase admin, while
  -- user_metadata is writable by callers of the public signup API.
  account_kind text := new.raw_app_meta_data ->> 'account_type';
  mentor_id uuid;
begin
  if account_kind is null or account_kind not in ('student','ai') then raise exception 'Use the trusted CampusConnect registration flow'; end if;
  if account_kind = 'ai' and (lower(coalesce(new.raw_user_meta_data ->> 'username','')) <> 'campusconnect-ai'
    or lower(coalesce(new.email,'')) <> 'campusconnect-ai@accounts.campusconnect.invalid') then
    raise exception 'Invalid platform account';
  end if;
  if account_kind = 'student' and lower(coalesce(new.raw_user_meta_data ->> 'username','')) = 'campusconnect-ai' then
    raise exception 'Reserved username';
  end if;
  insert into public.profiles (id, username, full_name, college, account_type, is_platform_badge, visibility)
  values (new.id, lower(new.raw_user_meta_data ->> 'username'), coalesce(new.raw_user_meta_data ->> 'full_name','CampusConnect AI Mentor'),
    coalesce(new.raw_user_meta_data ->> 'college','CampusConnect'), account_kind, account_kind = 'ai',
    case when account_kind = 'ai' then 'public' else coalesce(new.raw_user_meta_data ->> 'visibility','public') end);
  if account_kind = 'student' then
    select p.id into mentor_id from public.profiles p where p.account_type = 'ai' and p.username = 'campusconnect-ai' limit 1;
    if mentor_id is null then raise exception 'CampusConnect AI Mentor must be seeded before student registration'; end if;
    insert into public.follows (follower_id, followed_id) values (mentor_id, new.id) on conflict do nothing;
    insert into public.follows (follower_id, followed_id) values (new.id, mentor_id) on conflict do nothing;
  end if;
  return new;
end;
$$;
revoke all on function app_private.handle_new_auth_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute function app_private.handle_new_auth_user();

create or replace function app_private.accept_follow_request()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  if new.status = 'accepted' and old.status = 'pending' then
    if exists (select 1 from public.blocks b where (b.blocker_id = new.requester_id and b.blocked_id = new.recipient_id) or (b.blocker_id = new.recipient_id and b.blocked_id = new.requester_id)) then raise exception 'A blocked user cannot be accepted'; end if;
    insert into public.follows (follower_id, followed_id) values (new.requester_id,new.recipient_id) on conflict do nothing;
  end if;
  return new;
end;
$$;
revoke all on function app_private.accept_follow_request() from public, anon, authenticated;
create trigger on_follow_request_accepted after update of status on public.follow_requests for each row execute function app_private.accept_follow_request();

create or replace function app_private.touch_updated_at()
returns trigger language plpgsql set search_path = pg_catalog as $$ begin new.updated_at = now(); return new; end; $$;
do $$
declare t text;
begin
  foreach t in array array['profiles','education','student_goals','follow_requests','connections','posts','conversations','ai_conversations','user_preferences'] loop
    execute format('create trigger touch_%I_updated_at before update on public.%I for each row execute function app_private.touch_updated_at()', t, t);
  end loop;
end $$;

create or replace function app_private.refresh_goal_progress(p_goal_id uuid)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  task_count integer;
  done_count integer;
begin
  if auth.uid() is not null and not exists (select 1 from public.student_goals g where g.id = p_goal_id and g.user_id = auth.uid()) then raise exception 'Not allowed'; end if;
  select count(*), count(*) filter (where t.status = 'done') into task_count, done_count
    from public.goal_tasks t join public.goal_milestones m on m.id = t.milestone_id where m.goal_id = p_goal_id;
  update public.student_goals set progress_percent = case when task_count = 0 then 0 else round(done_count * 100.0 / task_count)::smallint end where id = p_goal_id;
end;
$$;
create or replace function app_private.sync_goal_progress()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  affected_goal uuid;
  previous_goal uuid;
begin
  if tg_table_name = 'goal_tasks' then
    select goal_id into affected_goal from public.goal_milestones where id = coalesce(new.milestone_id, old.milestone_id);
    if tg_op = 'UPDATE' and new.milestone_id is distinct from old.milestone_id then
      select goal_id into previous_goal from public.goal_milestones where id = old.milestone_id;
    end if;
  else
    affected_goal := coalesce(new.goal_id, old.goal_id);
  end if;
  if affected_goal is not null then perform app_private.refresh_goal_progress(affected_goal); end if;
  if previous_goal is not null and previous_goal is distinct from affected_goal then perform app_private.refresh_goal_progress(previous_goal); end if;
  return null;
end;
$$;
revoke all on function app_private.refresh_goal_progress(uuid) from public, anon, authenticated;
revoke all on function app_private.sync_goal_progress() from public, anon, authenticated;
create trigger on_goal_task_changed after insert or update or delete on public.goal_tasks for each row execute function app_private.sync_goal_progress();
create trigger on_goal_milestone_changed after delete on public.goal_milestones for each row execute function app_private.sync_goal_progress();

do $$
declare t text;
begin
  foreach t in array array['profiles','education','student_skills','interests','student_goals','goal_milestones','goal_tasks','follows','follow_requests','connections','blocks','posts','post_media','post_likes','comments','recommendations','communities','community_members','conversations','conversation_members','messages','ai_conversations','ai_messages','notifications','reports','user_preferences','collaboration_preferences'] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;
