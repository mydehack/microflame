import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Sign In • CON-ED",
  description: "Sign in to your CON-ED student account with your email or username.",
};

export default function LoginPage() {
  return <LoginForm />;
}
