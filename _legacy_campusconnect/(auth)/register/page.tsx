import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "Create Account • CON-ED",
  description: "Create your CON-ED student account with your email, username, and password.",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
