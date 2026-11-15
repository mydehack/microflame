"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  BookOpen,
  Briefcase,
  Wand2,
  Calendar,
  Users,
  Send,
  Trash2,
  Check,
  RefreshCw,
  Copy,
  Terminal,
  BrainCircuit,
  GraduationCap,
  Download,
} from "lucide-react";
import { ConEdStore, type StudentProfile } from "@/lib/coned-store";

export type MentorModuleType = "learning" | "career" | "project" | "productivity" | "social";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const MENTOR_MODULES = [
  {
    id: "learning" as MentorModuleType,
    title: "Learning Mentor",
    desc: "Explain complex concepts, teach programming, solve math, and generate practice questions.",
    icon: BookOpen,
    greeting: "👋 Hello! I'm your CON-ED Learning Mentor. What technical concept, algorithm, or course topic would you like to master today?",
  },
  {
    id: "career" as MentorModuleType,
    title: "Career Mentor",
    desc: "Resume critique, internship preparation, mock interviews, and career transition roadmaps.",
    icon: Briefcase,
    greeting: "🎯 Ready to advance your career? I can review your resume bullet points, prepare placement roadmaps, or conduct a mock interview.",
  },
  {
    id: "project" as MentorModuleType,
    title: "Project Mentor",
    desc: "Brainstorm high-impact project ideas, review system architecture, and debug code.",
    icon: Wand2,
    greeting: "🚀 What are you building? Tell me about your project idea, tech stack choices, or system architecture questions.",
  },
  {
    id: "productivity" as MentorModuleType,
    title: "Productivity Mentor",
    desc: "Study schedules, weekly sprint planning, Pomodoro targets, and habit building.",
    icon: Calendar,
    greeting: "⚡ Let's organize your study sprints! I can help you structure focused deep work blocks and track your weekly goals.",
  },
  {
    id: "social" as MentorModuleType,
    title: "Social Mentor",
    desc: "Discover relevant campus communities, hackathon partners, and compatible study buddies.",
    icon: Users,
    greeting: "🤝 Finding the right collaborators is half the battle. Tell me your project requirements or study interests, and I'll recommend peer matches!",
  },
];

const QUICK_ACTIONS = [
  { label: "Python Basics", prompt: "Explain Python generators, decorators, and list comprehensions with clear examples." },
  { label: "Web Development", prompt: "What is the best architecture for a production Next.js 16 App Router application?" },
  { label: "Career Guidance", prompt: "Create a 3-month roadmap to prepare for Software Engineering summer internships." },
  { label: "Study Plan", prompt: "Design a weekly study schedule for mastering Data Structures & Algorithms alongside college courses." },
  { label: "Project Ideas", prompt: "Suggest 3 unique, portfolio-worthy full-stack AI projects that impress technical recruiters." },
  { label: "Interview Preparation", prompt: "Conduct a mock technical interview for a junior backend software engineer role." },
];

