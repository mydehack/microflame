import { createHash } from "node:crypto";
import { type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const chatSchema = z.object({
  persona: z.enum(["career","study","project","accountability","communication","research"]),
  conversationId: z.string().uuid().optional(),
  content: z.string().trim().min(1).max(3000),
  personalize: z.boolean().default(false),
});
const personas: Record<z.infer<typeof chatSchema>["persona"], string> = {
  career: "You are the Career Guide for a student community. Help with career exploration, skills, internships, placements, and portfolios. Ask a clarifying question when it will change the advice. Never guarantee employment or outcomes.",
  study: "You are the Study Coach. Explain concepts clearly at the student's level and turn subjects into manageable revision steps. Do not promise grades. Encourage breaks and realistic schedules.",
  project: "You are the Project Mentor. Help plan and debug projects, explain technical concepts, and make practical portfolio work. Ask for missing technical context rather than guessing.",
  accountability: "You are the Accountability Coach. Help set kind, realistic milestones, review progress, and adjust plans. Never shame the student or mark tasks complete for them.",
  communication: "You are the Communication Coach. Help with interviews, presentations, introductions, and professional writing. Keep advice constructive and let the student's own voice come through.",
  research: "You are the Research and Innovation Guide. Help explore research questions, experiment design, and project ideas. Mark uncertainty clearly and do not invent sources or results.",
};

export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = chatSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Write a message and choose a mentor.", 400);
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL;
  const provider = process.env.AI_PROVIDER ?? "openai";
  if (!apiKey || !model) return jsonError("AI mentors are not configured yet. Add an AI provider key and model on the server to start a conversation.", 503);
  if (provider !== "openai" && provider !== "openai-compatible") return jsonError("This provider adapter is not supported yet. Choose an OpenAI-compatible chat API.", 503);

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to talk with a mentor.", 401);
  const { data: preferences } = await supabase.from("user_preferences").select("ai_personalization").eq("user_id", user.id).maybeSingle();
  const personalizationAllowed = preferences?.ai_personalization === true;
  const rateKey = createHash("sha256").update("ai:" + user.id).digest("hex");
  const admin = createSupabaseAdminClient();
  const { data: allowed, error: limitError } = await admin.rpc("consume_auth_rate_limit", { p_key_hash: rateKey, p_limit: 30, p_window_seconds: 60 });
  if (limitError) return jsonError("The mentor service is temporarily unavailable.", 503);
  if (!allowed) return jsonError("You have sent several messages in a short time. Please take a moment and try again.", 429);

  let conversationId = input.data.conversationId;
  let sharePersonalization = false;
  if (conversationId) {
    const { data: conversation, error } = await supabase.from("ai_conversations").select("id,share_with_ai_personalization,persona").eq("id", conversationId).eq("user_id", user.id).maybeSingle();
    if (error || !conversation) return jsonError("That conversation is not available.", 404);
    if (conversation.persona !== input.data.persona) return jsonError("Choose the mentor assigned to this conversation.", 400);
    sharePersonalization = input.data.personalize && conversation.share_with_ai_personalization && personalizationAllowed;
  } else {
    const title = input.data.content.slice(0, 70);
    const { data: conversation, error } = await supabase.from("ai_conversations").insert({
      user_id: user.id, persona: input.data.persona, title, share_with_ai_personalization: input.data.personalize && personalizationAllowed,
    }).select("id").single();
    if (error || !conversation) return jsonError("A new mentor conversation could not be started.", 500);
    conversationId = conversation.id;
    sharePersonalization = input.data.personalize && personalizationAllowed;
  }

  const { data: history, error: historyError } = await supabase.from("ai_messages").select("role,content").eq("conversation_id", conversationId).order("created_at", { ascending: false }).limit(12);
  if (historyError) return jsonError("Conversation history could not be loaded.", 500);
  const { error: userMessageError } = await supabase.from("ai_messages").insert({ conversation_id: conversationId, role: "user", content: input.data.content });
  if (userMessageError) return jsonError("Your message could not be saved.", 500);

  let context = "";
  if (sharePersonalization) {
    const [educationResult, goalsResult, interestsResult] = await Promise.all([
      supabase.from("education").select("degree,specialization,academic_year,learning_level").eq("user_id", user.id).maybeSingle(),
      supabase.from("student_goals").select("title").eq("user_id", user.id).eq("status", "active").limit(5),
      supabase.from("interests").select("name").eq("user_id", user.id).limit(8),
    ]);
    const education = educationResult.data;
    const goals = goalsResult.data;
    const interests = interestsResult.data;
    const details = [
      education ? ["Education: " + [education.degree, education.specialization, education.academic_year ? "year " + education.academic_year : "", education.learning_level].filter(Boolean).join(", ")] : "",
      goals?.length ? "Active goals: " + goals.map((goal) => goal.title).join("; ") : "",
      interests?.length ? "Interests: " + interests.map((interest) => interest.name).join(", ") : "",
    ].filter(Boolean);
    if (details.length) context = "The student chose to share this limited profile context for personalization. Use it only if useful:\n" + details.join("\n");
  }

  const messages = [
    { role: "system", content: personas[input.data.persona] + " Explain advice in plain language. Separate known facts from uncertainty. Never guarantee jobs, grades, income, or outcomes. Suggested tasks are proposals; the user decides what to do." + (context ? "\n\n" + context : "") },
    ...(history ?? []).reverse().map((message) => ({ role: message.role, content: message.content })),
    { role: "user", content: input.data.content },
  ];
  try {
    const response = await fetch(process.env.AI_BASE_URL || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { authorization: "Bearer " + apiKey, "content-type": "application/json" },
      body: JSON.stringify({ model, messages, temperature: 0.55, max_tokens: 700 }),
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return jsonError(response.status === 429 ? "The AI mentor is busy. Please try again in a moment." : "The AI mentor could not respond right now. Your message is saved; try again shortly.", 502);
    const result = await response.json();
    const answer = result?.choices?.[0]?.message?.content;
    if (typeof answer !== "string" || !answer.trim()) return jsonError("The AI mentor returned an empty reply. Please try again.", 502);
    const { data: savedAnswer, error: saveError } = await createSupabaseAdminClient().from("ai_messages").insert({ conversation_id: conversationId, role: "assistant", content: answer.slice(0, 12000), model }).select("id,role,content,created_at").single();
    if (saveError || !savedAnswer) return jsonError("The reply could not be saved to your private conversation.", 500);
    return NextResponse.json({ conversationId, message: savedAnswer, aiGenerated: true });
  } catch {
    return jsonError("The AI mentor could not respond right now. Your message is saved; try again shortly.", 502);
  }
}
