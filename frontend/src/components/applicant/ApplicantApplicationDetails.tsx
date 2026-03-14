import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldAlert, Download, Eye, UploadCloud, Activity, MessageSquare } from 'lucide-react';


import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';

import ApprovalTimeline from '../ui/ApprovalTimeline';
import StatusBadge from '../ui/StatusBadge';
import DocumentChecklist from './DocumentChecklist';

export default function ApplicantApplicationDetails({ onBack }: { onBack: () => void }) {
  const { id } = useParams();
  const { token } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resubmitting, setResubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        const [projRes, decRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_BASE_URL}/api/projects/${id}/decisions`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (projRes.ok) setProject(await projRes.json());
        if (decRes.ok) setDecisions(await decRes.json());
      } catch (err) {
        console.error("Failed to fetch project details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  const latestDeficiency = decisions.find(d => d.status === 'Deficiency raised');

  const handleResubmit = async () => {
    setResubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'Resubmitted', comment: 'Applicant has addressed the raised deficiencies.' })
      });
      if (res.ok) {
        setProject((p: any) => ({ ...p, status: 'Resubmitted' }));
        // Refresh decisions
        const dRes = await fetch(`${API_BASE_URL}/api/projects/${id}/decisions`, { headers: { Authorization: `Bearer ${token}` } });
        if (dRes.ok) setDecisions(await dRes.json());
      }
    } finally {
      setResubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-zinc-500">Loading application details...</div>;
  if (!project) return <div className="p-20 text-center text-zinc-500">Application not found.</div>;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6 fade-up relative">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium mb-4"
      >
        <ArrowLeft size={16} /> Back to Applications
      </button>

      <header className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Activity className="text-blue-400" size={20} />
            </div>
            <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Application #{project.id}</p>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{project.title.replace(/^\[.*?\]\s*/, '')}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5"><Clock size={14} /> Submitted {new Date(project.createdAt).toLocaleDateString()}</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>Category: {project.title.match(/^\[(.*?)\]/)?.[1] || 'Infrastructure'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shrink-0">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1.5 font-bold">Current Status</p>
            <StatusBadge status={project.status} size="lg" />
          </div>
          <div className="w-px h-10 bg-zinc-800" />
          <div className="text-right">
             <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">AI Risk Check</p>
             <p className={`text-lg font-black ${project.riskScore > 70 ? 'text-red-400' : project.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
               {project.riskScore} <span className="text-zinc-600 font-normal text-xs">/100</span>
             </p>
          </div>
        </div>
      </header>

      {/* Deficiency Alerts */}
      {project.status === 'Deficiency raised' && latestDeficiency && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 fade-up">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-amber-500/10 rounded-xl shrink-0 mt-0.5">
              <ShieldAlert className="text-amber-400" size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-amber-100 flex items-center gap-2">
                  Deficiency Raised
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-md">Action Required</span>
                </h3>
                <span className="text-xs text-zinc-500">{new Date(latestDeficiency.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed mb-4 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                {latestDeficiency.comment}
              </p>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleResubmit}
                  disabled={resubmitting}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-amber-600/20"
                >
                  {resubmitting ? 'Processing...' : <><UploadCloud size={16} /> Resubmit Application</>}
                </button>
                <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-xl transition-all">
                  Contact Helpdesk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <DocumentChecklist projectName={project.title} applicationId={project.id} />

          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">AI Risk Summary</h2>
            <p className="text-sm text-zinc-400 leading-relaxed italic">"{project.riskSummary}"</p>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-white mb-5 flex items-center gap-2 uppercase tracking-widest">
              Approval Workflow
            </h2>
            <ApprovalTimeline currentStatus={project.status} />
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg">
             <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Quick Actions</h2>
             <div className="space-y-2">
               <button className="w-full flex items-center justify-between p-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors group">
                 <span className="text-sm font-medium text-zinc-300">View Submitted Form</span>
                 <Eye size={16} className="text-zinc-600 group-hover:text-emerald-400" />
               </button>
               <button className="w-full flex items-center justify-between p-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors group">
                 <span className="text-sm font-medium text-zinc-300">Download Receipt</span>
                 <Download size={16} className="text-zinc-600 group-hover:text-emerald-400" />
               </button>
               <button className="w-full flex items-center justify-between p-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-colors group">
                 <span className="text-sm font-medium text-zinc-300">Message Regulator</span>
                 <MessageSquare size={16} className="text-zinc-600 group-hover:text-emerald-400" />
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
