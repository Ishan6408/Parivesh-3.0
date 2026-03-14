import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import EmptyState from './EmptyState';

export interface ColumnDef<T> {
  header: string;
  accessorKey: keyof T | string;
  sortable?: boolean;
  cell?: (row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  emptyStateIcon?: React.ElementType;
}

function SortIcon({ dir }: { dir: 'asc' | 'desc' | null }) {
  if (!dir) return <ChevronsUpDown size={12} className="text-zinc-600" />;
  return dir === 'asc'
    ? <ChevronUp size={12} className="text-[#FF9933]" />
    : <ChevronDown size={12} className="text-[#FF9933]" />;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  onRowClick,
  isLoading = false,
  emptyStateTitle,
  emptyStateMessage,
  emptyStateIcon,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDir]);

  if (!isLoading && data.length === 0) {
    return <EmptyState title={emptyStateTitle} message={emptyStateMessage} icon={emptyStateIcon} />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-800/70">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-[#0a1935]/80 border-b border-zinc-800">
            {columns.map((col, idx) => (
              <th
                key={String(col.accessorKey) + idx}
                className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap select-none ${col.width ?? ''} ${col.sortable ? 'cursor-pointer hover:text-zinc-300 transition-colors' : ''}`}
                onClick={() => col.sortable && handleSort(String(col.accessorKey))}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <SortIcon dir={sortKey === String(col.accessorKey) ? sortDir : null} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/40">
          {sorted.map((row, i) => (
            <tr
              key={row.id ? String(row.id) : i}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-white/5' : ''} ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}
            >
              {columns.map((col, idx) => (
                <td key={String(col.accessorKey) + idx} className="px-4 py-3.5 text-zinc-300">
                  {col.cell
                    ? col.cell(row)
                    : String(row[col.accessorKey as keyof T] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
