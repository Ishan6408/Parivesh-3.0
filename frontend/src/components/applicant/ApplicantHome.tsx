import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config';
import { motion } from 'motion/react';
import { Upload, FileText, CheckCircle, AlertCircle, ChevronRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../ui/StatCard';
import StatusBadge from '../ui/StatusBadge';

export default function ApplicantHome({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [projects, setProjects] = useState<any[]>([]);
  const { token, user } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const myProjects = data.filter((p: any) => p.applicant === user?.organization || p.applicant === user?.name);
        setProjects(myProjects);
      });
  }, [token, user]);

  const onDrop = async (acceptedFiles: File[]) => {
    setIsUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 200);

    setTimeout(async () => {
      try {
        const file = acceptedFiles[0];
        const res = await fetch(`${API_BASE_URL}/api/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: file.name.replace('.pdf', '') + ' Project',
            description: `Environmental Impact Assessment for ${file.name}.`,
            applicant: user?.organization || user?.name,
            lat: 20 + Math.random() * 10,
            lng: 70 + Math.random() * 15
          })
        });

        if (res.ok) {
          const updatedRes = await fetch(`${API_BASE_URL}/api/projects`, { headers: { 'Authorization': `Bearer ${token}` } });
          const data = await updatedRes.json();
          setProjects(data.filter((p: any) => p.applicant === user?.organization || p.applicant === user?.name));
        }
      } catch (error) {
        console.error('Failed to submit project:', error);
      } finally {
        setIsUploading(false); setUploadProgress(0);
      }
    }, 1500);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false } as any);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8 fade-up">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-500 uppercase font-medium tracking-widest mb-1">Applicant Workspace</p>
          <h1 className="text-3xl font-bold text-white">
            Hello, <span className="gradient-text">{user?.name?.split(' ')[0] || 'there'}</span> 👋
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Manage environmental clearances and compliance reports.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         <StatCard label="Total Applications" value={projects.length} icon={FileText} color="info" index={0} />
         <StatCard label="Approved" value={projects.filter(p => p.status === 'Approved').length} icon={CheckCircle} color="success" index={1} />
         <StatCard label="Under Review" value={projects.filter(p => p.status === 'Under Review' || p.status === 'Pending').length} icon={Upload} color="warning" index={2} />
         <StatCard label="Deficiencies" value={1} icon={AlertCircle} color="danger" index={3} subtitle="Action Required" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
              <Upload size={16} className="text-emerald-400" /> Submit New EIA Report
            </h2>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                isDragActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-800 hover:border-zinc-700 bg-zinc-950/40'
              }`}>
              <input {...getInputProps()} />
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${isDragActive ? 'bg-emerald-500/15' : 'bg-zinc-800'}`}>
                <Upload className={isDragActive ? 'text-emerald-400' : 'text-zinc-400'} size={24} />
              </div>
              <p className="text-zinc-200 font-medium mb-1">{isDragActive ? 'Release to upload!' : 'Drag & drop EIA PDF to auto-fill form'}</p>
              <p className="text-zinc-500 text-sm">or click to browse files</p>
            </div>
            {isUploading && (
              <div className="mt-5 space-y-2">
                 <div className="flex justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 border border-emerald-500 border-t-transparent rounded-full animate-spin" /> Uploading & Auto-Extracting...</span>
                    <span className="text-emerald-400">{uploadProgress}%</span>
                 </div>
                 <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} />
                 </div>
              </div>
            )}
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
             <div className="flex items-center justify-between mb-5">
               <h2 className="text-base font-semibold text-white flex items-center gap-2">
                 <FileText size={16} className="text-zinc-400" /> Recent Activity
               </h2>
               <button onClick={() => onNavigate('/applicant/applications')} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                 View All <ChevronRight size={14} />
               </button>
             </div>
             <div className="space-y-3">
                {projects.slice(0, 3).map((app, i) => (
                  <motion.div key={app.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex justify-between items-center p-4 bg-zinc-950/70 border border-zinc-800/80 rounded-xl hover:border-zinc-700 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-zinc-800 shrink-0"><FileText size={16} className="text-zinc-400" /></div>
                      <div>
                        <h3 className="font-semibold text-zinc-100 text-sm">{app.title}</h3>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Submitted {new Date(app.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <StatusBadge status={app.status} size="sm" />
                  </motion.div>
                ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-5 uppercase tracking-widest">Document Status Check</h2>
            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl flex items-start gap-3">
                <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-xs font-bold text-emerald-100">Biodiversity & EMP Ready</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">All core requirements met for Solar Park Alpha.</p>
                </div>
              </div>
              <div className="p-3.5 bg-red-500/5 border border-red-500/15 rounded-xl flex items-start gap-3">
                 <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                 <div>
                   <h4 className="text-xs font-bold text-red-100">Deficiency: Missing KML</h4>
                   <p className="text-[11px] text-zinc-400 mt-1">GIS boundaries not provided for Riverfront Project.</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
