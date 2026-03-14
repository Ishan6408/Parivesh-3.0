import React from 'react';

interface LoadingSkeletonProps {
  rows?: number;
  type?: 'card' | 'table' | 'stat';
}

function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={`bg-zinc-800/60 rounded animate-pulse ${className ?? ''}`}
      style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)', backgroundSize: '200% 100%' }}
    />
  );
}

export function StatSkeleton() {
  return (
    <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
      <Shimmer className="h-3 w-24" />
      <Shimmer className="h-8 w-16" />
      <Shimmer className="h-3 w-20" />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-3">
        <Shimmer className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-48" />
          <Shimmer className="h-3 w-32" />
        </div>
        <Shimmer className="h-6 w-20 rounded-lg" />
      </div>
      <Shimmer className="h-3 w-full" />
      <Shimmer className="h-3 w-3/4" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-zinc-800/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <Shimmer className={`h-4 ${i === 0 ? 'w-40' : i === cols - 1 ? 'w-20' : 'w-28'}`} />
        </td>
      ))}
    </tr>
  );
}

export default function LoadingSkeleton({ rows = 3, type = 'card' }: LoadingSkeletonProps) {
  if (type === 'stat') {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: rows }).map((_, i) => <StatSkeleton key={i} />)}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-0">
        {Array.from({ length: rows }).map((_, i) => <TableRowSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}
