'use client';

import React, { useState } from 'react';
import { 
  Scale, 
  ArrowLeft, 
  Trash2, 
  Plus, 
  Layers, 
  TrendingUp,
  Sparkles,
  Bot,
  Copy,
  Check
} from 'lucide-react';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { compareExperimentsAI } from '../../lib/services/groq-research-bot-service';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

type ComparisonDataPoint = Record<string, number>;

export function ComparisonWorkspace() {
  const { comparisonList, removeFromComparison, currentResult, addToComparison, setActiveTab } = useSimulationStore();
  const [aiComparison, setAiComparison] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateComparison = async () => {
    setIsComparing(true);
    try {
      const text = await compareExperimentsAI(allRuns, 'guided');
      setAiComparison(text);
    } catch (e) {
      console.error(e);
    } finally {
      setIsComparing(false);
    }
  };

  const handleCopy = () => {
    if (aiComparison) {
      navigator.clipboard.writeText(aiComparison);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const allRuns = comparisonList.length > 0 ? comparisonList : [currentResult];

  // Colors for multiple runs in comparison
  const runColors = ['#2694EE', '#E8671C', '#F79628', '#8B35E8', '#16A34A', '#38BDF8'];

  // Format merged time series for multi-run comparison chart
  const maxSteps = Math.max(...allRuns.map((r) => r.timeSeries.length));
  const mergedData: ComparisonDataPoint[] = [];

  for (let i = 0; i < maxSteps; i++) {
    const point: ComparisonDataPoint = { time: allRuns[0]?.timeSeries[i]?.time || i * 0.1 };
    allRuns.forEach((run, idx) => {
      const pt = run.timeSeries[i] || run.timeSeries[run.timeSeries.length - 1];
      if (pt) {
        point[`temp_${idx}`] = pt.maxTemp;
        point[`rate_${idx}`] = pt.burningRate;
      }
    });
    mergedData.push(point);
  }

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
              <Scale className="w-6 h-6 text-[#16A34A]" />
              Multi-Experiment Differential Comparison Workspace
            </h1>
            <p className="text-xs text-[#A7B1D2]">
              Cross-compare gravity transitions (1g vs μg), fuel chemical kinetics, and NASA benchmark correlations
            </p>
          </div>
        </div>

        <button
          onClick={() => addToComparison(currentResult)}
          className="px-3 py-1.5 rounded-lg bg-[#1B64DD] text-white hover:bg-[#2694EE] transition text-xs font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(38,148,238,0.4)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Current Run ({currentResult.id})</span>
        </button>
      </div>

      {/* Comparison Table */}
      <div className="glass-panel rounded-xl border border-[#1B64DD]/40 bg-[#0D2554]/80 overflow-hidden shadow-lg">
        <div className="p-3 bg-[#0A1D44] border-b border-[#1B64DD]/30 flex justify-between items-center">
          <h2 className="text-xs font-bold text-[#D9E0EE] uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2694EE]" />
            Side-by-Side Parameter Matrix ({allRuns.length} Simulation Runs)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#070F21] text-[#A7B1D2] border-b border-[#1B64DD]/30 font-mono">
                <th className="p-3">Parameter / Metric</th>
                {allRuns.map((run, idx) => (
                  <th key={run.id} className="p-3 border-l border-[#1B64DD]/30" style={{ color: runColors[idx % runColors.length] }}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{run.name}</span>
                      {allRuns.length > 1 && (
                        <button
                          onClick={() => removeFromComparison(run.id)}
                          className="text-[#A7B1D2] hover:text-[#E8671C] transition ml-2"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-[#A7B1D2] block font-mono">{run.id}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B64DD]/20 text-[#D9E0EE] font-mono">
              <tr className="hover:bg-[#164E9E]/10">
                <td className="p-3 font-semibold text-[#A7B1D2]">Gravity Level (g)</td>
                {allRuns.map((r) => (
                  <td key={r.id} className="p-3 border-l border-[#1B64DD]/20">
                    {r.conditions.gravity < 1e-4 ? '10⁻⁶ g (μg)' : `${r.conditions.gravity} g`}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#164E9E]/10">
                <td className="p-3 font-semibold text-[#A7B1D2]">Fuel Type</td>
                {allRuns.map((r) => (
                  <td key={r.id} className="p-3 border-l border-[#1B64DD]/20">{r.conditions.fuelType}</td>
                ))}
              </tr>
              <tr className="hover:bg-[#164E9E]/10">
                <td className="p-3 font-semibold text-[#A7B1D2]">Oxygen Concentration</td>
                {allRuns.map((r) => (
                  <td key={r.id} className="p-3 border-l border-[#1B64DD]/20">{r.conditions.oxygenConcentration}% O2</td>
                ))}
              </tr>
              <tr className="hover:bg-[#164E9E]/10">
                <td className="p-3 font-semibold text-[#A7B1D2]">Chamber Pressure</td>
                {allRuns.map((r) => (
                  <td key={r.id} className="p-3 border-l border-[#1B64DD]/20">{r.conditions.chamberPressure} atm</td>
                ))}
              </tr>
              <tr className="hover:bg-[#164E9E]/10">
                <td className="p-3 font-semibold text-[#A7B1D2]">Peak Temperature (K)</td>
                {allRuns.map((r) => (
                  <td key={r.id} className="p-3 border-l border-[#1B64DD]/20 font-bold text-[#F79628]">
                    {r.summaryMetrics.maxFlameTemperature} K
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#164E9E]/10">
                <td className="p-3 font-semibold text-[#A7B1D2]">Burning Rate (K)</td>
                {allRuns.map((r) => (
                  <td key={r.id} className="p-3 border-l border-[#1B64DD]/20 font-bold text-[#E8671C]">
                    {r.summaryMetrics.peakBurningRate} mm²/s
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#164E9E]/10">
                <td className="p-3 font-semibold text-[#A7B1D2]">Flame Radius (mm)</td>
                {allRuns.map((r) => (
                  <td key={r.id} className="p-3 border-l border-[#1B64DD]/20 font-bold text-[#2694EE]">
                    {r.summaryMetrics.steadyFlameSize} mm
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#164E9E]/10">
                <td className="p-3 font-semibold text-[#A7B1D2]">Grashof Number (Gr)</td>
                {allRuns.map((r) => (
                  <td key={r.id} className="p-3 border-l border-[#1B64DD]/20 text-[#A7B1D2]">
                    {r.summaryMetrics.grashofNumber}
                  </td>
                ))}
              </tr>
              <tr className="hover:bg-[#164E9E]/10">
                <td className="p-3 font-semibold text-[#A7B1D2]">Validation Status</td>
                {allRuns.map((r) => (
                  <td key={r.id} className="p-3 border-l border-[#1B64DD]/20">
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40">
                      {r.validation.status}
                    </span>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Groq AI Cross-Run Differential Synthesis */}
      <div className="glass-panel p-5 rounded-xl border border-[#16A34A]/40 bg-[#070F21]/90 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#1B64DD]/30 pb-3 gap-2">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-[#16A34A]" />
            <h3 className="text-sm font-bold text-[#D9E0EE]">
              Groq AI Multi-Run Comparative Analysis
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/40 font-bold uppercase">
              {allRuns.length} Datasets Evaluated
            </span>
          </div>

          <div className="flex items-center gap-2">
            {aiComparison && (
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-[#0D2554] border border-[#1B64DD]/40 text-[#A7B1D2] hover:text-white text-xs flex items-center gap-1 transition"
                title="Copy Comparison"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
            <button
              onClick={handleGenerateComparison}
              disabled={isComparing}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#16A34A] to-[#2694EE] text-white font-bold text-xs flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50 transition shadow-[0_0_12px_rgba(22,163,74,0.4)]"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isComparing ? 'animate-spin' : ''}`} />
              <span>{isComparing ? 'Synthesizing...' : aiComparison ? 'Re-Compare with Groq' : 'Summarize Differences with Groq AI'}</span>
            </button>
          </div>
        </div>

        {aiComparison ? (
          <div className="p-4 rounded-lg bg-[#0D2554]/60 border border-[#1B64DD]/30 text-xs text-[#D9E0EE] leading-relaxed whitespace-pre-wrap font-sans">
            {aiComparison}
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-[#0D2554]/30 border border-[#1B64DD]/20 text-xs text-[#A7B1D2]">
            Click &apos;Summarize Differences with Groq AI&apos; to contrast buoyancy regimes, propellant specific impulse trade-offs, and combustion stability metrics across these simulation runs.
          </div>
        )}
      </div>

      {/* Multi-Run Differential Temperature Plot */}
      <div className="glass-panel p-5 rounded-xl border border-[#1B64DD]/40 bg-[#0D2554]/80 flex flex-col space-y-3">
        <h2 className="text-xs font-bold text-[#D9E0EE] uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#2694EE]" />
          Temperature Profile Convergence Comparison
        </h2>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B64DD" opacity={0.2} />
              <XAxis dataKey="time" stroke="#A7B1D2" unit="s" />
              <YAxis stroke="#A7B1D2" unit="K" />
              <Tooltip contentStyle={{ backgroundColor: '#0D2554', borderColor: '#2694EE', color: '#D9E0EE' }} />
              <Legend />
              {allRuns.map((r, idx) => (
                <Line
                  key={r.id}
                  type="monotone"
                  dataKey={`temp_${idx}`}
                  name={`${r.name} (T_max)`}
                  stroke={runColors[idx % runColors.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

