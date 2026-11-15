'use client';

import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Download, 
  FileSpreadsheet, 
  Thermometer, 
  Ruler, 
  Wind, 
  Gauge, 
  Atom, 
  Activity,
  Rocket
} from 'lucide-react';
import { useSimulationStore } from '../../lib/store/simulation-store';
import { SmartHoverGuide } from '../ui/SmartHoverGuide';

type ChartType = 'thrustTime' | 'pressureTime' | 'tempDist' | 'velDist' | 'massFlowTime' | 'plumeWidthTime' | 'speciesDist';

export function BottomPanelGraphs() {
  const { currentResult, selectedEngine } = useSimulationStore();
  const [activeChart, setActiveChart] = useState<ChartType>('thrustTime');

  const data = currentResult.timeSeries;

  // CSV export of current chart series
  const exportChartCSV = () => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map((point) => Object.values(point).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nasa-${selectedEngine.id}-timeseries.csv`;
    a.click();
  };

  // Excel XML / Spreadsheet export
  const exportChartExcel = () => {
    if (!data.length) return;
    let xml = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>\n';
    xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n<Worksheet ss:Name="NASA Propulsion Data">\n<Table>\n';
    
    // Headers
    xml += '<Row>' + Object.keys(data[0]).map(k => `<Cell><Data ss:Type="String">${k}</Data></Cell>`).join('') + '</Row>\n';
    
    // Rows
    data.forEach(pt => {
      xml += '<Row>' + Object.values(pt).map(v => `<Cell><Data ss:Type="${typeof v === 'number' ? 'Number' : 'String'}">${v}</Data></Cell>`).join('') + '</Row>\n';
    });
    
    xml += '</Table>\n</Worksheet>\n</Workbook>';
    const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nasa-${selectedEngine.id}-timeseries.xls`;
    a.click();
  };

  // 7 Required NASA Graphs
  const tabs: Array<{
    id: ChartType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'thrustTime', label: '1. Thrust vs Time', icon: Rocket },
    { id: 'pressureTime', label: '2. Pressure vs Time', icon: Gauge },
    { id: 'tempDist', label: '3. Temp vs Distance', icon: Thermometer },
    { id: 'velDist', label: '4. Velocity vs Distance', icon: Wind },
    { id: 'massFlowTime', label: '5. Mass Flow vs Time', icon: Activity },
    { id: 'plumeWidthTime', label: '6. Plume Width vs Time', icon: Ruler },
    { id: 'speciesDist', label: '7. Species vs Distance', icon: Atom },
  ];

  return (
    <div className="w-full glass-panel border border-[#1B64DD]/40 bg-[#0D2554]/80 rounded-xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] h-[280px] flex flex-col">
      {/* Graphs Toolbar */}
      <div className="px-4 py-2 border-b border-[#1B64DD]/30 bg-[#0A1D44]/90 flex items-center justify-between">
        <SmartHoverGuide id="graph_typeSelector" className="flex-1 overflow-hidden">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeChart === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveChart(tab.id)}
                  className={`px-3 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition whitespace-nowrap ${
                    isActive
                      ? 'bg-[#1B64DD] text-white shadow-[0_0_10px_rgba(38,148,238,0.5)] border border-[#2694EE]'
                      : 'text-[#A7B1D2] hover:text-[#D9E0EE] hover:bg-[#164E9E]/20'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </SmartHoverGuide>

        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
          <SmartHoverGuide id="exportSuite">
            <button
              onClick={exportChartCSV}
              className="p-1.5 rounded hover:bg-[#164E9E]/30 text-[#2694EE] hover:text-white border border-[#1B64DD]/30 transition flex items-center gap-1 text-xs"
              title="Download Graph Series as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">CSV</span>
            </button>
          </SmartHoverGuide>

          <SmartHoverGuide id="exportSuite">
            <button
              onClick={exportChartExcel}
              className="p-1.5 rounded hover:bg-[#164E9E]/30 text-[#16A34A] hover:text-white border border-[#1B64DD]/30 transition flex items-center gap-1 text-xs"
              title="Download Graph Series as Excel Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Excel</span>
            </button>
          </SmartHoverGuide>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full p-2 bg-[#070F21]/40">
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === 'thrustTime' ? (
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B64DD" opacity={0.2} />
              <XAxis dataKey="time" stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="s" />
              <YAxis stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="N" />
              <Tooltip contentStyle={{ backgroundColor: '#0D2554', borderColor: '#2694EE', color: '#D9E0EE', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#D9E0EE' }} />
              <Area type="monotone" dataKey="thrustForce" name="Thrust Force F (N)" stroke="#2694EE" fill="rgba(38, 148, 238, 0.25)" />
            </AreaChart>
          ) : activeChart === 'pressureTime' ? (
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B64DD" opacity={0.2} />
              <XAxis dataKey="time" stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="s" />
              <YAxis stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="atm" />
              <Tooltip contentStyle={{ backgroundColor: '#0D2554', borderColor: '#8B35E8', color: '#D9E0EE', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#D9E0EE' }} />
              <Line type="monotone" dataKey="pressure" name="Chamber Pressure P_c (atm)" stroke="#8B35E8" strokeWidth={2} dot={false} />
            </LineChart>
          ) : activeChart === 'tempDist' ? (
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B64DD" opacity={0.2} />
              <XAxis dataKey="axialDistanceX" stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="mm" label={{ value: 'Axial Distance x (mm)', position: 'insideBottom', offset: -5, fill: '#A7B1D2', fontSize: 10 }} />
              <YAxis stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="K" />
              <Tooltip contentStyle={{ backgroundColor: '#0D2554', borderColor: '#F79628', color: '#D9E0EE', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#D9E0EE' }} />
              <Line type="monotone" dataKey="maxTemp" name="Centerline Plume Temp T(x)" stroke="#F79628" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="avgTemp" name="Boundary Layer Temp (K)" stroke="#E8671C" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
            </LineChart>
          ) : activeChart === 'velDist' ? (
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B64DD" opacity={0.2} />
              <XAxis dataKey="axialDistanceX" stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="mm" label={{ value: 'Axial Distance x (mm)', position: 'insideBottom', offset: -5, fill: '#A7B1D2', fontSize: 10 }} />
              <YAxis stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="m/s" />
              <Tooltip contentStyle={{ backgroundColor: '#0D2554', borderColor: '#2694EE', color: '#D9E0EE', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#D9E0EE' }} />
              <Line type="monotone" dataKey="exhaustVelocity" name="Supersonic Plume Velocity u(x)" stroke="#2694EE" strokeWidth={2} dot={false} />
            </LineChart>
          ) : activeChart === 'massFlowTime' ? (
            <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B64DD" opacity={0.2} />
              <XAxis dataKey="time" stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="s" />
              <YAxis stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="mm²/s" />
              <Tooltip contentStyle={{ backgroundColor: '#0D2554', borderColor: '#E8671C', color: '#D9E0EE', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#D9E0EE' }} />
              <Area type="monotone" dataKey="burningRate" name="Equivalent Mass Evaporation / Burning Rate K" stroke="#E8671C" fill="rgba(232, 103, 28, 0.25)" />
            </AreaChart>
          ) : activeChart === 'plumeWidthTime' ? (
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B64DD" opacity={0.2} />
              <XAxis dataKey="time" stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="s" />
              <YAxis stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="mm" />
              <Tooltip contentStyle={{ backgroundColor: '#0D2554', borderColor: '#F79628', color: '#D9E0EE', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#D9E0EE' }} />
              <Line type="monotone" dataKey="plumeWidth" name="Plume Width W(t) (mm)" stroke="#F79628" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="plumeLength" name="Plume Length L(t) (mm)" stroke="#2694EE" strokeWidth={2} dot={false} />
            </LineChart>
          ) : (
            <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1B64DD" opacity={0.2} />
              <XAxis dataKey="axialDistanceX" stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} unit="mm" label={{ value: 'Axial Distance x (mm)', position: 'insideBottom', offset: -5, fill: '#A7B1D2', fontSize: 10 }} />
              <YAxis stroke="#A7B1D2" tick={{ fill: '#A7B1D2', fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0D2554', borderColor: '#2694EE', color: '#D9E0EE', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '11px', color: '#D9E0EE' }} />
              <Line type="monotone" dataKey="yO2" name="Y_O2 (Oxidizer)" stroke="#2694EE" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="yCO2" name="Y_CO2 (Product)" stroke="#16A34A" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="yH2O" name="Y_H2O (Steam)" stroke="#38BDF8" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="yCO" name="Y_CO (Carbon Monoxide)" stroke="#E8671C" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="yOH" name="Y_OH (Radical x100)" stroke="#FACC15" strokeWidth={1.5} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
