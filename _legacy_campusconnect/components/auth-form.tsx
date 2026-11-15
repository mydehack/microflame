"use client";

import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  return mode === "register" ? <RegisterForm /> : <LoginForm />;
}
