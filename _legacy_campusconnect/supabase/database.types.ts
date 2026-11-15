export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, RequiredInsert extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, RequiredInsert>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, "id" | "username" | "full_name" | "college">;
      education: Table<Education, "user_id">;
      student_skills: Table<StudentSkill, "user_id" | "name">;
      interests: Table<Interest, "user_id" | "name">;
      student_goals: Table<StudentGoal, "user_id" | "title">;
      goal_milestones: Table<GoalMilestone, "goal_id" | "title">;
      goal_tasks: Table<GoalTask, "milestone_id" | "title">;
      follows: Table<Follow, "follower_id" | "followed_id">;
      follow_requests: Table<FollowRequest, "requester_id" | "recipient_id">;
      connections: Table<Connection, "requester_id" | "recipient_id">;
      blocks: Table<Block, "blocker_id" | "blocked_id">;
      posts: Table<Post, "user_id">;
      post_media: Table<PostMedia, "post_id" | "storage_path" | "media_type">;
      post_likes: Table<PostLike, "post_id" | "user_id">;
      comments: Table<Comment, "post_id" | "user_id" | "content">;
      recommendations: Table<Recommendation, "user_id" | "recommended_user_id" | "score" | "explanation">;
      saved_posts: Table<SavedPost, "user_id" | "post_id">;
      communities: Table<Community, "owner_id" | "name">;
      community_members: Table<CommunityMember, "community_id" | "user_id">;
      conversations: Table<Conversation, never>;
      conversation_members: Table<ConversationMember, "conversation_id" | "user_id">;
      messages: Table<Message, "conversation_id" | "sender_id" | "content">;
      ai_conversations: Table<AiConversation, "user_id" | "persona">;
      ai_messages: Table<AiMessage, "conversation_id" | "role" | "content">;
      notifications: Table<Notification, "user_id" | "notification_type" | "body">;
      reports: Table<Report, "reporter_id" | "reason">;
      user_preferences: Table<UserPreferences, "user_id">;
      collaboration_preferences: Table<CollaborationPreferences, "user_id">;
      account_recovery: Table<AccountRecovery, "user_id" | "email">;
    };
    Views: Record<string, never>;
    Functions: {
      consume_auth_rate_limit: { Args: { p_key_hash: string; p_limit: number; p_window_seconds: number }; Returns: boolean };
      save_student_onboarding: { Args: { p_payload: Json }; Returns: undefined };
      save_student_profile_settings: { Args: { p_payload: Json }; Returns: undefined };
      begin_recovery_challenge: { Args: { p_user_id: string; p_email: string; p_purpose: string; p_code_hash: string }; Returns: undefined };
      consume_recovery_challenge: { Args: { p_user_id: string; p_email: string; p_purpose: string; p_code_hash: string }; Returns: boolean };
      revoke_user_sessions: { Args: { p_user_id: string }; Returns: undefined };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Profile = {
  id: string; username: string; full_name: string; college: string; account_type: "student" | "ai"; is_platform_badge: boolean;
  bio: string; avatar_path: string | null; visibility: "public" | "private"; profile_fields_visible: boolean;
  contact_preference: "connections" | "followers" | "nobody";
  onboarded_at: string | null; created_at: string; updated_at: string;
};
export type Education = { user_id: string; degree: string; specialization: string; academic_year: number | null; graduation_year: number | null; learning_level: string; updated_at: string };
export type StudentSkill = { id: string; user_id: string; name: string; proficiency: number; wants_to_learn: boolean; created_at: string };
export type Interest = { id: string; user_id: string; name: string; created_at: string };
export type StudentGoal = { id: string; user_id: string; title: string; description: string; goal_type: "career" | "skill" | "project" | "study" | "other"; visibility: "private" | "public"; status: "active" | "paused" | "completed"; start_date: string; target_date: string | null; weekly_minutes: number | null; reminder_enabled: boolean; progress_percent: number; created_at: string; updated_at: string };
export type GoalMilestone = { id: string; goal_id: string; title: string; position: number; status: "todo" | "in_progress" | "done"; target_date: string | null; created_at: string };
export type GoalTask = { id: string; milestone_id: string; title: string; notes: string; priority: "low" | "medium" | "high"; estimated_minutes: number | null; position: number; status: "todo" | "in_progress" | "done"; completed_at: string | null; created_at: string };
export type Follow = { follower_id: string; followed_id: string; created_at: string };
export type FollowRequest = { id: string; requester_id: string; recipient_id: string; status: "pending" | "accepted" | "rejected" | "cancelled"; created_at: string; updated_at: string };
export type Connection = { id: string; requester_id: string; recipient_id: string; status: "pending" | "accepted" | "rejected" | "cancelled"; created_at: string; updated_at: string };
export type Block = { blocker_id: string; blocked_id: string; created_at: string };
export type Post = { id: string; user_id: string; content: string; post_type: "update" | "project" | "achievement" | "resource"; visibility: "public" | "followers" | "private"; created_at: string; updated_at: string; deleted_at: string | null };
export type PostMedia = { id: string; post_id: string; storage_path: string; media_type: "image" | "video"; alt_text: string; position: number; created_at: string };
export type PostLike = { post_id: string; user_id: string; created_at: string };
export type Comment = { id: string; post_id: string; user_id: string; parent_id: string | null; content: string; created_at: string; deleted_at: string | null };
export type Recommendation = { id: string; user_id: string; recommended_user_id: string; score: number; explanation: string; dismissed_at: string | null; created_at: string };
export type SavedPost = { user_id: string; post_id: string; created_at: string };
export type Community = { id: string; owner_id: string; name: string; description: string; visibility: "public" | "private"; created_at: string };
export type CommunityMember = { community_id: string; user_id: string; role: "owner" | "moderator" | "member"; status: "pending" | "accepted" | "rejected"; joined_at: string };
export type Conversation = { id: string; created_at: string; updated_at: string };
export type ConversationMember = { conversation_id: string; user_id: string; last_read_at: string | null; joined_at: string };
export type Message = { id: string; conversation_id: string; sender_id: string; content: string; created_at: string; read_at: string | null };
export type AiConversation = { id: string; user_id: string; persona: "career" | "study" | "project" | "accountability" | "communication" | "research"; title: string; share_with_ai_personalization: boolean; created_at: string; updated_at: string };
export type AiMessage = { id: string; conversation_id: string; role: "user" | "assistant"; content: string; model: string | null; created_at: string };
export type Notification = { id: string; user_id: string; actor_id: string | null; notification_type: string; entity_id: string | null; body: string; read_at: string | null; created_at: string };
export type Report = { id: string; reporter_id: string; reported_user_id: string | null; post_id: string | null; reason: "spam" | "harassment" | "unsafe" | "impersonation" | "other"; details: string; status: "open" | "reviewing" | "resolved" | "dismissed"; created_at: string };
export type UserPreferences = { user_id: string; language: string; timezone: string; reminder_opt_in: boolean; match_notifications: boolean; weekly_review_opt_in: boolean; ai_personalization: boolean; ai_notifications: boolean; updated_at: string };
export type AccountRecovery = { user_id: string; email: string; verified_at: string };
export type CollaborationPreferences = { user_id: string; collaboration_types: string[]; group_size: "solo" | "small" | "medium" | "open"; collaboration_style: string; preferred_language: string; discoverable: boolean; updated_at: string };
