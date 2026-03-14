import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, UploadCloud, X, CheckCircle, Search, Loader2 } from 'lucide-react';
import DataTable, { ColumnDef } from '../ui/DataTable';
import SearchFilterBar, { FilterConfig } from '../ui/SearchFilterBar';
import PaginationControls from '../ui/PaginationControls';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import FileUploadModal from '../ui/FileUploadModal';

export default function Deficiencies() {
  const { token } = useAuth();
  const [deficiencies, setDeficiencies] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeDeficiency, setActiveDeficiency] = useState<any | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const itemsPerPage = 8;

  const fetchDeficiencies = useCallback(async () => {
    try {
      // Let's assume for now we might need to update the server again if a global list is needed.
      // But let's try to fetch per project if we are in a project context, 
      // or if it's the dashboard, we need a global list.
      
      // Let's assume we'll use GET /api/deficiencies (I'll add this to server.ts next)
      const listRes = await fetch(`${API_BASE_URL}/api/deficiencies`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (listRes.ok) {
        const data = await listRes.json();
        setDeficiencies(data);
      }

    } catch (err) {
      console.error("Failed to fetch deficiencies:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDeficiencies();
  }, [fetchDeficiencies]);

  const filtered = deficiencies.filter(d => {
    const sMatch = d.item.toLowerCase().includes(search.toLowerCase()) || (d.projectName || '').toLowerCase().includes(search.toLowerCase());
    const fMatch = !statusFilter || statusFilter === 'All' || d.status === statusFilter;
    return sMatch && fMatch;
  });

  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filterConfigs: FilterConfig[] = [
    {
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
         { value: 'All', label: 'All Statuses' },
         { value: 'Pending', label: 'Pending' },
         { value: 'Response uploaded', label: 'Response Uploaded' },
         { value: 'Resolved', label: 'Resolved' },
      ],
      icon: <ShieldAlert size={16} />
    }
  ];

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/deficiencies/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      fetchDeficiencies();
    } catch (err) {
      console.error("Failed to update deficiency status:", err);
    }
  };

  const StatusDisplay = ({ status }: { status: string }) => {
    if (status === 'Pending') return <span className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">Pending</span>;
    if (status === 'Response uploaded') return <span className="px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">Response Uploaded</span>;
    return <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Resolved</span>;
  };

  const columns: ColumnDef<any>[] = [
    { header: 'ID', accessorKey: 'id', cell: (d) => <span className="text-zinc-500 font-mono text-xs">#{d.id}</span> },
    { header: 'Project ID', accessorKey: 'projectId', cell: (d) => <span className="text-zinc-400 text-xs">P-{d.projectId}</span> },
    { header: 'Deficiency Item', accessorKey: 'item', cell: (d) => <span className="font-semibold text-white text-sm whitespace-nowrap">{d.item}</span> },
    { header: 'Comment', accessorKey: 'comment', cell: (d) => <span className="text-zinc-400 text-xs line-clamp-1 pr-4">{d.comment}</span> },
    { header: 'Raised On', accessorKey: 'createdAt', cell: (d) => <span className="text-zinc-400 text-sm whitespace-nowrap">{new Date(d.createdAt).toLocaleDateString()}</span> },
    { header: 'Status', accessorKey: 'status', cell: (d) => <StatusDisplay status={d.status} /> },
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 fade-up relative">
      <header>
        <p className="text-xs text-red-500/80 uppercase font-semibold tracking-widest mb-1 flex items-center gap-1.5"><ShieldAlert size={14} /> Compliance Tracker</p>
        <h1 className="text-3xl font-black text-white">Environmental Deficiencies</h1>
        <p className="text-zinc-400 text-sm mt-1">Review issues flagged by regulators and upload missing documents or corrections to resume processing.</p>
      </header>

      <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-zinc-800/80">
          <SearchFilterBar 
            searchQuery={search}
            onSearchChange={setSearch}
            placeholder="Search deficiencies by item or comment..."
            filters={filterConfigs}
          />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-500 border-b border-zinc-800/50">
            <Loader2 className="animate-spin" size={32} />
            <p className="text-sm font-medium">Scanning for compliance issues...</p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={paginated}
            onRowClick={setActiveDeficiency}
            emptyStateTitle="No deficiencies found"
            emptyStateMessage="You have zero active or historical deficiencies matching the criteria."
            emptyStateIcon={CheckCircle}
          />
        )}

        {filtered.length > 0 && !loading && (
           <div className="p-4 bg-zinc-950/50 border-t border-zinc-800/50">
             <PaginationControls
                currentPage={currentPage}
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
             />
           </div>
        )}
      </div>

      <AnimatePresence>
        {activeDeficiency && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveDeficiency(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]" />
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} 
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl z-[160] overflow-hidden flex flex-col">
              
              <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-red-500/10 rounded-xl text-red-400"><ShieldAlert size={20} /></span>
                  <div>
                    <h2 className="text-lg font-bold text-white leading-none mb-1">Deficiency #{activeDeficiency.id}</h2>
                    <p className="text-xs text-zinc-500">Project P-{activeDeficiency.projectId}</p>
                  </div>
                </div>
                <button onClick={() => setActiveDeficiency(null)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                   <div><div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Status</div><StatusDisplay status={activeDeficiency.status} /></div>
                   <div><div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Raised On</div><p className="text-sm font-medium text-white">{new Date(activeDeficiency.createdAt).toLocaleDateString()}</p></div>
                   <div><div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-1">Deficiency Item</div><p className="text-sm font-medium text-white">{activeDeficiency.item}</p></div>
                </div>

                <div>
                   <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-2">Regulator Comment</div>
                   <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-xl text-sm text-zinc-300 leading-relaxed shadow-inner">
                     {activeDeficiency.comment}
                   </div>
                </div>

                {activeDeficiency.status === 'Pending' && (
                  <button 
                    onClick={() => setShowUploadModal(true)}
                    className="w-full p-5 border-2 border-dashed border-zinc-700 hover:border-emerald-500 hover:bg-emerald-500/5 rounded-2xl transition-all group text-center"
                  >
                     <UploadCloud size={28} className="mx-auto text-zinc-500 mb-2 group-hover:text-emerald-400 transition-colors" />
                     <p className="text-sm font-bold text-zinc-300 group-hover:text-emerald-300">Upload Responsive Document</p>
                     <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">Fulfill this regulatory requirement to resume scrutiny.</p>
                  </button>
                )}
                
                {activeDeficiency.status === 'Response uploaded' && (
                  <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex gap-3 text-sm">
                    <Search className="text-blue-400 shrink-0" size={18} />
                    <div>
                      <span className="font-bold text-blue-100 uppercase text-[10px] tracking-widest block mb-1">Awaiting Verification</span> 
                      <p className="text-blue-200/80 leading-relaxed text-xs">Your response has been submitted and is currently being internally reviewed by the concerned Environmental Appraisal Committee (EAC) member.</p>
                    </div>
                  </div>
                )}

                {activeDeficiency.status === 'Resolved' && (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex gap-3 text-sm">
                    <CheckCircle className="text-emerald-400 shrink-0" size={18} />
                    <div>
                      <span className="font-bold text-emerald-100 uppercase text-[10px] tracking-widest block mb-1">Requirement Fulfilled</span> 
                      <p className="text-emerald-200/80 leading-relaxed text-xs">This deficiency has been formally resolved and verified. No further action is required for this specific item.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showUploadModal && activeDeficiency && (
          <FileUploadModal 
            docType={`Deficiency response: ${activeDeficiency.item}`}
            applicationId={activeDeficiency.projectId}
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              handleStatusUpdate(activeDeficiency.id, 'Response uploaded');
              setShowUploadModal(false);
              setActiveDeficiency(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
