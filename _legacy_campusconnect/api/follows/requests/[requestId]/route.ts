import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const statusSchema = z.object({ status: z.enum(["accepted","rejected"]) });
export async function PATCH(request: NextRequest, context: { params: Promise<{ requestId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = statusSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Choose whether to approve or decline this request.", 400);
  const { requestId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to respond.", 401);
  const { data, error } = await supabase.from("follow_requests").update({ status: input.data.status }).eq("id", requestId).eq("recipient_id", user.id).eq("status", "pending").select("id,status").maybeSingle();
  if (error || !data) return jsonError("That follow request could not be updated.", 404);
  return NextResponse.json({ request: data });
}
