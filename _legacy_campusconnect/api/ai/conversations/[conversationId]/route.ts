import { NextRequest } from "next/server";
import { jsonError } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest, context: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to view mentor chats.", 401);
  const { data: conversation, error } = await supabase.from("ai_conversations").select("id").eq("id", conversationId).eq("user_id", user.id).maybeSingle();
  if (error || !conversation) return jsonError("That conversation is not available.", 404);
  const { data: messages, error: messagesError } = await supabase.from("ai_messages").select("id,role,content,created_at").eq("conversation_id", conversationId).order("created_at").limit(100);
  if (messagesError) return jsonError("Messages could not be loaded.", 500);
  return Response.json({ messages: messages ?? [] });
}
