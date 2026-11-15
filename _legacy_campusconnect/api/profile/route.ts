import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";

const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(100),
  college: z.string().trim().min(2).max(180),
  bio: z.string().trim().max(500),
  visibility: z.enum(["public", "private"]),
  profileFieldsVisible: z.boolean(),
  contactPreference: z.enum(["connections", "followers", "nobody"]),
  aiPersonalization: z.boolean(),
  aiNotifications: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = profileSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError(input.error.issues[0]?.message ?? "Check your profile changes.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to update your profile.", 401);
  const { error } = await supabase.rpc("save_student_profile_settings", { p_payload: input.data as Json });
  if (error) return jsonError("Profile changes could not be saved.", 500);
  const { data, error: profileError } = await supabase.from("profiles").select("id,username,full_name,college,bio,visibility,profile_fields_visible,contact_preference,avatar_path").eq("id", user.id).single();
  if (profileError || !data) return jsonError("Profile changes were saved, but the updated profile could not be loaded.", 500);
  return NextResponse.json({ profile: data });
}
