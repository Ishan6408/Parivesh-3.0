import React from 'react';
import { CheckCircle, Clock, XCircle, Search, AlertTriangle, ShieldAlert, FileText } from 'lucide-react';

type Status =
  | 'Approved'
  | 'Rejected'
  | 'Pending'
  | 'Under Review'
  | 'Draft'
  | 'Submitted'
  | 'Expert Review'
  | 'Completed'
  | 'Compliant'
  | 'Warning'
  | 'Violation'
  | 'High'
  | 'Medium'
  | 'Low'
  | string;

interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<string, { classes: string; Icon: React.ElementType }> = {
  Approved:       { classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', Icon: CheckCircle },
  Completed:      { classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', Icon: CheckCircle },
  Compliant:      { classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', Icon: CheckCircle },
  Low:            { classes: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25', Icon: CheckCircle },
  Rejected:       { classes: 'text-red-400 bg-red-500/10 border-red-500/25', Icon: XCircle },
  Violation:      { classes: 'text-red-400 bg-red-500/10 border-red-500/25', Icon: XCircle },
  High:           { classes: 'text-red-400 bg-red-500/10 border-red-500/25', Icon: AlertTriangle },
  Pending:        { classes: 'text-amber-400 bg-amber-500/10 border-amber-500/25', Icon: Clock },
  Warning:        { classes: 'text-amber-400 bg-amber-500/10 border-amber-500/25', Icon: AlertTriangle },
  Medium:         { classes: 'text-amber-400 bg-amber-500/10 border-amber-500/25', Icon: AlertTriangle },
  'Under Review': { classes: 'text-blue-400 bg-blue-500/10 border-blue-500/25', Icon: Search },
  'Expert Review':{ classes: 'text-violet-400 bg-violet-500/10 border-violet-500/25', Icon: ShieldAlert },
  Draft:          { classes: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/25', Icon: FileText },
  Submitted:      { classes: 'text-sky-400 bg-sky-500/10 border-sky-500/25', Icon: FileText },
};

const sizeClasses = {
  sm: 'text-[10px] px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
};

const iconSizes = { sm: 10, md: 12, lg: 14 };

export default function StatusBadge({ status, size = 'md', showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    classes: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/25',
    Icon: FileText,
  };
  const { classes, Icon } = config;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-lg border uppercase tracking-wide ${classes} ${sizeClasses[size]}`}
    >
      {showIcon && <Icon size={iconSizes[size]} />}
      {status}
    </span>
  );
}
