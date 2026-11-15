import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { enforceUserRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const messageSchema = z.object({ content: z.string().trim().min(1).max(5000) });
export async function GET(_request: NextRequest, context: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to read messages.", 401);
  const { data: conversation } = await supabase.from("conversations").select("id").eq("id", conversationId).maybeSingle();
  if (!conversation) return jsonError("That conversation is not available.", 404);
  const [messageResult, memberResult] = await Promise.all([
    supabase.from("messages").select("id,sender_id,content,created_at").eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(200),
    supabase.from("conversation_members").select("user_id").eq("conversation_id", conversationId),
  ]);
  if (messageResult.error || memberResult.error) return jsonError("Messages could not be loaded.", 500);
  const peerId = (memberResult.data ?? []).find((member) => member.user_id !== user.id)?.user_id;
  const { data: peer } = peerId ? await supabase.from("profiles").select("id,username,full_name,avatar_path").eq("id", peerId).maybeSingle() : { data: null };
  await supabase.from("conversation_members").update({ last_read_at: new Date().toISOString() }).eq("conversation_id", conversationId).eq("user_id", user.id);
  return NextResponse.json({ messages: messageResult.data ?? [], person: peer });
}

export async function POST(request: NextRequest, context: { params: Promise<{ conversationId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = messageSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Write a message before sending it.", 400);
  const { conversationId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to send messages.", 401);
  try {
    if (!await enforceUserRateLimit(user.id, "messages", 60, 600)) return jsonError("You have sent several messages recently. Please wait before messaging again.", 429);
  } catch {
    return jsonError("Messaging is temporarily unavailable.", 503);
  }
  const { data, error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: user.id, content: input.data.content }).select("id,sender_id,content,created_at").single();
  if (error || !data) return jsonError("Message could not be sent. The conversation may have ended or been blocked.", 403);
  return NextResponse.json({ message: data }, { status: 201 });
}
