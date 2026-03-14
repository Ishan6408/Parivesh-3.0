import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BarChart3, Cloud, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';

import StatCard from './ui/StatCard';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const monthlyData = [
  { month: 'Oct', approved: 18, rejected: 2 },
  { month: 'Nov', approved: 22, rejected: 4 },
  { month: 'Dec', approved: 19, rejected: 3 },
  { month: 'Jan', approved: 25, rejected: 1 },
  { month: 'Feb', approved: 28, rejected: 3 },
  { month: 'Mar', approved: 24, rejected: 2 },
];

const maxVal = Math.max(...monthlyData.map(d => d.approved + d.rejected));

export default function ImpactAnalytics() {
  const [projects, setProjects] = useState<any[]>([]);
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        setProjects(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  }, [token]);


  const approved = projects.filter(p => p.status === 'Approved');
  const rejectedCount = projects.filter(p => p.status === 'Rejected').length;

  
  // Calculate Sector breakdown
  const miningCount = projects.filter(p => p.title.includes('Mining')).length;
  const infraCount = projects.filter(p => p.title.includes('Infrastructure')).length;
  const energyCount = projects.filter(p => p.title.includes('Energy')).length;
  const otherCount = projects.length - (miningCount + infraCount + energyCount);

  const sectorChart = [
    { label: 'Infrastructure', value: projects.length ? (infraCount / projects.length) * 100 : 0, color: 'bg-emerald-500', count: infraCount },
    { label: 'Energy', value: projects.length ? (energyCount / projects.length) * 100 : 0, color: 'bg-indigo-500', count: energyCount },
    { label: 'Mining', value: projects.length ? (miningCount / projects.length) * 100 : 0, color: 'bg-amber-500', count: miningCount },
    { label: 'Others', value: projects.length ? (otherCount / projects.length) * 100 : 0, color: 'bg-zinc-500', count: otherCount },
  ];

  if (loading) return <div className="p-20 text-center text-zinc-500">Calculating impact analytics...</div>;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 fade-up">
      {/* Header */}
      <header>
        <p className="text-xs text-zinc-500 uppercase font-semibold tracking-widest mb-1">Regulator · Analytics</p>
        <h1 className="text-2xl font-black text-white">Impact Analytics</h1>
        <p className="text-zinc-500 text-sm mt-1">Holistic view of predicted environmental impact across all approved projects.</p>
      </header>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Submissions" value={projects.length} icon={Cloud} color="warning" index={0} subtitle="Global counter" />
        <StatCard label="Review Queue" value={projects.filter(p => p.status === 'Pending' || p.status === 'Under Review').length} icon={BarChart3} color="info" index={1} subtitle="Requires action" />
        <StatCard label="Clean Approvals" value={approved.length} icon={CheckCircle2} color="success" index={2} />
        <StatCard label="High Risk Flagged" value={projects.filter(p => p.riskScore > 70).length} icon={ShieldAlert} color="danger" index={3} subtitle="Score > 70" />
      </div>


      <div className="grid lg:grid-cols-2 gap-6">
        {/* Emissions by Sector */}
        <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Emissions by Sector</h2>
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">tCO2e / year</span>
          </div>
          <div className="space-y-4">
            {sectorChart.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-zinc-300 font-medium">{item.label}</span>
                  <span className="text-zinc-500 font-semibold tabular-nums">{item.count} Projects</span>
                </div>
                <div className="h-2.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.value}%` }}
                    transition={{ duration: 1, delay: i * 0.12, ease: 'easeOut' }}
                    className={`h-full ${item.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Monthly Approval Trend */}
        <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-widest">Monthly Approval Trend</h2>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Approved</span>
              <span className="flex items-center gap-1 text-red-400"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Rejected</span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-36">
            {monthlyData.map((d, i) => {
              const totalH = ((d.approved + d.rejected) / maxVal) * 100;
              const approvedH = (d.approved / (d.approved + d.rejected)) * totalH;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg overflow-hidden flex flex-col-reverse"
                    style={{ height: `${totalH}%` }}
                  >
                    <motion.div
                      className="w-full bg-emerald-500/80 shrink-0"
                      initial={{ height: 0 }}
                      animate={{ height: `${approvedH}%` }}
                      transition={{ delay: i * 0.08, duration: 0.7, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="w-full bg-red-500/80 flex-1"
                      initial={{ height: 0 }}
                      animate={{ height: `${totalH - approvedH}%` }}
                      transition={{ delay: i * 0.08, duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-[9px] text-zinc-600 font-medium">{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Monitoring Panel */}
      <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center relative shrink-0">
              <Zap className="text-emerald-400" size={28} />
              <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400/20 border-t-emerald-400 animate-spin" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">AI Resource Optimizer — Active</h3>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
                Groq AI is monitoring cumulative regional thresholds across all approved projects to prevent ecological tipping points.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-xl border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              Live Monitoring
            </div>
            <div className="text-right">
              <p className="text-xs text-zinc-500">Avg. Response</p>
              <p className="text-lg font-black text-white">4.5h</p>
            </div>
          </div>
        </div>

        {/* Region stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-zinc-800/50">
          <div className="p-3.5 bg-zinc-900/50 rounded-xl border border-zinc-800/50 text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Approved Cases</p>
            <p className="text-xl font-black text-emerald-400">{approved.length}</p>
          </div>
          <div className="p-3.5 bg-zinc-900/50 rounded-xl border border-zinc-800/50 text-center">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Rejected Cases</p>
            <p className="text-xl font-black text-red-400">{rejectedCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


