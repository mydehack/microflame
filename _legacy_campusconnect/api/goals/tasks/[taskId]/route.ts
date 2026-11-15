import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const taskUpdateSchema = z.object({ status: z.enum(["todo", "in_progress", "done"]).optional(), position: z.number().int().min(0).max(10000).optional(), notes: z.string().trim().max(2000).optional() });

export async function PATCH(request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = taskUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!input.success || !Object.keys(input.data ?? {}).length) return jsonError("Check the task update and try again.", 400);
  const { taskId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to update tasks.", 401);
  const update: Record<string, string | number | null> = { ...input.data };
  if (input.data.status) update.completed_at = input.data.status === "done" ? new Date().toISOString() : null;
  const { data, error } = await supabase.from("goal_tasks").update(update).eq("id", taskId).select("id,status,completed_at").maybeSingle();
  if (error || !data) return jsonError("That task could not be updated.", 404);
  return NextResponse.json({ task: data });
}
