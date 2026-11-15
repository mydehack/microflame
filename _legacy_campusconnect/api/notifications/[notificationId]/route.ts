import { NextResponse, type NextRequest } from "next/server";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest, context: { params: Promise<{ notificationId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const { notificationId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to update notifications.", 401);
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId).eq("user_id", user.id);
  if (error) return jsonError("That notification could not be updated.", 500);
  return NextResponse.json({ ok: true });
}
