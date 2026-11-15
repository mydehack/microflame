import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { emitN8nEvent } from "@/lib/n8n";

const onboardingSchema = z.object({
  degree: z.string().trim().max(120).default(""),
  specialization: z.string().trim().max(120).default(""),
  academicYear: z.number().int().min(1).max(10).nullable(),
  graduationYear: z.number().int().min(2000).max(2200).nullable(),
  learningLevel: z.string().trim().max(80).default(""),
  shortTermGoal: z.string().trim().max(160).default(""),
  careerGoal: z.string().trim().max(160).default(""),
  weeklyMinutes: z.number().int().min(0).max(10080).nullable(),
  interests: z.array(z.string().trim().min(1).max(80)).max(30),
  skills: z.array(z.object({ name: z.string().trim().min(1).max(80), proficiency: z.number().int().min(1).max(5), wantsToLearn: z.boolean() })).max(60),
  collaborationTypes: z.array(z.string().trim().min(1).max(80)).max(10),
  groupSize: z.enum(["solo", "small", "medium", "open"]),
  collaborationStyle: z.string().trim().max(300).default(""),
  language: z.string().trim().min(2).max(20).default("en"),
  timezone: z.string().trim().min(2).max(80).default("Asia/Kolkata"),
  bio: z.string().trim().max(500).default(""),
  visibility: z.enum(["public", "private"]),
  profileFieldsVisible: z.boolean(),
  aiPersonalization: z.boolean(),
});

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = onboardingSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError(input.error.issues[0]?.message ?? "Check your onboarding details and try again.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to save onboarding.", 401);
  const { error } = await supabase.rpc("save_student_onboarding", { p_payload: input.data });
  if (error) return jsonError("Your profile could not be saved. Please review your answers and try again.", 400);
  await emitN8nEvent("new-student", "student.onboarded", { studentId: user.id });
  return NextResponse.json({ ok: true }, { status: 201 });
}
