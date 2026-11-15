import { redirect } from "next/navigation";
import { HomeView } from "@/components/home-view";
import { getActiveSessionProfile } from "@/lib/auth-session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profile = await getActiveSessionProfile();
  if (!profile) redirect("/login");

  return (
    <HomeView
      userId={profile.id}
      fullName={profile.fullName}
      avatarPath={profile.avatarUrl}
    />
  );
}
