import { NextResponse } from "next/server";
import { jsonError } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to view follow requests.", 401);
  const { data: requests, error } = await supabase.from("follow_requests").select("id,requester_id,recipient_id,status,created_at").eq("recipient_id", user.id).eq("status", "pending").order("created_at", { ascending: false });
  if (error) return jsonError("Follow requests could not be loaded.", 500);
  const ids = [...new Set((requests ?? []).map((request) => request.requester_id))];
  const { data: profiles } = ids.length ? await supabase.from("profiles").select("id,username,full_name,college,avatar_path").in("id", ids) : { data: [] };
  const people = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  return NextResponse.json({ requests: (requests ?? []).map((request) => ({ ...request, person: people.get(request.requester_id) ?? null })) });
}
