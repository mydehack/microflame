import type { Metadata } from "next";
import { getActiveSessionProfile } from "@/lib/auth-session";
import { ProfileSettings } from "@/components/profile-settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings & Privacy • CON-ED",
  description: "Manage your profile, account privacy, story settings, and security preferences.",
};

export default async function SettingsPage() {
  const profile = await getActiveSessionProfile();

  // If no session found, provide safe default profile
  const activeProfile = profile || {
    id: "usr_me_001",
    username: "alex_rivera",
    fullName: "Alex Rivera",
    college: "Stanford University",
    department: "Computer Science & Engineering",
    academicYear: 3,
    bio: "CS Junior passionate about AI Systems, Distributed Algorithms, and Open Source Software.",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    accountType: "student" as const,
    isPlatformBadge: false,
    visibility: "public" as const,
    skills: [],
    interests: [],
    goals: [],
    stats: { postsCount: 14, followersCount: 342, followingCount: 189 },
    contactPreference: "connections" as const,
  };

  return <ProfileSettings profile={activeProfile} />;
}
