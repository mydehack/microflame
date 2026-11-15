'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ArrowLeft, 
  AlertTriangle, 
  Flame, 
  Wind, 
  Info,
  Sparkles, 
  Bot, 
  Copy, 
  Check 
} from 'lucide-react';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { analyzeSafetyAI } from '../../lib/services/groq-research-bot-service';

export function SafetyWorkspace() {
  const { currentResult, conditions, setActiveTab } = useSimulationStore();
  const { summaryMetrics } = currentResult;

  const [aiSafetyReport, setAiSafetyReport] = useState<string | null>(null);
  const [isAnalyzingSafety, setIsAnalyzingSafety] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateSafetyAI = async () => {
    setIsAnalyzingSafety(true);
    try {
      const text = await analyzeSafetyAI(conditions, summaryMetrics, 'guided');
      setAiSafetyReport(text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzingSafety(false);
    }
  };

  const handleCopySafety = () => {
    if (aiSafetyReport) {
      navigator.clipboard.writeText(aiSafetyReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Spacecraft fire safety screening checks
  const isHypoxic = conditions.oxygenConcentration < 16.0;
  const isEnriched = conditions.oxygenConcentration > 25.0;
  const isHighPressure = conditions.chamberPressure > 2.5;
  const isHighVelocity = conditions.flowVelocity > 30.0;
  const isLowGravity = conditions.gravity < 1e-4;

  const safetyScore = Math.max(
    10,
    100 -
      (isEnriched ? 35 : 0) -
      (isHighPressure ? 25 : 0) -
      (isHighVelocity ? 15 : 0) +
      (isHypoxic ? 20 : 0)
  );

  return (
    <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
      {/* Workspace Header */}
      <div className="flex items-center justify-between border-b border-[#1B64DD]/30 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="p-2 rounded-lg bg-[#0D2554] border border-[#1B64DD]/40 text-[#2694EE] hover:bg-[#164E9E] transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#D9E0EE] flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#E8671C]" />
              Spacecraft Combustion Fire Safety & Screening Workspace
            </h1>
            <p className="text-xs text-[#A7B1D2]">
              Preliminary flammability screening, extinction boundaries, and NASA-STD-6001 habitat risk evaluation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-lg bg-[#E8671C]/20 text-[#E8671C] border border-[#E8671C]/40 font-bold">
            NASA-STD-6001 Protocol Reference
          </span>
        </div>
      </div>

      {/* Safety Screening Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-[#1B64DD]/40 bg-[#0D2554]/70">
          <span className="text-[11px] text-[#A7B1D2] block">Habitat Fire Safety Index</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-3xl font-bold font-mono ${
              safetyScore > 70 ? 'text-[#16A34A]' : safetyScore > 40 ? 'text-[#FACC15]' : 'text-[#E8671C]'
            }`}>
              {safetyScore} / 100
            </span>
          </div>
          <p className="text-[10px] text-[#A7B1D2] mt-1">
            {safetyScore > 70 ? 'Favorable Self-Extinguishing Envelope' : 'Elevated Deflagration & Flame Propagation Risk'}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-[#1B64DD]/40 bg-[#0D2554]/70">
          <span className="text-[11px] text-[#A7B1D2] block">Limiting Oxygen Index (LOI)</span>
          <div className="text-3xl font-bold font-mono text-[#2694EE] mt-1">
            {conditions.oxygenConcentration}% O2
          </div>
          <p className="text-[10px] text-[#A7B1D2] mt-1">
            {isHypoxic ? 'Below microgravity sustaining threshold (~15.5%)' : 'Above minimum sustained combustion limit'}
          </p>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-[#1B64DD]/40 bg-[#0D2554]/70">
          <span className="text-[11px] text-[#A7B1D2] block">Quenching / Extinction Status</span>
          <div className={`text-xl font-bold font-mono mt-1 ${summaryMetrics.quenched ? 'text-[#16A34A]' : 'text-[#F79628]'}`}>
            {summaryMetrics.quenched ? 'EXTINGUISHED' : 'SUSTAINED FLAME'}
          </div>
          <p className="text-[10px] text-[#A7B1D2] mt-1">
            Regime: {summaryMetrics.extinctionRegime || 'Continuous Reaction'}
          </p>
        </div>
      </div>

      {/* Groq AI Spacecraft Fire Safety Screening Panel */}
      <div className="glass-panel p-5 rounded-xl border border-[#E8671C]/40 bg-[#070F21]/90 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1B64DD]/30 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#E8671C]" />
            <h3 className="text-sm font-bold text-[#D9E0EE]">
              Groq AI Spacecraft Fire Safety & Habitability Screening
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8671C]/20 text-[#E8671C] border border-[#E8671C]/40 font-bold uppercase">
              NASA-STD-6001 Protocol
            </span>
          </div>

          <div className="flex items-center gap-2">
            {aiSafetyReport && (
              <button
                onClick={handleCopySafety}
                className="px-2.5 py-1 rounded bg-[#0D2554] border border-[#1B64DD]/40 text-[#A7B1D2] hover:text-white text-xs flex items-center gap-1 transition"
                title="Copy Safety Assessment"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
            <button
              onClick={handleGenerateSafetyAI}
              disabled={isAnalyzingSafety}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#E8671C] to-[#F79628] text-white font-bold text-xs flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50 transition shadow-[0_0_12px_rgba(232,103,28,0.4)]"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isAnalyzingSafety ? 'animate-spin' : ''}`} />
              <span>{isAnalyzingSafety ? 'Screening Fire Risks...' : aiSafetyReport ? 'Re-Evaluate Safety' : 'Screen Safety with Groq AI'}</span>
            </button>
          </div>
        </div>

        {aiSafetyReport ? (
          <div className="p-4 rounded-lg bg-[#0D2554]/60 border border-[#1B64DD]/30 text-xs text-[#D9E0EE] leading-relaxed whitespace-pre-wrap font-sans">
            {aiSafetyReport}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-[#0D2554]/30 border border-[#1B64DD]/20 text-xs text-[#A7B1D2]">
            Click &apos;Screen Safety with Groq AI&apos; to run an AI flammability screening based on current oxygen concentration ({conditions.oxygenConcentration}%), pressure ({conditions.chamberPressure} atm), and low-convection microgravity envelope.
          </div>
        )}
      </div>

      {/* Scientific Fire Screening Criteria Breakdown */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#D9E0EE] uppercase tracking-wider flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#E8671C]" />
          Combustion Hazard Alerts & Screening Factors
        </h2>

        <div className="space-y-3 text-xs">
          {/* Oxygen Enrichment Check */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            isEnriched 
              ? 'bg-[#E8671C]/15 border-[#E8671C] text-[#D9E0EE]' 
              : 'bg-[#0D2554]/70 border-[#1B64DD]/40 text-[#D9E0EE]'
          }`}>
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isEnriched ? 'text-[#E8671C]' : 'text-[#16A34A]'}`} />
            <div>
              <div className="font-bold text-sm">
                Oxygen Concentration: {conditions.oxygenConcentration}% {isEnriched && '(Severe Acceleration Risk)'}
              </div>
              <p className="text-xs text-[#A7B1D2] mt-1 leading-relaxed">
                {isEnriched
                  ? 'Elevated oxygen fraction (>25% O2) sharply accelerates chemical kinetics and raises adiabatic flame temperature, expanding the flammability zone of materials normally non-flammable in standard air (NASA-STD-6001 Test 1).'
                  : 'Oxygen level is within or below standard ambient concentrations (14-21% O2).'}
              </p>
            </div>
          </div>

          {/* Microgravity Smoldering & Lack of Warning Drift */}
          <div className="p-4 rounded-xl border bg-[#0D2554]/70 border-[#1B64DD]/40 text-[#D9E0EE] flex items-start gap-3">
            <Info className="w-5 h-5 text-[#2694EE] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">
                Microgravity Diffusion Shielding & Smoldering Phenotype
              </div>
              <p className="text-xs text-[#A7B1D2] mt-1 leading-relaxed">
                In zero gravity, smoke and combustion products do not rise due to the absence of buoyant updraft. Instead, combustion products accumulate locally, which can suppress open flaming while sustaining subsurface smoldering that is undetectable by traditional ceiling smoke detectors.
              </p>
            </div>
          </div>

          {/* Spacecraft Ventilation / Co-Flow Warning */}
          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            conditions.flowVelocity > 0.0 && conditions.flowVelocity < 15.0 && isLowGravity
              ? 'bg-[#FACC15]/15 border-[#FACC15] text-[#D9E0EE]'
              : 'bg-[#0D2554]/70 border-[#1B64DD]/40 text-[#D9E0EE]'
          }`}>
            <Wind className="w-5 h-5 text-[#FACC15] flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">
                Ventilation Airflow Interaction: {conditions.flowVelocity} cm/s
              </div>
              <p className="text-xs text-[#A7B1D2] mt-1 leading-relaxed">
                In spacecraft habitats, forced cabin air circulation (typically 5-15 cm/s) can continuously supply fresh oxygen to otherwise suffocating diffusion flames, creating asymmetric flame anchors and increasing fire spread along wiring harnesses and stowage racks.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Advisory Notice */}
      <div className="p-4 rounded-xl bg-[#070F21] border border-[#1B64DD]/30 text-[11px] text-[#A7B1D2] space-y-1">
        <p className="font-bold text-[#D9E0EE]">
          Scientific Screening Advisory Notice:
        </p>
        <p>
          These calculated parameters are intended strictly for scientific screening and academic microgravity combustion modeling. They do NOT replace certified operational safety determinations or physical flammability testing governed by NASA-STD-6001 Test 1 (Upward Flame Propagation) or Test 2 (Heat Release).
        </p>
      </div>
    </div>
  );
}

