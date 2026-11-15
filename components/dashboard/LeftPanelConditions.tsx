'use client';

import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Sliders, 
  Cpu, 
  Sparkles, 
  Info, 
  AlertTriangle, 
  Rocket, 
  Flame,
  Bot,
  Send,
  Check
} from 'lucide-react';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { recommendSettingsAI, ParameterRecommendationResponse } from '../../lib/services/groq-research-bot-service';
import { BeginnerOnboardingWizardModal } from '../modals/BeginnerOnboardingWizardModal';
import { SmartHoverGuide } from '../ui/SmartHoverGuide';

export function LeftPanelConditions() {
  const {
    conditions,
    config,
    isRunning,
    progress,
    currentLog,
    selectedEngine,
    setCondition,
    setBatchConditions,
    resetEngineParameters,
    isParameterModified,
    setConfig,
    runSimulation,
    cancelSimulation,
  } = useSimulationStore();

  const [activeTab, setActiveTab] = useState<'conditions' | 'modes' | 'expert'>('conditions');
  const [guidedObjective, setGuidedObjective] = useState<string>('extinction-limits');
  const [tooltip, setTooltip] = useState<string | null>(null);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState('');
  const [isRecommending, setIsRecommending] = useState(false);
  const [groqRec, setGroqRec] = useState<ParameterRecommendationResponse | null>(null);
  const [recApplied, setRecApplied] = useState(false);

  const handleRequestGroqRec = async () => {
    if (!customGoalInput.trim() || isRecommending) return;
    setIsRecommending(true);
    setRecApplied(false);
    try {
      const rec = await recommendSettingsAI(customGoalInput, selectedEngine.category, 'guided');
      setGroqRec(rec);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRecommending(false);
    }
  };

  const handleApplyGroqRec = () => {
    if (groqRec) {
      setBatchConditions(groqRec.configuration);
      setRecApplied(true);
      setTimeout(() => setRecApplied(false), 3000);
    }
  };

  // Quick gravity helpers
  const gravityPresets = [
    { label: 'μg (ISS)', value: 0.000001 },
    { label: 'Drop Tower', value: 0.00001 },
    { label: 'Moon (0.17g)', value: 0.166 },
    { label: 'Mars (0.38g)', value: 0.38 },
    { label: 'Earth (1.0g)', value: 1.0 },
  ];

  const fuelOptions: string[] = [
    'Methane (CH4)',
    'Propane (C3H8)',
    'Ethylene (C2H4)',
    'n-Heptane (C7H16)',
    'Hydrogen (H2)',
    'Liquid Hydrogen (LH2)',
    'RP-1 (Kerosene)',
    'Aerozine 50',
    'Monomethylhydrazine (MMH)',
    'Anhydrous Hydrazine (N2H4)',
    'Xenon Gas (Xe Plasma)',
    'Solid AP/Al/PBAN',
  ];

  const oxidizerOptions: string[] = [
    'Liquid Oxygen (LOX)',
    'Nitrogen Tetroxide (N2O4)',
    'Ammonium Perchlorate (AP)',
    'Oxygen Gas (O2)',
    'None (Monopropellant / Electric)',
  ];

  const handleApplyGuided = () => {
    if (guidedObjective === 'extinction-limits') {
      setBatchConditions({
        gravity: 0.000001,
        fuelType: 'Methane (CH4)',
        oxygenConcentration: 15.5,
        chamberPressure: 1.0,
        flowVelocity: 0.0,
        radiationLevel: 0.35,
        heatLoss: 4.5,
      });
      setConfig('solver', 'Cantera 1D/Quasi-Spherical');
      setConfig('radiationModel', 'Optically Thin Approximation');
    } else if (guidedObjective === 'soot-morphology') {
      setBatchConditions({
        gravity: 0.000001,
        fuelType: 'Ethylene (C2H4)',
        fuelConcentration: 1.3,
        oxygenConcentration: 24.0,
        chamberPressure: 1.2,
        radiationLevel: 0.40,
      });
      setConfig('solver', 'Coupled Navier-Stokes Low-Mach');
      setConfig('radiationModel', 'Discrete Ordinates Model');
    } else if (guidedObjective === 'spacecraft-safety') {
      setBatchConditions({
        gravity: 0.000001,
        fuelType: 'Propane (C3H8)',
        oxygenConcentration: 30.0,
        chamberPressure: 0.56,
        flowVelocity: 4.5,
      });
      setConfig('chemicalMechanism', 'San Diego Mechanism');
    }
    setActiveTab('conditions');
  };

  return (
    <aside className="w-full lg:w-[380px] flex-shrink-0 flex flex-col glass-panel border border-[#1B64DD]/40 bg-[#0D2554]/80 overflow-hidden rounded-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] h-[calc(100vh-80px)]">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-[#1B64DD]/30 bg-[#0A1D44]/90 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#1B64DD]/20 border border-[#2694EE]/40 text-[#2694EE]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#D9E0EE] tracking-wide uppercase">
                Experiment Controls
              </h2>
              <p className="text-[11px] text-[#A7B1D2]">NASA Propulsion Parameters</p>
            </div>
          </div>

          <SmartHoverGuide id="resetConditions">
            <button
              onClick={resetEngineParameters}
              title="Revert all parameters to documented NASA specifications"
              className="p-1.5 rounded-md hover:bg-[#164E9E]/40 text-[#A7B1D2] hover:text-[#D9E0EE] transition text-xs flex items-center gap-1 border border-[#1B64DD]/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Revert Specs</span>
            </button>
          </SmartHoverGuide>
        </div>

        {/* Configuration Level Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-[#070F21]/80 p-1 rounded-lg border border-[#1B64DD]/30 text-[11px]">
          <button
            onClick={() => setActiveTab('conditions')}
            className={`py-1 rounded font-medium transition ${
              activeTab === 'conditions'
                ? 'bg-[#1B64DD] text-white shadow-[0_0_10px_rgba(38,148,238,0.5)]'
                : 'text-[#A7B1D2] hover:text-[#D9E0EE]'
            }`}
          >
            Parameters
          </button>
          <button
            onClick={() => setActiveTab('modes')}
            className={`py-1 rounded font-medium transition flex items-center justify-center gap-1 ${
              activeTab === 'modes'
                ? 'bg-[#1B64DD] text-white shadow-[0_0_10px_rgba(38,148,238,0.5)]'
                : 'text-[#A7B1D2] hover:text-[#D9E0EE]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#F79628]" />
            AI Guided
          </button>
          <button
            onClick={() => setActiveTab('expert')}
            className={`py-1 rounded font-medium transition flex items-center justify-center gap-1 ${
              activeTab === 'expert'
                ? 'bg-[#1B64DD] text-white shadow-[0_0_10px_rgba(38,148,238,0.5)]'
                : 'text-[#A7B1D2] hover:text-[#D9E0EE]'
            }`}
          >
            <Cpu className="w-3 h-3 text-[#2694EE]" />
            Expert CFD
          </button>
        </div>
      </div>

      {/* Bound Engine Dossier Tag */}
      <div className="px-4 py-2 bg-[#070F21]/70 border-b border-[#1B64DD]/20 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 truncate">
          <Rocket className="w-3.5 h-3.5 text-[#2694EE]" />
          <span className="text-[#A7B1D2]">Model:</span>
          <span className="font-bold text-[#D9E0EE] truncate">{selectedEngine.name}</span>
        </div>
        <span className="text-[10px] font-mono text-[#16A34A] bg-[#16A34A]/10 px-1.5 py-0.2 rounded border border-[#16A34A]/30 font-bold whitespace-nowrap">
          {selectedEngine.sourceReportIdentifier}
        </span>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {activeTab === 'conditions' && (
          <div className="space-y-3.5">
            {/* 1. Gravity / Acceleration */}
            <SmartHoverGuide id="gravity" className="w-full">
              <div className="w-full p-2.5 rounded-lg bg-[#070F21]/50 border border-[#1B64DD]/30">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-[#D9E0EE] flex items-center gap-1.5">
                    1. Gravity / Acceleration
                    <button 
                      onMouseEnter={() => setTooltip('Effective gravitational acceleration. Under microgravity (<10^-4 g), natural convection is eliminated and spherical/symmetric expansion prevails.')}
                      onMouseLeave={() => setTooltip(null)}
                      className="text-[#2694EE]"
                    >
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </span>
                  <span className="font-mono text-[#2694EE] bg-[#164E9E]/30 px-1.5 py-0.5 rounded text-[11px]">
                    {conditions.gravity < 1e-4 ? `${conditions.gravity.toExponential(1)} g` : `${conditions.gravity.toFixed(2)} g`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.000001"
                  max="1.0"
                  step="0.00005"
                  value={conditions.gravity}
                  onChange={(e) => setCondition('gravity', parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-[#2694EE]"
                />
                <div className="flex gap-1 mt-2">
                  {gravityPresets.map((gp) => (
                    <button
                      key={gp.label}
                      onClick={() => setCondition('gravity', gp.value)}
                      className={`flex-1 py-0.5 text-[9px] rounded border transition ${
                        Math.abs(conditions.gravity - gp.value) < 1e-4
                          ? 'bg-[#2694EE]/30 border-[#2694EE] text-white font-bold'
                          : 'border-[#1B64DD]/20 text-[#A7B1D2] hover:bg-[#164E9E]/20'
                      }`}
                    >
                      {gp.label}
                    </button>
                  ))}
                </div>
              </div>
            </SmartHoverGuide>

            {/* 2. Propellant and Oxidizer */}
            <SmartHoverGuide id="fuelType" className="w-full">
              <div className={`w-full p-2.5 rounded-lg bg-[#070F21]/50 border transition ${
                isParameterModified('fuelType') ? 'border-[#F79628]/60 bg-[#F79628]/5' : 'border-[#1B64DD]/30'
              }`}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-semibold text-[#D9E0EE]">2. Propellant & Fuel</span>
                  {isParameterModified('fuelType') ? (
                    <span className="text-[9px] font-mono text-[#F79628] bg-[#F79628]/20 px-1.5 py-0.2 rounded font-bold">
                      ✎ Modified
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono text-[#16A34A] bg-[#16A34A]/20 px-1.5 py-0.2 rounded font-bold">
                      ● NASA Documented
                    </span>
                  )}
                </div>
                <select
                  value={conditions.fuelType}
                  onChange={(e) => setCondition('fuelType', e.target.value)}
                  className="w-full bg-[#0A1B3B] border border-[#1B64DD]/50 rounded px-2.5 py-1 text-xs text-[#D9E0EE] focus:outline-none focus:border-[#2694EE]"
                >
                  {fuelOptions.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>

                {/* Oxidizer */}
                <div className="mt-2 pt-2 border-t border-[#1B64DD]/20">
                  <span className="text-[10px] text-[#A7B1D2] block mb-1">Oxidizer</span>
                  <select
                    value={conditions.oxidizer || selectedEngine.oxidizer || 'Liquid Oxygen (LOX)'}
                    onChange={(e) => setCondition('oxidizer', e.target.value)}
                    className="w-full bg-[#0A1B3B] border border-[#1B64DD]/50 rounded px-2.5 py-1 text-xs text-[#D9E0EE] focus:outline-none focus:border-[#2694EE]"
                  >
                    {oxidizerOptions.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </SmartHoverGuide>

            {/* 3. Chamber Pressure (P_c) */}
            <SmartHoverGuide id="chamberPressure" className="w-full">
              <div className={`w-full p-2.5 rounded-lg bg-[#070F21]/50 border transition ${
                isParameterModified('chamberPressure') ? 'border-[#F79628]/60 bg-[#F79628]/5' : 'border-[#1B64DD]/30'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#D9E0EE]">3. Chamber Pressure (P_c)</span>
                  <div className="flex items-center gap-1.5">
                    {isParameterModified('chamberPressure') ? (
                      <span className="text-[9px] font-mono text-[#F79628] bg-[#F79628]/20 px-1.5 py-0.2 rounded font-bold">
                        ✎ Modified
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-[#16A34A] bg-[#16A34A]/20 px-1.5 py-0.2 rounded font-bold">
                        ● NASA Documented
                      </span>
                    )}
                    <span className="font-mono text-[#2694EE] bg-[#164E9E]/30 px-1.5 py-0.5 rounded text-[11px]">
                      {conditions.chamberPressure.toFixed(1)} atm
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max={Math.max(50.0, conditions.chamberPressure * 1.5)}
                  step="0.1"
                  value={conditions.chamberPressure}
                  onChange={(e) => setCondition('chamberPressure', parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-[#2694EE]"
                />
                <div className="flex justify-between text-[10px] text-[#A7B1D2] mt-0.5">
                  <span>0.2 atm</span>
                  <span>{(conditions.chamberPressure * 101.325).toFixed(0)} kPa</span>
                  <span>{Math.max(50.0, (conditions.chamberPressure * 1.5)).toFixed(0)} atm</span>
                </div>
              </div>
            </SmartHoverGuide>

            {/* 4. Thruster Power Throttle */}
            <SmartHoverGuide id="metric_thrust" className="w-full">
              <div className="w-full p-2.5 rounded-lg bg-[#070F21]/50 border border-[#1B64DD]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#D9E0EE] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-[#E8671C]" />
                    4. Thruster Throttle Setting
                  </span>
                  <span className="font-mono text-[#E8671C] bg-[#E8671C]/20 px-1.5 py-0.5 rounded text-[11px]">
                    {conditions.thrusterThrottle ?? 100} %
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={conditions.thrusterThrottle ?? 100}
                  onChange={(e) => setCondition('thrusterThrottle', parseInt(e.target.value, 10))}
                  className="w-full cursor-pointer accent-[#E8671C]"
                />
                <div className="flex justify-between text-[10px] text-[#A7B1D2] mt-0.5">
                  <span>10% (Idle)</span>
                  <span>65% (Nominal)</span>
                  <span>100% (Full Thrust)</span>
                </div>
              </div>
            </SmartHoverGuide>

            {/* 5. Mixture Ratio (O/F) */}
            <SmartHoverGuide id="oxygenConcentration" className="w-full">
              <div className="w-full p-2.5 rounded-lg bg-[#070F21]/50 border border-[#1B64DD]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#D9E0EE]">5. Mixture Ratio (O/F)</span>
                  <span className="font-mono text-[#2694EE] bg-[#164E9E]/30 px-1.5 py-0.5 rounded text-[11px]">
                    {(conditions.mixtureRatioOF || 1.6).toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8.0"
                  step="0.1"
                  value={conditions.mixtureRatioOF || 1.6}
                  onChange={(e) => setCondition('mixtureRatioOF', parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-[#2694EE]"
                />
              </div>
            </SmartHoverGuide>

            {/* 6. Nozzle Expansion Ratio (Ae/At) */}
            <SmartHoverGuide id="thrusterNozzle" className="w-full">
              <div className="w-full p-2.5 rounded-lg bg-[#070F21]/50 border border-[#1B64DD]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#D9E0EE]">6. Expansion Ratio (ε = Ae/At)</span>
                  <span className="font-mono text-[#D9E0EE] bg-[#164E9E]/30 px-1.5 py-0.5 rounded text-[11px]">
                    {(conditions.expansionRatio || 40.0).toFixed(1)}:1
                  </span>
                </div>
                <input
                  type="range"
                  min="4.0"
                  max="300.0"
                  step="2.0"
                  value={conditions.expansionRatio || 40.0}
                  onChange={(e) => setCondition('expansionRatio', parseFloat(e.target.value))}
                  className="w-full cursor-pointer accent-[#2694EE]"
                />
                <div className="flex justify-between text-[10px] text-[#A7B1D2] mt-0.5">
                  <span>4:1 (Sea-level)</span>
                  <span>77:1 (SSME)</span>
                  <span>285:1 (RL10B-2)</span>
                </div>
              </div>
            </SmartHoverGuide>

            {/* 7. Initial Chamber Temperature (T0) */}
            <SmartHoverGuide id="initialTemperature" className="w-full">
              <div className="w-full p-2.5 rounded-lg bg-[#070F21]/50 border border-[#1B64DD]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#D9E0EE]">7. Pre-Ignition Temp (T₀)</span>
                  <span className="font-mono text-[#D9E0EE] bg-[#164E9E]/30 px-1.5 py-0.5 rounded text-[11px]">
                    {conditions.initialTemperature} K
                  </span>
                </div>
                <input
                  type="range"
                  min="273"
                  max="500"
                  step="1"
                  value={conditions.initialTemperature}
                  onChange={(e) => setCondition('initialTemperature', parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>
            </SmartHoverGuide>

            {/* 8. Airflow / Ambient Velocity */}
            <SmartHoverGuide id="flowVelocity" className="w-full">
              <div className="w-full p-2.5 rounded-lg bg-[#070F21]/50 border border-[#1B64DD]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#D9E0EE]">8. Co-Flow Velocity (v_∞)</span>
                  <span className="font-mono text-[#2694EE] bg-[#164E9E]/30 px-1.5 py-0.5 rounded text-[11px]">
                    {conditions.flowVelocity.toFixed(1)} cm/s
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="50.0"
                  step="0.5"
                  value={conditions.flowVelocity}
                  onChange={(e) => setCondition('flowVelocity', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </SmartHoverGuide>

            {/* 9. Heat Loss Factor */}
            <SmartHoverGuide id="heatLoss" className="w-full">
              <div className="w-full p-2.5 rounded-lg bg-[#070F21]/50 border border-[#1B64DD]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#D9E0EE]">9. Heat Loss Factor</span>
                  <span className="font-mono text-[#E8671C] bg-[#E8671C]/20 px-1.5 py-0.5 rounded text-[11px]">
                    {conditions.heatLoss.toFixed(1)} W/K
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="15.0"
                  step="0.2"
                  value={conditions.heatLoss}
                  onChange={(e) => setCondition('heatLoss', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </SmartHoverGuide>

            {/* 10. Radiation Level */}
            <SmartHoverGuide id="radiationLevel" className="w-full">
              <div className="w-full p-2.5 rounded-lg bg-[#070F21]/50 border border-[#1B64DD]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#D9E0EE]">10. Radiation Level (χ_R)</span>
                  <span className="font-mono text-[#8B35E8] bg-[#8B35E8]/20 px-1.5 py-0.5 rounded text-[11px]">
                    {(conditions.radiationLevel * 100).toFixed(0)} %
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.45"
                  step="0.01"
                  value={conditions.radiationLevel}
                  onChange={(e) => setCondition('radiationLevel', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </SmartHoverGuide>

            {/* 11. Microgravity Duration */}
            <SmartHoverGuide id="microgravityDuration" className="w-full">
              <div className="w-full p-2.5 rounded-lg bg-[#070F21]/50 border border-[#1B64DD]/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[#D9E0EE]">11. Burn Duration</span>
                  <span className="font-mono text-[#D9E0EE] bg-[#164E9E]/30 px-1.5 py-0.5 rounded text-[11px]">
                    {conditions.microgravityDuration.toFixed(1)} s
                  </span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="60.0"
                  step="0.5"
                  value={conditions.microgravityDuration}
                  onChange={(e) => setCondition('microgravityDuration', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </SmartHoverGuide>
          </div>
        )}

        {activeTab === 'modes' && (
          <div className="space-y-4">
            {/* Beginner Setup Wizard Pill */}
            <div className="p-3 rounded-lg bg-gradient-to-r from-[#0D2554] to-[#164E9E] border border-[#2694EE]/40 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#D9E0EE] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F79628]" />
                  Beginner Setup Wizard
                </span>
                <p className="text-[10px] text-[#A7B1D2] mt-0.5">
                  Step-by-step experiment goal & condition builder
                </p>
              </div>
              <SmartHoverGuide id="bot_beginnerWizard">
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="px-2.5 py-1 rounded bg-[#E8671C] hover:bg-[#F79628] text-white text-xs font-bold transition shadow"
                >
                  Launch
                </button>
              </SmartHoverGuide>
            </div>

            {/* Standard Presets */}
            <div className="p-3 rounded-lg bg-[#070F21]/70 border border-[#F79628]/40">
              <div className="flex items-center gap-2 mb-2 text-[#F79628] font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Preset Mission Objectives</span>
              </div>
              <p className="text-[11px] text-[#A7B1D2] mb-3">
                Auto-tunes boundary conditions and numerical tolerances for specialized NASA mission profiles.
              </p>

              <div className="space-y-1.5">
                {[
                  { id: 'extinction-limits', label: 'Radiative Extinction Limits (FLEX-like)' },
                  { id: 'soot-morphology', label: 'Microgravity Soot Shell & Agglomeration' },
                  { id: 'spacecraft-safety', label: 'Spacecraft Habitat Flammability (NASA STD-6001)' },
                ].map((obj) => (
                  <label
                    key={obj.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer border text-xs transition ${
                      guidedObjective === obj.id
                        ? 'bg-[#1B64DD]/30 border-[#2694EE] text-white font-medium'
                        : 'border-[#1B64DD]/20 bg-[#0A1B3B]/40 text-[#A7B1D2] hover:bg-[#164E9E]/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="objective"
                      checked={guidedObjective === obj.id}
                      onChange={() => setGuidedObjective(obj.id)}
                      className="accent-[#2694EE]"
                    />
                    <span>{obj.label}</span>
                  </label>
                ))}
              </div>

              <button
                onClick={handleApplyGuided}
                className="mt-3 w-full py-1.5 rounded bg-[#F79628] hover:bg-[#E8671C] text-[#070F21] font-bold text-xs transition shadow"
              >
                Apply Selected Preset
              </button>
            </div>

            {/* Custom Groq AI Goal Recommender */}
            <div className="p-3 rounded-lg bg-[#070F21]/80 border border-[#2694EE]/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2694EE]">
                  <Bot className="w-4 h-4 text-[#F79628]" />
                  <span>Groq AI Custom Parameter Suggestion</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#2694EE]/20 text-[#2694EE] uppercase">
                  Physics Validated
                </span>
              </div>
              <p className="text-[10px] text-[#A7B1D2]">
                Describe any experimental goal (e.g., &quot;Methane diffusion at low Martian pressure&quot;) and Groq will recommend bounded parameters.
              </p>

              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRequestGroqRec()}
                  placeholder="Enter scientific goal..."
                  className="flex-1 bg-[#0D2554] border border-[#1B64DD]/40 rounded px-2.5 py-1 text-xs text-[#D9E0EE] placeholder-[#A7B1D2]/50 outline-none"
                />
                <button
                  onClick={handleRequestGroqRec}
                  disabled={!customGoalInput.trim() || isRecommending}
                  className="px-2.5 py-1 rounded bg-[#2694EE] hover:bg-[#1B64DD] text-white text-xs font-bold disabled:opacity-50 transition flex items-center gap-1"
                >
                  <Send className={`w-3 h-3 ${isRecommending ? 'animate-spin' : ''}`} />
                  <span>Ask</span>
                </button>
              </div>

              {groqRec && (
                <div className="p-2.5 rounded bg-[#0D2554] border border-[#1B64DD]/40 text-xs space-y-2 mt-2">
                  <div className="text-[10px] text-[#2694EE] font-mono font-bold uppercase">
                    Proposed Physical Bounds:
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                    <div>Gravity: {groqRec.configuration.gravity} g</div>
                    <div>Fuel: {groqRec.configuration.fuelType}</div>
                    <div>Pc: {groqRec.configuration.chamberPressure} atm</div>
                    <div>O2: {groqRec.configuration.oxygenConcentration}%</div>
                  </div>
                  <div className="text-[10px] text-[#A7B1D2] italic border-t border-[#1B64DD]/20 pt-1">
                    {groqRec.rationale}
                  </div>
                  <button
                    onClick={handleApplyGroqRec}
                    className="w-full py-1 rounded bg-gradient-to-r from-[#E8671C] to-[#F79628] text-white text-xs font-bold flex items-center justify-center gap-1 hover:brightness-110 transition shadow"
                  >
                    {recApplied ? <Check className="w-3.5 h-3.5" /> : null}
                    <span>{recApplied ? 'Applied to Experiment!' : 'Review & Apply Proposed Settings'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'expert' && (
          <div className="space-y-3.5">
            <div className="p-3 rounded-lg bg-[#070F21]/70 border border-[#2694EE]/40 space-y-3">
              <div className="flex items-center gap-2 text-[#2694EE] font-bold">
                <Cpu className="w-4 h-4" />
                <span>Expert Numerical Solver Controls</span>
              </div>

              <div>
                <label className="text-[10px] text-[#A7B1D2] block mb-1">Equilibrium Engine</label>
                <select
                  value={config.solver}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                    const val = e.target.value;
                    if (
                      val === 'NASA CEA Supersonic Equilibrium' ||
                      val === 'Cantera 1D/Quasi-Spherical' ||
                      val === 'Coupled Navier-Stokes Low-Mach' ||
                      val === 'OpenFOAM reactingFoam (CFD)'
                    ) {
                      setConfig('solver', val);
                    }
                  }}
                  className="w-full bg-[#070F21] border border-[#1B64DD]/40 rounded p-1.5 text-xs text-[#D9E0EE]"
                >
                  <option value="NASA CEA Supersonic Equilibrium">NASA CEA Supersonic Equilibrium</option>
                  <option value="Cantera 1D/Quasi-Spherical">Cantera 1D/Quasi-Spherical</option>
                  <option value="Coupled Navier-Stokes Low-Mach">Coupled Navier-Stokes Low-Mach</option>
                  <option value="OpenFOAM reactingFoam (CFD)">OpenFOAM reactingFoam (CFD)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#A7B1D2] block mb-1">Mesh Grid Nodes: {config.meshDensity}</label>
                <input
                  type="range"
                  min="50"
                  max="350"
                  step="10"
                  value={config.meshDensity}
                  onChange={(e) => setConfig('meshDensity', parseInt(e.target.value, 10))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-[10px] text-[#A7B1D2] block mb-1">Time Step (dt): {config.timeStep.toExponential(1)} s</label>
                <input
                  type="range"
                  min="0.0001"
                  max="0.005"
                  step="0.0001"
                  value={config.timeStep}
                  onChange={(e) => setConfig('timeStep', parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Tooltip Box */}
      {tooltip && (
        <div className="px-4 py-2 bg-[#070F21] border-t border-[#2694EE]/40 text-[11px] text-[#2694EE] italic">
          💡 {tooltip}
        </div>
      )}

      {/* Manual Solver Execution Bar (Never auto-runs on slider change) */}
      <div className="p-3.5 border-t border-[#1B64DD]/30 bg-[#0A1D44]/95 flex flex-col gap-2">
        {/* Progress & Log */}
        {isRunning && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-[#A7B1D2]">
              <span className="truncate pr-2">{currentLog}</span>
              <span className="font-mono text-[#2694EE] font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-[#070F21] h-1.5 rounded-full overflow-hidden border border-[#1B64DD]/40">
              <div 
                className="h-full bg-gradient-to-r from-[#1B64DD] via-[#2694EE] to-[#E8671C] transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {!isRunning ? (
            <SmartHoverGuide id="runSimulation" className="flex-1">
              <button
                onClick={runSimulation}
                className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#1B64DD] via-[#2694EE] to-[#E8671C] text-white font-bold text-xs tracking-wider uppercase hover:brightness-110 active:scale-[0.99] transition shadow-[0_0_20px_rgba(27,100,221,0.5)] flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Run Simulation</span>
              </button>
            </SmartHoverGuide>
          ) : (
            <SmartHoverGuide id="cancelSimulation" className="flex-1">
              <button
                onClick={cancelSimulation}
                className="w-full py-2.5 px-4 rounded-lg bg-[#E8671C]/20 border border-[#E8671C] text-[#E8671C] font-bold text-xs uppercase hover:bg-[#E8671C]/30 transition flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Cancel Run</span>
              </button>
            </SmartHoverGuide>
          )}
        </div>
      </div>

      <BeginnerOnboardingWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
      />
    </aside>
  );
}
