import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { rankStudentMatches, type MatchProfile } from "@/lib/matching";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to find students.", 401);
  const [meResult, profilesResult, blockedResult, followingResult, dismissedResult] = await Promise.all([
    supabase.from("profiles").select("id,username,full_name,college,visibility,profile_fields_visible,account_type").eq("id", user.id).single(),
    supabase.from("profiles").select("id,username,full_name,college,visibility,profile_fields_visible,account_type").neq("id", user.id).limit(200),
    supabase.from("blocks").select("blocker_id,blocked_id").or(`blocker_id.eq.${user.id},blocked_id.eq.${user.id}`),
    supabase.from("follows").select("followed_id").eq("follower_id", user.id),
    supabase.from("recommendations").select("recommended_user_id,dismissed_at").eq("user_id", user.id),
  ]);
  if (meResult.error || !meResult.data) return jsonError("Your profile could not be loaded.", 500);
  if (profilesResult.error || blockedResult.error || followingResult.error || dismissedResult.error) return jsonError("Recommendations could not be loaded.", 500);

  const profiles = profilesResult.data ?? [];
  const candidateIds = profiles.filter((profile) => profile.profile_fields_visible && profile.account_type === "student").map((profile) => profile.id);
  const [educationResult, interestsResult, skillsResult, goalsResult, collabResult] = candidateIds.length ? await Promise.all([
    supabase.from("education").select("user_id,degree,specialization,academic_year").in("user_id", [user.id, ...candidateIds]),
    supabase.from("interests").select("user_id,name").in("user_id", [user.id, ...candidateIds]),
    supabase.from("student_skills").select("user_id,name,wants_to_learn").in("user_id", [user.id, ...candidateIds]),
    supabase.from("student_goals").select("user_id,title").in("user_id", [user.id, ...candidateIds]),
    supabase.from("collaboration_preferences").select("user_id,collaboration_types,discoverable").in("user_id", [user.id, ...candidateIds]),
  ]) : [{ data: [] }, { data: [] }, { data: [] }, { data: [] }, { data: [] }];
  if (educationResult.error || interestsResult.error || skillsResult.error || goalsResult.error || collabResult.error) return jsonError("Recommendations could not be loaded.", 500);
  const myId = user.id;
  const group = <T extends { user_id: string }>(items: T[] | null | undefined) => {
    const map = new Map<string, T[]>();
    for (const item of items ?? []) map.set(item.user_id, [...(map.get(item.user_id) ?? []), item]);
    return map;
  };
  const education = group(educationResult.data);
  const interests = group(interestsResult.data);
  const skills = group(skillsResult.data);
  const goals = group(goalsResult.data);
  const collaborations = group(collabResult.data);
  const hidden = new Set((blockedResult.data ?? []).map((edge) => edge.blocker_id === myId ? edge.blocked_id : edge.blocker_id));
  const following = new Set((followingResult.data ?? []).map((edge) => edge.followed_id));
  const dismissed = new Set((dismissedResult.data ?? []).filter((item) => item.dismissed_at).map((item) => item.recommended_user_id));
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const myProfile = meResult.data;

  const toMatchProfile = (id: string): MatchProfile => {
    const profile = id === myId ? myProfile : profileMap.get(id)!;
    const edu = education.get(id)?.[0];
    return {
      id,
      accountType: profile.account_type,
      discoverable: profile.visibility === "public" || id === myId || following.has(id),
      dismissed: dismissed.has(id),
      blocked: hidden.has(id),
      alreadyFollowing: id !== myId && following.has(id),
      college: profile.college,
      degree: edu?.degree,
      specialization: edu?.specialization,
      academicYear: edu?.academic_year,
      goals: (goals.get(id) ?? []).map((item) => item.title),
      interests: (interests.get(id) ?? []).map((item) => item.name),
      currentSkills: (skills.get(id) ?? []).filter((item) => !item.wants_to_learn).map((item) => item.name),
      desiredSkills: (skills.get(id) ?? []).filter((item) => item.wants_to_learn).map((item) => item.name),
      collaborationTypes: collaborations.get(id)?.[0]?.collaboration_types ?? [],
    };
  };
  const ranked = rankStudentMatches(toMatchProfile(myId), candidateIds.map(toMatchProfile));
  const educationMap = education;
  const results = ranked.map((result) => {
    const target = profileMap.get(result.profile.id);
    const education = educationMap.get(target?.id ?? "")?.[0];
    return {
      score: result.score,
      explanation: result.explanation,
      sharedInterests: result.sharedInterests,
      complementarySkills: result.complementarySkills,
      profile: target ? {
        ...target,
        degree: education?.degree ?? "",
        specialization: education?.specialization ?? "",
        academic_year: education?.academic_year ?? null,
        interests: result.profile.interests,
        career_goal: result.profile.goals[0] ?? "",
        open_to_collaboration: result.profile.collaborationTypes.length > 0,
        shared_goals: result.profile.goals.filter((goal) => (goals.get(myId) ?? []).some((myGoal) => myGoal.title.toLocaleLowerCase() === goal.toLocaleLowerCase())),
      } : null,
    };
  }).filter((result) => result.profile);
  return NextResponse.json({ matches: results, viewer: { college: myProfile.college, specialization: education.get(myId)?.[0]?.specialization ?? "", academic_year: education.get(myId)?.[0]?.academic_year ?? null, interests: (interests.get(myId) ?? []).map((item) => item.name), goals: (goals.get(myId) ?? []).map((item) => item.title) } });
}

const dismissSchema = z.object({ recommendedUserId: z.string().uuid() });
export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = dismissSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("That recommendation could not be dismissed.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to manage recommendations.", 401);
  const { error } = await supabase.from("recommendations").upsert({
    user_id: user.id,
    recommended_user_id: input.data.recommendedUserId,
    score: 0,
    explanation: "Dismissed by student",
    dismissed_at: new Date().toISOString(),
  }, { onConflict: "user_id,recommended_user_id" });
  if (error) return jsonError("That recommendation could not be dismissed.", 500);
  return NextResponse.json({ ok: true });
}
