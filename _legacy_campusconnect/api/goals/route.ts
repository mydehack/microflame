import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createGoalSchema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(3000).default(""),
  goalType: z.enum(["career", "skill", "project", "study", "other"]).default("career"),
  targetDate: z.string().date().optional(),
  weeklyMinutes: z.number().int().min(0).max(10080).optional(),
});

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to view goals.", 401);
  const { data: goals, error } = await supabase.from("student_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) return jsonError("Goals could not be loaded.", 500);
  const goalIds = (goals ?? []).map((goal) => goal.id);
  const { data: milestones } = goalIds.length ? await supabase.from("goal_milestones").select("*").in("goal_id", goalIds).order("position") : { data: [] };
  const milestoneIds = (milestones ?? []).map((milestone) => milestone.id);
  const { data: tasks } = milestoneIds.length ? await supabase.from("goal_tasks").select("*").in("milestone_id", milestoneIds).order("position") : { data: [] };
  const tasksByMilestone = new Map<string, typeof tasks>();
  for (const task of tasks ?? []) tasksByMilestone.set(task.milestone_id, [...(tasksByMilestone.get(task.milestone_id) ?? []), task]);
  const milestonesByGoal = new Map<string, typeof milestones>();
  for (const milestone of milestones ?? []) milestonesByGoal.set(milestone.goal_id, [...(milestonesByGoal.get(milestone.goal_id) ?? []), { ...milestone, tasks: tasksByMilestone.get(milestone.id) ?? [] }]);
  return NextResponse.json({ goals: (goals ?? []).map((goal) => ({ ...goal, milestones: milestonesByGoal.get(goal.id) ?? [] })) });
}

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = createGoalSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError(input.error.issues[0]?.message ?? "Check the goal details.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to create a goal.", 401);
  const { data, error } = await supabase.from("student_goals").insert({
    user_id: user.id, title: input.data.title, description: input.data.description, goal_type: input.data.goalType,
    target_date: input.data.targetDate ?? null, weekly_minutes: input.data.weeklyMinutes ?? null, visibility: "private",
  }).select("*").single();
  if (error || !data) return jsonError("The goal could not be saved.", 500);
  return NextResponse.json({ goal: { ...data, milestones: [] } }, { status: 201 });
}
