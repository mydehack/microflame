import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const reportSchema = z.object({
  reportedUserId: z.string().uuid().optional(), postId: z.string().uuid().optional(),
  reason: z.enum(["spam","harassment","unsafe","impersonation","other"]), details: z.string().trim().max(2000).default(""),
}).refine((data) => data.reportedUserId || data.postId, "Choose a profile or post to report.");
export async function POST(request: NextRequest) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = reportSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError(input.error.issues[0]?.message ?? "Check the report details.", 400);
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to report content.", 401);
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id, reported_user_id: input.data.reportedUserId ?? null, post_id: input.data.postId ?? null,
    reason: input.data.reason, details: input.data.details,
  });
  if (error) return jsonError("Your report could not be sent.", 500);
  return NextResponse.json({ ok: true }, { status: 201 });
}
