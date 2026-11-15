import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const querySchema = z.enum(["career","study","project","accountability","communication","research"]);
export async function GET(request: NextRequest) {
  const persona = querySchema.safeParse(request.nextUrl.searchParams.get("persona"));
  if (!persona.success) return jsonError("Choose a mentor persona.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to view mentor chats.", 401);
  const { data, error } = await supabase.from("ai_conversations").select("id,title,persona,share_with_ai_personalization,created_at,updated_at").eq("user_id", user.id).eq("persona", persona.data).order("updated_at", { ascending: false }).limit(20);
  if (error) return jsonError("Mentor conversations could not be loaded.", 500);
  return NextResponse.json({ conversations: data ?? [] });
}
