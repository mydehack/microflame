create table public.saved_posts (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
alter table public.saved_posts enable row level security;
grant select, insert, delete on public.saved_posts to authenticated;
create policy "saved posts private to owner" on public.saved_posts for select to authenticated using (user_id = (select auth.uid()));
create policy "save a visible post" on public.saved_posts for insert to authenticated with check (user_id = (select auth.uid()) and app_private.can_view_post_id(post_id));
create policy "remove own saved post" on public.saved_posts for delete to authenticated using (user_id = (select auth.uid()));

create or replace function app_private.save_student_onboarding(p_payload jsonb)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  uid uuid := auth.uid();
  item jsonb;
begin
  if uid is null then raise exception 'Authentication required'; end if;
  if exists (select 1 from public.profiles where id = uid and onboarded_at is not null) then raise exception 'Onboarding is already complete'; end if;

  update public.profiles set
    bio = coalesce(p_payload ->> 'bio',''),
    visibility = coalesce(p_payload ->> 'visibility','public'),
    profile_fields_visible = coalesce((p_payload ->> 'profileFieldsVisible')::boolean,true),
    onboarded_at = now()
  where id = uid and account_type = 'student';
  if not found then raise exception 'Student profile not found'; end if;

  insert into public.education(user_id,degree,specialization,academic_year,graduation_year,learning_level)
  values (uid, coalesce(p_payload ->> 'degree',''), coalesce(p_payload ->> 'specialization',''),
    nullif(p_payload ->> 'academicYear','')::smallint, nullif(p_payload ->> 'graduationYear','')::smallint, coalesce(p_payload ->> 'learningLevel',''));

  for item in select value from jsonb_array_elements(coalesce(p_payload -> 'skills','[]'::jsonb)) loop
    insert into public.student_skills(user_id,name,proficiency,wants_to_learn)
    values (uid, btrim(item ->> 'name'), greatest(1,least(5,coalesce(nullif(item ->> 'proficiency','')::smallint,1))), coalesce((item ->> 'wantsToLearn')::boolean,false));
  end loop;
  for item in select value from jsonb_array_elements(coalesce(p_payload -> 'interests','[]'::jsonb)) loop
    insert into public.interests(user_id,name) values (uid,btrim(item #>> '{}')) on conflict (user_id,name) do nothing;
  end loop;

  if length(btrim(coalesce(p_payload ->> 'shortTermGoal',''))) > 1 then
    insert into public.student_goals(user_id,title,description,goal_type,visibility,weekly_minutes)
    values (uid,btrim(p_payload ->> 'shortTermGoal'),'A short-term goal added during onboarding.','skill','private',nullif(p_payload ->> 'weeklyMinutes','')::integer);
  end if;
  if length(btrim(coalesce(p_payload ->> 'careerGoal',''))) > 1 then
    insert into public.student_goals(user_id,title,description,goal_type,visibility,weekly_minutes)
    values (uid,btrim(p_payload ->> 'careerGoal'),'A long-term goal added during onboarding.','career','private',nullif(p_payload ->> 'weeklyMinutes','')::integer);
  end if;

  insert into public.collaboration_preferences(user_id,collaboration_types,group_size,collaboration_style,preferred_language,discoverable)
  values (uid, array(select jsonb_array_elements_text(coalesce(p_payload -> 'collaborationTypes','[]'::jsonb))),
    coalesce(p_payload ->> 'groupSize','small'), coalesce(p_payload ->> 'collaborationStyle',''), coalesce(p_payload ->> 'language','en'), true);
  insert into public.user_preferences(user_id,language,timezone,reminder_opt_in,ai_personalization)
  values (uid,coalesce(p_payload ->> 'language','en'),coalesce(p_payload ->> 'timezone','Asia/Kolkata'),false,coalesce((p_payload ->> 'aiPersonalization')::boolean,false));
end;
$$;
revoke all on function app_private.save_student_onboarding(jsonb) from public, anon, authenticated;
grant execute on function app_private.save_student_onboarding(jsonb) to authenticated;
create or replace function public.save_student_onboarding(p_payload jsonb)
returns void language sql security invoker set search_path = pg_catalog, app_private as $$
  select app_private.save_student_onboarding(p_payload);
$$;
revoke all on function public.save_student_onboarding(jsonb) from public, anon, authenticated;
grant execute on function public.save_student_onboarding(jsonb) to authenticated;

create or replace function app_private.save_student_profile_settings(p_payload jsonb)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Authentication required'; end if;
  update public.profiles set
    full_name = btrim(p_payload ->> 'fullName'),
    college = btrim(p_payload ->> 'college'),
    bio = coalesce(p_payload ->> 'bio',''),
    visibility = p_payload ->> 'visibility',
    profile_fields_visible = (p_payload ->> 'profileFieldsVisible')::boolean,
    contact_preference = p_payload ->> 'contactPreference'
  where id = uid and account_type = 'student';
  if not found then raise exception 'Student profile not found'; end if;
  insert into public.user_preferences(user_id,ai_personalization,ai_notifications)
  values (uid,(p_payload ->> 'aiPersonalization')::boolean,(p_payload ->> 'aiNotifications')::boolean)
  on conflict (user_id) do update set ai_personalization = excluded.ai_personalization, ai_notifications = excluded.ai_notifications;
end;
$$;
revoke all on function app_private.save_student_profile_settings(jsonb) from public, anon, authenticated;
grant execute on function app_private.save_student_profile_settings(jsonb) to authenticated;
create or replace function public.save_student_profile_settings(p_payload jsonb)
returns void language sql security invoker set search_path = pg_catalog, app_private as $$
  select app_private.save_student_profile_settings(p_payload);
$$;
revoke all on function public.save_student_profile_settings(jsonb) from public, anon, authenticated;
grant execute on function public.save_student_profile_settings(jsonb) to authenticated;
