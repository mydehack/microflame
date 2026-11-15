'use client';

import React, { useState, useMemo } from 'react';
import { 
  Rocket, 
  Search, 
  Filter, 
  ExternalLink, 
  FileText, 
  X, 
  Plus, 
  Gauge
} from 'lucide-react';
import { NASA_ENGINE_CATALOGUE, NASAEngineRecord, EngineCategory } from '../../lib/data/nasa-engines';
import { useSimulationStore } from '../../lib/store/simulation-store';

interface EngineSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EngineSelectorModal({ isOpen, onClose }: EngineSelectorModalProps) {
  const { selectedEngine, selectEngine } = useSimulationStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPropellant, setSelectedPropellant] = useState<string>('All');
  const [activeEngineDetail, setActiveEngineDetail] = useState<NASAEngineRecord | null>(selectedEngine);

  // Custom engine builder state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCategory, setCustomCategory] = useState<EngineCategory>('Liquid rocket engines');
  const [customPropellant, setCustomPropellant] = useState('Methane (CH4)');
  const [customPc, setCustomPc] = useState(1.0);
  const [customThrust, setCustomThrust] = useState(10.0);
  const [customIsp, setCustomIsp] = useState(310.0);

  const categories: string[] = [
    'All',
    'Liquid rocket engines',
    'Bipropellant spacecraft thrusters',
    'Monopropellant thrusters',
    'Solid rocket motors',
    'Electric propulsion systems',
    'Experimental propulsion systems',
  ];

  const propellants = [
    'All',
    'Liquid Hydrogen (LH2)',
    'Liquid Methane (LCH4)',
    'RP-1 (Kerosene)',
    'Monomethylhydrazine (MMH)',
    'Aerozine 50',
    'Anhydrous Hydrazine (N2H4)',
    'Xenon Gas (Xe Plasma)',
    'Solid AP/Al/PBAN',
  ];

  const filteredEngines = useMemo(() => {
    return NASA_ENGINE_CATALOGUE.filter((eng) => {
      const matchesSearch = 
        eng.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eng.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eng.nasaSourceReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eng.propellant.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'All' || eng.category === selectedCategory;
      const matchesProp = selectedPropellant === 'All' || eng.propellant.toLowerCase().includes(selectedPropellant.toLowerCase().split(' ')[0]);

      return matchesSearch && matchesCat && matchesProp;
    });
  }, [searchQuery, selectedCategory, selectedPropellant]);

  const handleSelectEngine = (engine: NASAEngineRecord) => {
    selectEngine(engine);
    onClose();
  };

  const handleCreateCustom = () => {
    if (!customName.trim()) return;

    const customRecord: NASAEngineRecord = {
      id: `custom-${Date.now()}`,
      name: `${customName.trim()} (Custom Model)`,
      manufacturer: 'User-Defined Configuration',
      category: customCategory,
      cycleOrType: 'Custom User Specification',
      propellant: customPropellant,
      oxidizer: 'Liquid Oxygen (LOX)',
      chamberPressure: {
        value: customPc,
        unit: 'atm',
        provenanceType: 'user-entered',
        isDocumented: false,
      },
      thrust: {
        value: customThrust,
        unit: 'kN',
        provenanceType: 'user-entered',
        isDocumented: false,
      },
      specificImpulse: {
        value: customIsp,
        unit: 's',
        provenanceType: 'user-entered',
        isDocumented: false,
      },
      massFlowRate: {
        value: (customThrust * 1000) / (customIsp * 9.80665),
        unit: 'kg/s',
        provenanceType: 'calculated',
        isDocumented: false,
      },
      expansionRatio: {
        value: 40.0,
        unit: 'Ae/At',
        provenanceType: 'user-entered',
        isDocumented: false,
      },
      exitVelocity: {
        value: customIsp * 9.80665,
        unit: 'm/s',
        provenanceType: 'calculated',
        isDocumented: false,
      },
      chamberTemperature: {
        value: 3000.0,
        unit: 'K',
        provenanceType: 'calculated',
        isDocumented: false,
      },
      nasaSourceReference: 'User-Entered Custom Model (Not an official NASA engine)',
      sourceReportIdentifier: 'USER-CUSTOM-01',
      sourceDocumentUrl: 'https://ntrs.nasa.gov/',
      publicationDate: new Date().toISOString().split('T')[0],
      completenessStatus: 'User Created',
      notes: 'Clearly designated as a researcher-created propulsion setup rather than a verified NASA engine.',
    };

    selectEngine(customRecord);
    setShowCustomModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070F21]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl h-[85vh] bg-[#0D2554] border border-[#1B64DD]/60 rounded-2xl shadow-[0_0_50px_rgba(27,100,221,0.3)] flex flex-col overflow-hidden text-[#D9E0EE]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1B64DD]/30 bg-[#070F21]/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#1B64DD]/20 border border-[#2694EE]/50 text-[#2694EE]">
              <Rocket className="w-5 h-5 text-[#2694EE]" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#D9E0EE] tracking-wide flex items-center gap-2">
                NASA ENGINE MODEL EXPLORER
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40 font-bold">
                  VERIFIED TECHNICAL SOURCES
                </span>
              </h2>
              <p className="text-xs text-[#A7B1D2]">
                Sourced from NASA Technical Reports Server (NTRS), NASA SP monographs, and flight hardware archives
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCustomModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[#164E9E] hover:bg-[#1B64DD] text-xs font-bold text-white transition flex items-center gap-1.5 border border-[#2694EE]/50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Engine</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#164E9E]/40 text-[#A7B1D2] hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="px-6 py-3 border-b border-[#1B64DD]/20 bg-[#0A1D44]/60 flex flex-wrap gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A7B1D2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by engine name, manufacturer, report identifier..."
              className="w-full bg-[#070F21] border border-[#1B64DD]/40 rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#D9E0EE] placeholder-[#A7B1D2]/50 focus:outline-none focus:border-[#2694EE]"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#A7B1D2] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#2694EE]" />
              Category:
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#070F21] border border-[#1B64DD]/40 rounded-lg px-2.5 py-1.5 text-xs text-[#D9E0EE] focus:outline-none focus:border-[#2694EE]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Propellant Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#A7B1D2]">Propellant:</span>
            <select
              value={selectedPropellant}
              onChange={(e) => setSelectedPropellant(e.target.value)}
              className="bg-[#070F21] border border-[#1B64DD]/40 rounded-lg px-2.5 py-1.5 text-xs text-[#D9E0EE] focus:outline-none focus:border-[#2694EE]"
            >
              {propellants.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Master-Detail Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Engine Cards List */}
          <div className="w-1/2 border-r border-[#1B64DD]/30 overflow-y-auto p-4 space-y-2.5">
            {filteredEngines.length === 0 ? (
              <div className="text-center py-12 text-[#A7B1D2] text-xs">
                No NASA engines matched your filter criteria.
              </div>
            ) : (
              filteredEngines.map((eng) => {
                const isSelected = selectedEngine.id === eng.id;
                const isDetailActive = activeEngineDetail?.id === eng.id;

                return (
                  <div
                    key={eng.id}
                    onClick={() => setActiveEngineDetail(eng)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isDetailActive
                        ? 'bg-[#164E9E]/40 border-[#2694EE] shadow-[0_0_15px_rgba(38,148,238,0.3)]'
                        : 'bg-[#070F21]/60 border-[#1B64DD]/30 hover:border-[#2694EE]/50 hover:bg-[#164E9E]/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[#D9E0EE]">{eng.name}</h3>
                          {isSelected && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40 font-bold">
                              ACTIVE IN SIM
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#A7B1D2] mt-0.5">{eng.manufacturer}</p>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A1B3B] text-[#2694EE] border border-[#1B64DD]/30">
                        {eng.category.split(' ')[0]}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2.5 pt-2 border-t border-[#1B64DD]/20 text-[11px] font-mono">
                      <div>
                        <span className="text-[#A7B1D2]/80 block text-[9px]">THRUST</span>
                        <span className="text-[#2694EE] font-bold">
                          {eng.thrust.isDocumented ? `${eng.thrust.value} ${eng.thrust.unit}` : 'N/A in source'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#A7B1D2]/80 block text-[9px]">ISP (VAC)</span>
                        <span className="text-[#F79628] font-bold">
                          {eng.specificImpulse.isDocumented ? `${eng.specificImpulse.value} s` : 'N/A in source'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#A7B1D2]/80 block text-[9px]">P_CHAMBER</span>
                        <span className="text-[#D9E0EE] font-bold">
                          {eng.chamberPressure.isDocumented ? `${eng.chamberPressure.value} ${eng.chamberPressure.unit}` : 'N/A in source'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Technical Specifications & Source Dossier */}
          {activeEngineDetail && (
            <div className="w-1/2 overflow-y-auto p-5 space-y-4 bg-[#070F21]/40">
              <div className="flex items-start justify-between border-b border-[#1B64DD]/30 pb-3">
                <div>
                  <h3 className="text-lg font-extrabold text-[#D9E0EE]">{activeEngineDetail.name}</h3>
                  <p className="text-xs text-[#2694EE]">{activeEngineDetail.manufacturer}</p>
                  <p className="text-[11px] text-[#A7B1D2] font-mono mt-0.5">
                    Cycle: {activeEngineDetail.cycleOrType}
                  </p>
                </div>

                <button
                  onClick={() => handleSelectEngine(activeEngineDetail)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1B64DD] to-[#2694EE] text-white font-bold text-xs uppercase hover:brightness-110 transition shadow-[0_0_15px_rgba(38,148,238,0.4)] flex items-center gap-1.5"
                >
                  <Rocket className="w-4 h-4" />
                  <span>Load Into Experiment</span>
                </button>
              </div>

              {/* Source Documentation Card */}
              <div className="p-3.5 rounded-xl bg-[#070F21]/80 border border-[#1B64DD]/40 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2694EE] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#2694EE]" />
                    Official NASA Technical Documentation
                  </span>
                  <span className="text-[10px] font-mono text-[#16A34A] bg-[#16A34A]/10 px-2 py-0.5 rounded border border-[#16A34A]/30">
                    {activeEngineDetail.completenessStatus}
                  </span>
                </div>

                <p className="text-xs text-[#D9E0EE] leading-snug">
                  {activeEngineDetail.nasaSourceReference}
                </p>

                <div className="flex items-center justify-between text-[11px] text-[#A7B1D2] pt-1 border-t border-[#1B64DD]/20">
                  <span>Report ID: {activeEngineDetail.sourceReportIdentifier}</span>
                  <span>Date: {activeEngineDetail.publicationDate}</span>
                </div>

                <a
                  href={activeEngineDetail.sourceDocumentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 text-[11px] text-[#2694EE] hover:underline flex items-center gap-1"
                >
                  <span>View Source on NASA Technical Reports Server (NTRS)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Technical Specifications Grid */}
              <div>
                <h4 className="text-[11px] font-bold text-[#2694EE] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  Documented Technical Specifications
                </h4>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-[#070F21]/60 border border-[#1B64DD]/30">
                    <span className="text-[10px] text-[#A7B1D2] block">PROPELLANT</span>
                    <span className="text-[#D9E0EE] font-bold">{activeEngineDetail.propellant}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#070F21]/60 border border-[#1B64DD]/30">
                    <span className="text-[10px] text-[#A7B1D2] block">OXIDIZER</span>
                    <span className="text-[#D9E0EE] font-bold">{activeEngineDetail.oxidizer || 'Not available in source'}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#070F21]/60 border border-[#1B64DD]/30">
                    <span className="text-[10px] text-[#A7B1D2] block">VACUUM THRUST</span>
                    <span className="text-[#2694EE] font-bold">
                      {activeEngineDetail.thrust.isDocumented ? `${activeEngineDetail.thrust.value} ${activeEngineDetail.thrust.unit}` : 'Not available in source'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#070F21]/60 border border-[#1B64DD]/30">
                    <span className="text-[10px] text-[#A7B1D2] block">SPECIFIC IMPULSE (I_sp)</span>
                    <span className="text-[#F79628] font-bold">
                      {activeEngineDetail.specificImpulse.isDocumented ? `${activeEngineDetail.specificImpulse.value} s` : 'Not available in source'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#070F21]/60 border border-[#1B64DD]/30">
                    <span className="text-[10px] text-[#A7B1D2] block">CHAMBER PRESSURE (P_c)</span>
                    <span className="text-[#D9E0EE] font-bold">
                      {activeEngineDetail.chamberPressure.isDocumented ? `${activeEngineDetail.chamberPressure.value} ${activeEngineDetail.chamberPressure.unit}` : 'Not available in source'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#070F21]/60 border border-[#1B64DD]/30">
                    <span className="text-[10px] text-[#A7B1D2] block">NOZZLE EXPANSION (Ae/At)</span>
                    <span className="text-[#D9E0EE] font-bold">
                      {activeEngineDetail.expansionRatio.isDocumented ? `${activeEngineDetail.expansionRatio.value}:1` : 'Not available in source'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#070F21]/60 border border-[#1B64DD]/30">
                    <span className="text-[10px] text-[#A7B1D2] block">EXIT VELOCITY (v_e)</span>
                    <span className="text-[#2694EE] font-bold">
                      {activeEngineDetail.exitVelocity.isDocumented ? `${activeEngineDetail.exitVelocity.value} m/s` : 'Not available in source'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#070F21]/60 border border-[#1B64DD]/30">
                    <span className="text-[10px] text-[#A7B1D2] block">CHAMBER TEMP (T_c)</span>
                    <span className="text-[#F79628] font-bold">
                      {activeEngineDetail.chamberTemperature.isDocumented ? `${activeEngineDetail.chamberTemperature.value} K` : 'Not available in source'}
                    </span>
                  </div>
                </div>

                {activeEngineDetail.notes && (
                  <p className="text-[11px] text-[#A7B1D2] italic mt-3 bg-[#070F21]/40 p-2.5 rounded-lg border border-[#1B64DD]/20">
                    💡 {activeEngineDetail.notes}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Engine Configuration Sub-Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0D2554] border border-[#2694EE] rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1B64DD]/30 pb-3">
              <h3 className="font-bold text-sm text-[#D9E0EE] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#2694EE]" />
                Create Researcher Custom Propulsion Model
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="p-1 text-[#A7B1D2] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#A7B1D2]">
              Define custom parameters. This configuration will be explicitly marked as a 
              <span className="text-[#F79628] font-bold"> User-Created Model</span> to preserve NASA scientific data provenance.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] text-[#A7B1D2] block mb-1">Model Name</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Lab Scale LOX/Methane Pintle Thruster"
                  className="w-full bg-[#070F21] border border-[#1B64DD]/40 rounded p-2 text-xs text-[#D9E0EE] outline-none focus:border-[#2694EE]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#A7B1D2] block mb-1">Category</label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as EngineCategory)}
                    className="w-full bg-[#070F21] border border-[#1B64DD]/40 rounded p-2 text-xs text-[#D9E0EE]"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#A7B1D2] block mb-1">Propellant</label>
                  <select
                    value={customPropellant}
                    onChange={(e) => setCustomPropellant(e.target.value)}
                    className="w-full bg-[#070F21] border border-[#1B64DD]/40 rounded p-2 text-xs text-[#D9E0EE]"
                  >
                    <option value="Methane (CH4)">Methane (CH4)</option>
                    <option value="Hydrogen (H2)">Hydrogen (H2)</option>
                    <option value="Propane (C3H8)">Propane (C3H8)</option>
                    <option value="RP-1 (Kerosene)">RP-1 (Kerosene)</option>
                    <option value="Anhydrous Hydrazine (N2H4)">Hydrazine (N2H4)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-[#A7B1D2] block mb-1">Chamber P (atm)</label>
                  <input
                    type="number"
                    value={customPc}
                    onChange={(e) => setCustomPc(parseFloat(e.target.value) || 1.0)}
                    className="w-full bg-[#070F21] border border-[#1B64DD]/40 rounded p-1.5 text-xs text-[#D9E0EE]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#A7B1D2] block mb-1">Thrust (kN)</label>
                  <input
                    type="number"
                    value={customThrust}
                    onChange={(e) => setCustomThrust(parseFloat(e.target.value) || 1.0)}
                    className="w-full bg-[#070F21] border border-[#1B64DD]/40 rounded p-1.5 text-xs text-[#D9E0EE]"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#A7B1D2] block mb-1">Isp (s)</label>
                  <input
                    type="number"
                    value={customIsp}
                    onChange={(e) => setCustomIsp(parseFloat(e.target.value) || 300.0)}
                    className="w-full bg-[#070F21] border border-[#1B64DD]/40 rounded p-1.5 text-xs text-[#D9E0EE]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1B64DD]/30">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 rounded text-xs text-[#A7B1D2] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCustom}
                disabled={!customName.trim()}
                className="px-4 py-1.5 rounded bg-[#2694EE] hover:bg-[#1B64DD] text-xs font-bold text-white transition disabled:opacity-50"
              >
                Create and Load Model
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

