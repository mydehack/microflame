'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  ArrowRight, 
  Bot, 
  Activity,
  X
} from 'lucide-react';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { getHoverExplanation, HoverExplanation } from '../../lib/data/smart-hover-explanations';

interface SmartHoverGuideProps {
  id: string;
  customExplanation?: Partial<HoverExplanation>;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  className?: string;
  disabled?: boolean;
}

export function SmartHoverGuide({
  id,
  customExplanation,
  children,
  position = 'auto',
  className = '',
  disabled = false,
}: SmartHoverGuideProps) {
  const { 
    userRole, 
    hoverHelpSettings, 
    conditions, 
    selectedEngine, 
    currentResult,
    askBotToExplainContext 
  } = useSimulationStore();

  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; placement: 'top' | 'bottom' | 'left' | 'right' }>({
    top: 0,
    left: 0,
    placement: 'bottom',
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  // Retrieve explanation from dictionary or custom override
  const baseExplanation = getHoverExplanation(id);
  const explanation: HoverExplanation | undefined = baseExplanation
    ? { ...baseExplanation, ...customExplanation }
    : customExplanation?.title
    ? (customExplanation as HoverExplanation)
    : undefined;

  // Active check: Only enable when smartHoverGuide is true and role is Beginner (or explicitly enabled)
  const isHelpActive = !disabled && Boolean(
    explanation && hoverHelpSettings?.smartHoverGuide && (userRole === 'beginner' || hoverHelpSettings?.enabled)
  );

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const cardWidth = 320;
    const cardHeight = 240;
    const padding = 12;

    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceRight = window.innerWidth - rect.right;
    const spaceLeft = rect.left;

    let chosenPlacement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

    if (position !== 'auto') {
      chosenPlacement = position;
    } else {
      if (spaceBelow >= cardHeight + padding) {
        chosenPlacement = 'bottom';
      } else if (spaceAbove >= cardHeight + padding) {
        chosenPlacement = 'top';
      } else if (spaceRight >= cardWidth + padding) {
        chosenPlacement = 'right';
      } else if (spaceLeft >= cardWidth + padding) {
        chosenPlacement = 'left';
      } else {
        chosenPlacement = 'bottom';
      }
    }

    let top = 0;
    let left = 0;

    if (chosenPlacement === 'bottom') {
      top = rect.bottom + 8;
      left = Math.max(padding, Math.min(rect.left + rect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - padding));
    } else if (chosenPlacement === 'top') {
      top = Math.max(padding, rect.top - cardHeight - 8);
      left = Math.max(padding, Math.min(rect.left + rect.width / 2 - cardWidth / 2, window.innerWidth - cardWidth - padding));
    } else if (chosenPlacement === 'right') {
      top = Math.max(padding, Math.min(rect.top, window.innerHeight - cardHeight - padding));
      left = Math.min(window.innerWidth - cardWidth - padding, rect.right + 8);
    } else if (chosenPlacement === 'left') {
      top = Math.max(padding, Math.min(rect.top, window.innerHeight - cardHeight - padding));
      left = Math.max(padding, rect.left - cardWidth - 8);
    }

    setCoords({ top, left, placement: chosenPlacement });
  };

  const handleMouseEnter = () => {
    if (!isHelpActive) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      calculatePosition();
      setIsVisible(true);
    }, 350); // 350ms delay per specifications
  };

  const handleMouseLeave = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsVisible(false);
  };

  const handleTouchToggle = (e: React.MouseEvent) => {
    if (!isHelpActive) return;
    if (window.matchMedia('(pointer: coarse)').matches) {
      e.preventDefault();
      calculatePosition();
      setIsVisible((prev) => !prev);
    }
  };

  const handleFocus = () => {
    if (!isHelpActive) return;
    calculatePosition();
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Close on outside click for touch devices
  useEffect(() => {
    if (!isVisible) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        cardRef.current &&
        !cardRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('touchstart', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isVisible]);

  // If help is disabled, render children bare (clean researcher experience)
  if (!isHelpActive || !explanation) {
    return <div className={`inline-flex ${className}`}>{children}</div>;
  }

  const currentValue = explanation.currentValueFn
    ? explanation.currentValueFn(conditions, selectedEngine, currentResult)
    : undefined;

  const handleExplainMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    askBotToExplainContext({
      id: explanation.id,
      name: explanation.title,
      category: explanation.category,
      currentValue: currentValue || undefined,
      unit: explanation.unit,
      whatIsThis: explanation.whatIsThis,
      howToUseIt: explanation.howToUseIt,
      whatHappensIfChanged: explanation.whatHappensIfChanged,
      scientificNote: explanation.scientificNote,
    });
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleTouchToggle}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`relative inline-flex group ${className}`}
    >
      {children}

      {/* Floating Smart Hover Explanation Card */}
      {isVisible && (
        <div
          ref={cardRef}
          style={{
            position: 'fixed',
            top: `${coords.top}px`,
            left: `${coords.left}px`,
            zIndex: 9999,
          }}
          className="w-80 p-3.5 rounded-xl bg-[#070F21]/95 border border-[#1B64DD] shadow-[0_0_25px_rgba(27,100,221,0.4),0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md text-[#D9E0EE] animate-in fade-in zoom-in-95 duration-150 pointer-events-auto select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1B64DD]/40 pb-2 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded bg-[#2694EE]/20 text-[#2694EE] border border-[#2694EE]/30">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#D9E0EE] flex items-center gap-1 leading-tight">
                  {explanation.title}
                </h4>
                <span className="text-[9px] font-mono text-[#2694EE] uppercase tracking-wider block">
                  {explanation.category}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsVisible(false)}
              className="text-[#A7B1D2] hover:text-white p-0.5 rounded sm:hidden"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Live Value Callout (if applicable) */}
          {currentValue !== undefined && (
            <div className="mb-2 px-2 py-1 rounded bg-[#0D2554] border border-[#1B64DD]/30 flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#A7B1D2] flex items-center gap-1">
                <Activity className="w-3 h-3 text-[#2694EE]" />
                Current Setting:
              </span>
              <span className="text-[#F79628] font-bold">{currentValue}</span>
            </div>
          )}

          {/* 4-Part Structured Explanation Hierarchy */}
          <div className="space-y-2 text-[11px] leading-relaxed">
            {/* 1. WHAT IS THIS? */}
            <div>
              <span className="text-[9px] font-mono text-[#2694EE] font-bold uppercase tracking-wider block">
                1. What is this?
              </span>
              <p className="text-[#D9E0EE] mt-0.5">{explanation.whatIsThis}</p>
            </div>

            {/* 2. HOW TO USE IT */}
            <div>
              <span className="text-[9px] font-mono text-[#16A34A] font-bold uppercase tracking-wider block">
                2. How to use it:
              </span>
              <p className="text-[#A7B1D2] mt-0.5">{explanation.howToUseIt}</p>
            </div>

            {/* 3. WHAT HAPPENS IF YOU CHANGE IT? */}
            {hoverHelpSettings?.detailedExplanations !== false && (
              <div>
                <span className="text-[9px] font-mono text-[#E8671C] font-bold uppercase tracking-wider block">
                  3. What happens if you change it?
                </span>
                <p className="text-[#A7B1D2] mt-0.5">{explanation.whatHappensIfChanged}</p>
              </div>
            )}

            {/* 4. SCIENTIFIC NOTE (Optional per user preference) */}
            {hoverHelpSettings?.scientificNotes !== false && explanation.scientificNote && (
              <div className="p-2 rounded bg-[#0D2554]/60 border border-[#1B64DD]/25 mt-1.5">
                <span className="text-[9px] font-mono text-[#F79628] font-bold uppercase tracking-wider flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Scientific Note:
                </span>
                <p className="text-[10px] text-[#A7B1D2] italic mt-0.5 leading-snug">
                  {explanation.scientificNote}
                </p>
              </div>
            )}
          </div>

          {/* Footer: Explain More in Research Bot */}
          {hoverHelpSettings?.explainMoreEnabled !== false && (
            <div className="mt-2.5 pt-2 border-t border-[#1B64DD]/30 flex items-center justify-between">
              <span className="text-[9px] text-[#A7B1D2]/80 font-mono">
                Beginner Smart Guide
              </span>
              <button
                onClick={handleExplainMore}
                className="px-2 py-0.5 rounded bg-[#1B64DD]/30 hover:bg-[#1B64DD] border border-[#2694EE]/40 text-[#2694EE] hover:text-white transition text-[10px] font-bold flex items-center gap-1 shadow-sm"
              >
                <Bot className="w-3 h-3 text-[#F79628]" />
                <span>Explain more with AI</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
