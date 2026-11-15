"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  ArrowLeft,
} from "lucide-react";
import { ConEdLogo } from "@/components/coned-logo";

export function LoginForm() {
  const router = useRouter();

  // Login Form State
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Forgot Password Mode
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setError("Please enter your email address or username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: trimmedIdentifier,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "Invalid credentials. Please verify your email/username and password.");
        setLoading(false);
        return;
      }

      setSuccess("Welcome back! Redirecting to home feed...");

      // Client session setup for local/offline dev
      if (typeof window !== "undefined") {
        const username = trimmedIdentifier.includes("@")
          ? trimmedIdentifier.split("@")[0]
          : trimmedIdentifier;
        const sessionData = {
          username: username.toLowerCase(),
          email: trimmedIdentifier.includes("@") ? trimmedIdentifier : `${username}@campus.edu`,
          fullName: username.replace(/_/g, " "),
        };
        document.cookie = `coned_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=604800`;
        document.cookie = "coned_logged_out=; path=/; max-age=0";
      }

      setTimeout(() => {
        router.push("/home");
        router.refresh();
      }, 500);
    } catch {
      setError("Unable to complete sign-in. Please try again.");
      setLoading(false);
    }
  };

  // Handle Forgot Password Submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotMessage(null);

    const target = forgotIdentifier.trim();
    if (!target) {
      setForgotError("Please enter your email address or username.");
      return;
    }

    setForgotLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: target }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setForgotError(data?.error || "Could not process request. Please try again.");
        setForgotLoading(false);
        return;
      }

      setForgotMessage(
        data?.message || "If an account matches that email or username, password reset instructions have been sent."
      );
      setForgotLoading(false);
    } catch {
      setForgotError("Recovery service temporarily unavailable.");
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050908] text-[#F4FFF9] flex flex-col justify-between py-10 px-4 sm:px-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00E69A]/8 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header */}
      <div className="max-w-md mx-auto w-full flex items-center justify-between mb-8 z-10">
        <ConEdLogo size="md" />
        <Link
          href="/"
          className="text-xs text-[#71857A] hover:text-[#00E69A] transition font-medium"
        >
          ← Back
        </Link>
      </div>

      {/* Main Card */}
      <div className="max-w-md mx-auto w-full z-10">
        <div className="rounded-3xl bg-[#101916] border border-[#23372D] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {!isForgotMode ? (
            /* ================= LOGIN FORM ================= */
            <>
              <div className="mb-6 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#00E69A]">
                  Student Sign In
                </span>
                <h1 className="text-2xl font-black text-[#F4FFF9]">
                  Welcome Back
                </h1>
                <p className="text-xs text-[#A6B8AE]">
                  Enter your university email or username to access your CON-ED student feed.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-[#FF5364]/15 border border-[#FF5364]/30 text-[#FF5364] text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 rounded-xl bg-[#00E69A]/15 border border-[#00E69A]/40 text-[#00E69A] text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 size={15} className="shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                {/* Field 1: Email or Username */}
                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                    Email address or Username
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71857A]" />
                    <input
                      type="text"
                      required
                      autoComplete="username"
                      placeholder="student@university.edu or username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A] transition"
                    />
                  </div>
                </div>

                {/* Field 2: Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#A6B8AE]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotMode(true);
                        setForgotIdentifier(identifier);
                      }}
                      className="text-[11px] text-[#00E69A] hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71857A]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A] transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#71857A] hover:text-[#F4FFF9] transition"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 shadow-[0_0_20px_rgba(0,230,154,0.3)] transition mt-2 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-[#050908] border-t-transparent rounded-full animate-spin" />
                      Signing In...
                    </span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Switcher */}
              <div className="mt-6 pt-5 border-t border-[#23372D]/60 text-center text-xs text-[#A6B8AE]">
                <span>
                  Don't have an account yet?{" "}
                  <Link href="/register" className="text-[#00E69A] font-bold hover:underline">
                    Create Account
                  </Link>
                </span>
              </div>
            </>
          ) : (
            /* ================= FORGOT PASSWORD VIEW ================= */
            <>
              <div className="mb-6 space-y-1">
                <button
                  type="button"
                  onClick={() => setIsForgotMode(false)}
                  className="text-xs text-[#A6B8AE] hover:text-[#00E69A] flex items-center gap-1 mb-2 font-medium"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </button>
                <div className="flex items-center gap-2 text-[#00E69A] mb-1">
                  <KeyRound size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Password Recovery
                  </span>
                </div>
                <h2 className="text-xl font-black text-[#F4FFF9]">
                  Reset Your Password
                </h2>
                <p className="text-xs text-[#A6B8AE]">
                  Enter your email address or username to receive password reset instructions.
                </p>
              </div>

              {forgotError && (
                <div className="mb-4 p-3 rounded-xl bg-[#FF5364]/15 border border-[#FF5364]/30 text-[#FF5364] text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotMessage && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#00E69A]/15 border border-[#00E69A]/40 text-[#00E69A] text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{forgotMessage}</span>
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                    Email address or Username
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71857A]" />
                    <input
                      type="text"
                      required
                      placeholder="student@university.edu or username"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-[#050908] bg-[#00E69A] hover:bg-[#00C982] transition disabled:opacity-50 cursor-pointer"
                >
                  {forgotLoading ? "Sending Instructions..." : "Send Reset Instructions"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-[#71857A] mt-8 z-10">
        CON-ED • Connect • Learn • Grow • Secure Student Authentication
      </div>
    </div>
  );
}

