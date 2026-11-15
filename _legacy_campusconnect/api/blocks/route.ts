import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const blockSchema = z.object({ userId: z.string().uuid() });
export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = blockSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Choose a profile to block.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to manage blocks.", 401);
  if (user.id === input.data.userId) return jsonError("You cannot block your own account.", 400);
  const { error } = await supabase.from("blocks").upsert({ blocker_id: user.id, blocked_id: input.data.userId }, { onConflict: "blocker_id,blocked_id", ignoreDuplicates: true });
  if (error) return jsonError("That profile could not be blocked.", 500);
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = blockSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Choose a profile to unblock.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to manage blocks.", 401);
  const { error } = await supabase.from("blocks").delete().eq("blocker_id", user.id).eq("blocked_id", input.data.userId);
  if (error) return jsonError("That profile could not be unblocked.", 500);
  return NextResponse.json({ ok: true });
}
