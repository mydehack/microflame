"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  User,
  Lock,
  Eye,
  EyeOff,
  Bell,
  Download,
  Trash2,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Save,
  Camera,
  Moon,
  Database,
  ExternalLink
} from "lucide-react";
import { ConEdStore, type StudentProfile } from "@/lib/coned-store";

interface ProfileSettingsProps {
  profile: StudentProfile;
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"profile" | "privacy" | "notifications" | "security">("profile");

  // Form State
  const [fullName, setFullName] = useState(profile.fullName);
  const [college, setCollege] = useState(profile.college);
  const [department, setDepartment] = useState(profile.department);
  const [academicYear, setAcademicYear] = useState(profile.academicYear);
  const [bio, setBio] = useState(profile.bio);
  const [visibility, setVisibility] = useState<"public" | "private">(profile.visibility);
  const [contactPreference, setContactPreference] = useState(profile.contactPreference || "connections");

  // Preferences
  const [storyPrivacy, setStoryPrivacy] = useState<"everyone" | "followers" | "close_peers">("everyone");
  const [allowAiPersonalization, setAllowAiPersonalization] = useState(true);
  const [notifyLikes, setNotifyLikes] = useState(true);
  const [notifyMentions, setNotifyMentions] = useState(true);
  const [notifyPeerRequests, setNotifyPeerRequests] = useState(true);
  const [notifyAiTips, setNotifyAiTips] = useState(true);

  // Status feedback
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setNotice("");

