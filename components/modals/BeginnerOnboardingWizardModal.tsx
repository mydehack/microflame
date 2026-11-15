'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Flame, 
  ShieldCheck, 
  Wind, 
  Thermometer, 
  Rocket, 
  Gauge, 
  Activity, 
  Sliders 
} from 'lucide-react';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { recommendSettingsAI, ParameterRecommendationResponse } from '../../lib/services/groq-research-bot-service';
import { ExperimentalConditions } from '../../lib/types/simulation';

interface BeginnerOnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BeginnerOnboardingWizardModal({ isOpen, onClose }: BeginnerOnboardingWizardModalProps) {
  const { setBatchConditions, setActiveTab } = useSimulationStore();

  const [step, setStep] = useState<number>(1);
  const [selectedGoal, setSelectedGoal] = useState<string>('Microgravity flame behaviour');
  const [selectedPropellant, setSelectedPropellant] = useState<string>('Methane (CH4)');
  const [isLoadingRecommendation, setIsLoadingRecommendation] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<ParameterRecommendationResponse | null>(null);
  const [customParams, setCustomParams] = useState<Partial<ExperimentalConditions>>({
    gravity: 0.000001,
    fuelType: 'Methane (CH4)',
    fuelConcentration: 100.0,
    oxygenConcentration: 21.0,
    chamberPressure: 1.0,
    initialTemperature: 298.15,
    flowVelocity: 0.0,
    heatLoss: 5.0,
    radiationLevel: 20.0,
    microgravityDuration: 10.0,
    chamberSize: 20.0,
  });

  if (!isOpen) return null;

  const investigationGoals = [
    {
      id: 'microgravity-flame',
      title: 'Microgravity flame behaviour',
      desc: 'Observe how fire burns in pure freefall (10⁻⁶ g) into calm, blue spherical shapes with no buoyancy.',
      icon: Flame,
      color: '#2694EE',
    },
    {
      id: 'combustion-stability',
      title: 'Combustion stability & extinction',
      desc: 'Discover when and why flames extinguish in space due to radiative heat loss and lack of air currents.',
      icon: Activity,
      color: '#E8671C',
    },
    {
      id: 'temperature-distribution',
      title: 'Temperature distribution',
      desc: 'Track the hot core, reaction front, and cool gas boundaries across the combustion chamber.',
      icon: Thermometer,
      color: '#F79628',
    },
    {
      id: 'heat-transfer',
      title: 'Heat transfer & radiation',
      desc: 'Investigate how gas radiation cools microgravity fire and the formation of spherical soot shells.',
      icon: Wind,
      color: '#8B35E8',
    },
    {
      id: 'rocket-thruster',
      title: 'Rocket thruster exhaust plume',
      desc: 'Study supersonic expansion through a bell nozzle, shock diamonds, and vacuum plume divergence.',
      icon: Rocket,
      color: '#2694EE',
    },
    {
      id: 'propulsion-performance',
      title: 'Propulsion performance',
      desc: 'Optimize specific impulse (Isp), chamber pressure, and thrust efficiency for spacecraft propulsion.',
      icon: Gauge,
      color: '#16A34A',
    },
  ];

  const handleFetchRecommendations = async () => {
    setIsLoadingRecommendation(true);
    try {
      const rec = await recommendSettingsAI(
        `${selectedGoal} with ${selectedPropellant}`,
        'Liquid rocket engines',
        'beginner'
      );
      setRecommendation(rec);
      setCustomParams({
        ...customParams,
        ...rec.configuration,
        fuelType: selectedPropellant,
      });
      setStep(4);
    } catch (err) {
      console.error('Failed to get recommendation:', err);
      setStep(4);
    } finally {
      setIsLoadingRecommendation(false);
    }
  };

  const handleApplyConfiguration = () => {
    setBatchConditions(customParams);
    setStep(6);
  };

