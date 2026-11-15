"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Users,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  UserX,
  Radio,
  Sparkles,
  Settings,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  Sliders,
  Send
} from "lucide-react";
import { ConEdStore, type StudentProfile, type Post } from "@/lib/coned-store";

interface ReportItem {
  id: string;
  postId: string;
  authorName: string;
  authorCollege: string;
  reason: string;
  reportedBy: string;
  previewText: string;
  status: "pending" | "resolved" | "dismissed";
  timestamp: string;
}

const INITIAL_REPORTS: ReportItem[] = [
  {
    id: "rep_1",
    postId: "post_rep_101",
    authorName: "Liam Vance",
    authorCollege: "NYU Tech",
    reason: "Suspected commercial advertising / spam",
    reportedBy: "Marcus Chen",
    previewText: "Cheap assignment solving services available! Contact on Telegram for guaranteed grades...",
    status: "pending",
    timestamp: "2 hours ago",
  },
  {
    id: "rep_2",
    postId: "post_rep_102",
    authorName: "Anonymous Student",
    authorCollege: "State University",
    reason: "Offensive language in hackathon discussion",
    reportedBy: "Priya Sharma",
    previewText: "Dispute regarding hackathon repo pull request containing abrasive comments...",
    status: "pending",
    timestamp: "5 hours ago",
  },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "moderation" | "users" | "announcements" | "ai_config">("overview");
  const [reports, setReports] = useState<ReportItem[]>(INITIAL_REPORTS);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [suspendedUsers, setSuspendedUsers] = useState<Set<string>>(new Set());

  // Announcement state
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [announcementSent, setAnnouncementSent] = useState(false);

  // AI Configuration state
  const [autoWelcome, setAutoWelcome] = useState(true);
  const [aiMentorEnabled, setAiMentorEnabled] = useState(true);
  const [interestWeight, setInterestWeight] = useState(50);
  const [skillWeight, setSkillWeight] = useState(30);

  useEffect(() => {
    setStudents(ConEdStore.getStudents());
  }, []);

  const handleResolveReport = (reportId: string, action: "dismiss" | "remove") => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId ? { ...r, status: action === "dismiss" ? "dismissed" : "resolved" } : r
      )
    );
  };

  const handleToggleSuspend = (userId: string) => {
    setSuspendedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementBody.trim()) return;

    // Send announcement through store
    ConEdStore.addPost({
      content: `📢 [OFFICIAL PLATFORM ANNOUNCEMENT]\n**${announcementTitle.trim()}**\n\n${announcementBody.trim()}`,
      postType: "update",
      visibility: "public",
      tags: ["CONED_Official", "Announcement", "PlatformUpdate"],
    });

    setAnnouncementSent(true);
    setAnnouncementTitle("");
    setAnnouncementBody("");
    setTimeout(() => setAnnouncementSent(false), 5000);
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      s.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      s.college.toLowerCase().includes(userSearch.toLowerCase())
  );

  const pendingReportsCount = reports.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen pb-24 text-[#F4FFF9]">
      {/* Top Banner */}
      <div className="border-b border-[#23372D] bg-[#080F0D]/90 backdrop-blur-md px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FFC15A] mb-1">
              <ShieldAlert size={16} />
              CON-ED Platform Administration & Governance
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F4FFF9]">
              Admin Control Center
            </h1>
            <p className="text-sm text-[#A6B8AE] mt-1 max-w-2xl">
              Oversee the student ecosystem, moderate flagged content, manage student profiles, broadcast announcements, and configure official CON-ED AI behavior.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#18251F] border border-[#23372D] text-xs font-semibold text-[#00E69A]">
            <span className="w-2 h-2 rounded-full bg-[#00E69A] animate-ping" />
            Superadmin Access Active
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#23372D] pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "overview"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            <TrendingUp size={15} />
            Platform Metrics
          </button>
          <button
            onClick={() => setActiveTab("moderation")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "moderation"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            <AlertTriangle size={15} />
            Moderation Queue ({pendingReportsCount})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "users"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            <Users size={15} />
            Student Accounts ({students.length})
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "announcements"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            <Radio size={15} />
            Announcements
          </button>
          <button
            onClick={() => setActiveTab("ai_config")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
              activeTab === "ai_config"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            <Cpu size={15} />
            CON-ED AI Config
          </button>
        </div>

        {/* Tab 1: Platform Metrics */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-5 shadow-lg">
                <div className="text-xs text-[#A6B8AE] mb-1 font-medium">Total Registered Students</div>
                <div className="text-3xl font-black text-[#F4FFF9]">14,820</div>
                <span className="text-[11px] text-[#00E69A] mt-2 block font-semibold">+342 this week</span>
              </div>

              <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-5 shadow-lg">
                <div className="text-xs text-[#A6B8AE] mb-1 font-medium">Daily Active Users</div>
                <div className="text-3xl font-black text-[#F4FFF9]">8,450</div>
                <span className="text-[11px] text-[#00E69A] mt-2 block font-semibold">57.0% engagement rate</span>
              </div>

              <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-5 shadow-lg">
                <div className="text-xs text-[#A6B8AE] mb-1 font-medium">Student Communities</div>
                <div className="text-3xl font-black text-[#F4FFF9]">128</div>
                <span className="text-[11px] text-[#A6B8AE] mt-2 block font-medium">9 academic categories</span>
              </div>

              <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-5 shadow-lg">
                <div className="text-xs text-[#A6B8AE] mb-1 font-medium">Pending Moderation</div>
                <div className="text-3xl font-black text-[#FF5364]">{pendingReportsCount}</div>
                <span className="text-[11px] text-[#FF5364] mt-2 block font-semibold">Requires admin review</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-6 space-y-4">
                <h3 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
                  <Sparkles size={18} className="text-[#00E69A]" />
                  System Health & Services
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#080F0D] border border-[#23372D]">
                    <span className="text-xs text-[#F4FFF9] font-medium">Supabase Auth & Database</span>
                    <span className="text-[11px] text-[#00E69A] font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#080F0D] border border-[#23372D]">
                    <span className="text-xs text-[#F4FFF9] font-medium">Supabase Realtime Messaging</span>
                    <span className="text-[11px] text-[#00E69A] font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Active (0.02s latency)
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-[#080F0D] border border-[#23372D]">
                    <span className="text-xs text-[#F4FFF9] font-medium">CON-ED AI Mentorship Engine</span>
                    <span className="text-[11px] text-[#00E69A] font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} /> Online (Gemini 2.5 Flash)
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-6 space-y-4">
                <h3 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
                  <Users size={18} className="text-[#00E69A]" />
                  Top Represented Campuses
                </h3>
                <div className="space-y-2">
                  {[
                    { college: "Stanford University", students: 1840, pct: 85 },
                    { college: "MIT", students: 1620, pct: 75 },
                    { college: "UC Berkeley", students: 1450, pct: 67 },
                    { college: "Harvard University", students: 1120, pct: 52 },
                  ].map((c, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#F4FFF9] font-semibold">{c.college}</span>
                        <span className="text-[#71857A]">{c.students} students</span>
                      </div>
                      <div className="w-full bg-[#080F0D] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#00E69A] h-full rounded-full"
                          style={{ width: `${c.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Moderation Queue */}
        {activeTab === "moderation" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#F4FFF9]">
                Flagged Content & Reports
              </h3>
              <span className="text-xs text-[#71857A]">
                Reports submitted by community members
              </span>
            </div>

            {reports.length === 0 ? (
              <div className="p-8 text-center bg-[#101916] rounded-2xl border border-[#23372D]">
                <CheckCircle2 size={32} className="mx-auto text-[#00E69A] mb-2" />
                <p className="text-sm text-[#F4FFF9] font-semibold">Moderation Queue is Clear</p>
                <p className="text-xs text-[#A6B8AE] mt-1">No pending reports require attention.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div
                    key={r.id}
                    className="p-5 rounded-2xl bg-[#101916] border border-[#23372D] flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FF5364]/20 text-[#FF5364] border border-[#FF5364]/30">
                          {r.reason}
                        </span>
                        <span className="text-xs text-[#71857A]">Reported by {r.reportedBy}</span>
                        <span className="text-xs text-[#71857A]">• {r.timestamp}</span>
                      </div>

                      <div className="p-3 rounded-xl bg-[#080F0D] border border-[#23372D] text-xs text-[#A6B8AE] italic">
                        "{r.previewText}"
                      </div>

                      <div className="text-xs text-[#71857A]">
                        Author: <span className="text-[#F4FFF9] font-semibold">{r.authorName}</span> ({r.authorCollege})
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {r.status === "pending" ? (
                        <>
                          <button
                            onClick={() => handleResolveReport(r.id, "dismiss")}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#A6B8AE] hover:text-[#F4FFF9] bg-[#18251F] hover:bg-[#23372D] border border-[#23372D] transition"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleResolveReport(r.id, "remove")}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#FF5364] bg-[#FF5364]/10 hover:bg-[#FF5364]/20 border border-[#FF5364]/30 transition"
                          >
                            <Trash2 size={13} />
                            Remove Content
                          </button>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-[#00E69A] flex items-center gap-1">
                          <CheckCircle2 size={14} /> Actioned ({r.status})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Student Accounts Directory */}
        {activeTab === "users" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71857A]" />
                <input
                  type="text"
                  placeholder="Search students by name, handle, or college..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-[#101916] border border-[#23372D] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                />
              </div>

              <span className="text-xs text-[#71857A]">
                Showing {filteredStudents.length} of {students.length} students
              </span>
            </div>

            <div className="rounded-2xl bg-[#101916] border border-[#23372D] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#F4FFF9]">
                  <thead className="bg-[#080F0D] border-b border-[#23372D] text-[#71857A] uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-4">Student</th>
                      <th className="p-4">College & Dept</th>
                      <th className="p-4">Account Type</th>
                      <th className="p-4">Followers</th>
                      <th className="p-4 text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#23372D]/60">
                    {filteredStudents.map((s) => {
                      const isSuspended = suspendedUsers.has(s.id);
                      return (
                        <tr key={s.id} className="hover:bg-[#131F1A]/50 transition">
                          <td className="p-4 flex items-center gap-3">
                            <img
                              src={s.avatarUrl}
                              alt={s.fullName}
                              className="w-8 h-8 rounded-full object-cover border border-[#23372D]"
                            />
                            <div>
                              <div className="font-bold flex items-center gap-1.5">
                                {s.fullName}
                                {s.isPlatformBadge && (
                                  <span className="text-[10px] bg-[#00E69A]/20 text-[#00E69A] px-1.5 py-0.2 rounded font-bold">
                                    Official
                                  </span>
                                )}
                              </div>
                              <span className="text-[#71857A]">@{s.username}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div>{s.college}</div>
                            <span className="text-[#71857A]">{s.department}</span>
                          </td>
                          <td className="p-4 capitalize">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#18251F] text-[#67F5B8] border border-[#23372D]">
                              {s.accountType}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-[#00E69A]">
                            {s.stats.followersCount}
                          </td>
                          <td className="p-4 text-right">
                            {s.accountType !== "ai" && (
                              <button
                                onClick={() => handleToggleSuspend(s.id)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                  isSuspended
                                    ? "bg-[#00E69A]/15 text-[#00E69A] border border-[#00E69A]/40"
                                    : "bg-[#FF5364]/10 text-[#FF5364] border border-[#FF5364]/30 hover:bg-[#FF5364]/20"
                                }`}
                              >
                                {isSuspended ? "Reactivate" : "Suspend"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Platform Announcements */}
        {activeTab === "announcements" && (
          <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
                <Radio size={18} className="text-[#00E69A]" />
                Broadcast Platform Announcement
              </h3>
              <p className="text-xs text-[#A6B8AE] mt-0.5">
                Publish a high-priority official broadcast to all students across the platform feed.
              </p>
            </div>

            {announcementSent && (
              <div className="p-4 rounded-xl bg-[#00E69A]/15 border border-[#00E69A]/40 text-[#00E69A] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                Announcement broadcasted live to the global CON-ED feed!
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                  Announcement Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CON-ED Winter Hackathon 2026 Registrations Open"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A6B8AE] mb-1.5">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide all relevant details, links, and guidance..."
                  value={announcementBody}
                  onChange={(e) => setAnnouncementBody(e.target.value)}
                  className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3.5 py-2.5 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00D995]"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 transition shadow"
                >
                  <Send size={14} />
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: CON-ED AI Configuration */}
        {activeTab === "ai_config" && (
          <div className="rounded-2xl bg-[#101916] border border-[#23372D] p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
                <Cpu size={18} className="text-[#00E69A]" />
                Official CON-ED AI Account & Recommendation Tuning
              </h3>
              <p className="text-xs text-[#A6B8AE] mt-0.5">
                Configure platform companion parameters and recommendation algorithm weights.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#080F0D] border border-[#23372D] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#F4FFF9]">
                    Auto-Follow New Registrations
                  </h4>
                  <p className="text-[11px] text-[#A6B8AE] mt-0.5">
                    Official CON-ED AI account automatically connects with new students upon registration.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoWelcome(!autoWelcome)}
                  className={`w-11 h-5.5 rounded-full transition-colors relative shrink-0 ${
                    autoWelcome ? "bg-[#00E69A]" : "bg-[#23372D]"
                  }`}
                >
                  <span
                    className={`block w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      autoWelcome ? "translate-x-5.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#080F0D] border border-[#23372D] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#F4FFF9]">
                    AI Mentorship Engine Active
                  </h4>
                  <p className="text-[11px] text-[#A6B8AE] mt-0.5">
                    Allows real-time streaming completions across the 5 specialized mentor disciplines.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAiMentorEnabled(!aiMentorEnabled)}
                  className={`w-11 h-5.5 rounded-full transition-colors relative shrink-0 ${
                    aiMentorEnabled ? "bg-[#00E69A]" : "bg-[#23372D]"
                  }`}
                >
                  <span
                    className={`block w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      aiMentorEnabled ? "translate-x-5.5" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              <div className="p-4 rounded-xl bg-[#080F0D] border border-[#23372D] space-y-3">
                <h4 className="text-xs font-bold text-[#F4FFF9] flex items-center gap-1.5">
                  <Sliders size={14} className="text-[#00E69A]" />
                  Peer Recommendation Weightings
                </h4>
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs text-[#A6B8AE] mb-1">
                      <span>Shared Interests Affinity</span>
                      <span className="font-bold text-[#00E69A]">{interestWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={interestWeight}
                      onChange={(e) => setInterestWeight(Number(e.target.value))}
                      className="w-full accent-[#00E69A]"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-[#A6B8AE] mb-1">
                      <span>Skill Level & Learning Path Affinity</span>
                      <span className="font-bold text-[#00E69A]">{skillWeight}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={skillWeight}
                      onChange={(e) => setSkillWeight(Number(e.target.value))}
                      className="w-full accent-[#00E69A]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