    setTimeout(() => {
      const updated = ConEdStore.setCurrentUser({
        fullName,
        college,
        department,
        academicYear: Number(academicYear),
        bio,
        visibility,
        contactPreference,
      });

      setIsSaving(false);
      setNotice("Settings saved successfully.");
      setTimeout(() => setNotice(""), 4000);
    }, 400);
  };

  const handleDownloadData = () => {
    const data = {
      user: ConEdStore.getCurrentUser(),
      posts: ConEdStore.getPosts().filter((p) => p.authorId === profile.id),
      goals: ConEdStore.getGoals(),
      stories: ConEdStore.getStories().filter((s) => s.authorId === profile.id),
      exportedAt: new Date().toISOString(),
      platform: "CON-ED Student Social Networking Ecosystem",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `coned-data-export-${profile.username}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      document.cookie = "coned_session=; path=/; max-age=0";
      document.cookie = "coned_logged_out=true; path=/;";
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen pb-24 text-[#F4FFF9]">
      {/* Top Header */}
      <div className="border-b border-[#23372D] bg-[#080F0D]/80 backdrop-blur-md px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#00E69A] mb-1">
              <Shield size={15} />
              Account & Governance
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F4FFF9]">
              Settings & Privacy
            </h1>
            <p className="text-sm text-[#A6B8AE] mt-1">
              Control your digital presence, public identity, learning AI permissions, and personal data.
            </p>
          </div>

          <Link
            href={`/profile/${profile.username}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#F4FFF9] bg-[#101916] hover:bg-[#18251F] border border-[#23372D] hover:border-[#00D995] transition shrink-0"
          >
            <ExternalLink size={14} className="text-[#00E69A]" />
            View Public Profile
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#23372D] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "profile"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            <User size={15} />
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "privacy"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            <Lock size={15} />
            Privacy & Accounts
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "notifications"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            <Bell size={15} />
            Notifications
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "security"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            <Shield size={15} />
            Data & Security
          </button>
        </div>

        {notice && (
          <div className="p-3.5 rounded-xl bg-[#00E69A]/15 border border-[#00E69A]/40 text-[#00E69A] text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 size={16} />
            {notice}
          </div>
        )}

        {/* Tab 1: Profile Details */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-6 space-y-6">
              <h3 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
                <User size={18} className="text-[#00E69A]" />
                Public Student Identity
              </h3>

              <div className="flex items-center gap-4">
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00D995]/50 shadow-md"
                />
                <div>
                  <h4 className="text-sm font-bold text-[#F4FFF9]">{profile.fullName}</h4>
                  <p className="text-xs text-[#71857A]">@{profile.username}</p>
                  <span className="text-[10px] text-[#00E69A] mt-1 block">
                    Verified Student Account
                  </span>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                    College / University *
                  </label>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                    Department / Major
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                    Academic Year
                  </label>
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(Number(e.target.value))}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                    <option value={5}>Graduate / Masters / PhD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                  Bio
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                  placeholder="Share your interests, projects, or what you're learning..."
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 transition shadow"
                >
                  <Save size={14} />
                  {isSaving ? "Saving..." : "Save Profile Details"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Privacy & Account Type */}
        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-6 space-y-5">
              <h3 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
                <Lock size={18} className="text-[#00E69A]" />
                Account Visibility & Permissions
              </h3>

              {/* Public vs Private toggle */}
              <div className="p-4 rounded-xl bg-[#080F0D] border border-[#23372D] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#F4FFF9]">Private Account</h4>
                    <p className="text-xs text-[#A6B8AE] mt-0.5">
                      When your account is private, only students you approve can follow you and view your full posts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisibility(visibility === "public" ? "private" : "public")}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      visibility === "private" ? "bg-[#00E69A]" : "bg-[#23372D]"
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                        visibility === "private" ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <span className="text-[11px] text-[#00E69A] font-semibold block">
                  Current Status: {visibility === "public" ? "Public (Anyone can discover & follow)" : "Private (Follow request approvals required)"}
                </span>
              </div>

              {/* Story Privacy */}
              <div className="p-4 rounded-xl bg-[#080F0D] border border-[#23372D] space-y-3">
                <h4 className="text-sm font-bold text-[#F4FFF9]">Story Visibility</h4>
                <p className="text-xs text-[#A6B8AE]">
                  Choose who can view your 24-hour stories on the desktop and mobile feed.
                </p>
                <div className="grid sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { id: "everyone", label: "All Students" },
                    { id: "followers", label: "Followers Only" },
                    { id: "close_peers", label: "Close Study Group" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStoryPrivacy(opt.id as any)}
                      className={`p-3 rounded-xl text-left border text-xs font-semibold transition ${
                        storyPrivacy === opt.id
                          ? "bg-[#18251F] text-[#00E69A] border-[#00D995]"
                          : "bg-[#101916] text-[#A6B8AE] border-[#23372D] hover:border-[#71857A]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Personalization */}
              <div className="p-4 rounded-xl bg-[#080F0D] border border-[#23372D] flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#F4FFF9] flex items-center gap-2">
                    <Sparkles size={16} className="text-[#00E69A]" />
                    AI Mentor Personalization
                  </h4>
                  <p className="text-xs text-[#A6B8AE] mt-0.5">
                    Allow CON-ED AI to personalize learning paths based on your academic major, goals, and logged milestones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowAiPersonalization(!allowAiPersonalization)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    allowAiPersonalization ? "bg-[#00E69A]" : "bg-[#23372D]"
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                      allowAiPersonalization ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#050908] bg-[#00E69A] hover:bg-[#00C982] transition"
                >
                  Update Privacy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Notifications */}
        {activeTab === "notifications" && (
          <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-6 space-y-5">
            <h3 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
              <Bell size={18} className="text-[#00E69A]" />
              Notification Channels & Triggers
            </h3>

            <div className="space-y-3">
              {[
                { title: "Peer Follows & Requests", desc: "Notify when another student follows you or requests connection.", state: notifyPeerRequests, set: setNotifyPeerRequests },
                { title: "Post Likes & Comments", desc: "Notify when someone interacts with your research or projects.", state: notifyLikes, set: setNotifyLikes },
                { title: "Community Mentions & Invites", desc: "Alerts when you are tagged in technical discussions.", state: notifyMentions, set: setNotifyMentions },
                { title: "CON-ED AI Daily Roadmap Briefings", desc: "Receive weekly targets, milestone reminders and study streak updates.", state: notifyAiTips, set: setNotifyAiTips },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-[#080F0D] border border-[#23372D] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-[#F4FFF9]">{item.title}</h4>
                    <p className="text-[11px] text-[#A6B8AE] mt-0.5">{item.desc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => item.set(!item.state)}
                    className={`w-11 h-5.5 rounded-full transition-colors relative shrink-0 ${
                      item.state ? "bg-[#00E69A]" : "bg-[#23372D]"
                    }`}
                  >
                    <span
                      className={`block w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                        item.state ? "translate-x-5.5" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Data & Security */}
        {activeTab === "security" && (
          <div className="space-y-6">
            {/* Data Export */}
            <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-6 space-y-4">
              <h3 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
                <Database size={18} className="text-[#00E69A]" />
                Personal Data Portability
              </h3>
              <p className="text-xs text-[#A6B8AE]">
                Download a complete, machine-readable JSON archive of your CON-ED account data, including your public profile, posts, goals, and milestones.
              </p>
              <button
                onClick={handleDownloadData}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#F4FFF9] bg-[#080F0D] hover:bg-[#18251F] border border-[#23372D] hover:border-[#00D995] transition"
              >
                <Download size={14} className="text-[#00E69A]" />
                Download Personal Data (.json)
              </button>
            </div>

            {/* Logout and Danger Zone */}
            <div className="rounded-2xl bg-[#101916] border border-[#FF5364]/30 p-6 space-y-4">
              <h3 className="text-base font-bold text-[#FF5364] flex items-center gap-2">
                <AlertTriangle size={18} />
                Session & Account Controls
              </h3>
              <p className="text-xs text-[#A6B8AE]">
                End your active session on this device, or permanently close your CON-ED student profile.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#F4FFF9] bg-[#18251F] hover:bg-[#23372D] border border-[#23372D] transition"
                >
                  <LogOut size={14} className="text-[#FFC15A]" />
                  Log Out
                </button>

                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete your CON-ED account? This cannot be undone.")) {
                      handleLogout();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#FF5364] bg-[#FF5364]/10 hover:bg-[#FF5364]/20 border border-[#FF5364]/30 transition"
                >
                  <Trash2 size={14} />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
