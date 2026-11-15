revoke all on public.profiles from public, anon, authenticated;
grant select (id, username, full_name, college, account_type, is_platform_badge, bio, avatar_path, visibility, profile_fields_visible, contact_preference, onboarded_at, created_at, updated_at) on public.profiles to authenticated;
grant update (username, full_name, college, bio, avatar_path, visibility, profile_fields_visible, contact_preference) on public.profiles to authenticated;
create policy "profile visible to owner, public, or approved follower" on public.profiles for select to authenticated
using (app_private.can_view_profile(id));
create policy "student updates own editable profile" on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()) and account_type = 'student' and is_platform_badge = false);

grant select, insert, update, delete on public.education, public.student_skills, public.interests, public.student_goals, public.goal_milestones, public.goal_tasks to authenticated;
create policy "education visible when profile fields are shared" on public.education for select to authenticated using (
  user_id = (select auth.uid()) or (exists (select 1 from public.profiles p where p.id = user_id and p.profile_fields_visible) and app_private.can_view_profile(user_id))
);
create policy "education owner writes" on public.education for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "skills visible when profile fields are shared" on public.student_skills for select to authenticated using (
  user_id = (select auth.uid()) or (exists (select 1 from public.profiles p where p.id = user_id and p.profile_fields_visible) and app_private.can_view_profile(user_id))
);
create policy "skills owner writes" on public.student_skills for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "interests visible when profile fields are shared" on public.interests for select to authenticated using (
  user_id = (select auth.uid()) or (exists (select 1 from public.profiles p where p.id = user_id and p.profile_fields_visible) and app_private.can_view_profile(user_id))
);
create policy "interests owner writes" on public.interests for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "goals visible only when profile owner shares" on public.student_goals for select to authenticated
using (user_id = (select auth.uid()) or (visibility = 'public' and app_private.can_view_profile(user_id)));
create policy "goal owner writes" on public.student_goals for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "milestones visible with goal" on public.goal_milestones for select to authenticated
using (exists (select 1 from public.student_goals g where g.id = goal_id and (g.user_id = (select auth.uid()) or (g.visibility = 'public' and app_private.can_view_profile(g.user_id)))));
create policy "milestone owner writes" on public.goal_milestones for all to authenticated
using (exists (select 1 from public.student_goals g where g.id = goal_id and g.user_id = (select auth.uid())))
with check (exists (select 1 from public.student_goals g where g.id = goal_id and g.user_id = (select auth.uid())));
create policy "tasks visible with goal" on public.goal_tasks for select to authenticated
using (exists (select 1 from public.goal_milestones m join public.student_goals g on g.id = m.goal_id where m.id = milestone_id and (g.user_id = (select auth.uid()) or (g.visibility = 'public' and app_private.can_view_profile(g.user_id)))));
create policy "task owner writes" on public.goal_tasks for all to authenticated
using (exists (select 1 from public.goal_milestones m join public.student_goals g on g.id = m.goal_id where m.id = milestone_id and g.user_id = (select auth.uid())))
with check (exists (select 1 from public.goal_milestones m join public.student_goals g on g.id = m.goal_id where m.id = milestone_id and g.user_id = (select auth.uid())));

grant select, insert, delete on public.follows to authenticated;
create policy "users see their follow edges" on public.follows for select to authenticated using (follower_id = (select auth.uid()) or followed_id = (select auth.uid()));
create policy "follow a public profile" on public.follows for insert to authenticated with check (
  follower_id = (select auth.uid()) and exists (select 1 from public.profiles p where p.id = followed_id and p.visibility = 'public')
  and not app_private.is_blocked_between(followed_id)
);
create policy "unfollow own edge" on public.follows for delete to authenticated using (follower_id = (select auth.uid()));
revoke update on public.follow_requests, public.connections from authenticated;
grant select, insert, delete on public.follow_requests, public.connections to authenticated;
grant update (status) on public.follow_requests, public.connections to authenticated;
create policy "follow requests visible to participants" on public.follow_requests for select to authenticated using (requester_id = (select auth.uid()) or recipient_id = (select auth.uid()));
create policy "request to follow a private profile" on public.follow_requests for insert to authenticated with check (
  requester_id = (select auth.uid()) and status = 'pending'
  and app_private.is_private_profile(recipient_id)
  and not app_private.is_blocked_between(recipient_id)
);
create policy "recipient accepts or rejects request" on public.follow_requests for update to authenticated
using (recipient_id = (select auth.uid()) and status = 'pending') with check (recipient_id = (select auth.uid()) and status in ('accepted','rejected'));
create policy "requester cancels request" on public.follow_requests for delete to authenticated using (requester_id = (select auth.uid()) and status = 'pending');
create policy "connections visible to participants" on public.connections for select to authenticated
using ((requester_id = (select auth.uid()) or recipient_id = (select auth.uid())) and not app_private.is_blocked_between(case when requester_id = (select auth.uid()) then recipient_id else requester_id end));
create policy "send connection request" on public.connections for insert to authenticated with check (requester_id = (select auth.uid()) and status = 'pending' and app_private.accepts_connection_requests(recipient_id));
create policy "recipient responds to connection" on public.connections for update to authenticated using (recipient_id = (select auth.uid()) and status = 'pending') with check (recipient_id = (select auth.uid()) and status in ('accepted','rejected'));
create policy "requester cancels connection" on public.connections for delete to authenticated using (requester_id = (select auth.uid()));