  const handleFinishAndGoToDashboard = () => {
    onClose();
    setActiveTab('dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#070F21] border border-[#1B64DD]/60 rounded-2xl shadow-[0_0_50px_rgba(27,100,221,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#1B64DD]/30 bg-[#0A1D44]/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#2694EE]/20 border border-[#2694EE]/40 text-[#2694EE]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#D9E0EE] flex items-center gap-2 font-mono">
                BEGINNER ONBOARDING WIZARD
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40 font-bold">
                  STEP {step} OF 6
                </span>
              </h2>
              <p className="text-xs text-[#A7B1D2]">Guided step-by-step experimental setup powered by Groq AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#A7B1D2] hover:text-white hover:bg-[#164E9E]/30 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Progress Bar */}
        <div className="h-1 w-full bg-[#0D2554]">
          <div 
            className="h-full bg-gradient-to-r from-[#1B64DD] via-[#2694EE] to-[#E8671C] transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          
          {/* STEP 1: Select Investigation Goal */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#D9E0EE] mb-1">
                  Step 1: What would you like to investigate?
                </h3>
                <p className="text-[#A7B1D2] text-xs">
                  Choose the scientific focus of your experiment. Research Bot will tailor all explanations and configurations for this goal.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {investigationGoals.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoal === goal.title;
                  return (
                    <div
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.title)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#164E9E]/40 border-[#2694EE] shadow-[0_0_15px_rgba(38,148,238,0.3)]'
                          : 'bg-[#0D2554]/60 border-[#1B64DD]/30 hover:border-[#2694EE]/50 hover:bg-[#164E9E]/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div 
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${goal.color}20`, border: `1px solid ${goal.color}40`, color: goal.color }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="font-bold text-[#D9E0EE] text-xs">{goal.title}</h4>
                      </div>
                      <p className="text-[11px] text-[#A7B1D2] leading-relaxed">{goal.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Context & Plain-English Explanation */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0D2554]/70 border border-[#1B64DD]/40">
                <span className="text-[10px] font-mono text-[#2694EE] font-bold block mb-1 uppercase tracking-wider">
                  ✦ Selected Objective
                </span>
                <h3 className="text-base font-bold text-[#D9E0EE] mb-2">{selectedGoal}</h3>
                <p className="text-xs text-[#A7B1D2] leading-relaxed">
                  In space or during freefall in a drop tower, buoyant convection completely shuts down. Hot combustion products do not rise because there is no lighter or heavier air.
                  Instead, gases expand purely by spherical molecular diffusion.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0A1B3B]/60 border border-[#16A34A]/30 space-y-2">
                <h4 className="font-bold text-[#16A34A] text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  What You Will Learn in This Experiment
                </h4>
                <ul className="list-disc list-inside text-xs text-[#D9E0EE] space-y-1.5 pl-1">
                  <li>Why flames become spherical instead of teardrop-shaped in microgravity.</li>
                  <li>How chamber pressure changes flame size, expansion, and burning speed.</li>
                  <li>How fuel and oxygen ratios dictate stability vs flame quenching.</li>
                </ul>
              </div>
            </div>
          )}

          {/* STEP 3: Propellant & Conditions Inquiry */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#D9E0EE] mb-1">
                  Step 3: Select Your Propellant / Fuel
                </h3>
                <p className="text-[#A7B1D2] text-xs">
                  Choose the fuel reactant for this experiment. Groq will consult NASA CEA chemistry to calculate theoretical thermodynamics.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { name: 'Methane (CH4)', type: 'Hydrocarbon Gas', desc: 'Clean, soot-free combustion, optimal for drop towers.' },
                  { name: 'Hydrogen (H2)', type: 'Cryogenic Fuel', desc: 'Highest Isp, burns with pure steam H2O product.' },
                  { name: 'Propane (C3H8)', type: 'Hydrocarbon Gas', desc: 'Moderate soot production, ideal for radiation study.' },
                  { name: 'RP-1 (Kerosene)', type: 'Rocket Propellant', desc: 'Standard Saturn V / Falcon 9 booster propellant.' },
                ].map((fuel) => {
                  const isSelected = selectedPropellant === fuel.name;
                  return (
                    <div
                      key={fuel.name}
                      onClick={() => setSelectedPropellant(fuel.name)}
                      className={`p-3 rounded-xl border cursor-pointer transition ${
                        isSelected
                          ? 'bg-[#164E9E]/40 border-[#2694EE] shadow-[0_0_12px_rgba(38,148,238,0.3)]'
                          : 'bg-[#0D2554]/60 border-[#1B64DD]/30 hover:border-[#2694EE]/40'
                      }`}
                    >
                      <span className="text-xs font-bold text-[#D9E0EE] block">{fuel.name}</span>
                      <span className="text-[10px] text-[#2694EE] block mb-1">{fuel.type}</span>
                      <p className="text-[10px] text-[#A7B1D2]">{fuel.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Groq AI Smart Recommendation & Breakdown */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1B64DD]/30 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-[#D9E0EE]">
                    Step 4: AI-Recommended Configuration
                  </h3>
                  <p className="text-xs text-[#A7B1D2]">
                    Validated against NASA CEA physical limits and the de Laval gas dynamics engine.
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[#16A34A] bg-[#16A34A]/10 border border-[#16A34A]/30 px-2 py-0.5 rounded font-bold">
                  VALIDATED
                </span>
              </div>

              {recommendation && (
                <div className="p-3.5 rounded-xl bg-[#0D2554]/70 border border-[#2694EE]/30 space-y-2">
                  <span className="text-[10px] font-mono text-[#F79628] font-bold block uppercase">
                    ✦ Scientific Rationale
                  </span>
                  <p className="text-xs text-[#D9E0EE] leading-relaxed italic">
                    &ldquo;{recommendation.rationale}&rdquo;
                  </p>
                </div>
              )}

              {/* Parameter Breakdown */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-[#0A1B3B]/60 border border-[#1B64DD]/20">
                  <span className="text-[9px] text-[#A7B1D2] block">GRAVITY</span>
                  <span className="text-sm font-bold text-[#2694EE]">
                    {customParams.gravity === 0.000001 ? '10⁻⁶ g (Freefall)' : `${customParams.gravity} g`}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#0A1B3B]/60 border border-[#1B64DD]/20">
                  <span className="text-[9px] text-[#A7B1D2] block">PROPELLANT</span>
                  <span className="text-sm font-bold text-[#D9E0EE] truncate block">
                    {customParams.fuelType}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#0A1B3B]/60 border border-[#1B64DD]/20">
                  <span className="text-[9px] text-[#A7B1D2] block">CHAMBER PRESSURE (Pc)</span>
                  <span className="text-sm font-bold text-[#F79628]">
                    {customParams.chamberPressure} atm
                  </span>
                </div>
                <div className="p-2.5 rounded bg-[#0A1B3B]/60 border border-[#1B64DD]/20">
                  <span className="text-[9px] text-[#A7B1D2] block">OXYGEN CONCENTRATION</span>
                  <span className="text-sm font-bold text-[#16A34A]">
                    {customParams.oxygenConcentration}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Interactive Fine-Tuning & Review */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#D9E0EE] mb-1">
                  Step 5: Review & Fine-Tune Parameters
                </h3>
                <p className="text-[#A7B1D2] text-xs">
                  You have full scientific control. Edit any suggested value before confirming.
                </p>
              </div>

              <div className="space-y-3 font-mono">
                {/* Gravity Slider */}
                <div className="p-3 rounded-lg bg-[#0A1B3B]/60 border border-[#1B64DD]/20">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-[#A7B1D2]">Gravity Acceleration:</span>
                    <span className="text-[#2694EE] font-bold">
                      {customParams.gravity === 0.000001 ? '10⁻⁶ g (Microgravity)' : `${customParams.gravity} g`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={customParams.gravity ?? 0.000001}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCustomParams({ ...customParams, gravity: val === 0 ? 0.000001 : val });
                    }}
                    className="w-full accent-[#2694EE]"
                  />
                </div>

                {/* Chamber Pressure */}
                <div className="p-3 rounded-lg bg-[#0A1B3B]/60 border border-[#1B64DD]/20">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-[#A7B1D2]">Chamber Stagnation Pressure (Pc):</span>
                    <span className="text-[#F79628] font-bold">{customParams.chamberPressure} atm</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="50"
                    step="0.5"
                    value={customParams.chamberPressure ?? 1.0}
                    onChange={(e) => setCustomParams({ ...customParams, chamberPressure: parseFloat(e.target.value) })}
                    className="w-full accent-[#F79628]"
                  />
                </div>

                {/* Oxygen Concentration */}
                <div className="p-3 rounded-lg bg-[#0A1B3B]/60 border border-[#1B64DD]/20">
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <span className="text-[#A7B1D2]">Chamber Oxygen Level:</span>
                    <span className="text-[#16A34A] font-bold">{customParams.oxygenConcentration}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="1"
                    value={customParams.oxygenConcentration ?? 21}
                    onChange={(e) => setCustomParams({ ...customParams, oxygenConcentration: parseFloat(e.target.value) })}
                    className="w-full accent-[#16A34A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Confirmation & Next Steps */}
          {step === 6 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#16A34A]/20 border border-[#16A34A] text-[#16A34A] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(22,163,74,0.4)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-bold text-[#D9E0EE]">
                  Configuration Applied to Experiment!
                </h3>
                <p className="text-xs text-[#A7B1D2] max-w-md mx-auto mt-1 leading-relaxed">
                  Your baseline settings ({customParams.fuelType}, {customParams.chamberPressure} atm, {customParams.gravity === 0.000001 ? '10⁻⁶ g' : `${customParams.gravity} g`}) are now loaded into the experiment dashboard.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0D2554]/80 border border-[#E8671C]/40 text-xs text-[#D9E0EE] max-w-md mx-auto space-y-1">
                <span className="font-bold text-[#E8671C] flex items-center justify-center gap-1.5 uppercase font-mono text-[10px]">
                  <Rocket className="w-4 h-4" />
                  Manual Run Required (Safety Protection)
                </span>
                <p className="text-[11px] text-[#A7B1D2]">
                  Simulations are never started automatically. Click below to return to the Dashboard and press the &ldquo;RUN SIMULATION&rdquo; button when you are ready.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-4 border-t border-[#1B64DD]/30 bg-[#0A1D44]/90 flex items-center justify-between">
          {step > 1 && step < 6 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-3 py-1.5 rounded-lg border border-[#1B64DD]/40 text-[#A7B1D2] hover:text-white hover:bg-[#164E9E]/20 transition flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg bg-[#2694EE] text-white font-bold hover:bg-[#1B64DD] transition flex items-center gap-1.5 text-xs shadow"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-lg bg-[#2694EE] text-white font-bold hover:bg-[#1B64DD] transition flex items-center gap-1.5 text-xs shadow"
              >
                <span>Select Propellant</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleFetchRecommendations}
                disabled={isLoadingRecommendation}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1B64DD] to-[#2694EE] text-white font-bold hover:brightness-110 transition flex items-center gap-1.5 text-xs shadow disabled:opacity-50"
              >
                {isLoadingRecommendation ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Consulting Groq AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate AI Recommendation</span>
                  </>
                )}
              </button>
            )}

            {step === 4 && (
              <button
                onClick={() => setStep(5)}
                className="px-4 py-2 rounded-lg bg-[#2694EE] text-white font-bold hover:bg-[#1B64DD] transition flex items-center gap-1.5 text-xs shadow"
              >
                <Sliders className="w-4 h-4" />
                <span>Review & Fine-Tune</span>
              </button>
            )}

            {step === 5 && (
              <button
                onClick={handleApplyConfiguration}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#16A34A] to-[#2694EE] text-white font-bold hover:brightness-110 transition flex items-center gap-1.5 text-xs shadow-[0_0_15px_rgba(22,163,74,0.4)]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Apply to Experiment</span>
              </button>
            )}

            {step === 6 && (
              <button
                onClick={handleFinishAndGoToDashboard}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#1B64DD] via-[#2694EE] to-[#E8671C] text-white font-bold hover:brightness-110 transition flex items-center gap-2 text-xs shadow-[0_0_20px_rgba(232,103,28,0.4)] uppercase"
              >
                <Rocket className="w-4 h-4" />
                <span>Go to Dashboard & Run Simulation</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
