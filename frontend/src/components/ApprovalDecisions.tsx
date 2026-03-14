import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle, Info, History, BrainCircuit, ShieldAlert, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './ui/StatusBadge';
import ApprovalTimeline from './ui/ApprovalTimeline';
import EmptyState from './ui/EmptyState';

// Helper for generating mock risk flags
const getRiskFlags = (projectType: string) => {
  if (projectType === 'Mining') return ['Forest Proximity', 'Groundwater Depletion Risk'];
  if (projectType === 'Infrastructure') return ['Missing KML Document'];
  if (projectType === 'Energy') return ['Wildlife Corridor Intersection'];
  return ['No Major Flags'];
};

interface Project {
  id: number;
  title: string;
  applicant: string;
  type?: string;
  status: string;
  riskScore: number;
  riskSummary: string;
  description: string;
}

interface Decision {
  id: number;
  status: string;
  comment: string;
  createdAt: string;
}

export default function ApprovalDecisions() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const pending = (Array.isArray(data) ? data : []).filter(
          (p: Project) => p.status === 'Pending' || p.status === 'Under Review'
        );
        setProjects(pending);
        if (pending.length > 0) setSelectedProject(pending[0]);
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (selectedProject) {
      fetch(`${API_BASE_URL}/api/projects/${selectedProject.id}/decisions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setDecisions(Array.isArray(data) ? data : []))
        .catch(() => setDecisions([]));
    }
  }, [selectedProject, token]);

  const handleDecision = async (status: string) => {
    if (!selectedProject || !comment.trim()) {
      alert('Please provide a comment for your decision.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${selectedProject.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, comment })
      });
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== selectedProject.id));
        setSelectedProject(projects.find(p => p.id !== selectedProject.id) || null);
        setComment('');
        setDecisions([]);
      }
    } catch (error) {
      console.error('Decision failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-4 fade-up">
      <header>
        <p className="text-xs text-zinc-500 uppercase font-semibold tracking-widest mb-1">Regulator · Decisions</p>
        <h1 className="text-2xl font-black text-white">Approval Decisions</h1>
        <p className="text-zinc-500 text-sm mt-1">Issue formal clearance decisions with mandatory reasoning comments.</p>
      </header>

      {projects.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Pending Decisions"
          message="All environmental clearance applications have been processed."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left: Project List */}
          <div className="lg:col-span-1 space-y-2">
            <h2 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-1 mb-3">
              Awaiting Decision ({projects.length})
            </h2>
            {projects.map((project) => (
              <div
                key={project.id}
                onClick={() => { setSelectedProject(project); setComment(''); setDecisions([]); }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedProject?.id === project.id
                    ? 'bg-[#FF9933]/8 border-[#FF9933]/30'
                    : 'bg-[#0f1f4a]/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="font-semibold text-zinc-100 text-sm mb-1.5 leading-snug">{project.title}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 truncate">{project.applicant}</span>
                  <StatusBadge status={project.status} size="sm" showIcon={false} />
                </div>
                <div className={`text-xs font-bold mt-1.5 ${
                  project.riskScore > 70 ? 'text-red-400' : project.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  Risk: {project.riskScore}/100
                </div>
              </div>
            ))}
          </div>

          {/* Right: Decision Panel */}
          <div className="lg:col-span-2 space-y-5">
            {selectedProject && (
              <motion.div
                key={selectedProject.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-5"
              >
                {/* Project Summary */}
                <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-white mb-1">{selectedProject.title}</h2>
                      <p className="text-sm text-zinc-400">{selectedProject.applicant}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1">AI Risk</div>
                      <div className={`text-3xl font-black ${
                        selectedProject.riskScore > 70 ? 'text-red-400' : selectedProject.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {selectedProject.riskScore}<span className="text-base font-normal text-zinc-600">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Status + Timeline */}
                  <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-4 border-b border-zinc-800/80 pb-4">
                    <StatusBadge status={selectedProject.status} size="md" />
                    <div className="flex gap-2 flex-wrap">
                      {getRiskFlags(selectedProject.type || 'Infrastructure').map((flag, idx) => (
                        <span key={idx} className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-1 ${
                          flag === 'No Major Flags' ? 'bg-zinc-800 text-zinc-400' : 'bg-red-500/10 border border-red-500/20 text-red-500'
                        }`}>
                           <Flag size={10} /> {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ApprovalTimeline currentStatus={selectedProject.status} compact />
                </div>

                {/* AI Risk Box */}
                <div className={`border rounded-2xl p-5 ${
                  selectedProject.riskScore > 70 ? 'bg-red-500/5 border-red-500/25' :
                  selectedProject.riskScore > 30 ? 'bg-amber-500/5 border-amber-500/25' :
                  'bg-emerald-500/5 border-emerald-500/25'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <BrainCircuit size={16} className="text-indigo-400" />
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">AI Recommendation</h3>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {selectedProject.riskSummary || 'No AI summary available.'}
                  </p>
                  <p className={`text-sm font-bold mt-3 ${
                    selectedProject.riskScore > 70 ? 'text-red-400' :
                    selectedProject.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    Suggested Action: {
                      selectedProject.riskScore > 70 ? 'Reject (High Risk)' :
                      selectedProject.riskScore > 30 ? 'Request Additional Info (Medium Risk)' :
                      'Approve (Low Risk)'
                    }
                  </p>
                </div>

                {/* Officer Action Panel */}
                <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Officer Action Panel</h3>
                  <textarea
                    className="w-full h-28 bg-zinc-950/60 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#FF9933]/40 transition-colors resize-none placeholder-zinc-600"
                    placeholder="Enter technical grounds for your decision or specific deficiency details (mandatory)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                      disabled={loading}
                      onClick={() => handleDecision('Approved')}
                      className="py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <CheckCircle2 size={15} /> Approve
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => handleDecision('Rejected')}
                      className="py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                    >
                      <XCircle size={15} /> Reject
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => handleDecision('Under Review')}
                      className="py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs text-center leading-tight"
                    >
                      <Info size={15} className="shrink-0" /> Request<br/>Clarification
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => handleDecision('Action Required')}
                      className="py-3 bg-[#FF9933]/10 hover:bg-[#FF9933]/20 border border-[#FF9933]/30 text-[#FF9933] font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs text-center leading-tight shadow-[0_0_15px_rgba(255,153,51,0.1)]"
                    >
                      <ShieldAlert size={15} className="shrink-0" /> Raise<br/>Deficiency
                    </button>
                  </div>
                </div>

                {/* Decision History */}
                <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                    <History size={13} /> Decision History
                  </h3>
                  {decisions.length > 0 ? (
                    <div className="space-y-4 relative pl-5 before:absolute before:left-2 before:top-1 before:bottom-1 before:w-px before:bg-zinc-800">
                      {decisions.map((d, i) => (
                        <div key={i} className="relative">
                          <div className={`absolute -left-5 top-1.5 w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#0a1935] ${
                            d.status === 'Approved' ? 'bg-emerald-500' :
                            d.status === 'Rejected' ? 'bg-red-500' : 'bg-amber-500'
                          }`} />
                          <div className="flex items-center justify-between mb-1">
                            <StatusBadge status={d.status} size="sm" />
                            <span className="text-[10px] text-zinc-600">{new Date(d.createdAt).toLocaleString()}</span>
                          </div>
                          {d.comment && <p className="text-xs text-zinc-400 leading-relaxed mt-1">{d.comment}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-600 italic">No previous decisions recorded for this project.</p>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
