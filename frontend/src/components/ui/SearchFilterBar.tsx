import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  icon?: React.ReactNode;
}

interface SearchFilterBarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  filters?: FilterConfig[]; // New multi-filter support
  // Legacy support props:
  filterLabel?: string;
  filterOptions?: FilterOption[];
  filterValue?: string;
  onFilterChange?: (value: string) => void;
  children?: React.ReactNode; 
}

export default function SearchFilterBar({
  searchQuery,
  onSearchChange,
  placeholder = 'Search...',
  filters,
  filterLabel = 'Status',
  filterOptions,
  filterValue,
  onFilterChange,
  children,
}: SearchFilterBarProps) {
  // Use legacy props if filters prop is not provided, allowing smooth migration
  const activeFilters = filters || (filterOptions && onFilterChange ? [{
    label: filterLabel,
    value: filterValue || '',
    onChange: onFilterChange,
    options: filterOptions,
    icon: <SlidersHorizontal size={13} />
  }] : []);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      {onSearchChange && (
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchQuery || ''}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-9 pr-8 py-2.5 bg-[#0a1935] border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#FF9933]/40 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Dynamic multiple filters */}
      {activeFilters.map((flt, idx) => (
        <div className="relative shrink-0" key={idx}>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
             {flt.icon || <SlidersHorizontal size={13} />}
          </div>
          <select
            value={flt.value}
            onChange={e => flt.onChange(e.target.value)}
            className="pl-8 pr-8 py-2.5 bg-[#0a1935] border border-zinc-800 rounded-xl text-sm text-zinc-200 focus:outline-none focus:border-[#FF9933]/40 appearance-none cursor-pointer transition-colors w-full sm:w-auto min-w-[150px]"
          >
            {flt.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      ))}

      {children}
    </div>
  );
}
