create unique index connections_undirected_pair_uq
on public.connections (least(requester_id, recipient_id), greatest(requester_id, recipient_id));

create or replace function app_private.notify_follow_request()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  insert into public.notifications(user_id,actor_id,notification_type,entity_id,body)
  values (new.recipient_id,new.requester_id,'follow_request',new.id,'sent you a follow request.');
  return new;
end;
$$;
revoke all on function app_private.notify_follow_request() from public, anon, authenticated;
create trigger on_follow_request_created after insert on public.follow_requests
for each row when (new.status = 'pending') execute function app_private.notify_follow_request();

create or replace function app_private.notify_connection_request()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  insert into public.notifications(user_id,actor_id,notification_type,entity_id,body)
  values (new.recipient_id,new.requester_id,'connection',new.id,'sent you a connection request.');
  return new;
end;
$$;
revoke all on function app_private.notify_connection_request() from public, anon, authenticated;
create trigger on_connection_request_created after insert on public.connections
for each row when (new.status = 'pending') execute function app_private.notify_connection_request();

create or replace function app_private.start_connection_conversation()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare new_conversation_id uuid;
begin
  if new.status = 'accepted' and old.status = 'pending' then
    if exists (select 1 from public.blocks b where (b.blocker_id = new.requester_id and b.blocked_id = new.recipient_id) or (b.blocker_id = new.recipient_id and b.blocked_id = new.requester_id)) then
      raise exception 'A blocked user cannot be connected';
    end if;
    insert into public.conversations default values returning id into new_conversation_id;
    insert into public.conversation_members(conversation_id,user_id) values (new_conversation_id,new.requester_id),(new_conversation_id,new.recipient_id);
    insert into public.notifications(user_id,actor_id,notification_type,entity_id,body)
    values (new.requester_id,new.recipient_id,'connection',new.id,'accepted your connection request.');
  end if;
  return new;
end;
$$;
revoke all on function app_private.start_connection_conversation() from public, anon, authenticated;
create trigger on_connection_accepted after update of status on public.connections
for each row execute function app_private.start_connection_conversation();

create or replace function app_private.notify_social_activity()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  owner_id uuid;
  actor_type text;
  recipient_type text;
begin
  if tg_table_name = 'post_likes' then
    select p.user_id into owner_id from public.posts p where p.id = new.post_id and p.deleted_at is null;
    if owner_id is not null and owner_id <> new.user_id then
      insert into public.notifications(user_id,actor_id,notification_type,entity_id,body)
      select owner_id,new.user_id,'like',new.post_id,'liked your post.'
      where not exists (select 1 from public.blocks b where (b.blocker_id = owner_id and b.blocked_id = new.user_id) or (b.blocker_id = new.user_id and b.blocked_id = owner_id));
    end if;
  elsif tg_table_name = 'comments' then
    select p.user_id into owner_id from public.posts p where p.id = new.post_id and p.deleted_at is null;
    if owner_id is not null and owner_id <> new.user_id then
      insert into public.notifications(user_id,actor_id,notification_type,entity_id,body)
      select owner_id,new.user_id,'comment',new.post_id,'commented on your post.'
      where not exists (select 1 from public.blocks b where (b.blocker_id = owner_id and b.blocked_id = new.user_id) or (b.blocker_id = new.user_id and b.blocked_id = owner_id));
    end if;
  elsif tg_table_name = 'follows' then
    select account_type into actor_type from public.profiles where id = new.follower_id;
    select account_type into recipient_type from public.profiles where id = new.followed_id;
    if actor_type = 'student' and recipient_type = 'student' then
      insert into public.notifications(user_id,actor_id,notification_type,entity_id,body)
      values (new.followed_id,new.follower_id,'follow',new.follower_id,'started following you.');
    end if;
  elsif tg_table_name = 'messages' then
    insert into public.notifications(user_id,actor_id,notification_type,entity_id,body)
    select cm.user_id,new.sender_id,'message',new.conversation_id,'sent you a message.'
    from public.conversation_members cm
    where cm.conversation_id = new.conversation_id and cm.user_id <> new.sender_id
      and not exists (select 1 from public.blocks b where (b.blocker_id = cm.user_id and b.blocked_id = new.sender_id) or (b.blocker_id = new.sender_id and b.blocked_id = cm.user_id));
  end if;
  return new;
end;
$$;
revoke all on function app_private.notify_social_activity() from public, anon, authenticated;
create trigger on_post_like_created after insert on public.post_likes for each row execute function app_private.notify_social_activity();
create trigger on_comment_created after insert on public.comments for each row when (new.deleted_at is null) execute function app_private.notify_social_activity();
create trigger on_follow_created after insert on public.follows for each row execute function app_private.notify_social_activity();
create trigger on_message_created after insert on public.messages for each row execute function app_private.notify_social_activity();

create or replace function app_private.cleanup_blocked_relationships()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  delete from public.follows where (follower_id = new.blocker_id and followed_id = new.blocked_id) or (follower_id = new.blocked_id and followed_id = new.blocker_id);
  delete from public.follow_requests where (requester_id = new.blocker_id and recipient_id = new.blocked_id) or (requester_id = new.blocked_id and recipient_id = new.blocker_id);
  delete from public.connections where (requester_id = new.blocker_id and recipient_id = new.blocked_id) or (requester_id = new.blocked_id and recipient_id = new.blocker_id);
  delete from public.conversations c where
    exists (select 1 from public.conversation_members cm where cm.conversation_id = c.id and cm.user_id = new.blocker_id)
    and exists (select 1 from public.conversation_members cm where cm.conversation_id = c.id and cm.user_id = new.blocked_id);
  return new;
end;
$$;
revoke all on function app_private.cleanup_blocked_relationships() from public, anon, authenticated;
create trigger on_block_created after insert on public.blocks for each row execute function app_private.cleanup_blocked_relationships();

create or replace function app_private.add_community_owner()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
begin
  insert into public.community_members(community_id,user_id,role,status)
  values (new.id,new.owner_id,'owner','accepted') on conflict do nothing;
  return new;
end;
$$;
revoke all on function app_private.add_community_owner() from public, anon, authenticated;
create trigger on_community_created after insert on public.communities for each row execute function app_private.add_community_owner();

create or replace function app_private.notify_private_group_request()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare owner_id uuid;
begin
  if new.status = 'pending' then
    select c.owner_id into owner_id from public.communities c where c.id = new.community_id;
    insert into public.notifications(user_id,actor_id,notification_type,entity_id,body)
    values (owner_id,new.user_id,'system',new.community_id,'requested to join your private community.');
  end if;
  return new;
end;
$$;
revoke all on function app_private.notify_private_group_request() from public, anon, authenticated;
create trigger on_private_group_request after insert on public.community_members for each row execute function app_private.notify_private_group_request();
