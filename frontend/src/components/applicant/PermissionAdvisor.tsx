import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Search, AlertCircle, FileText, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

export default function PermissionAdvisor() {
  const [idea, setIdea] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ approvals: string[], advice: string } | null>(null);
  const { token } = useAuth();

  const analyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/permission-advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ idea })
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({
        approvals: ["Environmental Clearance (EC)", "Consent to Establish (CTE)"],
        advice: "Fallback: Unable to reach AI Advisor. Based on standard industrial projects, you typically require an EC and State Pollution Board CTE before commencing any construction."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6 fade-up">
      <header>
        <p className="text-xs text-blue-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5">
          <Compass size={14} /> AI Clearance Guide
        </p>
        <h1 className="text-3xl font-black text-white">Permission Advisor</h1>
        <p className="text-zinc-400 text-sm mt-1">Describe your proposed project, and our AI will outline the exact environmental clearances required under Indian regulations.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="p-5 bg-[#0f1f4a]/80 border border-blue-900/40 rounded-2xl shadow-xl shadow-blue-900/10">
             <ShieldCheck size={24} className="text-blue-400 mb-3" />
             <h3 className="text-sm font-bold text-white mb-2">How it works</h3>
             <p className="text-xs text-blue-200/70 leading-relaxed">
               The PARIVESH 3.0 AI engine cross-references your project description against the EIA Notification 2006, Forest (Conservation) Act, and CRZ rules to predict required statutory clearances.
             </p>
          </div>
          
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
             <HelpCircle size={20} className="text-zinc-500 mb-3" />
             <h3 className="text-xs font-bold text-white mb-1">Example Prompts</h3>
             <ul className="text-[11px] text-zinc-500 space-y-2 mt-3 list-disc pl-3">
               <li>"100 MW solar park on 500 hectares of barren land in Rajasthan"</li>
               <li>"Chemical dye manufacturing unit producing 50 tons per day near a river"</li>
               <li>"Expansion of existing coal mine by 20% in forest area"</li>
             </ul>
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <form onSubmit={analyze} className="bg-[#0f1f4a]/50 border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />
            
            <label className="block text-sm font-bold text-zinc-300 mb-3">Project Description</label>
            <textarea
              className="w-full h-32 bg-[#09152e] border border-blue-900/50 rounded-xl p-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all resize-none shadow-inner"
              placeholder="Describe your project, capacity, location type, and land use..."
              value={idea}
              onChange={e => setIdea(e.target.value)}
            />
            
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading || idea.trim().length < 10}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                ) : (
                  <><Search size={16} /> Analyze Project</>
                )}
              </button>
            </div>
          </form>

          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-emerald-400" />
                  Required Clearances
                </h3>
                
                <div className="space-y-3 mb-6">
                  {result.approvals?.map((app: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-[#0a1935] border border-emerald-900/20 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-500 font-black text-[10px]">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-emerald-100">{app}</p>
                      </div>
                    </div>
                  ))}
                  {(!result.approvals || result.approvals.length === 0) && (
                    <p className="text-sm text-zinc-500 p-4 border border-zinc-800 border-dashed rounded-xl">No specific clearances identified. Please provide more details.</p>
                  )}
                </div>

                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <AlertCircle size={14} /> Regulatory Advice
                  </h4>
                  <p className="text-sm text-zinc-300 leading-relaxed">{result.advice}</p>
                </div>
                
                <div className="mt-5 flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-colors">
                    <FileText size={14} /> Download PDF Report
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-xl transition-colors">
                    Start Application <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
