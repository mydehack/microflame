create table public.account_recovery (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email text not null check (char_length(email) between 3 and 254 and email = lower(email)),
  verified_at timestamptz not null default now()
);
alter table public.account_recovery enable row level security;
revoke all on public.account_recovery from public, anon, authenticated;
grant select (user_id,email,verified_at) on public.account_recovery to authenticated;
grant select on public.account_recovery to service_role;
create policy "recovery address visible only to owner" on public.account_recovery for select to authenticated
using (user_id = (select auth.uid()));

create table app_private.recovery_challenges (
  user_id uuid not null references public.profiles(id) on delete cascade,
  purpose text not null check (purpose in ('enroll','reset')),
  email text not null,
  code_hash text not null check (code_hash ~ '^[a-f0-9]{64}$'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (user_id,purpose)
);
revoke all on app_private.recovery_challenges from public, anon, authenticated, service_role;

create or replace function public.begin_recovery_challenge(p_user_id uuid, p_email text, p_purpose text, p_code_hash text)
returns void language plpgsql security definer set search_path = pg_catalog, public, app_private as $$
begin
  if auth.role() <> 'service_role' then raise exception 'Not allowed'; end if;
  if p_purpose not in ('enroll','reset') or lower(p_email) <> p_email or p_email !~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    or p_code_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid recovery challenge'; end if;
  if p_purpose = 'reset' and not exists (
    select 1 from public.account_recovery r where r.user_id = p_user_id and r.email = p_email
  ) then raise exception 'No verified recovery address'; end if;
  insert into app_private.recovery_challenges(user_id,purpose,email,code_hash,expires_at)
  values (p_user_id,p_purpose,p_email,p_code_hash,now() + interval '10 minutes')
  on conflict (user_id,purpose) do update set email = excluded.email, code_hash = excluded.code_hash,
    expires_at = excluded.expires_at, created_at = now();
end;
$$;
revoke all on function public.begin_recovery_challenge(uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.begin_recovery_challenge(uuid,text,text,text) to service_role;

create or replace function public.consume_recovery_challenge(p_user_id uuid, p_email text, p_purpose text, p_code_hash text)
returns boolean language plpgsql security definer set search_path = pg_catalog, public, app_private as $$
declare consumed boolean;
begin
  if auth.role() <> 'service_role' then raise exception 'Not allowed'; end if;
  if p_purpose not in ('enroll','reset') or p_code_hash !~ '^[a-f0-9]{64}$' then return false; end if;
  if p_purpose = 'reset' and not exists (
    select 1 from public.account_recovery r where r.user_id = p_user_id and r.email = p_email
  ) then return false; end if;
  delete from app_private.recovery_challenges c
  where c.user_id = p_user_id and c.purpose = p_purpose and c.email = p_email
    and c.code_hash = p_code_hash and c.expires_at > now()
  returning true into consumed;
  if not coalesce(consumed,false) then return false; end if;
  if p_purpose = 'enroll' then
    insert into public.account_recovery(user_id,email,verified_at) values (p_user_id,p_email,now())
    on conflict (user_id) do update set email = excluded.email, verified_at = now();
  end if;
  return true;
end;
$$;
revoke all on function public.consume_recovery_challenge(uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.consume_recovery_challenge(uuid,text,text,text) to service_role;

create or replace function public.revoke_user_sessions(p_user_id uuid)
returns void language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  if auth.role() <> 'service_role' then raise exception 'Not allowed'; end if;
  delete from auth.sessions where user_id = p_user_id;
end;
$$;
revoke all on function public.revoke_user_sessions(uuid) from public, anon, authenticated;
grant execute on function public.revoke_user_sessions(uuid) to service_role;