grant select, insert, delete on public.blocks to authenticated;
create policy "block parties see edge" on public.blocks for select to authenticated using (blocker_id = (select auth.uid()) or blocked_id = (select auth.uid()));
create policy "user blocks another" on public.blocks for insert to authenticated with check (blocker_id = (select auth.uid()));
create policy "user removes own block" on public.blocks for delete to authenticated using (blocker_id = (select auth.uid()));

grant select, insert, update, delete on public.posts, public.post_media, public.post_likes to authenticated;
revoke update on public.comments from authenticated;
grant select, insert, delete on public.comments to authenticated;
create policy "view post allowed by audience" on public.posts for select to authenticated using (deleted_at is null and app_private.can_view_post(user_id, visibility));
create policy "create own post" on public.posts for insert to authenticated with check (user_id = (select auth.uid()));
create policy "edit own post" on public.posts for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "delete own post" on public.posts for delete to authenticated using (user_id = (select auth.uid()));
create policy "media inherits post visibility" on public.post_media for select to authenticated using (app_private.can_view_post_id(post_id));
create policy "post owner manages media" on public.post_media for all to authenticated
using (exists (select 1 from public.posts p where p.id = post_id and p.user_id = (select auth.uid())))
with check (exists (select 1 from public.posts p where p.id = post_id and p.user_id = (select auth.uid())));
create policy "likes visible with post" on public.post_likes for select to authenticated using (app_private.can_view_post_id(post_id));
create policy "like visible post" on public.post_likes for insert to authenticated with check (user_id = (select auth.uid()) and app_private.can_view_post_id(post_id));
create policy "unlike own post" on public.post_likes for delete to authenticated using (user_id = (select auth.uid()));
create policy "comments visible with post" on public.comments for select to authenticated using (deleted_at is null and app_private.can_view_post_id(post_id));
create policy "comment on visible post" on public.comments for insert to authenticated with check (
  user_id = (select auth.uid()) and app_private.can_view_post_id(post_id)
  and (parent_id is null or exists (select 1 from public.comments parent where parent.id = parent_id and parent.post_id = public.comments.post_id and parent.deleted_at is null))
);
create policy "edit own comment" on public.comments for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "delete own comment" on public.comments for delete to authenticated using (user_id = (select auth.uid()));

revoke update on public.recommendations from authenticated;
grant select, insert, delete on public.recommendations to authenticated;
grant update (dismissed_at) on public.recommendations to authenticated;
create policy "recommendations private to recipient" on public.recommendations for select to authenticated using (user_id = (select auth.uid()) and not app_private.is_blocked_between(recommended_user_id));
create policy "recipient stores own recommendation" on public.recommendations for insert to authenticated with check (
  user_id = (select auth.uid()) and recommended_user_id <> (select auth.uid()) and app_private.can_view_profile(recommended_user_id)
);
create policy "recipient dismisses recommendation" on public.recommendations for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "recipient deletes recommendation" on public.recommendations for delete to authenticated using (user_id = (select auth.uid()));

