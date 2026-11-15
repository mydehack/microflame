"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Heart,
  MessageSquare,
  Sparkles,
  Target,
  UserPlus,
  Users2,
  Trash2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { ConEdStore, type NotificationItem } from "@/lib/coned-store";

export function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "social" | "system">("all");

  useEffect(() => {
    setNotifications(ConEdStore.getNotifications());
  }, []);

  const handleMarkAllRead = () => {
    ConEdStore.markAllNotificationsRead();
    setNotifications(ConEdStore.getNotifications());
  };

  const handleMarkOneRead = (id: string) => {
    ConEdStore.markNotificationRead(id);
    setNotifications(ConEdStore.getNotifications());
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "social") return n.type === "follow" || n.type === "like" || n.type === "comment" || n.type === "invite";
    if (filter === "system") return n.type === "goal" || n.type === "system";
    return true;
  });

  const getIconForType = (type: NotificationItem["type"]) => {
    switch (type) {
      case "follow":
        return <UserPlus size={16} className="text-[#00E69A]" />;
      case "like":
        return <Heart size={16} className="text-[#FF5364] fill-[#FF5364]" />;
      case "comment":
        return <MessageSquare size={16} className="text-[#4DA9FF]" />;
      case "invite":
        return <Users2 size={16} className="text-[#67F5B8]" />;
      case "goal":
        return <Target size={16} className="text-[#FFC15A]" />;
      case "system":
      default:
        return <Sparkles size={16} className="text-[#00E69A]" />;
    }
  };

  return (
    <div className="min-h-screen pb-24 text-[#F4FFF9]">
      {/* Header */}
      <div className="border-b border-[#23372D] bg-[#080F0D]/80 backdrop-blur-md px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#00E69A] mb-1">
              <Bell size={15} />
              Activity Center
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F4FFF9]">
              Notifications
            </h1>
            <p className="text-sm text-[#A6B8AE] mt-1">
              Stay connected with peer interactions, milestones, community invites, and CON-ED AI updates.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[#F4FFF9] bg-[#101916] hover:bg-[#18251F] border border-[#23372D] hover:border-[#00D995] transition shrink-0"
            >
              <CheckCheck size={16} className="text-[#00E69A]" />
              Mark all read ({unreadCount})
            </button>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-6 space-y-6">
        {/* Filters */}
        <div className="flex items-center gap-2 border-b border-[#23372D] pb-3 overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filter === "all"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            All Activity ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filter === "unread"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("social")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filter === "social"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            Peers & Invites
          </button>
          <button
            onClick={() => setFilter("system")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              filter === "system"
                ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/30 shadow"
                : "text-[#A6B8AE] hover:text-[#F4FFF9]"
            }`}
          >
            Goals & System
          </button>
        </div>

        {/* Notifications list */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#23372D] bg-[#101916]/40 p-12 text-center">
            <Bell size={36} className="mx-auto text-[#71857A] mb-3" />
            <h3 className="text-base font-bold text-[#F4FFF9]">No notifications</h3>
            <p className="text-xs text-[#A6B8AE] mt-1 max-w-sm mx-auto">
              When peers follow your projects, reply to your discussions, or send messages, you will see alerts here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => handleMarkOneRead(item.id)}
                className={`rounded-2xl p-4.5 border transition-all flex items-start justify-between gap-4 cursor-pointer group ${
                  item.isRead
                    ? "bg-[#101916]/60 border-[#23372D] hover:border-[#23372D]/80"
                    : "bg-[#131F1A] border-[#00D995]/40 shadow-[0_0_15px_rgba(0,230,154,0.08)]"
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Avatar with type badge */}
                  <div className="relative shrink-0">
                    <img
                      src={item.actorAvatar}
                      alt={item.actorName}
                      className="w-11 h-11 rounded-full object-cover border border-[#23372D]"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#080F0D] border border-[#23372D] flex items-center justify-center">
                      {getIconForType(item.type)}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-[#F4FFF9] leading-relaxed">
                      <span className="font-bold text-[#F4FFF9] mr-1">{item.actorName}</span>
                      <span className="text-[#A6B8AE]">{item.body}</span>
                    </p>
                    <span className="text-[10px] text-[#71857A] mt-1 block">
                      {item.createdAt}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!item.isRead && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E69A] animate-pulse" />
                  )}
                  {item.link && (
                    <Link
                      href={item.link}
                      className="p-1.5 rounded-lg text-[#71857A] hover:text-[#00E69A] hover:bg-[#18251F] transition"
                    >
                      <ChevronRight size={16} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
