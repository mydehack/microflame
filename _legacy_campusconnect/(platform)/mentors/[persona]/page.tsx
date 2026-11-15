import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { MentorChat } from "@/components/mentors-view";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const personas = ["career","study","project","accountability","communication","research"];
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "AI mentor conversation" };

export default async function MentorChatPage({ params }: { params: Promise<{ persona: string }> }) {
  const { persona } = await params;
  if (!personas.includes(persona)) redirect("/mentors");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: preferences } = await supabase.from("user_preferences").select("ai_personalization").eq("user_id", user.id).maybeSingle();
  return <MentorChat profileAllowsPersonalization={preferences?.ai_personalization ?? false} />;
}
