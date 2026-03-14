import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  page?: number;
  currentPage?: number;
  pageSize?: number;
  itemsPerPage?: number;
  total?: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
}

export default function PaginationControls({ 
  page, currentPage, 
  pageSize, itemsPerPage, 
  total, totalItems, 
  onPageChange 
}: PaginationControlsProps) {
  const activePage = currentPage ?? page ?? 1;
  const activePageSize = itemsPerPage ?? pageSize ?? 10;
  const activeTotal = totalItems ?? total ?? 0;

  const totalPages = Math.max(1, Math.ceil(activeTotal / activePageSize));
  const start = (activePage - 1) * activePageSize + 1;
  const end = Math.min(activePage * activePageSize, activeTotal);

  if (activeTotal === 0) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3">
      <p className="text-xs text-zinc-500">
        Showing <span className="font-semibold text-zinc-300">{start}–{end}</span> of{' '}
        <span className="font-semibold text-zinc-300">{activeTotal}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(activePage - 1)}
          disabled={activePage <= 1}
          className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter(p => p === 1 || p === totalPages || Math.abs(p - activePage) <= 1)
          .reduce<(number | '...')[]>((acc, p, i, arr) => {
            if (i > 0 && typeof arr[i - 1] === 'number' && p - (arr[i - 1] as number) > 1) {
              acc.push('...');
            }
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === '...' ? (
              <span key={`ellipsis-${i}`} className="px-2 text-zinc-600 text-xs">…</span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p as number)}
                className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-medium transition-all border ${
                  activePage === p
                    ? 'bg-[#FF9933]/10 border-[#FF9933]/30 text-[#FF9933]'
                    : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                {p}
              </button>
            )
          )}

        <button
          onClick={() => onPageChange(activePage + 1)}
          disabled={activePage >= totalPages}
          className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
