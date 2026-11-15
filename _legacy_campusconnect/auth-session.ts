import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { INITIAL_CURRENT_USER, type StudentProfile } from "@/lib/coned-store";

export async function getActiveSessionProfile(): Promise<StudentProfile | null> {
  const env = getSupabasePublicEnv();
  const cookieStore = await cookies();
  const demoCookie = cookieStore.get("coned_session");

  // 1. If Supabase configured, check Supabase auth
  if (env) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select(
            "id,username,full_name,college,account_type,is_platform_badge,bio,avatar_path,visibility,profile_fields_visible,contact_preference,onboarded_at,created_at,updated_at"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          return {
            id: profile.id,
            username: profile.username,
            fullName: profile.full_name,
            college: profile.college,
            department: "Computer Science",
            academicYear: 3,
            bio: profile.bio || "Student on CON-ED",
            avatarUrl:
              profile.avatar_path ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
            accountType: profile.account_type as "student" | "ai",
            isPlatformBadge: profile.is_platform_badge,
            visibility: profile.visibility as "public" | "private",
            skills: [
              { name: "Full-Stack Development", level: "Advanced" },
              { name: "Python", level: "Intermediate" },
            ],
            interests: ["Artificial Intelligence", "Web Development"],
            goals: ["Build impactful software projects"],
            stats: {
              postsCount: 5,
              followersCount: 140,
              followingCount: 95,
            },
            contactPreference: profile.contact_preference as "connections" | "followers" | "nobody",
          };
        }
      }
    } catch {
      // Fall through to demo cookie or fallback
    }
  }

  // 2. Demo session handling (either cookie exists, or default active session for exploration)
  if (demoCookie?.value) {
    try {
      const parsed = JSON.parse(decodeURIComponent(demoCookie.value));
      return {
        ...INITIAL_CURRENT_USER,
        ...parsed,
      };
    } catch {
      return INITIAL_CURRENT_USER;
    }
  }

  // Return the default student session in local development so the app is always accessible
  return INITIAL_CURRENT_USER;
}
