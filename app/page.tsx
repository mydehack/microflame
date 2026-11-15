'use client';

import React, { useState } from 'react';
import { SimulationProvider, useSimulationStore } from '../lib/store/simulation-store';
import { LeftPanelConditions } from '../components/dashboard/LeftPanelConditions';
import { CenterFlame2D } from '../components/dashboard/CenterFlame2D';
import { RightPanelMetrics } from '../components/dashboard/RightPanelMetrics';
import { BottomPanelGraphs } from '../components/dashboard/BottomPanelGraphs';
import { RadialMenu } from '../components/navigation/RadialMenu';
import { ExportModal } from '../components/modals/ExportModal';
import { UserAccessModal } from '../components/modals/UserAccessModal';

import { AnalysisWorkspace } from '../components/workspaces/AnalysisWorkspace';
import { VisualizationWorkspace } from '../components/workspaces/VisualizationWorkspace';
import { ResearchBotWorkspace } from '../components/workspaces/ResearchBotWorkspace';
import { ReportsWorkspace } from '../components/workspaces/ReportsWorkspace';
import { ComparisonWorkspace } from '../components/workspaces/ComparisonWorkspace';
import { SafetyWorkspace } from '../components/workspaces/SafetyWorkspace';
import { Radio, Download, User, GraduationCap, ShieldCheck, HelpCircle } from 'lucide-react';
import { SmartHoverGuide } from '../components/ui/SmartHoverGuide';

function MainAppContent() {
  const { 
    activeTab, 
    isRunning, 
    profile, 
    userRole, 
    hoverHelpSettings, 
    setHoverHelpSettings 
  } = useSimulationStore();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#070F21] text-[#D9E0EE] scientific-grid relative">
      {/* 
        Minimal, uncluttered dashboard utility header.
        Per requirements: Traditional top navigation bar, NASA logo/icon, large title, 
        and permanent workspace tabs have been completely removed.
      */}
      <header className="h-10 px-4 md:px-6 border-b border-[#1B64DD]/20 bg-[#070F21]/80 backdrop-blur-sm flex items-center justify-between z-20">
        {/* Solver Telemetry Status Indicator */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#A7B1D2]">
          <Radio className="w-3 h-3 text-[#16A34A] animate-pulse" />
          <span>SOLVER STATUS:</span>
          <span className="text-[#2694EE] font-bold">
            {isRunning ? 'CALCULATING (ACTIVE RUN)' : 'PHYSICS ENGINE READY'}
          </span>
          <span className="text-[#1B64DD]/40">•</span>
          <span className="text-[#A7B1D2]">10⁻⁶ g FREEFALL ENVIRONMENT</span>
        </div>

        {/* Minimal Right Utilities (Role Badge, Guide Toggle, Export & Researcher Profile) */}
        <div className="flex items-center gap-2">
          {/* Role Status Badge */}
          <SmartHoverGuide id="setting_userRole">
            <button
              onClick={() => setShowUserModal(true)}
              className={`px-2.5 py-1 rounded border text-xs font-mono flex items-center gap-1.5 transition ${
                userRole === 'beginner'
                  ? 'bg-[#F79628]/15 border-[#F79628]/40 text-[#F79628] hover:bg-[#F79628]/25'
                  : 'bg-[#16A34A]/15 border-[#16A34A]/40 text-[#16A34A] hover:bg-[#16A34A]/25'
              }`}
              title="Click to Switch User Role (Beginner / Researcher)"
            >
              {userRole === 'beginner' ? (
                <>
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span className="font-bold">Beginner Mode</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="font-bold">Researcher Mode</span>
                </>
              )}
            </button>
          </SmartHoverGuide>

          {/* Quick Hover Guide Toggle (Visible in Beginner role) */}
          {userRole === 'beginner' && (
            <SmartHoverGuide id="setting_smartHoverGuide">
              <button
                onClick={() => setHoverHelpSettings({ enabled: !hoverHelpSettings.enabled })}
                className={`px-2 py-1 rounded border text-[11px] font-mono flex items-center gap-1 transition ${
                  hoverHelpSettings.enabled
                    ? 'bg-[#2694EE]/20 border-[#2694EE] text-[#2694EE] font-bold'
                    : 'bg-[#0D2554] border-[#1B64DD]/40 text-[#A7B1D2] hover:text-white'
                }`}
                title="Toggle Smart Hover Guide Tooltips"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Guide: {hoverHelpSettings.enabled ? 'ON' : 'OFF'}</span>
              </button>
            </SmartHoverGuide>
          )}

          <SmartHoverGuide id="exportSuite">
            <button
              onClick={() => setShowExportModal(true)}
              className="px-2.5 py-1 rounded bg-[#0D2554] border border-[#1B64DD]/40 text-[#2694EE] hover:bg-[#164E9E] hover:text-white transition flex items-center gap-1.5 text-xs font-mono"
              title="Open Scientific Export Suite"
            >
              <Download className="w-3.5 h-3.5 text-[#2694EE]" />
              <span className="hidden sm:inline">Export Suite</span>
            </button>
          </SmartHoverGuide>

          <SmartHoverGuide id="setting_userRole">
            <button
              onClick={() => setShowUserModal(true)}
              className="px-2.5 py-1 rounded bg-[#0D2554] border border-[#1B64DD]/40 text-[#D9E0EE] hover:bg-[#164E9E] transition flex items-center gap-1.5 text-xs font-mono"
              title="Researcher Access Profile & Preferences"
            >
              <User className="w-3.5 h-3.5 text-[#2694EE]" />
              <span className="hidden sm:inline">{profile.name}</span>
            </button>
          </SmartHoverGuide>
        </div>
      </header>

      {/* Main Dynamic Viewport Container */}
      <main className="flex-1 flex flex-col p-3 md:p-5 overflow-hidden">
        {activeTab === 'dashboard' && (
          <div className="flex-1 flex flex-col space-y-3.5 max-w-[1920px] mx-auto w-full">
            {/* Top Tri-Panel Grid */}
            <div className="flex-1 flex flex-col lg:flex-row gap-3.5 min-h-[580px]">
              {/* Left Panel: Experimental Conditions (11 Conditions) */}
              <LeftPanelConditions />

              {/* Center Panel: Photorealistic 2D Animated Thruster Flame Simulation (PixiJS/GLSL) */}
              <CenterFlame2D />

              {/* Right Panel: Scientific Metrics & Key Insights */}
              <RightPanelMetrics />
            </div>

            {/* Bottom Panel: Interactive Time-Series Graphs */}
            <BottomPanelGraphs />
          </div>
        )}

        {/* 6 Dedicated Radial Workspaces (Accessible strictly via bottom-left radial menu) */}
        {activeTab === 'analysis' && <AnalysisWorkspace />}
        {activeTab === 'visualization' && <VisualizationWorkspace />}
        {activeTab === 'research-bot' && <ResearchBotWorkspace />}
        {activeTab === 'reports' && <ReportsWorkspace />}
        {activeTab === 'comparison' && <ComparisonWorkspace />}
        {activeTab === 'safety' && <SafetyWorkspace />}
      </main>

      {/* Persistent Bottom-Left Circular Radial Navigation Menu (Exactly 6 options) */}
      <RadialMenu />

      {/* Modals */}
      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
      <UserAccessModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
    </div>
  );
}

export default function FlameInFreefallPage() {
  return (
    <SimulationProvider>
      <MainAppContent />
    </SimulationProvider>
  );
}
