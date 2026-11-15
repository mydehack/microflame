import type { Metadata } from "next";
import { getActiveSessionProfile } from "@/lib/auth-session";
import { MessagesView } from "@/components/messages-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Realtime Messages • CON-ED",
  description: "One-to-one and student study group conversations with official CON-ED AI companion integration.",
};

export default async function MessagesPage() {
  const profile = await getActiveSessionProfile();
  return <MessagesView userId={profile?.id || "usr_me_001"} />;
}
