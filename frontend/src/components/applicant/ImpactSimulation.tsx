import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, Factory, Map as MapIcon, Database, AlertTriangle, Wind, Droplets, Leaf } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

export default function ImpactSimulation() {
  const [form, setForm] = useState({ type: 'Manufacturing', scale: 50, location: 'Industrial Zone' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ air: number, water: number, co2: number, summary: string } | null>(null);
  const { token } = useAuth();

  const simulate = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/pollution-predictor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectData: form })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
        air: 65, water: 30, co2: 850,
        summary: "Fallback Simulation: The proposed scale and type indicate moderate air pollution risks but manageable water effluents. Strict electrostatic precipitators recommended."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6 fade-up">
      <header>
        <p className="text-xs text-indigo-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5">
          <Eye size={14} /> Environmental AI Engine
        </p>
        <h1 className="text-3xl font-black text-white">Impact Simulation</h1>
        <p className="text-zinc-400 text-sm mt-1">Simulate estimated pollution baselines and resource consumption prior to filing your official EIA.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Input Form */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#0f1f4a]/50 border border-indigo-900/30 rounded-2xl p-5 shadow-xl">
             <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
               <Database size={16} className="text-indigo-400"/> Scenario Parameters
             </h3>
             
             <div className="space-y-4">
               <div>
                 <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Industry Type</label>
                 <select 
                   value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                   className="w-full bg-[#0a1935] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                 >
                   <option>Manufacturing</option>
                   <option>Mining</option>
                   <option>Power Generation</option>
                   <option>Infrastructure</option>
                   <option>Chemical Production</option>
                 </select>
               </div>
               
               <div>
                 <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Scale Index (1-100)</label>
                 <input 
                   type="range" min="1" max="100" 
                   value={form.scale} onChange={e => setForm({...form, scale: parseInt(e.target.value)})}
                   className="w-full accent-indigo-500"
                 />
                 <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                   <span>Small Scale</span><span>Mega Project</span>
                 </div>
               </div>
               
               <div>
                 <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Location Zone</label>
                 <select 
                   value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                   className="w-full bg-[#0a1935] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
                 >
                   <option>Industrial Zone</option>
                   <option>Coastal Region</option>
                   <option>Near Forest Area</option>
                   <option>Urban Periphery</option>
                 </select>
               </div>
               
               <button 
                 onClick={simulate}
                 disabled={loading}
                 className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50"
               >
                 {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Factory size={16} />}
                 {loading ? 'Simulating Impact...' : 'Run Simulation'}
               </button>
             </div>
          </div>
        </div>

        {/* Output Dashboard */}
        <div className="lg:col-span-2 space-y-6">
          {!result && !loading && (
            <div className="h-full min-h-[300px] border-2 border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/20">
              <MapIcon size={48} className="text-zinc-700 mb-4" />
              <p className="font-medium">Define parameters and run simulation</p>
              <p className="text-xs mt-1">AI models will predict environmental load factors.</p>
            </div>
          )}

          {loading && (
             <div className="h-full min-h-[300px] border border-indigo-900/20 bg-[#0f1f4a]/30 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent animate-shimmer" />
               <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
               <p className="text-indigo-400 font-bold text-sm animate-pulse">Computing predictive impact models...</p>
             </div>
          )}

          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-[#0a1935] border border-zinc-800 rounded-2xl text-center">
                    <Wind size={20} className="text-blue-400 mx-auto mb-2" />
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">AQI Impact Risk</p>
                    <div className="text-2xl font-black text-white">{result.air}<span className="text-sm text-zinc-500 font-medium">/100</span></div>
                  </div>
                  <div className="p-4 bg-[#0a1935] border border-zinc-800 rounded-2xl text-center">
                    <Droplets size={20} className="text-emerald-400 mx-auto mb-2" />
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Water Effluents</p>
                    <div className="text-2xl font-black text-white">{result.water}<span className="text-sm text-zinc-500 font-medium">/100</span></div>
                  </div>
                  <div className="p-4 bg-[#0a1935] border border-zinc-800 rounded-2xl text-center">
                    <Leaf size={20} className="text-amber-400 mx-auto mb-2" />
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Carbon Footprint</p>
                    <div className="text-2xl font-black text-white">{result.co2} <span className="text-[10px] text-zinc-500 font-medium">tons/yr</span></div>
                  </div>
                </div>

                <div className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl">
                   <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                     <AlertTriangle size={14} className="text-amber-500" /> AI Executive Summary
                   </h4>
                   <p className="text-sm text-zinc-300 leading-relaxed bg-[#0a1935] p-4 rounded-xl border border-zinc-800/80">
                     {result.summary}
                   </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
