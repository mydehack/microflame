'use client';

import React, { useState } from 'react';
import { 
  Rocket, 
  ExternalLink, 
  Search
} from 'lucide-react';
import { NASA_ENGINE_CATALOGUE } from '../../lib/data/nasa-engines';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { EngineSelectorModal } from './EngineSelectorModal';
import { SmartHoverGuide } from '../ui/SmartHoverGuide';

export function EngineSelectorBar() {
  const { selectedEngine, selectEngine } = useSimulationStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="w-full glass-panel border border-[#1B64DD]/40 bg-[#0D2554]/80 rounded-xl px-4 py-2.5 shadow-lg flex flex-wrap items-center justify-between gap-3">
        {/* Left: Active Engine Identity & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-[#0D2554] via-[#1B64DD] to-[#2694EE] p-0.5 shadow-[0_0_15px_rgba(38,148,238,0.4)] flex items-center justify-center">
            <Rocket className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs sm:text-sm text-[#D9E0EE] tracking-wide">
                {selectedEngine.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40 font-bold hidden sm:inline-block">
                {selectedEngine.completenessStatus === 'User Created' ? 'USER MODEL' : 'NASA VERIFIED'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#A7B1D2] font-mono mt-0.5">
              <span>{selectedEngine.manufacturer}</span>
              <span className="text-[#1B64DD]">•</span>
              <span className="text-[#2694EE]">{selectedEngine.propellant}</span>
              {selectedEngine.oxidizer && (
                <>
                  <span className="text-[#A7B1D2]/60">/</span>
                  <span className="text-[#2694EE]">{selectedEngine.oxidizer}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center: Key Documented Parameters Pill */}
        <div className="hidden xl:flex items-center gap-3 bg-[#070F21]/70 px-3 py-1.5 rounded-lg border border-[#1B64DD]/30 text-xs font-mono">
          <div>
            <span className="text-[#A7B1D2] text-[9px] block">DOCUMENTED THRUST</span>
            <span className="text-[#2694EE] font-bold">
              {selectedEngine.thrust.isDocumented ? `${selectedEngine.thrust.value} ${selectedEngine.thrust.unit}` : 'N/A in source'}
            </span>
          </div>

          <div className="w-[1px] h-6 bg-[#1B64DD]/30" />

          <div>
            <span className="text-[#A7B1D2] text-[9px] block">VACUUM ISP</span>
            <span className="text-[#F79628] font-bold">
              {selectedEngine.specificImpulse.isDocumented ? `${selectedEngine.specificImpulse.value} s` : 'N/A in source'}
            </span>
          </div>

          <div className="w-[1px] h-6 bg-[#1B64DD]/30" />

          <div>
            <span className="text-[#A7B1D2] text-[9px] block">CHAMBER P_c</span>
            <span className="text-[#D9E0EE] font-bold">
              {selectedEngine.chamberPressure.isDocumented ? `${selectedEngine.chamberPressure.value} ${selectedEngine.chamberPressure.unit}` : 'N/A in source'}
            </span>
          </div>

          <div className="w-[1px] h-6 bg-[#1B64DD]/30" />

          <div>
            <span className="text-[#A7B1D2] text-[9px] block">SOURCE REPORT</span>
            <a
              href={selectedEngine.sourceDocumentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[#2694EE] hover:underline flex items-center gap-1 font-bold"
              title="Open source document on NASA NTRS"
            >
              <span>{selectedEngine.sourceReportIdentifier}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Right: Quick Switcher Dropdown & Catalogue Browse Button */}
        <SmartHoverGuide id="engineSelector" className="flex items-center gap-2">
          {/* Quick Dropdown */}
          <select
            value={selectedEngine.id}
            onChange={(e) => {
              const eng = NASA_ENGINE_CATALOGUE.find((x) => x.id === e.target.value);
              if (eng) selectEngine(eng);
            }}
            className="bg-[#070F21] border border-[#1B64DD]/50 rounded-lg px-2.5 py-1.5 text-xs text-[#D9E0EE] focus:outline-none focus:border-[#2694EE] max-w-[190px] truncate"
          >
            {NASA_ENGINE_CATALOGUE.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.name}
              </option>
            ))}
          </select>

          {/* Browse Catalog Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#1B64DD] via-[#2694EE] to-[#E8671C] text-white font-bold text-xs hover:brightness-110 transition shadow-[0_0_15px_rgba(38,148,238,0.4)] flex items-center gap-1.5 whitespace-nowrap"
          >
            <Search className="w-3.5 h-3.5" />
            <span>NASA Engine Explorer</span>
          </button>
        </SmartHoverGuide>
      </div>

      {/* Full Explorer Modal */}
      <EngineSelectorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}

