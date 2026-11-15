'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Compass, 
  Microscope, 
  Eye, 
  Bot, 
  FileText, 
  Scale, 
  ShieldAlert
} from 'lucide-react';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { WorkspaceTab } from '../../lib/types/simulation';
import { SmartHoverGuide } from '../ui/SmartHoverGuide';

interface RadialNode {
  tab: WorkspaceTab;
  label: string;
  icon: React.ElementType;
  angleDeg: number; // Angle in degrees relative to bottom-left quadrant (0 to 90 degrees)
  color: string;
  glow: string;
}

export function RadialMenu() {
  const { activeTab, setActiveTab } = useSimulationStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Exactly six options according to specification:
  // 1. Analysis, 2. Visualization, 3. Research Bot, 4. Reports, 5. Comparison, 6. Safety
  const radialNodes: RadialNode[] = [
    {
      tab: 'analysis',
      label: 'Analysis',
      icon: Microscope,
      angleDeg: 90, // Straight Up (12 o'clock relative to corner)
      color: '#2694EE',
      glow: 'rgba(38, 148, 238, 0.6)',
    },
    {
      tab: 'visualization',
      label: 'Visualization',
      icon: Eye,
      angleDeg: 72,
      color: '#1B64DD',
      glow: 'rgba(27, 100, 221, 0.6)',
    },
    {
      tab: 'research-bot',
      label: 'Research Bot',
      icon: Bot,
      angleDeg: 54,
      color: '#F79628',
      glow: 'rgba(247, 150, 40, 0.6)',
    },
    {
      tab: 'reports',
      label: 'Reports',
      icon: FileText,
      angleDeg: 36,
      color: '#8B35E8',
      glow: 'rgba(139, 53, 232, 0.6)',
    },
    {
      tab: 'comparison',
      label: 'Comparison',
      icon: Scale,
      angleDeg: 18,
      color: '#16A34A',
      glow: 'rgba(22, 163, 74, 0.6)',
    },
    {
      tab: 'safety',
      label: 'Safety',
      icon: ShieldAlert,
      angleDeg: 0, // Horizontal Right (3 o'clock relative to corner)
      color: '#E8671C',
      glow: 'rgba(232, 103, 28, 0.6)',
    },
  ];

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const radius = 135; // Distance in pixels from center trigger

  return (
    <div ref={menuRef} className="fixed bottom-6 left-6 z-50">
      {/* Hover Tooltip Display Pill */}
      {hoveredLabel && (
        <div 
          className="absolute bottom-20 left-1 bg-[#0D2554]/95 text-[#D9E0EE] text-xs font-bold px-3 py-1.5 rounded-lg border border-[#2694EE] shadow-[0_0_15px_rgba(38,148,238,0.5)] whitespace-nowrap pointer-events-none transition-all duration-200 z-50 backdrop-blur-md"
        >
          {hoveredLabel}
        </div>
      )}

      {/* Radial Nodes Fan: Exactly 6 Options */}
      {isOpen && (
        <div className="absolute inset-0 pointer-events-none">
          {radialNodes.map((node, index) => {
            const rad = (node.angleDeg * Math.PI) / 180;
            const x = Math.cos(rad) * radius;
            const y = -Math.sin(rad) * radius; // inverted y for upward
            const isSelected = activeTab === node.tab;
            const Icon = node.icon;

            return (
              <button
                key={node.tab}
                onClick={() => {
                  if (isSelected) {
                    setActiveTab('dashboard');
                  } else {
                    setActiveTab(node.tab);
                  }
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHoveredLabel(isSelected ? `${node.label} (Return to Dashboard)` : node.label)}
                onMouseLeave={() => setHoveredLabel(null)}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  transitionDelay: `${index * 25}ms`,
                }}
                className={`pointer-events-auto absolute bottom-1 left-1 w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 transform hover:scale-125 shadow-xl ${
                  isSelected
                    ? 'bg-[#1B64DD] border-white text-white shadow-[0_0_20px_rgba(38,148,238,0.8)] scale-110'
                    : 'bg-[#0D2554] border-[#1B64DD] text-[#D9E0EE] hover:border-[#2694EE] hover:text-[#2694EE]'
                }`}
                title={node.label}
              >
                <Icon className="w-5 h-5" style={{ color: isSelected ? '#FFFFFF' : node.color }} />
              </button>
            );
          })}
        </div>
      )}

      {/* Floating AI Shortcut Button (Above Navigation Wheel) */}
      <div className="absolute -top-14 left-1.5 z-40">
        <SmartHoverGuide id="nav_aiShortcut">
          <button
            onClick={() => setActiveTab(activeTab === 'research-bot' ? 'dashboard' : 'research-bot')}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 border-2 shadow-lg ${
              activeTab === 'research-bot'
                ? 'bg-gradient-to-r from-[#E8671C] to-[#F79628] border-white text-white shadow-[0_0_20px_rgba(247,150,40,0.8)] scale-105'
                : 'bg-[#0D2554] border-[#F79628]/60 text-[#F79628] hover:bg-[#F79628]/20 shadow-[0_0_15px_rgba(247,150,40,0.3)]'
            }`}
            title="Open Groq AI Research Bot"
          >
            <Bot className="w-5 h-5" />
          </button>
        </SmartHoverGuide>
      </div>

      {/* Main Bottom-Left Radial Trigger Icon */}
      <SmartHoverGuide id="nav_radialButton">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 border-2 shadow-2xl ${
            isOpen
              ? 'bg-[#E8671C] border-white text-white rotate-45 shadow-[0_0_25px_rgba(232,103,28,0.8)]'
              : activeTab !== 'dashboard'
              ? 'bg-[#1B64DD] border-[#2694EE] text-white shadow-[0_0_20px_rgba(38,148,238,0.7)]'
              : 'bg-[#0D2554] border-[#2694EE] text-[#2694EE] hover:bg-[#164E9E] shadow-[0_0_20px_rgba(38,148,238,0.4)]'
          }`}
          title="Open Radial Navigation Menu"
        >
          <Compass className="w-7 h-7" />
          
          {/* Active Workspace Indicator Badge */}
          {activeTab !== 'dashboard' && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E8671C] border border-[#070F21] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
              ●
            </span>
          )}
        </button>
      </SmartHoverGuide>
    </div>
  );
}
