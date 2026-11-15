"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  MessageCircle,
  Bell,
  User,
  Settings,
  X,
} from "lucide-react";

interface RadialItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  color: string;
}

// Exactly FIVE items as requested by CON-ED UI/UX specification
const radialItems: RadialItem[] = [
  { id: "home", label: "Home", href: "/home", icon: Home, color: "#00E69A" },
  { id: "messages", label: "Messages", href: "/messages", icon: MessageCircle, color: "#4DA9FF" },
  { id: "notifications", label: "Notifications", href: "/notifications", icon: Bell, color: "#FFC15A" },
  { id: "profile", label: "Profile", href: "/profile", icon: User, color: "#F4FFF9" },
  { id: "settings", label: "Settings", href: "/settings", icon: Settings, color: "#A6B8AE" },
];

export function RadialMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNavigate = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  // Radial geometry: 5 items evenly spread from 85° (top) down to 5° (right)
  const radius = 118; // px radius from the button center
  const totalItems = radialItems.length;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 left-6 z-50 select-none print:hidden"
      aria-label="CON-ED Radial Navigation"
    >
      {/* Background Dimmer when open */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/55 backdrop-blur-[2px] -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Radiating Satellite Items */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-3 left-3 pointer-events-none">
            {radialItems.map((item, index) => {
              // 5 points: 84° down to 6° for balanced spacing in the upper-right quadrant
              const startAngle = 84;
              const endAngle = 6;
              const angleDeg = startAngle - (index / (totalItems - 1)) * (startAngle - endAngle);
              const angleRad = (angleDeg * Math.PI) / 180;

              // x and y offsets (y is negative for upwards)
              const x = Math.cos(angleRad) * radius;
              const y = -Math.sin(angleRad) * radius;

              const Icon = item.icon;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.3 }}
                  animate={{
                    opacity: 1,
                    x: x,
                    y: y,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 380,
                      damping: 25,
                      delay: index * 0.03,
                    },
                  }}
                  exit={{
                    opacity: 0,
                    x: 0,
                    y: 0,
                    scale: 0.3,
                    transition: { duration: 0.14 },
                  }}
                  className="absolute pointer-events-auto"
                  style={{ transformOrigin: "center center" }}
                >
                  <button
                    type="button"
                    onClick={() => handleNavigate(item.href)}
                    className="relative group w-11 h-11 rounded-full bg-[#101916] border border-[#23372D] hover:border-[#00E69A] flex items-center justify-center text-[#F4FFF9] hover:text-[#00E69A] shadow-[0_4px_16px_rgba(0,0,0,0.6)] hover:shadow-[0_0_18px_rgba(0,230,154,0.4)] transition-all duration-200 cursor-pointer"
                    aria-label={item.label}
                    title={item.label}
                  >
                    <Icon size={18} />

                    {/* Subtle Glow Ring */}
                    <span className="absolute inset-0 rounded-full border border-[#00E69A]/30 opacity-0 group-hover:opacity-100 group-hover:scale-120 transition-all duration-300 pointer-events-none" />

                    {/* Tooltip on Hover / Focus */}
                    <div className="absolute left-full ml-2 px-2.5 py-1 rounded-md bg-[#18251F] border border-[#23372D] text-[#F4FFF9] text-[11px] font-semibold whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-20">
                      {item.label}
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* Main Circular Button fixed at extreme bottom-left corner */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
          isOpen
            ? "bg-[#00E69A] text-[#050908] shadow-[0_0_30px_rgba(0,230,154,0.8)] rotate-90"
            : "bg-[#070D0B] text-[#00E69A] border-2 border-[#00E69A] shadow-[0_0_20px_rgba(0,230,154,0.35)] hover:shadow-[0_0_30px_rgba(0,230,154,0.55)] hover:scale-105"
        }`}
        aria-label={isOpen ? "Close CON-ED Navigation Menu" : "Open CON-ED Radial Navigation Menu"}
        title="CON-ED Navigation Menu"
      >
        {/* Subtle idle ring */}
        {!isOpen && (
          <span className="absolute -inset-1.5 rounded-full border border-[#00E69A]/30 pointer-events-none" />
        )}

        {isOpen ? (
          <X size={22} className="stroke-[2.5]" />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-7 h-7 drop-shadow-[0_0_8px_rgba(0,230,154,0.6)]"
          >
            <path
              d="M12 3L2 8.5L12 14L22 8.5L12 3Z"
              fill="currentColor"
              fillOpacity="0.25"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M6 11V16.5C6 18.5 8.68629 20.5 12 20.5C15.3137 20.5 18 18.5 18 16.5V11"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M20 9.5V16L21.5 17.5"
              stroke="#67F5B8"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
