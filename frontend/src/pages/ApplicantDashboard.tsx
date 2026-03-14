import { useState, useEffect } from 'react';


import { API_BASE_URL } from '../config';
import { motion } from 'motion/react';
import {
  Upload, CheckCircle, Download, Shield, Send, ChevronRight, ShieldCheck, AlertCircle
} from 'lucide-react';

import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { PROJECT_CATEGORIES, ProjectCategory } from '../constants/clearanceWorkflow';


import ApplicantHome from '../components/applicant/ApplicantHome';
import MyApplications from '../components/applicant/MyApplications';
import ApplicantApplicationDetails from '../components/applicant/ApplicantApplicationDetails';
import AffidavitDeclaration from '../components/applicant/AffidavitDeclaration';
import Deficiencies from '../components/applicant/Deficiencies';
import PermissionAdvisor from '../components/applicant/PermissionAdvisor';
import ImpactSimulation from '../components/applicant/ImpactSimulation';
import ReviewMeetings from '../components/applicant/ReviewMeetings';

// ─── Submit Project ───────────────────────────────────────────────────────────
function SubmitProject() {
  const [form, setForm] = useState({ title: '', description: '', lat: '', lng: '', type: 'Infrastructure', category: 'Infrastructure Projects' as ProjectCategory, area: '', forestLand: 'No', waterUsage: '', cost: '', employment: '', distProtectedArea: '', emissions: 'None', wastewater: '', solidWaste: '' });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [agreedPoints, setAgreedPoints] = useState<Record<string, boolean>>({});

  const COMPLIANCE_POINTS = [
    { id: 'c1', text: 'Topsoil extracted from the project area will be preserved and stored properly.' },
    { id: 'c2', text: 'Control blasting will only be done by an authorized DGMS license holder.' },
    { id: 'c3', text: 'Plantation survival rate will be maintained above 90% and continuously monitored.' },
    { id: 'c4', text: 'High-pressure water sprinkling systems will be used to control fugitive dust emissions.' },
    { id: 'c5', text: 'Strict Zero Liquid Discharge (ZLD) will be maintained; no polluted water will be released into natural sources.' },
    { id: 'c6', text: 'Local employment will be prioritized according to state government regulations and rules.' },
    { id: 'c7', text: 'No excavation or operational activity will occur outside the approved lease boundary area.' },
    { id: 'c8', text: 'All Environmental Clearance (EC) conditions will be followed strictly without deviation.' },
    { id: 'c9', text: 'Transportation of minerals will be done in covered vehicles following CPCB/SPCB guidelines.' },
    { id: 'c10', text: 'Mining operations will be carried out such that they do not disturb local flora and fauna.' },
    { id: 'c11', text: 'Scientific restoration work will be completed for all excavated boundary zones post-mining.' },
    { id: 'c12', text: 'All CER (Corporate Environmental Responsibility) activities proposed in the plan will be implemented.' },
    { id: 'c13', text: 'A dense green belt of native trees will be planted and maintained around the entire lease boundary.' },
    { id: 'c14', text: 'Mining operations will strictly follow the Sustainable Sand Mining Guidelines and other environmental regulations.' }
  ];

  const allAgreed = COMPLIANCE_POINTS.every(p => agreedPoints[p.id]);

  const togglePoint = (id: string) => {
    setAgreedPoints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
      return;
    }
    if (!allAgreed) return;

    setIsUploading(true);
    setUploadProgress(0);

    const tick = setInterval(() => setUploadProgress(p => Math.min(p + 15, 90)), 150);

    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ 
          ...form, 
          title: `[${form.category}] ${form.title}`,
          applicant: user?.organization || user?.name, 
          lat: parseFloat(form.lat) || 20.5, 
          lng: parseFloat(form.lng) || 78.9 
        }),
      });
      if (res.ok) { setUploadProgress(100); setTimeout(() => setSubmitted(true), 400); }
    } finally {
      clearInterval(tick);
      setIsUploading(false);
    }
  };


  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    const tick = setInterval(() => setUploadProgress(p => Math.min(p + 20, 90)), 200);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: `[Infrastructure Projects] ${file.name.replace('.pdf', '')} Project`,
          description: `EIA document: ${file.name}`,

          applicant: user?.organization || user?.name,
          lat: 20 + Math.random() * 10,
          lng: 70 + Math.random() * 15,
        }),
      });
      if (res.ok) { setUploadProgress(100); setTimeout(() => setSubmitted(true), 400); }
    } finally {
      clearInterval(tick);
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false } as any);

  if (submitted) return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto fade-up">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-emerald-500/20 rounded-2xl p-12 text-center">
        <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Project Submitted!</h2>
        <p className="text-zinc-400 mb-6 text-sm">Your project has been received. Please review your document checklist.</p>
        <div className="flex items-center justify-center gap-4">
           <button onClick={() => navigate('/applicant/applications')}
             className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-sm font-medium transition-colors">
             View Applications
           </button>
           <button onClick={() => { setSubmitted(false); setForm({ title: '', description: '', lat: '', lng: '', type: 'Infrastructure', category: 'Infrastructure Projects' as ProjectCategory, area: '', forestLand: 'No', waterUsage: '', cost: '', employment: '', distProtectedArea: '', emissions: 'None', wastewater: '', solidWaste: '' }); }}

             className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition-colors">
             Submit Another
           </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6 fade-up">
      <header>
        <h1 className="text-3xl font-bold text-white mb-1">Submit Project</h1>
        <p className="text-zinc-400 text-sm">Submit a new environmental clearance application for AI-powered risk assessment.</p>
      </header>

      {step === 1 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-5 flex items-center gap-2">
              <Send size={16} className="text-emerald-400" /> Fill Project Details
            </h2>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Project Title *</label>
                <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Solar Park Alpha" className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div>
                 <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description *</label>
                 <textarea required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                   rows={3} placeholder="Describe the project scope..." className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Project Category *</label>
                    <select required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ProjectCategory }))} className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50">
                      {PROJECT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Area (Ha) *</label>
                    <input type="number" required value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} placeholder="100" className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50" />
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Latitude *</label>
                    <input required step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                      placeholder="20.5" className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50" />
                 </div>
                 <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Longitude *</label>
                    <input required step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                      placeholder="78.9" className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50" />
                 </div>
              </div>
              <button type="submit" disabled={isUploading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
                Continue to Affidavit <ChevronRight size={16} />
              </button>
            </form>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center" {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                <Upload className="text-emerald-400" size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Upload Draft EIA/KML</h3>
              <p className="text-zinc-500 text-xs mb-6 max-w-[240px] mx-auto">Drag and drop your project documents or click to browse files.</p>
              {isUploading ? (
                <div className="w-full bg-zinc-950 rounded-full h-1.5 border border-zinc-800 mb-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              ) : (
                <button className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors mb-2">Select Files</button>
              )}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col">
              <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Shield size={16} className="text-emerald-400" /> Pre-Submission Check
              </h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <CheckCircle size={12} className="text-emerald-500" /> Correct project category selected
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <CheckCircle size={12} className="text-emerald-500" /> Geographic coordinates validated
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <CheckCircle size={12} className="text-emerald-500" /> Document baseline ready
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-6 lg:p-10 fade-up max-w-3xl mx-auto shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
              <ShieldCheck className="text-emerald-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Step 2: Compliance Affidavit</h2>
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mt-0.5">Final regulatory affirmation</p>
            </div>
          </div>
          
          <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl mb-8 flex gap-3 items-start">
            <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
              You MUST solemnly affirm all 14 compliance points below. These are legally binding conditions for your environmental clearance.
            </p>
          </div>

          <div className="space-y-3 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {COMPLIANCE_POINTS.map((point) => (
              <div 
                key={point.id}
                onClick={() => togglePoint(point.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                  agreedPoints[point.id] 
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_-5px_rgba(16,185,129,0.1)]' 
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  agreedPoints[point.id] ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-500/20' : 'border-zinc-600 bg-zinc-950'
                }`}>
                  {agreedPoints[point.id] && <CheckCircle size={14} className="text-white" />}
                </div>
                <p className={`text-xs leading-relaxed transition-colors ${
                  agreedPoints[point.id] ? 'text-zinc-100 font-medium' : 'text-zinc-500'
                }`}>
                  {point.text}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between gap-4 pt-6 border-t border-zinc-800/80">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-bold rounded-xl text-sm transition-colors"
            >
              Back to Details
            </button>
            <button
              disabled={!allAgreed || isUploading}
              onClick={handleManualSubmit as any}
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Finalizing Submission...
                </div>
              ) : (
                <><Send size={18} /> Final Submit Application</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Compliance Reports ───────────────────────────────────────────────────────
function ComplianceReports() {
  const [projects, setProjects] = useState<any[]>([]);
  const { token, user } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProjects(data.filter((p: any) => p.applicant === user?.organization || p.applicant === user?.name));
        }
      })
      .catch(() => {});
  }, [token, user]);


  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6 fade-up">
      <header>
        <h1 className="text-3xl font-bold text-white mb-1">Compliance Reports</h1>
        <p className="text-zinc-400 text-sm">Download AI-generated environmental risk assessments.</p>
      </header>
      {projects.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <Shield size={32} className="mx-auto text-zinc-700 mb-3" />
          <p className="text-zinc-500">No compliance reports yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="font-semibold text-zinc-100 text-lg">{p.title}</h3>
              <p className="text-xs text-zinc-500 mt-1 mb-4">Submitted {new Date(p.createdAt).toLocaleDateString()}</p>
              <div className="mb-4 text-xs text-zinc-400">Risk Score: {p.riskScore ?? 'N/A'}/100</div>
              <button onClick={() => {}} className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold hover:text-emerald-300">
                <Download size={13} /> Download Report
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Notifications ────────────────────────────────────────────────────────────
function Notifications() {
  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6 fade-up">
      <header><h1 className="text-3xl font-bold text-white">Notifications</h1><p className="text-zinc-400 text-sm">System alerts and workflow updates.</p></header>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-500">All caught up!</div>
    </div>
  );
}


// MAIN DASHBOARD COMPONENT
export default function ApplicantDashboard() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<ApplicantHome onNavigate={(path) => navigate(path)} />} />
      <Route path="/applications" element={<MyApplications onSelectApp={(id) => navigate(`/applicant/applications/${id}`)} />} />
      <Route path="/applications/:id" element={<ApplicantApplicationDetails onBack={() => navigate('/applicant/applications')} />} />
      <Route path="/submit" element={<SubmitProject />} />
      <Route path="/deficiencies" element={<Deficiencies />} />
      <Route path="/affidavits" element={<AffidavitDeclaration />} />
      <Route path="/advisor" element={<PermissionAdvisor />} />
      <Route path="/simulation" element={<ImpactSimulation />} />
      <Route path="/meetings" element={<ReviewMeetings />} />
      <Route path="/compliance" element={<ComplianceReports />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="*" element={<Navigate to="/applicant" replace />} />
    </Routes>
  );
}
