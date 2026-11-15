"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  UserCheck,
  Check,
  X,
  Sparkles,
  MessageCircle,
  GraduationCap,
  BadgeCheck,
  Search,
} from "lucide-react";
import { ConEdStore, type StudentProfile } from "@/lib/coned-store";

export function ConnectionsView() {
  const [activeTab, setActiveTab] = useState<"suggested" | "following" | "followers" | "requests">("suggested");
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<StudentProfile>(ConEdStore.getCurrentUser());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mock pending requests
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: "req_1",
      studentName: "David Miller",
      studentCollege: "Georgia Tech",
      studentDept: "Cybersecurity",
      avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80",
      reason: "Shared interest in Cloud Security & AWS Hardening",
    },
    {
      id: "req_2",
      studentName: "Sophia Lin",
      studentCollege: "Stanford University",
      studentDept: "Human-Computer Interaction",
      avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80",
      reason: "Mutual connections with Aisha Patel",
    },
  ]);

  useEffect(() => {
    setStudents(ConEdStore.getStudents());
    setCurrentUser(ConEdStore.getCurrentUser());
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleFollow = (studentId: string) => {
    const res = ConEdStore.toggleFollow(studentId);
    setStudents(ConEdStore.getStudents());
    setCurrentUser(ConEdStore.getCurrentUser());
    showToast(res.isFollowing ? "Followed student!" : "Unfollowed student.");
  };

  const handleAcceptRequest = (reqId: string, studentName: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
    showToast(`Accepted follow request from ${studentName}!`);
  };

  const handleRejectRequest = (reqId: string) => {
    setPendingRequests((prev) => prev.filter((r) => r.id !== reqId));
    showToast("Request declined.");
  };

  const followingList = students.filter((s) => s.isFollowing);
  const followersList = students.filter((s) => s.id !== currentUser.id);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#101916] border border-[#00E69A] text-[#F4FFF9] text-xs font-semibold shadow-[0_0_20px_rgba(0,230,154,0.35)] flex items-center gap-2">
          <Check size={14} className="text-[#00E69A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101916] border border-[#00E69A]/30 text-[#00E69A] text-xs font-semibold mb-2">
          <Users size={14} />
          <span>Student Network & Connections</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4FFF9] tracking-tight">
          Connections & Followers
        </h1>
        <p className="text-xs sm:text-sm text-[#A6B8AE] mt-1">
          Manage your followers, private follow requests, and explore AI-matched peers from your campus and beyond.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#23372D] pb-3">
        {[
          { id: "suggested", label: "Suggested Peers", count: students.length - followingList.length },
          { id: "following", label: "Following", count: followingList.length },
          { id: "followers", label: "Followers", count: currentUser.stats.followersCount },
          { id: "requests", label: "Pending Requests", count: pendingRequests.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-[#00E69A]/15 text-[#00E69A] border border-[#00E69A]/30 shadow-[0_0_12px_rgba(0,230,154,0.15)]"
                : "text-[#71857A] hover:text-[#F4FFF9] hover:bg-[#101916]"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.id ? "bg-[#00E69A] text-[#050908]" : "bg-[#18251F] text-[#A6B8AE]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* 1. SUGGESTED PEERS */}
      {activeTab === "suggested" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {students.map((student) => (
            <div
              key={student.id}
              className="p-5 rounded-2xl bg-[#101916] border border-[#23372D] flex flex-col justify-between gap-4 hover:border-[#00E69A]/40 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <Link href={`/profile/${student.username}`}>
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-[#00E69A]/40 shrink-0">
                    <img
                      src={student.avatarUrl}
                      alt={student.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/profile/${student.username}`}
                      className="text-sm font-bold text-[#F4FFF9] hover:text-[#00E69A] truncate"
                    >
                      {student.fullName}
                    </Link>
                    {student.isPlatformBadge && <BadgeCheck size={14} className="text-[#00E69A]" />}
                  </div>
                  <span className="text-[11px] text-[#A6B8AE] truncate">
                    {student.college} • {student.department}
                  </span>
                  <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#00E69A]">
                    <Sparkles size={11} />
                    <span>{student.stats.compatibilityScore || 90}% Compatibility Match</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#A6B8AE] line-clamp-2 leading-relaxed">
                {student.bio}
              </p>

              {/* Skills Chips */}
              <div className="flex flex-wrap gap-1.5">
                {student.skills.slice(0, 3).map((sk, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-[#131F1A] text-[10px] font-medium text-[#67F5B8]"
                  >
                    {sk.name}
                  </span>
                ))}
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-[#23372D] flex items-center justify-between">
                <Link
                  href="/messages"
                  className="text-xs font-semibold text-[#A6B8AE] hover:text-[#F4FFF9] flex items-center gap-1"
                >
                  <MessageCircle size={13} /> Message
                </Link>

                <button
                  type="button"
                  onClick={() => handleToggleFollow(student.id)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    student.isFollowing
                      ? "bg-[#131F1A] border border-[#23372D] text-[#A6B8AE] hover:text-[#FF5364]"
                      : "btn-gradient"
                  }`}
                >
                  {student.isFollowing ? (
                    <>
                      <UserCheck size={13} /> Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={13} /> Follow
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. FOLLOWING */}
      {activeTab === "following" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {followingList.length === 0 ? (
            <div className="col-span-2 p-10 rounded-2xl bg-[#101916] border border-[#23372D] text-center">
              <p className="text-xs text-[#71857A]">You are not following any students yet.</p>
            </div>
          ) : (
            followingList.map((student) => (
              <div
                key={student.id}
                className="p-4 rounded-2xl bg-[#101916] border border-[#23372D] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#23372D] shrink-0">
                    <img src={student.avatarUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <Link
                      href={`/profile/${student.username}`}
                      className="text-xs font-bold text-[#F4FFF9] hover:text-[#00E69A] truncate"
                    >
                      {student.fullName}
                    </Link>
                    <span className="text-[10px] text-[#71857A] truncate">
                      {student.college} • {student.department}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleFollow(student.id)}
                  className="px-3 py-1.5 rounded-xl bg-[#131F1A] border border-[#23372D] text-xs font-bold text-[#FF5364] hover:bg-[#FF5364]/10 transition-colors"
                >
                  Unfollow
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 3. FOLLOWERS */}
      {activeTab === "followers" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {followersList.map((student) => (
            <div
              key={student.id}
              className="p-4 rounded-2xl bg-[#101916] border border-[#23372D] flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#23372D] shrink-0">
                  <img src={student.avatarUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#F4FFF9] truncate">{student.fullName}</span>
                  <span className="text-[10px] text-[#71857A] truncate">{student.college}</span>
                </div>
              </div>

              <Link
                href={`/profile/${student.username}`}
                className="px-3 py-1.5 rounded-xl bg-[#131F1A] border border-[#23372D] hover:border-[#00E69A] text-xs font-bold text-[#F4FFF9]"
              >
                Profile
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 4. PENDING REQUESTS */}
      {activeTab === "requests" && (
        <div className="flex flex-col gap-3">
          {pendingRequests.length === 0 ? (
            <div className="p-10 rounded-2xl bg-[#101916] border border-[#23372D] text-center">
              <p className="text-xs text-[#71857A]">No pending follow requests right now.</p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-[#101916] border border-[#23372D] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl overflow-hidden border border-[#23372D] shrink-0">
                    <img src={req.avatarUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#F4FFF9]">{req.studentName}</h3>
                    <p className="text-[10px] text-[#A6B8AE]">
                      {req.studentCollege} • {req.studentDept}
                    </p>
                    <p className="text-[10px] text-[#00E69A] mt-0.5">{req.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleRejectRequest(req.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#131F1A] border border-[#23372D] text-xs font-bold text-[#FF5364] hover:bg-[#FF5364]/10 transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req.id, req.studentName)}
                    className="btn-gradient px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <Check size={13} />
                    <span>Accept</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
