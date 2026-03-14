import React from 'react';
import { motion } from 'motion/react';
import { Wind, Droplets, Cloud, TrendingDown, TrendingUp, BarChart } from 'lucide-react';

export default function PollutionStats() {
  const airTrends = [
    { month: 'Jan', value: 85 }, { month: 'Feb', value: 80 }, { month: 'Mar', value: 75 },
    { month: 'Apr', value: 90 }, { month: 'May', value: 65 }, { month: 'Jun', value: 60 }
  ];
  const waterTrends = [
    { month: 'Jan', value: 45 }, { month: 'Feb', value: 48 }, { month: 'Mar', value: 42 },
    { month: 'Apr', value: 50 }, { month: 'May', value: 35 }, { month: 'Jun', value: 30 }
  ];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 fade-up">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 rounded-xl">
            <BarChart className="text-emerald-400" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white">Regional Pollution Statistics</h1>
        </div>
        <p className="text-zinc-400">Open data on air quality, water health, and carbon emissions for public transparency.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 text-blue-400">
               <Wind size={20} /> <span className="font-bold">Air Quality Index (AQI)</span>
             </div>
             <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded">
               <TrendingDown size={14} /> 12% Improved
             </span>
          </div>
          <div className="flex items-end gap-2 mb-6">
             <span className="text-4xl font-black text-white">60</span>
             <span className="text-zinc-400 font-medium pb-1">Good (Avg)</span>
          </div>
          
          <div className="flex items-end h-24 gap-2 border-b border-zinc-800 pb-2">
            {airTrends.map((t, i) => (
               <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group">
                  <div className="w-full bg-blue-500/20 hover:bg-blue-500/40 rounded-t-sm transition-colors relative" style={{ height: `${t.value}%` }}>
                     <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">{t.value}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{t.month}</span>
               </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 text-cyan-400">
               <Droplets size={20} /> <span className="font-bold">Water Turbidity (NTU)</span>
             </div>
             <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded">
               <TrendingDown size={14} /> 8% Improved
             </span>
          </div>
          <div className="flex items-end gap-2 mb-6">
             <span className="text-4xl font-black text-white">30</span>
             <span className="text-zinc-400 font-medium pb-1">Clear (Avg)</span>
          </div>
          
          <div className="flex items-end h-24 gap-2 border-b border-zinc-800 pb-2">
            {waterTrends.map((t, i) => (
               <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group">
                  <div className="w-full bg-cyan-500/20 hover:bg-cyan-500/40 rounded-t-sm transition-colors relative" style={{ height: `${t.value}%` }}>
                     <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">{t.value}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">{t.month}</span>
               </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-2 text-zinc-300">
               <Cloud size={20} /> <span className="font-bold">Carbon Footprint</span>
             </div>
             <span className="text-xs font-bold text-red-400 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded">
               <TrendingUp size={14} /> 2% Increase
             </span>
          </div>
          <div className="flex items-end gap-2 mb-6">
             <span className="text-4xl font-black text-white">12.4</span>
             <span className="text-zinc-400 font-medium pb-1">k tonnes CO2e</span>
          </div>
          <p className="text-sm text-zinc-500 leading-relaxed mt-4">
             Carbon emissions have slightly increased due to the 3 new mega-infrastructure projects approved in Q1, but remain actively monitored by AI thresholds.
          </p>
        </div>
      </div>
      
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
        <h3 className="text-lg font-bold text-emerald-400 mb-2">Transparency Pledge</h3>
        <p className="text-sm text-emerald-500/80 max-w-2xl mx-auto">
          All data displayed above is automatically aggregated from calibrated IoT sensors and verified by AI. Parivesh 3.0 guarantees zero human manipulation of this public data feed.
        </p>
      </div>
    </div>
  );
}
