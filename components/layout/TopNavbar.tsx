'use client';

import React, { useState } from 'react';
import { 
  Flame, 
  Download, 
  User, 
  Bot, 
  Radio,
  HelpCircle,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { WorkspaceTab } from '../../lib/types/simulation';
import { ExportModal } from '../modals/ExportModal';
import { UserAccessModal } from '../modals/UserAccessModal';
import { SmartHoverGuide } from '../ui/SmartHoverGuide';

export function TopNavbar() {
  const { 
    activeTab, 
    setActiveTab, 
    userRole, 
    hoverHelpSettings, 
    setHoverHelpSettings, 
    profile, 
    isRunning 
  } = useSimulationStore();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  return (
    <>
      <header className="h-16 px-6 border-b border-[#1B64DD]/40 bg-[#070F21]/90 backdrop-blur-md flex items-center justify-between z-30 sticky top-0 shadow-lg">
        {/* Left: Branding & Research Subtitle */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="cursor-pointer flex items-center gap-2.5 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0D2554] via-[#1B64DD] to-[#E8671C] p-0.5 shadow-[0_0_20px_rgba(232,103,28,0.5)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#070F21] rounded-[10px] flex items-center justify-center">
                <Flame className="w-6 h-6 text-[#E8671C] fill-[#F79628]/40 animate-pulse" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider bg-gradient-to-r from-white via-[#D9E0EE] to-[#2694EE] bg-clip-text text-transparent">
                  FLAME IN FREEFALL
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#1B64DD]/30 text-[#2694EE] border border-[#2694EE]/40 font-bold">
                  v2.4
                </span>
              </div>
              <p className="text-[10px] text-[#A7B1D2] tracking-wide">
                AI-Assisted Microgravity Combustion & Freefall Research Platform
              </p>
            </div>
          </div>

          {/* Engine Status Tag */}
          <div className="hidden xl:flex items-center gap-2 ml-4 pl-4 border-l border-[#1B64DD]/30 text-[11px] font-mono text-[#A7B1D2]">
            <Radio className="w-3.5 h-3.5 text-[#16A34A] animate-pulse" />
            <span>SOLVER:</span>
            <span className="text-[#2694EE] font-bold">
              {isRunning ? 'CALCULATING (RUNNING)' : 'PHYSICS ENGINE READY'}
            </span>
            <span className="text-[#1B64DD]">|</span>
            <span className="text-[#A7B1D2]">NASA CIR ARCHIVE</span>
          </div>
        </div>

        {/* Center: Quick Workspace Indicator Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-[#0D2554]/60 p-1 rounded-xl border border-[#1B64DD]/30 text-xs">
          {(
            [
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'analysis', label: 'Analysis' },
              { id: 'visualization', label: '3D Studio' },
              { id: 'research-bot', label: 'Research Bot' },
              { id: 'reports', label: 'Reports' },
              { id: 'comparison', label: 'Comparison' },
              { id: 'safety', label: 'Safety' },
            ] as const satisfies Array<{ id: WorkspaceTab; label: string }>
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-lg font-medium transition ${
                activeTab === tab.id
                  ? 'bg-[#1B64DD] text-white shadow-[0_0_10px_rgba(38,148,238,0.5)]'
                  : 'text-[#A7B1D2] hover:text-[#D9E0EE]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Action Icons & User Mode */}
        <div className="flex items-center gap-2.5">
          {/* Smart Hover Guide Quick Switcher */}
          <SmartHoverGuide id="setting_smartHoverGuide">
            <button
              onClick={() => setHoverHelpSettings({ smartHoverGuide: !hoverHelpSettings.smartHoverGuide })}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 ${
                hoverHelpSettings.smartHoverGuide
                  ? 'bg-[#16A34A]/20 border-[#16A34A] text-[#16A34A] shadow-[0_0_10px_rgba(22,163,74,0.3)]'
                  : 'bg-[#0D2554] border-[#1B64DD]/40 text-[#A7B1D2] hover:text-white'
              }`}
              title="Toggle Smart Hover Guide"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[11px] font-mono">
                Guide: {hoverHelpSettings.smartHoverGuide ? 'ON' : 'OFF'}
              </span>
            </button>
          </SmartHoverGuide>

          {/* Research Bot Quick Pill */}
          <SmartHoverGuide id="nav_aiShortcut">
            <button
              onClick={() => setActiveTab('research-bot')}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1.5 shadow ${
                activeTab === 'research-bot'
                  ? 'bg-[#F79628] text-[#070F21] border-[#F79628]'
                  : 'bg-[#0D2554] border-[#F79628]/40 text-[#F79628] hover:bg-[#F79628]/10'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">Research Bot</span>
            </button>
          </SmartHoverGuide>

          {/* Export Suite Button */}
          <SmartHoverGuide id="exportSuite">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[#1B64DD] hover:bg-[#2694EE] text-white font-bold text-xs transition flex items-center gap-1.5 shadow-[0_0_15px_rgba(38,148,238,0.4)]"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Suite</span>
            </button>
          </SmartHoverGuide>

          {/* Researcher User Account Pill */}
          <SmartHoverGuide id="setting_userRole">
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center gap-2 p-1.5 pl-2.5 rounded-lg bg-[#0D2554] border border-[#1B64DD]/40 text-xs hover:border-[#2694EE] transition"
            >
              <div className="text-right hidden sm:block">
                <div className="font-bold text-[#D9E0EE] leading-tight text-[11px]">{profile.name}</div>
                <div className="text-[10px] text-[#2694EE] font-mono leading-tight flex items-center justify-end gap-1">
                  {userRole === 'beginner' ? (
                    <>
                      <GraduationCap className="w-3 h-3 text-[#16A34A]" />
                      <span className="text-[#16A34A] font-bold">Beginner Explorer</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-3 h-3 text-[#2694EE]" />
                      <span>NASA Scientist</span>
                    </>
                  )}
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-[#1B64DD]/30 border border-[#2694EE] flex items-center justify-center text-[#2694EE]">
                <User className="w-4 h-4" />
              </div>
            </button>
          </SmartHoverGuide>
        </div>
      </header>

      {/* Modals */}
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
      <UserAccessModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
    </>
  );
}

