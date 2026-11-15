import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const milestoneUpdateSchema = z.object({ title: z.string().trim().min(2).max(160).optional(), position: z.number().int().min(0).max(10000).optional(), status: z.enum(["todo", "in_progress", "done"]).optional() });

export async function PATCH(request: NextRequest, context: { params: Promise<{ milestoneId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = milestoneUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!input.success || !Object.keys(input.data ?? {}).length) return jsonError("Check the milestone update and try again.", 400);
  const { milestoneId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to update milestones.", 401);
  const { data, error } = await supabase.from("goal_milestones").update(input.data).eq("id", milestoneId).select("id,title,status,position").maybeSingle();
  if (error || !data) return jsonError("That milestone could not be updated.", 404);
  return NextResponse.json({ milestone: data });
}
