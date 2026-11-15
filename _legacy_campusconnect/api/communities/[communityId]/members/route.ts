import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const memberSchema = z.object({ userId: z.string().uuid(), status: z.enum(["accepted","rejected"]) });
export async function PATCH(request: NextRequest, context: { params: Promise<{ communityId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = memberSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Choose whether to approve or decline this request.", 400);
  const { communityId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to review requests.", 401);
  const { data, error } = await supabase.from("community_members").update({ status: input.data.status }).eq("community_id", communityId).eq("user_id", input.data.userId).eq("status", "pending").select("status").maybeSingle();
  if (error || !data) return jsonError("That join request could not be updated.", 404);
  return NextResponse.json({ status: data.status });
}
