import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const updateGoalSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(3000).optional(),
  status: z.enum(["active", "paused", "completed"]).optional(),
  target_date: z.string().date().nullable().optional(),
  visibility: z.enum(["private", "public"]).optional(),
});

export async function PATCH(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = updateGoalSchema.safeParse(await request.json().catch(() => null));
  if (!input.success || Object.keys(input.data ?? {}).length === 0) return jsonError("Check the changes and try again.", 400);
  const { goalId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to edit goals.", 401);
  const { data, error } = await supabase.from("student_goals").update(input.data).eq("id", goalId).eq("user_id", user.id).select("*").maybeSingle();
  if (error || !data) return jsonError("That goal could not be updated.", 404);
  return NextResponse.json({ goal: data });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const { goalId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to delete goals.", 401);
  const { error } = await supabase.from("student_goals").delete().eq("id", goalId).eq("user_id", user.id);
  if (error) return jsonError("That goal could not be deleted.", 500);
  return NextResponse.json({ ok: true });
}
