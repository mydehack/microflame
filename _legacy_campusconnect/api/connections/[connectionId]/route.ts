import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, requireSameOrigin } from "@/lib/http";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const responseSchema = z.object({ status: z.enum(["accepted", "rejected"]) });
export async function PATCH(request: NextRequest, context: { params: Promise<{ connectionId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const input = responseSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return jsonError("Choose whether to accept or decline this request.", 400);
  const { connectionId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to respond to requests.", 401);
  const { data, error } = await supabase.from("connections").update({ status: input.data.status }).eq("id", connectionId).eq("recipient_id", user.id).eq("status", "pending").select("id,status").maybeSingle();
  if (error || !data) return jsonError("That connection request could not be updated.", 404);
  return NextResponse.json({ connection: data });
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ connectionId: string }> }) {
  const originError = requireSameOrigin(request);
  if (originError) return originError;
  const { connectionId } = await context.params;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return jsonError("Please sign in to cancel requests.", 401);
  const { error } = await supabase.from("connections").delete().eq("id", connectionId).eq("requester_id", user.id).eq("status", "pending");
  if (error) return jsonError("That request could not be cancelled.", 500);
  return NextResponse.json({ ok: true });
}
