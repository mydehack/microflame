"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { ConEdLogo } from "@/components/coned-logo";

export function RegisterForm() {
  const router = useRouter();

  // Registration Fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Username validation state
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "available" | "unavailable">("idle");
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);

  // Debounced live username availability check
  useEffect(() => {
    const trimmed = username.trim().toLowerCase();
    if (!trimmed) {
      setUsernameStatus("idle");
      setUsernameMessage(null);
      return;
    }

    if (trimmed.length < 3 || !/^[a-z0-9_]{3,24}$/.test(trimmed)) {
      setUsernameStatus("unavailable");
      setUsernameMessage("3–24 lowercase letters, numbers, or underscores.");
      return;
    }

    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(trimmed)}`);
        const data = await res.json().catch(() => null);
        if (data?.available) {
          setUsernameStatus("available");
          setUsernameMessage("Username is available!");
        } else {
          setUsernameStatus("unavailable");
          setUsernameMessage(data?.error || "Username is already taken.");
        }
      } catch {
        setUsernameStatus("idle");
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  // Simple password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 1;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = username.trim().toLowerCase();

    // Validations
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Please provide a valid email address.");
      return;
    }
    if (trimmedUsername.length < 3 || !/^[a-z0-9_]{3,24}$/.test(trimmedUsername)) {
      setError("Username must be 3–24 lowercase letters, numbers, or underscores.");
      return;
    }
    if (usernameStatus === "unavailable") {
      setError(usernameMessage || "This username is not available. Please choose another.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          username: trimmedUsername,
          password,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setError(data?.error || "Registration could not be completed. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully! Preparing your student workspace...");

      // Client session setup for local/offline dev
      if (typeof window !== "undefined") {
        const sessionData = {
          username: trimmedUsername,
          email: trimmedEmail,
          fullName: trimmedUsername.replace(/_/g, " "),
          college: "Campus Member",
        };
        document.cookie = `coned_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=604800`;
        document.cookie = "coned_logged_out=; path=/; max-age=0";
      }

      setTimeout(() => {
        router.push("/home");
        router.refresh();
      }, 600);
    } catch {
      setError("Unable to reach the authentication service. Please check your connection.");
      setLoading(false);
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

      {/* Main Registration Card */}
      <div className="max-w-md mx-auto w-full z-10">
        <div className="rounded-3xl bg-[#101916] border border-[#23372D] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00E69A]">
              Create Student Account
            </span>
            <h1 className="text-2xl font-black text-[#F4FFF9]">
              Join CON-ED
            </h1>
            <p className="text-xs text-[#A6B8AE]">
              Connect with ambitious peers, collaborate on real-world projects, and grow your skills.
            </p>
          </div>

          {/* Error Feedback */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[#FF5364]/15 border border-[#FF5364]/30 text-[#FF5364] text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Feedback */}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-[#00E69A]/15 border border-[#00E69A]/40 text-[#00E69A] text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
              <CheckCircle2 size={15} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Email Address */}
            <div>
              <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71857A]" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A] transition"
                />
              </div>
            </div>

            {/* Field 2: Username (with live validation) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#A6B8AE]">
                  Username
                </label>
                {usernameStatus === "checking" && (
                  <span className="text-[10px] text-[#71857A] flex items-center gap-1">
                    <Loader2 size={10} className="animate-spin" /> Checking...
                  </span>
                )}
                {usernameStatus === "available" && (
                  <span className="text-[10px] text-[#00E69A] font-semibold flex items-center gap-1">
                    <Check size={11} /> Available
                  </span>
                )}
                {usernameStatus === "unavailable" && (
                  <span className="text-[10px] text-[#FF5364] font-semibold flex items-center gap-1">
                    <X size={11} /> Taken / Invalid
                  </span>
                )}
              </div>

              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71857A]" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="choose_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  className={`w-full bg-[#080F0D] border rounded-xl pl-10 pr-9 py-2.5 text-xs text-[#F4FFF9] placeholder-[#71857A] focus:outline-none transition ${
                    usernameStatus === "available"
                      ? "border-[#00E69A]"
                      : usernameStatus === "unavailable"
                      ? "border-[#FF5364]"
                      : "border-[#23372D] focus:border-[#00E69A]"
                  }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {usernameStatus === "available" && (
                    <CheckCircle2 size={15} className="text-[#00E69A]" />
                  )}
                  {usernameStatus === "unavailable" && (
                    <AlertCircle size={15} className="text-[#FF5364]" />
                  )}
                </div>
              </div>
              <span className="text-[10px] text-[#71857A] block mt-1">
                Lowercase letters, numbers, and underscores (3–24 chars).
              </span>
            </div>

            {/* Field 3: Password */}
            <div>
              <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71857A]" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
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

              {/* Password strength meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1 h-1 w-full bg-[#080F0D] rounded-full overflow-hidden">
                    <div className={`h-full flex-1 ${strength >= 1 ? "bg-[#FF5364]" : "bg-transparent"}`} />
                    <div className={`h-full flex-1 ${strength >= 2 ? "bg-[#FFC15A]" : "bg-transparent"}`} />
                    <div className={`h-full flex-1 ${strength >= 3 ? "bg-[#00E69A]" : "bg-transparent"}`} />
                    <div className={`h-full flex-1 ${strength >= 4 ? "bg-[#67F5B8]" : "bg-transparent"}`} />
                  </div>
                  <span className="text-[10px] text-[#71857A] block text-right">
                    Strength: {strength <= 2 ? "Weak" : strength === 3 ? "Good" : "Strong"}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || usernameStatus === "unavailable"}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 shadow-[0_0_20px_rgba(0,230,154,0.3)] transition mt-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-[#050908] border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="mt-6 pt-5 border-t border-[#23372D]/60 text-center text-xs text-[#A6B8AE]">
            <span>
              Already have an account?{" "}
              <Link href="/login" className="text-[#00E69A] font-bold hover:underline">
                Sign In
              </Link>
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-[#71857A] mt-8 z-10">
        CON-ED • Connect • Learn • Grow • Secure Student Authentication
      </div>
    </div>
  );
}

