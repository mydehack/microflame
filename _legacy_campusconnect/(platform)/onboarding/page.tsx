import type { Metadata } from "next";
import { getActiveSessionProfile } from "@/lib/auth-session";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Welcome to CON-ED • Personalize Your Journey",
  description: "Set your academic context, interests, goals, and meet your official CON-ED AI companion.",
};

export default async function OnboardingPage() {
  const profile = await getActiveSessionProfile();

  const collegeName = profile?.college || "Stanford University";
  const initialName = profile?.fullName || "Student";

  return <OnboardingWizard college={collegeName} studentName={initialName} />;
}
