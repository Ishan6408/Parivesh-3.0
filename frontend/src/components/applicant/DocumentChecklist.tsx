import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, AlertCircle, Clock, UploadCloud, FileText, 
  Eye, RefreshCw, Loader2
} from 'lucide-react';


import StatusBadge from '../ui/StatusBadge';
import { CATEGORY_CHECKLISTS, ProjectCategory } from '../../constants/clearanceWorkflow';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import FileUploadModal from '../ui/FileUploadModal';

export interface DocumentItem {
  id: number;
  projectId: number;
  documentType: string;
  status: 'Approved' | 'Under Review' | 'Uploaded' | 'Missing';
  fileName: string;
  filePath: string;
  uploadedAt: string;
}

interface DocumentChecklistProps {
  projectName?: string;
  applicationId?: number;
  isRegulator?: boolean;
}

export default function DocumentChecklist({ 
  projectName = '', 
  applicationId,
  isRegulator = false 
}: DocumentChecklistProps) {
  const { token } = useAuth();
  const [applicationDocuments, setApplicationDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState<{ open: boolean; docType: string } | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!applicationId) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${applicationId}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApplicationDocuments(data);
      }
    } catch (err) {
      console.error("Failed to fetch documents:", err);
    } finally {
      setLoading(false);
    }
  }, [applicationId, token]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Infer category from title [Category] Title
  const categoryMatch = projectName.match(/^\[(.*?)\]/);
  const category = (categoryMatch ? categoryMatch[1] : 'Infrastructure Projects') as ProjectCategory;
  const requiredList = CATEGORY_CHECKLISTS[category] || CATEGORY_CHECKLISTS['Infrastructure Projects'];
  
  // Merge required items with existing uploaded documents
  const mergedDocuments = requiredList.map(item => {
    const existing = applicationDocuments.find(d => d.documentType === item.name);
    return {
      id: item.id,
      dbId: existing?.id,
      name: item.name,
      category: item.category,
      status: existing ? (existing.status as any) : 'Missing',
      updatedAt: existing ? existing.uploadedAt : '',
      fileName: existing?.fileName,
      filePath: existing?.filePath
    };
  });

  const total = mergedDocuments.length;
  const provided = mergedDocuments.filter(d => d.status !== 'Missing').length;
  const approved = mergedDocuments.filter(d => d.status === 'Approved').length;
  const completionPercentage = Math.round((provided / total) * 100);

  const handleStatusUpdate = async (docId: number, status: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/documents/${docId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchDocuments();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const getStatusColor = (s: string) => {
    switch(s) {
      case 'Approved': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Under Review': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'Uploaded': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-red-400 bg-red-500/10 border-red-500/20';
    }
  };

  return (
    <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-6 fade-up relative overflow-hidden">
      {/* Glossy background effect */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="text-emerald-400" size={20} /> Document Validation Checklist
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Track mandatory documents required for clearance processing.</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1 font-bold">Application Completeness</div>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full rounded-full ${completionPercentage === 100 ? 'bg-emerald-500' : 'bg-emerald-600'}`}
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <span className={`text-lg font-black ${completionPercentage === 100 ? 'text-emerald-400' : 'text-white'}`}>
              {completionPercentage}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pt-5 border-t border-zinc-800/50">
        <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 shadow-inner">
          <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Total Required</p>
          <p className="text-2xl font-black text-white">{total}</p>
        </div>
        <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 shadow-inner">
          <p className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider mb-1">Approved</p>
          <p className="text-2xl font-black text-emerald-400">{approved}</p>
        </div>
        <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 shadow-inner">
          <p className="text-[10px] text-blue-500 uppercase font-bold tracking-wider mb-1">Uploaded</p>
          <p className="text-2xl font-black text-blue-400">{provided - approved}</p>
        </div>
        <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 shadow-inner">
          <p className="text-[10px] text-red-500 uppercase font-bold tracking-wider mb-1">Missing</p>
          <p className="text-2xl font-black text-red-400">{total - provided}</p>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-10 gap-3 text-zinc-500">
            <Loader2 className="animate-spin" size={20} />
            <span className="text-sm">Synchronizing document status...</span>
          </div>
        ) : mergedDocuments.map((doc) => (
          <motion.div 
            layout
            key={doc.id} 
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700 transition-colors rounded-xl group"
          >
            <div className="flex items-start gap-4 min-w-0">
              <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 transition-colors ${getStatusColor(doc.status)}`}>
                {doc.status === 'Approved' ? <CheckCircle2 size={16} /> :
                 doc.status === 'Missing' ? <AlertCircle size={16} /> :
                 <Clock size={16} />}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-zinc-100 text-sm truncate">{doc.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{doc.category}</span>
                  {doc.updatedAt && (
                    <>
                      <span className="text-zinc-700">•</span>
                      <span className="text-xs text-zinc-600">Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              <StatusBadge status={doc.status} size="sm" showIcon={false} />
              
              <div className="flex items-center gap-2">
                {doc.status !== 'Missing' && (
                  <button 
                    onClick={() => window.open(`${API_BASE_URL}/${doc.filePath}`, '_blank')}
                    className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-zinc-700"
                    title="View Document"
                  >
                    <Eye size={16} />
                  </button>
                )}

                {!isRegulator ? (
                  doc.status === 'Missing' ? (
                    <button 
                      onClick={() => setUploadModal({ open: true, docType: doc.name })}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/10 active:scale-95"
                    >
                      <UploadCloud size={14} /> Upload
                    </button>
                  ) : (
                    <button 
                      onClick={() => setUploadModal({ open: true, docType: doc.name })}
                      className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg transition-colors border border-transparent hover:border-zinc-700"
                      title="Replace Document"
                    >
                      <RefreshCw size={16} />
                    </button>
                  )
                ) : (
                  doc.status === 'Uploaded' && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => doc.dbId && handleStatusUpdate(doc.dbId, 'Approved')}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase rounded-lg border border-emerald-500/30 transition-all"
                      >
                         Approve
                      </button>
                      <button 
                        onClick={() => doc.dbId && handleStatusUpdate(doc.dbId, 'Needs correction')}
                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold uppercase rounded-lg border border-red-500/30 transition-all"
                      >
                         Reject
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {uploadModal?.open && (
           <FileUploadModal 
             docType={uploadModal.docType} 
             applicationId={applicationId} 
             onClose={() => setUploadModal(null)} 
             onSuccess={() => { setUploadModal(null); fetchDocuments(); }}
           />
        )}
      </AnimatePresence>
    </div>
  );
}