export function MentorsDirectory() {
  const [activeModule, setActiveModule] = useState<MentorModuleType>("learning");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = ConEdStore.getCurrentUser();
  const currentModule = MENTOR_MODULES.find((m) => m.id === activeModule)!;

  // Initialize conversation when switching modules
  useEffect(() => {
    const savedKey = `coned_mentor_${activeModule}`;
    const saved = localStorage.getItem(savedKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
        return;
      } catch {
        // ignore
      }
    }

    setMessages([
      {
        id: "msg_init",
        role: "assistant",
        content: currentModule.greeting,
        timestamp: "Just now",
      },
    ]);
  }, [activeModule, currentModule.greeting]);

  // Persist messages
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`coned_mentor_${activeModule}`, JSON.stringify(messages));
    }
  }, [messages, activeModule]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsThinking(true);

    // Call API or use intelligent student companion engine
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: query,
          persona: activeModule,
          profile: {
            fullName: currentUser.fullName,
            college: currentUser.college,
            department: currentUser.department,
            academicYear: currentUser.academicYear,
            skills: currentUser.skills.map((s) => s.name),
            goals: currentUser.goals,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          role: "assistant",
          content: data.reply || generateIntelligentResponse(query, activeModule, currentUser),
          timestamp: "Just now",
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsThinking(false);
        return;
      }
    } catch {
      // Fall through to offline high-fidelity assistant
    }

    // High-fidelity responsive fallback
    setTimeout(() => {
      const aiReply = generateIntelligentResponse(query, activeModule, currentUser);
      const aiMessage: ChatMessage = {
        id: `ai_${Date.now()}`,
        role: "assistant",
        content: aiReply,
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsThinking(false);
    }, 1200);
  };

  const handleClearHistory = () => {
    localStorage.removeItem(`coned_mentor_${activeModule}`);
    setMessages([
      {
        id: "msg_init",
        role: "assistant",
        content: currentModule.greeting,
        timestamp: "Just now",
      },
    ]);
    showToast("Chat history cleared.");
  };

  const handleExportSession = () => {
    const markdown = messages
      .map((m) => `### ${m.role === "user" ? currentUser.fullName : "CON-ED AI Mentor"}\n${m.content}\n`)
      .join("\n---\n\n");
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CON-ED-${currentModule.title.replace(/\s+/g, "_")}-Session.md`;
    a.click();
    showToast("Session exported as Markdown!");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-xl bg-[#101916] border border-[#00E69A] text-[#F4FFF9] text-xs font-semibold shadow-[0_0_20px_rgba(0,230,154,0.35)] flex items-center gap-2">
          <Sparkles size={14} className="text-[#00E69A]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Mode Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101916] border border-[#00E69A]/30 text-[#00E69A] text-xs font-semibold mb-2">
            <Sparkles size={14} />
            <span>Futuristic Student Learning Companion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F4FFF9] tracking-tight">
            CON-ED AI Mentor Suite
          </h1>
          <p className="text-xs sm:text-sm text-[#A6B8AE] mt-1">
            Personalized academic guidance tailored to your graduation year ({currentUser.academicYear}rd Year), skills, and career goals.
          </p>
        </div>

        {/* Live Config Badge */}
        <div className="flex items-center gap-2 self-start md:self-end">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#101916] border border-[#23372D] text-xs text-[#00E69A] font-medium">
            <span className="w-2 h-2 rounded-full bg-[#00E69A] animate-pulse" />
            CON-ED Intelligence Active
          </span>
          <button
            type="button"
            onClick={handleExportSession}
            className="p-2 rounded-xl bg-[#101916] border border-[#23372D] text-[#A6B8AE] hover:text-[#F4FFF9] transition-colors"
            title="Export Session as Markdown"
          >
            <Download size={15} />
          </button>
          <button
            type="button"
            onClick={handleClearHistory}
            className="p-2 rounded-xl bg-[#101916] border border-[#23372D] text-[#A6B8AE] hover:text-[#FF5364] transition-colors"
            title="Clear Chat History"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* 5 MODULES SELECTOR CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {MENTOR_MODULES.map((m) => {
          const Icon = m.icon;
          const isSelected = activeModule === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveModule(m.id)}
              className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-3 transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#131F1A] border-[#00E69A] shadow-[0_0_15px_rgba(0,230,154,0.2)] scale-[1.02]"
                  : "bg-[#101916] border-[#23372D] hover:border-[#00E69A]/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`p-2 rounded-xl ${
                    isSelected ? "bg-[#00E69A] text-[#050908]" : "bg-[#18251F] text-[#00E69A]"
                  }`}
                >
                  <Icon size={16} />
                </span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-[#00E69A]" />}
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#F4FFF9]">{m.title}</h3>
                <p className="text-[10px] text-[#71857A] line-clamp-2 mt-1 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-[#71857A] whitespace-nowrap uppercase tracking-wider pl-1">
          Quick Prompts:
        </span>
        {QUICK_ACTIONS.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(action.prompt)}
            className="px-3 py-1.5 rounded-xl bg-[#101916] border border-[#23372D] hover:border-[#00E69A]/50 text-xs font-medium text-[#A6B8AE] hover:text-[#00E69A] whitespace-nowrap transition-all cursor-pointer"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* CHAT CONTAINER */}
      <div className="rounded-3xl bg-[#101916] border border-[#23372D] shadow-xl flex flex-col h-[580px] overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-[#23372D] bg-[#070D0B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#00E69A]/15 border border-[#00E69A]/40 flex items-center justify-center text-[#00E69A]">
              <Sparkles size={18} />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#F4FFF9] flex items-center gap-1.5">
                {currentModule.title}
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00E69A]/20 text-[#00E69A] uppercase font-bold">
                  AI Active
                </span>
              </h2>
              <span className="text-[10px] text-[#71857A]">
                Context: {currentUser.fullName} • {currentUser.college} • {currentUser.department}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClearHistory}
            className="text-xs text-[#71857A] hover:text-[#FF5364] flex items-center gap-1"
          >
            <RefreshCw size={12} />
            <span>Reset</span>
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl overflow-hidden shrink-0 flex items-center justify-center ${
                    isUser
                      ? "border border-[#00E69A]/50 bg-[#131F1A]"
                      : "border border-[#00E69A] bg-[#080F0D] text-[#00E69A]"
                  }`}
                >
                  {isUser ? (
                    <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Sparkles size={16} />
                  )}
                </div>

                <div
                  className={`flex flex-col gap-1 max-w-[85%] sm:max-w-2xl ${
                    isUser ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "bg-[#00E69A] text-[#050908] font-medium rounded-tr-none shadow-[0_0_15px_rgba(0,230,154,0.2)]"
                        : "bg-[#080F0D] text-[#F4FFF9] border border-[#23372D] rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-[#71857A] px-1">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {/* Thinking Animation */}
          {isThinking && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl border border-[#00E69A] bg-[#080F0D] text-[#00E69A] flex items-center justify-center">
                <Sparkles size={16} className="animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#080F0D] border border-[#23372D] text-xs text-[#00E69A] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00E69A] animate-ping" />
                <span>CON-ED AI is reasoning and synthesizing guidance…</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3.5 border-t border-[#23372D] bg-[#070D0B] flex items-center gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask ${currentModule.title} a question or paste code...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#101916] border border-[#23372D] text-xs sm:text-sm text-[#F4FFF9] placeholder-[#71857A] focus:outline-none focus:border-[#00E69A]"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="btn-gradient px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            <Send size={14} />
            <span>Ask AI</span>
          </button>
        </form>
      </div>
    </div>
  );
}

// High-fidelity student companion response generator
function generateIntelligentResponse(
  query: string,
  moduleType: MentorModuleType,
  student: StudentProfile
): string {
  const q = query.toLowerCase();

  if (moduleType === "learning") {
    if (q.includes("python") || q.includes("generator") || q.includes("decorator")) {
      return `### Python Advanced Concepts Breakdown 🐍\n\n**1. Generators & Lazy Evaluation**\nGenerators allow you to produce items one at a time using \`yield\` rather than storing an entire dataset in memory.\n\`\`\`python\ndef fibonacci_stream():\n    a, b = 0, 1\n    while True:\n        yield a\n        a, b = b, a + b\n\`\`\`\n\n**2. Decorators**\nA decorator wraps a function to modify or log its behavior without changing its source:\n\`\`\`python\nimport time\n\ndef benchmark(func):\n    def wrapper(*args, **kwargs):\n        start = time.perf_counter()\n        result = func(*args, **kwargs)\n        print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")\n        return result\n    return wrapper\n\`\`\`\n\nWould you like a set of 3 practice questions to test your understanding?`;
    }
    return `### Understanding: ${query}\n\n1. **Core Concept**:\nTo understand this systematically, let's break it down into first principles. In computer science and applied systems, clarity comes from recognizing how data flows and where state is maintained.\n\n2. **Key Takeaway for Year ${student.academicYear} Students**:\nFocus on edge cases and time/space trade-offs. If this appears in coursework or interviews, state your assumptions before writing implementation code.\n\n3. **Recommended Next Step**:\nTry implementing a minimal 10-line prototype or solving a related problem on LeetCode/Codeforces.`;
  }

  if (moduleType === "career") {
    return `### Career & Placement Roadmap for ${student.fullName} 🎯\n\n**Target**: Top Tier Software Engineering & AI Internships\n\n1. **Resume Focus (Week 1 - 2)**:\n- Highlight quantifiable impact in your projects (e.g. "Reduced API query latency by 45% using Redis caching").\n- Add your ${student.skills.slice(0, 3).map((s) => s.name).join(", ")} competencies at the top.\n\n2. **Technical Interview Sprints (Week 3 - 6)**:\n- Master the top 14 patterns: Sliding Window, Two Pointers, Top K Elements, Fast & Slow Pointers, Monotonic Stack.\n- Complete 2 mock interviews per week with peer study buddies in the 'Competitive Programming' community.\n\n3. **Behavioral STAR Technique**:\nPrepare 4 key stories: Leadership conflict, unexpected technical blocker, high-pressure deadline, and collaborative project win.`;
  }

  if (moduleType === "project") {
    return `### High-Impact Project Blueprint 🚀\n\n**Concept**: "Autonomous Distributed Vector Search for Academic Papers"\n\n- **Frontend**: Next.js 16 with Tailwind CSS and Framer Motion.\n- **Backend**: FastAPI or Rust microservice exposing gRPC endpoints.\n- **Database**: PostgreSQL with pgvector or Qdrant for semantic similarity.\n- **Recruiter Appeal**: Demonstrates end-to-end full stack competence, vector embeddings, and cloud deployment.\n\nWould you like me to generate the database schema or milestone checklist for this project?`;
  }

  if (moduleType === "productivity") {
    return `### Optimized Weekly Study Sprint for ${student.fullName} ⚡\n\n**Weekly Target**: 14 Hours of Deep Focused Work\n\n- **Monday & Wednesday (6:00 PM - 8:30 PM)**: DSA Problem Solving & LeetCode Sprints (No distractions).\n- **Tuesday & Thursday (7:00 PM - 9:00 PM)**: College Coursework & Lab Reports.\n- **Friday Evening (5:00 PM - 7:00 PM)**: Open-Source Project Contribution & Code Review.\n- **Sunday Morning (10:00 AM - 1:00 PM)**: System Design & Research Paper Reading.\n\n*Pro-tip*: Turn on Pomodoro mode (50m study / 10m walk) to maximize retention without burnout.`;
  }

  // Social Mentor
  return `### Collaboration Recommendations for ${student.fullName} 🤝\n\nBased on your profile at **${student.college}** and interests in **${student.interests.join(", ")}**:\n\n1. **Priya Sharma (MIT)**: Researching Graph Neural Networks and Transformers. 96% match.\n2. **Marcus Chen (UC Berkeley)**: Building autonomous drones using ROS2 and C++. 88% match.\n3. **Aisha Patel (Stanford)**: Leading UI/UX systems and design architectures. 92% match.\n\nI recommend sending Priya a message in the Messages tab regarding biochem graph models!`;
}
