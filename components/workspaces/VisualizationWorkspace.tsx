'use client';

import React from 'react';
import { 
  Eye, 
  ArrowLeft, 
  Layers, 
  Box, 
  Thermometer, 
  Wind, 
  Grid, 
  Ruler
} from 'lucide-react';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { CenterFlame2D } from '../dashboard/CenterFlame2D';

export function VisualizationWorkspace() {
  const { setActiveTab, currentResult, layers, toggleLayer } = useSimulationStore();

  const export3DModel = () => {
    // Generate a downloadable scientific 3D geometry JSON representation
    const modelData = {
      format: 'flame-in-freefall-3d-geometry',
      version: '2.0',
      simulationId: currentResult.id,
      fuel: currentResult.conditions.fuelType,
      gravity: currentResult.conditions.gravity,
      metrics: currentResult.summaryMetrics,
      geometry: {
        type: currentResult.conditions.gravity < 1e-4 ? 'spherical-diffusion-envelope' : 'buoyant-teardrop-mesh',
        radius_mm: currentResult.summaryMetrics.steadyFlameSize,
        height_mm: currentResult.summaryMetrics.steadyFlameSize * (currentResult.conditions.gravity > 0.05 ? 2.5 : 1.05),
        slices: 64,
        stacks: 32,
      },
    };

    const blob = new Blob([JSON.stringify(modelData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flame-geometry-${currentResult.id}.json`;
    a.click();
  };

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
              <Eye className="w-6 h-6 text-[#1B64DD]" />
              3D Cinematic Visualization & Volumetric Inspection Lab
            </h1>
            <p className="text-xs text-[#A7B1D2]">
              Multi-layer visual diagnosis of flame boundary, thermal radiation plume, and vector flow fields
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={export3DModel}
            className="px-3 py-1.5 rounded-lg bg-[#1B64DD] text-white hover:bg-[#2694EE] transition text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(38,148,238,0.4)]"
          >
            <Box className="w-4 h-4" />
            <span>Export 3D Geometry</span>
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Expanded 2D GLSL Canvas */}
        <div className="lg:col-span-3 h-[560px] rounded-xl overflow-hidden glass-panel border border-[#1B64DD]/40 relative">
          <CenterFlame2D />
        </div>

        {/* Visualization Settings Sidebar */}
        <div className="glass-panel p-4 rounded-xl border border-[#1B64DD]/40 bg-[#0D2554]/80 flex flex-col space-y-4">
          <h2 className="text-xs font-bold text-[#2694EE] uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            Visualization Layer Toggles
          </h2>

          <div className="space-y-2 text-xs">
            <label className="flex items-center justify-between p-2 rounded bg-[#070F21]/60 border border-[#1B64DD]/30 cursor-pointer hover:bg-[#164E9E]/20">
              <span className="flex items-center gap-2 text-[#D9E0EE]">
                <Thermometer className="w-4 h-4 text-[#F79628]" />
                Temperature Field (T)
              </span>
              <input
                type="checkbox"
                checked={layers.temperatureField}
                onChange={() => toggleLayer('temperatureField')}
                className="accent-[#2694EE]"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded bg-[#070F21]/60 border border-[#1B64DD]/30 cursor-pointer hover:bg-[#164E9E]/20">
              <span className="flex items-center gap-2 text-[#D9E0EE]">
                <Wind className="w-4 h-4 text-[#2694EE]" />
                Velocity Vector Streamlines
              </span>
              <input
                type="checkbox"
                checked={layers.velocityStreamlines}
                onChange={() => toggleLayer('velocityStreamlines')}
                className="accent-[#2694EE]"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded bg-[#070F21]/60 border border-[#1B64DD]/30 cursor-pointer hover:bg-[#164E9E]/20">
              <span className="flex items-center gap-2 text-[#D9E0EE]">
                <Ruler className="w-4 h-4 text-[#2694EE]" />
                Plume Dimension Calipers
              </span>
              <input
                type="checkbox"
                checked={layers.plumeMeasurements}
                onChange={() => toggleLayer('plumeMeasurements')}
                className="accent-[#2694EE]"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded bg-[#070F21]/60 border border-[#1B64DD]/30 cursor-pointer hover:bg-[#164E9E]/20">
              <span className="flex items-center gap-2 text-[#D9E0EE]">
                <Grid className="w-4 h-4 text-[#A7B1D2]" />
                Nozzle Geometry & Wall Profile
              </span>
              <input
                type="checkbox"
                checked={layers.nozzleGeometry}
                onChange={() => toggleLayer('nozzleGeometry')}
                className="accent-[#2694EE]"
              />
            </label>
          </div>

          <div className="border-t border-[#1B64DD]/30 pt-3">
            <h3 className="text-[11px] font-bold text-[#A7B1D2] uppercase tracking-wider mb-2">
              Optical Diagnostics Reference
            </h3>
            <p className="text-[11px] text-[#A7B1D2] leading-relaxed">
              In microgravity, the blue emission arises from chemiluminescence of excited CH* (431 nm) and C2* Swan bands (516 nm) in the thin reaction zone. The orange/yellow zone indicates soot incandescence governed by Planck’s blackbody radiation law.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