grant select, insert, update, delete on public.communities to authenticated;
revoke update on public.community_members from authenticated;
grant select, insert, delete on public.community_members to authenticated;
grant update (status) on public.community_members to authenticated;
create policy "community visible or joined" on public.communities for select to authenticated using (
  visibility = 'public' or owner_id = (select auth.uid()) or exists (select 1 from public.community_members cm where cm.community_id = id and cm.user_id = (select auth.uid()) and cm.status = 'accepted')
);
create policy "owner creates community" on public.communities for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "owner edits community" on public.communities for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));
create policy "owner deletes community" on public.communities for delete to authenticated using (owner_id = (select auth.uid()));
create policy "members see own or public membership" on public.community_members for select to authenticated using (
  user_id = (select auth.uid()) or exists (select 1 from public.communities c where c.id = community_id and c.visibility = 'public')
  or exists (select 1 from public.communities c where c.id = community_id and c.owner_id = (select auth.uid()))
);
create policy "users request or join community" on public.community_members for insert to authenticated with check (
  user_id = (select auth.uid()) and role = 'member' and app_private.can_join_community(community_id,status)
);
create policy "community owner responds to requests" on public.community_members for update to authenticated
using (exists (select 1 from public.communities c where c.id = community_id and c.owner_id = (select auth.uid())) and status = 'pending')
with check (status in ('accepted','rejected') and exists (select 1 from public.communities c where c.id = community_id and c.owner_id = (select auth.uid())));
create policy "users leave community" on public.community_members for delete to authenticated using (user_id = (select auth.uid()) or exists (select 1 from public.communities c where c.id = community_id and c.owner_id = (select auth.uid())));

revoke update on public.conversations, public.conversation_members, public.notifications from authenticated;
grant select on public.conversations, public.conversation_members to authenticated;
grant update (last_read_at) on public.conversation_members to authenticated;
grant select, insert on public.messages to authenticated;
create policy "members read conversations" on public.conversations for select to authenticated using (app_private.can_access_conversation(id));
create policy "members read membership" on public.conversation_members for select to authenticated using (app_private.can_access_conversation(conversation_id));
create policy "members update own read marker" on public.conversation_members for update to authenticated
using (user_id = (select auth.uid()) and app_private.can_access_conversation(conversation_id)) with check (user_id = (select auth.uid()));
create policy "members read messages" on public.messages for select to authenticated using (app_private.can_access_conversation(conversation_id));
create policy "members send messages" on public.messages for insert to authenticated with check (sender_id = (select auth.uid()) and app_private.can_access_conversation(conversation_id));

grant select, insert, update, delete on public.ai_conversations to authenticated;
grant select, insert on public.ai_messages to authenticated;
create policy "AI chats private to owner" on public.ai_conversations for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "AI messages private to owner" on public.ai_messages for select to authenticated
using (exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
create policy "student adds own chat message" on public.ai_messages for insert to authenticated
with check (role = 'user' and exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));

grant select on public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
create policy "notifications private to owner" on public.notifications for select to authenticated using (user_id = (select auth.uid()));
create policy "mark own notification read" on public.notifications for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert on public.reports to authenticated;
create policy "reporter reads own reports" on public.reports for select to authenticated using (reporter_id = (select auth.uid()));
create policy "submit a report" on public.reports for insert to authenticated with check (reporter_id = (select auth.uid()) and (reported_user_id is null or reported_user_id <> (select auth.uid())));
grant select, insert, update on public.user_preferences to authenticated;
create policy "preferences private to owner" on public.user_preferences for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
grant select, insert, update on public.collaboration_preferences to authenticated;
create policy "opted in collaboration preferences visible" on public.collaboration_preferences for select to authenticated
using (user_id = (select auth.uid()) or (discoverable and exists (select 1 from public.profiles p where p.id = user_id and p.profile_fields_visible) and app_private.can_view_profile(user_id)));
create policy "collaboration preferences private owner writes" on public.collaboration_preferences for insert to authenticated
with check (user_id = (select auth.uid()));
create policy "collaboration preferences private owner updates" on public.collaboration_preferences for update to authenticated
using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-media','profile-media',false,5242880,array['image/jpeg','image/png','image/webp']),
       ('post-media','post-media',false,15728640,array['image/jpeg','image/png','image/webp','video/mp4'])
on conflict (id) do nothing;
create policy "profile media follows profile access" on storage.objects for select to authenticated
using (bucket_id = 'profile-media' and app_private.can_view_profile((storage.foldername(name))[1]::uuid));
create policy "user uploads profile media" on storage.objects for insert to authenticated with check (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "user updates profile media" on storage.objects for update to authenticated using (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "user deletes profile media" on storage.objects for delete to authenticated using (bucket_id = 'profile-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "post media follows post access" on storage.objects for select to authenticated
using (bucket_id = 'post-media' and app_private.can_view_post_id((storage.foldername(name))[2]::uuid));
create policy "user uploads post media" on storage.objects for insert to authenticated with check (bucket_id = 'post-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "user updates post media" on storage.objects for update to authenticated using (bucket_id = 'post-media' and (storage.foldername(name))[1] = (select auth.uid())::text) with check (bucket_id = 'post-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "user deletes post media" on storage.objects for delete to authenticated using (bucket_id = 'post-media' and (storage.foldername(name))[1] = (select auth.uid())::text);
