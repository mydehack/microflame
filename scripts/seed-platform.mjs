import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRoleKey) {
  throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
}

const admin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
});
const username = "campusconnect-ai";
const email = `${username}@accounts.campusconnect.invalid`;

const { data: existingProfile, error: profileError } = await admin
  .from("profiles")
  .select("id,account_type,is_platform_badge")
  .eq("username", username)
  .maybeSingle();
if (profileError) throw profileError;
if (existingProfile) {
  if (existingProfile.account_type !== "ai" || !existingProfile.is_platform_badge) {
    throw new Error("The reserved CampusConnect AI username belongs to a non-AI account. Resolve it before seeding.");
  }
  console.log("CampusConnect AI Mentor is already initialized.");
  process.exit(0);
}

const { data: created, error: createError } = await admin.auth.admin.createUser({
  email,
  password: randomBytes(64).toString("base64url"),
  email_confirm: true,
  app_metadata: { account_type: "ai" },
  user_metadata: {
    username,
    full_name: "CampusConnect AI Mentor",
    college: "CampusConnect",
    visibility: "public",
  },
});
if (createError || !created.user) {
  throw new Error(`Could not initialize CampusConnect AI Mentor: ${createError?.message ?? "Auth returned no user."}`);
}

const { data: seededProfile, error: verifyError } = await admin
  .from("profiles")
  .select("id,account_type,is_platform_badge")
  .eq("id", created.user.id)
  .maybeSingle();
if (verifyError || seededProfile?.account_type !== "ai" || !seededProfile.is_platform_badge) {
  await admin.auth.admin.deleteUser(created.user.id);
  throw new Error(`AI account trigger did not create the expected profile: ${verifyError?.message ?? "profile missing or invalid"}`);
}

console.log("Seeded the official CampusConnect AI Mentor account.");
