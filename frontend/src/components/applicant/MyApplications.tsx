import { useState, useEffect } from 'react';

import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { Eye, FileText } from 'lucide-react';
import DataTable, { ColumnDef } from '../ui/DataTable';
import StatusBadge from '../ui/StatusBadge';
import SearchFilterBar, { FilterConfig } from '../ui/SearchFilterBar';
import PaginationControls from '../ui/PaginationControls';

export default function MyApplications({ onSelectApp }: { onSelectApp: (id: number) => void }) {
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const mine = data.filter((p: any) =>
          p.applicant === user?.organization || p.applicant === user?.name
        );
        // Add random mock IDs/data for demo if missing
        const augmented = mine.map((p: any, i: number) => {
           const category = p.title.match(/^\[(.*?)\]/)?.[1] || 'Infrastructure';
           const cleanTitle = p.title.replace(/^\[.*?\]\s*/, '');
           
           // Regulatory completion logic
           let completion = 20; // Draft/Submitted
           if (p.status === 'Under scrutiny') completion = 40;
           if (p.status === 'Deficiency raised') completion = 45;
           if (p.status === 'Resubmitted') completion = 60;
           if (p.status === 'Committee review') completion = 85;
           if (p.status === 'Approved') completion = 100;
           if (p.status === 'Rejected') completion = 100;

           return {
             ...p,
             id: p.id || i + 1000,
             displayTitle: cleanTitle,
             category: category,
             completion: completion,
             deficiencies: p.status === 'Deficiency raised' ? 1 : 0,
           };
        });
        setProjects(augmented);

      })
      .finally(() => setLoading(false));
  }, [token, user]);

  const filtered = projects.filter(p => {
    const sMatch = p.title.toLowerCase().includes(search.toLowerCase()) || p.id.toString().includes(search);
    const fMatch = !statusFilter || statusFilter === 'All' || p.status === statusFilter;
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
         { value: 'Pending', label: 'Pending Submission' },
         { value: 'Under Review', label: 'Under Review' },
         { value: 'Approved', label: 'Approved' },
         { value: 'Rejected', label: 'Rejected' },
      ],
      icon: <FileText size={16} />
    }
  ];

  const columns: ColumnDef<any>[] = [
    { header: 'Project Title', accessorKey: 'displayTitle', 
      cell: (p) => (
         <div>
           <p className="font-semibold text-zinc-100 text-sm">{p.displayTitle}</p>
           <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">{p.category}</p>
         </div>
      )
    },

    { header: 'Submitted', accessorKey: 'createdAt',
      cell: (p) => <span className="text-zinc-400 text-sm whitespace-nowrap">{new Date(p.createdAt).toLocaleDateString()}</span>
    },
    { header: 'Checklist', accessorKey: 'completion',
      cell: (p) => (
         <div className="flex items-center gap-2 w-32">
           <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
             <div className={`h-full ${p.completion === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${p.completion}%` }} />
           </div>
           <span className="text-xs text-zinc-400">{p.completion}%</span>
         </div>
      )
    },
    { header: 'Status', accessorKey: 'status',
      cell: (p) => <StatusBadge status={p.status} size="sm" />
    },
    { header: 'Alerts', accessorKey: 'deficiencies',
      cell: (p) => p.deficiencies > 0 ? (
         <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest rounded-lg">
           {p.deficiencies} Issue{p.deficiencies > 1 ? 's' : ''}
         </span>
      ) : (
         <span className="text-zinc-500 text-sm">—</span>
      )
    },
    { header: '', accessorKey: 'id',
      cell: () => (
         <button className="flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors ml-auto">
           <Eye size={14} /> View
         </button>
      )
    }
  ];

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-6 fade-up">
      <header>
        <p className="text-xs text-zinc-500 uppercase font-semibold tracking-widest mb-1">Applicant · Records</p>
        <h1 className="text-3xl font-black text-white">My Applications</h1>
        <p className="text-zinc-400 text-sm mt-1">Track checklist progress and action deficiency reports for all your submissions.</p>
      </header>

      <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-zinc-800/80">
          <SearchFilterBar 
            searchQuery={search}
            onSearchChange={setSearch}
            placeholder="Search by title or application ID..."
            filters={filterConfigs}
          />
        </div>

        <DataTable
          columns={columns}
          data={paginated}
          isLoading={loading}
          onRowClick={(p) => onSelectApp(p.id)}
          emptyStateTitle="No applications found"
          emptyStateMessage="You haven't submitted any applications that match your filters."
        />

        {filtered.length > 0 && (
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
    </div>
  );
}
