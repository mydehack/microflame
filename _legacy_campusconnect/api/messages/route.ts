import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to view messages.", 401);
  const { data: mine, error: memberError } = await supabase.from("conversation_members").select("conversation_id,last_read_at").eq("user_id", user.id);
  if (memberError) return jsonError("Conversations could not be loaded.", 500);
  const ids = (mine ?? []).map((item) => item.conversation_id);
  if (!ids.length) return NextResponse.json({ conversations: [] });
  const [memberResult, messageResult] = await Promise.all([
    supabase.from("conversation_members").select("conversation_id,user_id,last_read_at").in("conversation_id", ids),
    supabase.from("messages").select("id,conversation_id,sender_id,content,created_at").in("conversation_id", ids).order("created_at", { ascending: false }).limit(300),
  ]);
  if (memberResult.error || messageResult.error) return jsonError("Conversations could not be loaded.", 500);
  const memberIds = [...new Set((memberResult.data ?? []).map((item) => item.user_id).filter((id) => id !== user.id))];
  const { data: profiles } = memberIds.length ? await supabase.from("profiles").select("id,username,full_name,avatar_path").in("id", memberIds) : { data: [] };
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const mineMap = new Map((mine ?? []).map((item) => [item.conversation_id, item.last_read_at]));
  const latest = new Map<string, (typeof messageResult.data)[number]>();
  const unread = new Map<string, number>();
  for (const message of messageResult.data ?? []) {
    if (!latest.has(message.conversation_id)) latest.set(message.conversation_id, message);
    const lastRead = mineMap.get(message.conversation_id);
    if (message.sender_id !== user.id && (!lastRead || message.created_at > lastRead)) unread.set(message.conversation_id, (unread.get(message.conversation_id) ?? 0) + 1);
  }
  const conversations = ids.map((id) => {
    const peer = (memberResult.data ?? []).find((item) => item.conversation_id === id && item.user_id !== user.id);
    return { id, person: peer ? profileMap.get(peer.user_id) ?? null : null, latestMessage: latest.get(id) ?? null, unreadCount: unread.get(id) ?? 0 };
  }).filter((item) => item.person).sort((a, b) => (b.latestMessage?.created_at ?? "").localeCompare(a.latestMessage?.created_at ?? ""));
  return NextResponse.json({ conversations });
}
