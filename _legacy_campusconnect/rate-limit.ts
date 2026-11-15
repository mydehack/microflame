import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function enforceAuthRateLimit(request: NextRequest, bucket: "login" | "register") {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = request.headers.get("x-real-ip") ?? forwarded ?? "unknown";
  return enforceRateLimitKey(`${bucket}:${ip}`, bucket === "login" ? 10 : 5, bucket === "login" ? 600 : 900);
}

export async function enforceUserRateLimit(userId: string, bucket: string, limit: number, windowSeconds: number) {
  return enforceRateLimitKey(`${bucket}:${userId}`, limit, windowSeconds);
}

async function enforceRateLimitKey(key: string, limit: number, windowSeconds: number) {
  const keyHash = createHash("sha256").update(key).digest("hex");
  const { data, error } = await createSupabaseAdminClient().rpc("consume_auth_rate_limit", {
    p_key_hash: keyHash,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw new Error("The authentication rate limiter is unavailable.");
  return data === true;
}
