import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { motion, AnimatePresence } from 'motion/react';

import { ChevronRight, BrainCircuit, X, Calendar, ShieldCheck, Check } from 'lucide-react';



import { useAuth } from '../context/AuthContext';
import StatusBadge from './ui/StatusBadge';
import SearchFilterBar from './ui/SearchFilterBar';
import PaginationControls from './ui/PaginationControls';
import ApprovalTimeline from './ui/ApprovalTimeline';
import EmptyState from './ui/EmptyState';
import DocumentChecklist from './applicant/DocumentChecklist';
import { DEFICIENCY_ITEMS } from '../constants/clearanceWorkflow';

function RaiseDeficiencyModal({ projectId, onClose, onSuccess }: { projectId: number, onClose: () => void, onSuccess: () => void }) {
  const { token } = useAuth();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleItem = (item: string) => {
    setSelectedItems(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0 || !comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/deficiencies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ items: selectedItems, comment })
      });
      if (res.ok) onSuccess();
    } catch (err) {
      console.error("Failed to raise deficiency:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[200] p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl bg-[#0a1935] border border-zinc-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="text-red-400" size={24} /> Raise Environmental Deficiency
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 custom-scrollbar">
          <p className="text-sm text-zinc-400 mb-2">Select missing or incorrect items from the regulatory list:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {DEFICIENCY_ITEMS.map((item) => (
              <button
                key={item}
                onClick={() => toggleItem(item)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedItems.includes(item) 
                    ? 'bg-red-500/10 border-red-500/50 text-red-100' 
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  selectedItems.includes(item) ? 'bg-red-500 border-red-500' : 'border-zinc-700'
                }`}>
                  {selectedItems.includes(item) && <Check size={12} className="text-white" />}
                </div>
                <span className="text-xs font-medium">{item}</span>
              </button>
            ))}
          </div>

          <div className="pt-4">
            <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2 block">Deficiency Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide specific instructions for the applicant (e.g. 'Submit revised forest NOC with correct khasra numbers.')"
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm text-white focus:ring-1 focus:ring-red-500/50 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-zinc-800">
          <button onClick={onClose} className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl text-sm transition-colors">Cancel</button>
          <button 
            disabled={selectedItems.length === 0 || !comment.trim() || submitting}
            onClick={handleSubmit}
            className="flex-1 py-3 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-red-600/20"
          >
            {submitting ? 'Submitting...' : 'Issue Deficiency'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}



interface Project {
  id: number;
  title: string;
  applicant: string;
  status: string;
  riskScore: number;
  riskSummary: string;
  createdAt: string;
  description: string;
}

const MOCK_PROJECTS: Project[] = [
  { id: 101, title: 'Western Ghats Eco-Resort', applicant: 'GreenStay Ltd.', status: 'Pending', riskScore: 82, riskSummary: 'High proximity to protected wildlife reserve. Severe deforestation risk.', createdAt: '2023-10-12', description: 'Construction of a 50-villa luxury eco-resort spread across 15 acres.' },
  { id: 102, title: 'Mumbai Coastal Road Phase 2', applicant: 'MMRDA', status: 'Under Review', riskScore: 65, riskSummary: 'Moderate marine ecosystem impact. Requires strict compliance with CRZ norms.', createdAt: '2023-11-05', description: 'Extension of the coastal road from Bandra to Versova.' },
  { id: 103, title: 'Thar Solar Park Expansion', applicant: 'NaviEnergyCorp', status: 'Action Required', riskScore: 28, riskSummary: 'Low environmental impact. Arid land usage optimal for solar generation.', createdAt: '2023-11-20', description: 'Adding 500MW capacity to the existing solar park in Jaisalmer.' },
  { id: 104, title: 'Kaveri River Sand Mining', applicant: 'Delta Minerals', status: 'Rejected', riskScore: 95, riskSummary: 'Critical threat to riverbed ecology and groundwater levels.', createdAt: '2023-09-15', description: 'Proposed sand extraction project in the Trichy river basin.' },
  { id: 105, title: 'Pune Metro Line 4', applicant: 'Pune Metro Rail', status: 'Approved', riskScore: 45, riskSummary: 'Urban infrastructure project with manageable urban tree displacement.', createdAt: '2023-08-10', description: 'New metro line from Hinjewadi to Shivajinagar.' },
];

const PAGE_SIZE = 8;

const STATUS_FILTERS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Under Review', label: 'Under Review' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Rejected', label: 'Rejected' },
];

export default function PendingApplications() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showDeficiencyModal, setShowDeficiencyModal] = useState(false);
  const [page, setPage] = useState(1);

  const { token } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        } else {
          setProjects(MOCK_PROJECTS);
        }
      })
      .catch(() => setProjects(MOCK_PROJECTS));
  }, [token]);

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                        p.applicant.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filterStatus === 'All' || p.status === filterStatus;
    return matchSearch && matchFilter;
  });

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearchChange = (v: string) => { setSearch(v); setPage(1); };
  const handleFilterChange = (v: string) => { setFilterStatus(v); setPage(1); };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 fade-up">
      {/* Header */}
      <header>
        <p className="text-xs text-zinc-500 uppercase font-semibold tracking-widest mb-1">Regulator · Applications</p>
        <h1 className="text-2xl font-black text-white">All Applications</h1>
        <p className="text-zinc-500 text-sm mt-1">Browse, search, and review all submitted environmental clearance applications.</p>
      </header>

      {/* Search + Filter */}
      <SearchFilterBar
        searchQuery={search}
        onSearchChange={handleSearchChange}
        placeholder="Search by project title or applicant..."
        filterOptions={STATUS_FILTERS}
        filterValue={filterStatus}
        onFilterChange={handleFilterChange}
      />

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState title="No applications found" message="Try adjusting your search or filter criteria." />
      ) : (
        <div className="bg-[#0f1f4a]/80 border border-zinc-800/70 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#0a1935]/80 border-b border-zinc-800">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Project Name</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hidden md:table-cell">Applicant</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Risk Score</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500">Status</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hidden lg:table-cell">Submitted</th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {paged.map((project, i) => (
                <motion.tr
                  key={project.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedProject(project)}
                  className="hover:bg-white/3 cursor-pointer transition-colors group"
                >
                  <td className="px-5 py-4">
                    <div className="font-semibold text-zinc-100 text-sm">{project.title}</div>
                    <div className="text-[10px] text-zinc-600 mt-0.5 line-clamp-1 hidden sm:block">{project.description?.slice(0, 60)}…</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-zinc-400 hidden md:table-cell">{project.applicant}</td>
                  <td className="px-5 py-4">
                    <div className={`flex items-center gap-2 text-sm font-bold ${
                      project.riskScore > 70 ? 'text-red-400' : project.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {project.riskScore}/100
                      <div className="w-12 h-1.5 bg-zinc-800 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${project.riskScore > 70 ? 'risk-high' : project.riskScore > 30 ? 'risk-med' : 'risk-low'}`}
                          style={{ width: `${project.riskScore}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={project.status} size="sm" />
                  </td>
                  <td className="px-5 py-4 text-xs text-zinc-500 hidden lg:table-cell">
                    <span className="flex items-center gap-1"><Calendar size={11} />{new Date(project.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <ChevronRight size={16} className="text-zinc-600 group-hover:text-zinc-300 transition-colors inline" />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 border-t border-zinc-800/50">
            <PaginationControls page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedProject && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-xl bg-[#0a1935] border-l border-zinc-800 z-[101] shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                {/* Drawer header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Application Detail</p>
                    <h2 className="text-xl font-bold text-white leading-tight">{selectedProject.title}</h2>
                    <p className="text-sm text-zinc-500 mt-1">{selectedProject.applicant}</p>
                  </div>
                  <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-zinc-800 rounded-xl text-zinc-500 hover:text-white transition-colors mt-1">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Status + Risk Row */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <StatusBadge status={selectedProject.status} size="md" />
                    <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${
                      selectedProject.riskScore > 70 ? 'text-red-400 bg-red-500/10 border-red-500/25' :
                      selectedProject.riskScore > 30 ? 'text-amber-400 bg-amber-500/10 border-amber-500/25' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25'
                    }`}>
                      Risk: {selectedProject.riskScore}/100
                    </span>
                  </div>

                  {/* Timeline */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Application Lifecycle</h3>
                    <ApprovalTimeline currentStatus={selectedProject.status} />
                  </div>

                  {/* Description */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Project Description</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{selectedProject.description || 'No description provided.'}</p>
                  </div>

                  {/* AI Risk Summary */}
                  {selectedProject.riskSummary && (
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <BrainCircuit size={15} className="text-indigo-400" />
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">AI Risk Summary</h3>
                        <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded uppercase tracking-widest font-bold">AI</span>
                      </div>
                      <p className="text-sm text-zinc-400 leading-relaxed italic">"{selectedProject.riskSummary}"</p>
                    </div>
                  )}

                  {/* Affidavit Verification */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Compliance Affidavit</h3>
                      <span className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded uppercase tracking-widest font-bold font-mono">Verified E-Sign</span>
                    </div>
                    <div className="p-4 bg-zinc-950/60 border border-zinc-800/50 rounded-xl space-y-3">
                      <div className="flex items-center gap-3">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        <span className="text-xs text-zinc-300 font-medium">14/14 Compliance Rules Affirmed</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 leading-relaxed font-mono">
                        Digital ID: AFF-{selectedProject.id}-{new Date(selectedProject.createdAt).getTime().toString(36).toUpperCase()}
                      </div>
                      <button className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors border border-zinc-700/50">
                        View Full E-Affidavit
                      </button>
                    </div>
                  </div>

                  {/* GIS Validation Proximity Warnings */}
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5">
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">GIS Proximity Validation</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-zinc-800/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs text-zinc-300">Forest Boundary</span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500 tracking-tighter">{">"} 15.4 km</span>

                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-950/60 border border-emerald-500/20 rounded-xl">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-400" />
                          <span className="text-xs text-zinc-300 font-medium">Eco-Sensitive Zone</span>
                        </div>
                        <span className="text-[10px] font-black text-red-400 tracking-tighter">0.8 km [CRITICAL]</span>
                      </div>
                    </div>
                  </div>

                  <DocumentChecklist 
                    projectName={selectedProject.title} 
                    applicationId={selectedProject.id} 
                    isRegulator={true}
                  />


                  {/* Actions */}
                  <div className="space-y-3 pt-2">
                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          await fetch(`${API_BASE_URL}/api/projects/${selectedProject.id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ status: 'Approved', comment: 'Clearance Granted' })
                          });
                          setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, status: 'Approved' } : p));
                          setSelectedProject(null);
                        }}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-emerald-500/10"
                      >
                        Grant Clearance
                      </button>
                      <button
                        onClick={async () => {
                          await fetch(`${API_BASE_URL}/api/projects/${selectedProject.id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ status: 'Rejected', comment: 'Application Rejected' })
                          });
                          setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, status: 'Rejected' } : p));
                          setSelectedProject(null);
                        }}
                        className="flex-1 py-3 bg-red-600/80 hover:bg-red-600 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-red-500/10"
                      >
                        Reject
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={async () => {
                          await fetch(`${API_BASE_URL}/api/projects/${selectedProject.id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ status: 'Under scrutiny', comment: 'Commencing document verification.' })
                          });
                          setProjects(prev => prev.map(p => p.id === selectedProject.id ? { ...p, status: 'Under scrutiny' } : p));
                          setSelectedProject(prev => prev ? { ...prev, status: 'Under scrutiny' } : null);
                        }}
                        className="flex-1 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-semibold rounded-xl transition-all text-xs"
                      >
                        Start Scrutiny
                      </button>
                      <button
                        onClick={() => setShowDeficiencyModal(true)}
                        className="flex-1 py-2.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-semibold rounded-xl transition-all text-xs"
                      >
                        Raise Deficiency
                      </button>

                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeficiencyModal && selectedProject && (
          <RaiseDeficiencyModal 
            projectId={selectedProject.id} 
            onClose={() => setShowDeficiencyModal(false)} 
            onSuccess={() => {
              setShowDeficiencyModal(false);
              setSelectedProject(null);
              // Optionally refresh projects
              fetch(`${API_BASE_URL}/api/projects`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => setProjects(Array.isArray(data) ? data : MOCK_PROJECTS));
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
