import { useEffect, useState } from 'react';

import { API_BASE_URL } from '../config';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Clock, FileSearch, ShieldAlert, BrainCircuit, FileCheck, Radio } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import RegulatorMap from '../components/RegulatorMap';
import PendingApplications from '../components/PendingApplications';
import ReviewDocuments from '../components/ReviewDocuments';
import ApprovalDecisions from '../components/ApprovalDecisions';
import RiskAlerts from '../components/RiskAlerts';
import ImpactAnalytics from '../components/ImpactAnalytics';
import AiMonitoringDashboard from './AiMonitoringDashboard';
import StatCard from '../components/ui/StatCard';
import StatusBadge from '../components/ui/StatusBadge';
import ApprovalTimeline from '../components/ui/ApprovalTimeline';

interface Project {
  id: number;
  title: string;
  applicant: string;
  status: string;
  riskScore: number;
  riskSummary: string;
  createdAt: string;
  lat: number;
  lng: number;
}

function RegulatorHome() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deficiencyStats, setDeficiencyStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProjects(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch(`${API_BASE_URL}/api/stats/deficiencies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setDeficiencyStats(data))
      .catch(() => {});
  }, [token]);


  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/projects/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      setProjects(projects.map(p => p.id === id ? { ...p, status } : p));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const pendingProjects = projects.filter(p => p.status === 'Pending' || p.status === 'Under Review');
  const approvedCount = projects.filter(p => p.status === 'Approved').length;
  const rejectedCount = projects.filter(p => p.status === 'Rejected').length;


  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 fade-up">
      {/* Page header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500 uppercase font-semibold tracking-widest mb-1">Regulator Command Center</p>
          <h1 className="text-2xl font-black text-white">Environmental Clearance Review</h1>
          <p className="text-zinc-500 text-sm mt-1">Review AI-flagged risks and manage pending environmental clearances.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('/regulator/pending')}
            className="px-4 py-2 bg-[#FF9933]/10 border border-[#FF9933]/25 text-[#FF9933] rounded-xl text-sm font-semibold hover:bg-[#FF9933]/15 transition-colors flex items-center gap-2"
          >
            <FileSearch size={15} /> Review Queue
          </button>
          <button
            onClick={() => navigate('/regulator/monitoring')}
            className="px-4 py-2 bg-blue-500/10 border border-blue-500/25 text-blue-300 rounded-xl text-sm font-semibold hover:bg-blue-500/15 transition-colors flex items-center gap-2"
          >
            <Radio size={15} /> AI Monitor
          </button>
        </div>
      </header>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={projects.length} icon={FileCheck} color="default" index={0} />
        <StatCard label="Pending Review" value={pendingProjects.length} icon={Clock} color="warning" index={1} subtitle={`Requires action`} />
        <StatCard label="Approved" value={approvedCount} icon={CheckCircle2} color="success" index={2} />
        <StatCard label="Compliance EDS" value={deficiencyStats.pending} icon={ShieldAlert} color="danger" index={3} subtitle={`${deficiencyStats.resolved} of ${deficiencyStats.total} Resolved`} />
      </div>


      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Review Queue */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-300 flex items-center gap-2 uppercase tracking-widest">
              <FileSearch size={15} className="text-[#FF9933]" />
              Action Required — {pendingProjects.length} Applications
            </h2>
            <button onClick={() => navigate('/regulator/pending')} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">View all →</button>
          </div>
          
          <div className="space-y-4">
            {pendingProjects.slice(0, 4).map((project, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                key={project.id} 
                className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-semibold text-zinc-100">{project.title}</h3>
                      <StatusBadge status={project.status} size="sm" />
                    </div>
                    <p className="text-xs text-zinc-500">
                      {project.applicant} · Submitted {new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="shrink-0 text-right">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">AI Risk Score</div>
                    <div className={`text-2xl font-black flex items-center justify-end gap-1 ${
                      project.riskScore > 70 ? 'text-red-400' : project.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {project.riskScore > 70 && <AlertTriangle size={16} />}
                      {project.riskScore}<span className="text-sm font-normal text-zinc-600">/100</span>
                    </div>
                    {/* Mini risk bar */}
                    <div className="w-20 h-1.5 bg-zinc-800 rounded-full mt-1.5 ml-auto overflow-hidden">
                      <div
                        className={`h-full rounded-full ${project.riskScore > 70 ? 'risk-high' : project.riskScore > 30 ? 'risk-med' : 'risk-low'}`}
                        style={{ width: `${project.riskScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {project.riskSummary && (
                  <div className="bg-zinc-950 rounded-xl p-3.5 border border-zinc-800/60 mb-4">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 bg-indigo-500/10 rounded-md mt-0.5 shrink-0">
                        <BrainCircuit size={13} className="text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">AI Risk Summary</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{project.riskSummary}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3">
                  <button 
                    onClick={() => handleStatusUpdate(project.id, 'Rejected')}
                    className="px-4 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(project.id, 'Approved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 size={15} /> Grant Clearance
                  </button>
                </div>
              </motion.div>
            ))}
            
            {pendingProjects.length === 0 && (
              <div className="text-center py-12 bg-[#0f1f4a]/50 border border-zinc-800 rounded-2xl">
                <CheckCircle2 size={40} className="mx-auto text-emerald-500/40 mb-3" />
                <h3 className="text-base font-medium text-zinc-300">All caught up!</h3>
                <p className="text-zinc-600 text-sm mt-1">No pending applications require your review.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          {/* Application workflow stages */}
          <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Latest Application — Lifecycle</h2>
            {pendingProjects.length > 0 ? (
              <ApprovalTimeline currentStatus={pendingProjects[0]?.status} />
            ) : (
              <p className="text-xs text-zinc-600">No applications in queue.</p>
            )}
          </div>

          {/* SLA Monitor */}
          <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">SLA Monitor</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                <div>
                  <div className="text-sm font-semibold text-red-200">Riverfront Dev</div>
                  <div className="text-xs text-red-500/70">Overdue by 2 days</div>
                </div>
                <button className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">Expedite</button>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div>
                  <div className="text-sm font-semibold text-amber-200">Highway Exp. Phase 2</div>
                  <div className="text-xs text-amber-500/70">Due in 24 hours</div>
                </div>
                <button className="text-xs px-3 py-1.5 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 transition-colors">Review</button>
              </div>
            </div>
          </div>

          {/* This Month Stats */}
          <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">This Month</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/50 text-center">
                <div className="text-2xl font-black text-emerald-400 mb-1">{approvedCount || 24}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Approved</div>
              </div>
              <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/50 text-center">
                <div className="text-2xl font-black text-red-400 mb-1">{rejectedCount || 3}</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Rejected</div>
              </div>
              <div className="p-3.5 bg-zinc-950/60 rounded-xl border border-zinc-800/50 text-center col-span-2">
                <div className="text-2xl font-black text-indigo-400 mb-1">12</div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-wider">AI Auto-Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegulatorDashboard() {
  return (
    <Routes>
      <Route path="/" element={<RegulatorHome />} />
      <Route path="/pending" element={<PendingApplications />} />
      <Route path="/map" element={<RegulatorMap />} />
      <Route path="/review" element={<ReviewDocuments />} />
      <Route path="/decisions" element={<ApprovalDecisions />} />
      <Route path="/alerts" element={<RiskAlerts />} />
      <Route path="/impact" element={<ImpactAnalytics />} />
      <Route path="/monitoring" element={<AiMonitoringDashboard />} />
      <Route path="*" element={<Navigate to="/regulator" replace />} />
    </Routes>
  );
}
