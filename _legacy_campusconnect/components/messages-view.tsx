"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageCircle,
  UsersRound,
  Send,
  Search,
  Sparkles,
  CheckCheck,
  ChevronLeft,
  BadgeCheck,
  Info,
  X,
  Plus,
  Globe,
  Lock,
  Calendar,
  Bell,
  BookOpen,
  Check,
  Building,
} from "lucide-react";
import {
  ConEdStore,
  type Conversation,
  type MessageItem,
  type Community,
  type StudentProfile,
} from "@/lib/coned-store";

export function MessagesView({ userId }: { userId?: string }) {
  // Navigation segment in left pane: "direct" vs "communities"
  const [navTab, setNavTab] = useState<"direct" | "communities">("direct");

  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [activeChatType, setActiveChatType] = useState<"direct" | "community">("direct");
  const [activeId, setActiveId] = useState<string>("conv_coned_ai");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRightDetails, setShowRightDetails] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Community directory browse / create modal
  const [showCommunityModal, setShowCommunityModal] = useState(false);
  const [communityCategoryFilter, setCommunityCategoryFilter] = useState("All");
  const [newCommName, setNewCommName] = useState("");
  const [newCommDesc, setNewCommDesc] = useState("");
  const [newCommCat, setNewCommCat] = useState("Artificial Intelligence");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = ConEdStore.getCurrentUser();

  // Load store data
  useEffect(() => {
    const convs = ConEdStore.getConversations();
    const comms = ConEdStore.getCommunities();
    setConversations(convs);
    setCommunities(comms);

    if (convs.length > 0 && !activeId) {
      setActiveId(convs[0].id);
      setActiveChatType("direct");
    }
  }, [activeId]);

  // Load messages for current chat (either direct or community channel)
  useEffect(() => {
    if (activeId) {
      setMessages(ConEdStore.getMessages(activeId));
    }
  }, [activeId]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Find active items
  const activeConv = conversations.find((c) => c.id === activeId);
  const activeCommunity = communities.find((c) => c.id === activeId);

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeId) return;

    const userText = inputText.trim();
    ConEdStore.sendMessage(activeId, userText);
    setMessages(ConEdStore.getMessages(activeId));
    setConversations(ConEdStore.getConversations());
    setInputText("");

    // If chatting with CON-ED AI in Direct Messages, simulate instant response
    if (activeChatType === "direct" && (activeConv?.isPlatformAccount || activeId === "conv_coned_ai")) {
      setIsTyping(true);
      setTimeout(() => {
        let reply = "I've reviewed your question! Here are a few recommended steps:";
        if (userText.toLowerCase().includes("python") || userText.toLowerCase().includes("code")) {
          reply = "For Python and clean software architecture, prioritize type annotations with Pydantic and modular services. You can also explore the AI Mentor tab for code walkthroughs!";
        } else if (userText.toLowerCase().includes("interview") || userText.toLowerCase().includes("dsa")) {
          reply = "For DSA interviews, focus on Pattern Recognition rather than memorizing individual solutions (Sliding Window, Two Pointers, Top K Elements). Check the Goals tab to track your progress!";
        } else if (userText.toLowerCase().includes("hackathon") || userText.toLowerCase().includes("project")) {
          reply = "Great initiative! You can showcase your project in the 'Project Showcase' tab to find peer collaborators and get constructive feedback.";
        } else {
          reply = `That's a thoughtful question regarding "${userText}". I've pinned a learning roadmap to your Goals dashboard. Feel free to ask for deep code examples anytime!`;
        }

        ConEdStore.sendMessage(activeId, reply);
        setMessages(ConEdStore.getMessages(activeId));
        setConversations(ConEdStore.getConversations());
        setIsTyping(false);
      }, 1200);
    }
  };

  const handleToggleJoin = (commId: string) => {
    const joined = ConEdStore.toggleJoinCommunity(commId);
    setCommunities(ConEdStore.getCommunities());
    showToast(joined ? "Joined community!" : "Left community.");
  };

  const handleCreateCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    const created = ConEdStore.createCommunity({
      name: newCommName.trim(),
      slug: newCommName.trim().toLowerCase().replace(/\s+/g, "-"),
      description: newCommDesc.trim() || "Student community hub on CON-ED.",
      category: newCommCat,
      bannerUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
      logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80",
      rules: ["Be respectful and collaborative", "No spam or unauthorized promotions"],
    });

    setCommunities(ConEdStore.getCommunities());
    setActiveChatType("community");
    setActiveId(created.id);
    setNewCommName("");
    setNewCommDesc("");
    setShowCommunityModal(false);
    showToast(`Community "${created.name}" created!`);
  };

  // Filtered lists
  const filteredConversations = conversations.filter((c) =>
    c.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCommunities = communities.filter((c) => {
    const matchCat = communityCategoryFilter === "All" || c.category === communityCategoryFilter;
    const matchQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="w-full h-[calc(100vh-64px)] bg-[#050908] flex overflow-hidden">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#101916] border border-[#00E69A] text-[#F4FFF9] text-xs font-semibold shadow-[0_0_20px_rgba(0,230,154,0.3)] flex items-center gap-2">
          <Check size={14} className="text-[#00E69A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= 1. LEFT CONVERSATIONS & COMMUNITIES LIST ================= */}
      <aside
        className={`w-full md:w-80 lg:w-96 border-r border-[#23372D] bg-[#070D0B] flex flex-col shrink-0 ${
          activeId ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header with Segment Toggle */}
        <div className="p-4 border-b border-[#23372D] flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
              <MessageCircle size={18} className="text-[#00E69A]" />
              <span>Messages & Hubs</span>
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#00E69A]/15 text-[#00E69A] text-[10px] font-bold">
              Realtime
            </span>
          </div>

          {/* Navigation Segment Tabs */}
          <div className="flex items-center gap-1 bg-[#101916] p-1 rounded-xl border border-[#23372D]">
            <button
              type="button"
              onClick={() => setNavTab("direct")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                navTab === "direct"
                  ? "bg-[#18251F] text-[#00E69A] shadow"
                  : "text-[#71857A] hover:text-[#A6B8AE]"
              }`}
            >
              <MessageCircle size={13} />
              <span>Direct Chats</span>
            </button>
            <button
              type="button"
              onClick={() => setNavTab("communities")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                navTab === "communities"
                  ? "bg-[#18251F] text-[#00E69A] shadow"
                  : "text-[#71857A] hover:text-[#A6B8AE]"
              }`}
            >
              <UsersRound size={13} />
              <span>Communities ({communities.length})</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-2.5 text-[#71857A]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={navTab === "direct" ? "Search peers & mentors..." : "Search community channels..."}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#101916] border border-[#23372D] text-xs text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A]"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {/* TAB A: DIRECT MESSAGES */}
          {navTab === "direct" && (
            <>
              {filteredConversations.map((conv) => {
                const isSelected = activeChatType === "direct" && conv.id === activeId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      setActiveChatType("direct");
                      setActiveId(conv.id);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#101916] border border-[#00D995]/50 shadow"
                        : "hover:bg-[#101916]/60 border border-transparent"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={conv.participantAvatar}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover border border-[#23372D]"
                      />
                      {conv.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#00E69A] border-2 border-[#070D0B]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F4FFF9] truncate flex items-center gap-1">
                          {conv.participantName}
                          {conv.isPlatformAccount && (
                            <BadgeCheck size={13} className="text-[#00E69A]" />
                          )}
                        </span>
                        <span className="text-[10px] text-[#71857A]">{conv.lastMessageTime}</span>
                      </div>
                      <p className="text-[11px] text-[#A6B8AE] truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#00E69A] text-[#050908] text-[9px] font-bold flex items-center justify-center shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}

          {/* TAB B: COMMUNITIES & GROUPS */}
          {navTab === "communities" && (
            <>
              <div className="flex items-center justify-between px-2 py-1 text-[11px] text-[#71857A] font-semibold">
                <span>Campus Community Hubs</span>
                <button
                  type="button"
                  onClick={() => setShowCommunityModal(true)}
                  className="text-[#00E69A] hover:underline flex items-center gap-1 font-bold text-[10px]"
                >
                  <Plus size={12} /> Explore / Create
                </button>
              </div>

              {filteredCommunities.map((comm) => {
                const isSelected = activeChatType === "community" && comm.id === activeId;
                return (
                  <button
                    key={comm.id}
                    type="button"
                    onClick={() => {
                      setActiveChatType("community");
                      setActiveId(comm.id);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#101916] border border-[#00D995]/50 shadow"
                        : "hover:bg-[#101916]/60 border border-transparent"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={comm.logoUrl}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-[#23372D]"
                      />
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#18251F] text-[#00E69A] text-[9px] font-bold flex items-center justify-center border border-[#23372D]">
                        #
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#F4FFF9] truncate">
                          {comm.name}
                        </span>
                        <span className="text-[10px] text-[#00E69A] font-semibold">
                          {comm.membersCount}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#A6B8AE] truncate mt-0.5">
                        {comm.category} • {comm.isJoined ? "Joined" : "Available"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </>
          )}
        </div>
      </aside>

      {/* ================= 2. CENTER ACTIVE CHAT PANE ================= */}
      <section className="flex-1 flex flex-col bg-[#050908] h-full overflow-hidden">
        {/* If Direct Conversation is active */}
        {activeChatType === "direct" && activeConv ? (
          <>
            {/* Direct Chat Top Header */}
            <div className="p-3.5 px-4 sm:px-6 border-b border-[#23372D] bg-[#070D0B] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveId("")}
                  className="md:hidden p-1.5 rounded-lg text-[#A6B8AE] hover:text-[#F4FFF9] hover:bg-[#131F1A]"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#00E69A]/40 shrink-0">
                  <img
                    src={activeConv.participantAvatar}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-[#F4FFF9] flex items-center gap-1.5">
                    {activeConv.participantName}
                    {activeConv.isPlatformAccount && (
                      <BadgeCheck size={14} className="text-[#00E69A]" />
                    )}
                  </span>
                  <span className="text-[10px] text-[#00E69A] flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E69A] animate-pulse" />
                    {activeConv.isOnline ? "Online & Active" : "Offline"} • {activeConv.participantCollege}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRightDetails(!showRightDetails)}
                className="hidden lg:flex p-2 rounded-xl text-[#A6B8AE] hover:text-[#00E69A] hover:bg-[#131F1A] transition-colors"
                title="Profile Details"
              >
                <Info size={17} />
              </button>
            </div>

            {/* Direct Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id || msg.senderId === "usr_me_001";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <img
                        src={msg.senderAvatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-[#23372D] shrink-0 mb-1"
                      />
                    )}

                    <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-md">
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                          isMe
                            ? "bg-[#00E69A] text-[#050908] font-medium rounded-br-none shadow-[0_0_15px_rgba(0,230,154,0.15)]"
                            : "bg-[#101916] text-[#F4FFF9] border border-[#23372D] rounded-bl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span
                        className={`text-[9px] text-[#71857A] flex items-center gap-1 px-1 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.createdAt}
                        {isMe && <CheckCheck size={11} className="text-[#00E69A]" />}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#00E69A]">
                  <span className="w-2 h-2 rounded-full bg-[#00E69A] animate-ping" />
                  <span>CON-ED AI is composing guidance…</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Direct Message Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 border-t border-[#23372D] bg-[#070D0B] flex items-center gap-3 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${activeConv.participantName}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#101916] border border-[#23372D] text-xs sm:text-sm text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
              >
                <Send size={14} />
                <span className="hidden sm:inline">Send</span>
              </button>
            </form>
          </>
        ) : null}

        {/* If Community Channel is active */}
        {activeChatType === "community" && activeCommunity ? (
          <>
            {/* Community Channel Header */}
            <div className="p-3.5 px-4 sm:px-6 border-b border-[#23372D] bg-[#070D0B] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveId("")}
                  className="md:hidden p-1.5 rounded-lg text-[#A6B8AE] hover:text-[#F4FFF9] hover:bg-[#131F1A]"
                >
                  <ChevronLeft size={20} />
                </button>

                <img
                  src={activeCommunity.logoUrl}
                  alt=""
                  className="w-9 h-9 rounded-xl object-cover border border-[#00E69A]/40 shrink-0"
                />

                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-bold text-[#F4FFF9] flex items-center gap-1.5">
                    {activeCommunity.name}
                  </span>
                  <span className="text-[10px] text-[#A6B8AE] flex items-center gap-1">
                    <span className="text-[#00E69A] font-semibold">{activeCommunity.category}</span>
                    <span>•</span>
                    <span>{activeCommunity.membersCount.toLocaleString()} student members</span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleJoin(activeCommunity.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeCommunity.isJoined
                      ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/40"
                      : "bg-[#00E69A] text-[#050908] hover:bg-[#00C982]"
                  }`}
                >
                  {activeCommunity.isJoined ? "Joined Hub" : "+ Join Community"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowRightDetails(!showRightDetails)}
                  className="hidden lg:flex p-2 rounded-xl text-[#A6B8AE] hover:text-[#00E69A] hover:bg-[#131F1A] transition-colors"
                  title="Community Information"
                >
                  <Info size={17} />
                </button>
              </div>
            </div>

            {/* Community Group Chat Stream */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="p-4 rounded-2xl bg-[#101916] border border-[#23372D] text-xs text-[#A6B8AE] space-y-1">
                <div className="font-bold text-[#F4FFF9] flex items-center gap-1.5">
                  <UsersRound size={15} className="text-[#00E69A]" />
                  Welcome to #{activeCommunity.name}!
                </div>
                <p>{activeCommunity.description}</p>
              </div>

              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id || msg.senderId === "usr_me_001";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {!isMe && (
                      <img
                        src={msg.senderAvatar}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover border border-[#23372D] shrink-0 mb-1"
                      />
                    )}

                    <div className="flex flex-col gap-1 max-w-[85%] sm:max-w-md">
                      {!isMe && (
                        <span className="text-[10px] text-[#A6B8AE] font-semibold px-1">
                          {msg.senderName}
                        </span>
                      )}
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                          isMe
                            ? "bg-[#00E69A] text-[#050908] font-medium rounded-br-none shadow-[0_0_15px_rgba(0,230,154,0.15)]"
                            : "bg-[#101916] text-[#F4FFF9] border border-[#23372D] rounded-bl-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span
                        className={`text-[9px] text-[#71857A] flex items-center gap-1 px-1 ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        {msg.createdAt}
                        {isMe && <CheckCheck size={11} className="text-[#00E69A]" />}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Community Group Chat Input */}
            <form
              onSubmit={handleSendMessage}
              className="p-3 sm:p-4 border-t border-[#23372D] bg-[#070D0B] flex items-center gap-3 shrink-0"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message #${activeCommunity.name}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#101916] border border-[#23372D] text-xs sm:text-sm text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A]"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
              >
                <Send size={14} />
                <span className="hidden sm:inline">Post</span>
              </button>
            </form>
          </>
        ) : null}
      </section>

      {/* ================= 3. RIGHT DETAILS DRAWER ================= */}
      {showRightDetails && (
        <aside className="hidden lg:flex w-72 border-l border-[#23372D] bg-[#070D0B] p-5 flex-col gap-5 shrink-0 overflow-y-auto">
          {activeChatType === "direct" && activeConv && (
            <>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#00E69A] p-0.5 shadow-lg">
                  <img
                    src={activeConv.participantAvatar}
                    alt=""
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <h3 className="text-sm font-bold text-[#F4FFF9] flex items-center gap-1">
                  {activeConv.participantName}
                  {activeConv.isPlatformAccount && <BadgeCheck size={14} className="text-[#00E69A]" />}
                </h3>
                <span className="text-[11px] text-[#A6B8AE]">{activeConv.participantCollege}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#101916] border border-[#23372D] flex flex-col gap-2">
                <span className="text-[11px] font-bold text-[#F4FFF9]">Ecosystem Companion</span>
                <p className="text-xs text-[#A6B8AE] leading-relaxed">
                  {activeConv.isPlatformAccount
                    ? "Official automated student companion. Ask any question about algorithms, code architecture, or career roadmaps."
                    : "Connected peer on CON-ED. Messages are encrypted and private."}
                </p>
              </div>

              <Link
                href="/mentors"
                className="w-full py-2.5 rounded-xl text-xs font-bold text-[#050908] bg-gradient-to-r from-[#00E69A] to-[#00B879] hover:brightness-110 transition flex items-center justify-center gap-2"
              >
                <Sparkles size={13} />
                <span>Open AI Mentor Suite</span>
              </Link>
            </>
          )}

          {activeChatType === "community" && activeCommunity && (
            <>
              <div className="flex flex-col items-center text-center gap-2">
                <img
                  src={activeCommunity.logoUrl}
                  alt=""
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#00E69A] p-0.5"
                />
                <h3 className="text-sm font-bold text-[#F4FFF9]">{activeCommunity.name}</h3>
                <span className="text-[11px] text-[#00E69A] font-semibold">{activeCommunity.category}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#101916] border border-[#23372D] space-y-2">
                <span className="text-[11px] font-bold text-[#F4FFF9] flex items-center gap-1.5">
                  <BookOpen size={13} className="text-[#00E69A]" />
                  Hub Rules & Guidelines
                </span>
                <ul className="text-[11px] text-[#A6B8AE] space-y-1 list-disc list-inside">
                  {activeCommunity.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-[#101916] border border-[#23372D] space-y-1">
                <span className="text-[11px] font-bold text-[#F4FFF9] flex items-center gap-1.5">
                  <Calendar size={13} className="text-[#00E69A]" />
                  Next Community Sync
                </span>
                <p className="text-[11px] text-[#A6B8AE]">
                  Virtual Hackathon Sprint & Code Review this Saturday at 4 PM.
                </p>
              </div>
            </>
          )}
        </aside>
      )}

      {/* ================= MODAL: EXPLORE & CREATE COMMUNITIES ================= */}
      {showCommunityModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101916] border border-[#23372D] rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#23372D] flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#F4FFF9] flex items-center gap-2">
                  <UsersRound size={18} className="text-[#00E69A]" />
                  Campus Communities & Study Guilds
                </h3>
                <p className="text-xs text-[#A6B8AE] mt-0.5">
                  Join student-led study groups or launch your own collaborative hub.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCommunityModal(false)}
                className="text-[#71857A] hover:text-[#F4FFF9]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {["All", "Artificial Intelligence", "Web Development", "Robotics & Hardware", "Career & Coding"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCommunityCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                      communityCategoryFilter === cat
                        ? "bg-[#00E69A] text-[#050908] font-bold"
                        : "bg-[#080F0D] text-[#A6B8AE] border border-[#23372D]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Communities Directory Grid */}
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredCommunities.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-3.5 rounded-xl bg-[#080F0D] border border-[#23372D] flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={comm.logoUrl}
                        alt=""
                        className="w-10 h-10 rounded-xl object-cover border border-[#23372D] shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-[#F4FFF9] truncate">{comm.name}</h4>
                        <span className="text-[10px] text-[#00E69A] font-semibold block">{comm.category}</span>
                        <p className="text-[11px] text-[#71857A] line-clamp-2 mt-1 leading-snug">
                          {comm.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#23372D]/50 text-xs">
                      <span className="text-[10px] text-[#71857A]">{comm.membersCount} members</span>
                      <button
                        type="button"
                        onClick={() => handleToggleJoin(comm.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          comm.isJoined
                            ? "bg-[#18251F] text-[#00E69A] border border-[#00D995]/40"
                            : "bg-[#00E69A] text-[#050908] hover:bg-[#00C982]"
                        }`}
                      >
                        {comm.isJoined ? "Joined" : "+ Join"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Community Form */}
              <div className="pt-4 border-t border-[#23372D] space-y-3">
                <span className="text-xs font-bold text-[#F4FFF9] block">
                  Create a New Student Community
                </span>
                <form onSubmit={handleCreateCommunity} className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Community Name (e.g. Quantum Computing Guild)"
                      value={newCommName}
                      onChange={(e) => setNewCommName(e.target.value)}
                      className="bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                    />
                    <select
                      value={newCommCat}
                      onChange={(e) => setNewCommCat(e.target.value)}
                      className="bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                    >
                      <option>Artificial Intelligence</option>
                      <option>Web Development</option>
                      <option>Robotics & Hardware</option>
                      <option>Career & Coding</option>
                      <option>Startups & Venture</option>
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Short description of what your community explores..."
                    value={newCommDesc}
                    onChange={(e) => setNewCommDesc(e.target.value)}
                    className="w-full bg-[#080F0D] border border-[#23372D] rounded-xl px-3 py-2 text-xs text-[#F4FFF9] focus:outline-none focus:border-[#00E69A]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00E69A] text-[#050908] hover:bg-[#00C982] transition"
                    >
                      Launch Community Hub
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
