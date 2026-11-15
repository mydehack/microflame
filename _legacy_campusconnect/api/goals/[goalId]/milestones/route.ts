import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const milestoneSchema = z.object({ title: z.string().trim().min(2).max(160), tasks: z.array(z.string().trim().min(1).max(240)).max(40).default([]) });

export async function POST(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = milestoneSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Add a title for this milestone.", 400);
  const { goalId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to edit goals.", 401);
  const { data: milestone, error: milestoneError } = await supabase.from("goal_milestones").insert({ goal_id: goalId, title: input.data.title, position: 0 }).select("*").single();
  if (milestoneError || !milestone) return jsonError("That milestone could not be saved.", 404);
  if (input.data.tasks.length) {
    const tasks = [...new Set(input.data.tasks)].map((title, position) => ({ milestone_id: milestone.id, title, position }));
    const { error } = await supabase.from("goal_tasks").insert(tasks);
    if (error) {
      await supabase.from("goal_milestones").delete().eq("id", milestone.id);
      return jsonError("The milestone tasks could not be saved. Please try again.", 400);
    }
  }
  const { data: savedTasks } = await supabase.from("goal_tasks").select("*").eq("milestone_id", milestone.id).order("position");
  return NextResponse.json({ milestone: { ...milestone, tasks: savedTasks ?? [] } }, { status: 201 });
}
