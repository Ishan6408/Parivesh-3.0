import { Fragment } from 'react';
import { CheckCircle, Circle, Clock, FileText, Search, ShieldCheck, AlertCircle, Send, XCircle } from 'lucide-react';




export interface TimelineStage {
  id: string;
  label: string;
  sublabel?: string;
  date?: string;
  status: 'completed' | 'active' | 'pending';
}

const DEFAULT_STAGES: Omit<TimelineStage, 'status' | 'date'>[] = [
  { id: 'draft',       label: 'Draft',             sublabel: 'Application prepared' },
  { id: 'submitted',   label: 'Submitted',         sublabel: 'Awaiting scrutiny' },
  { id: 'scrutiny',    label: 'Under scrutiny',    sublabel: 'Document verification' },
  { id: 'deficiency',  label: 'Deficiency raised', sublabel: 'Action required' },
  { id: 'resubmitted', label: 'Resubmitted',       sublabel: 'Awaiting re-scrutiny' },
  { id: 'committee',   label: 'Committee review',  sublabel: 'Expert committee (EAC/SEIAA)' },
  { id: 'approved',    label: 'Approved',          sublabel: 'Clearance granted' },
  { id: 'rejected',    label: 'Rejected',          sublabel: 'Application denied' },
];

const stageIcons: Record<string, React.ElementType> = {
  draft: FileText,
  submitted: Clock,
  scrutiny: Search,
  deficiency: AlertCircle,
  resubmitted: Send,
  committee: ShieldCheck,
  approved: CheckCircle,
  rejected: XCircle,
};


interface ApprovalTimelineProps {
  stages?: TimelineStage[];
  /** Short-cut: pass the current application status string */
  currentStatus?: string;
  compact?: boolean;
}

const statusToStageId: Record<string, string> = {
  Draft: 'draft',
  Submitted: 'submitted',
  'Under scrutiny': 'scrutiny',
  'Deficiency raised': 'deficiency',
  Resubmitted: 'resubmitted',
  'Committee review': 'committee',
  Approved: 'approved',
  Rejected: 'rejected',
};


function deriveStages(currentStatus: string): TimelineStage[] {
  const activeId = statusToStageId[currentStatus] ?? 'submitted';
  const idx = DEFAULT_STAGES.findIndex(s => s.id === activeId);
  return DEFAULT_STAGES.map((s, i) => ({
    ...s,
    status: i < idx ? 'completed' : i === idx ? 'active' : 'pending',
  }));
}

export default function ApprovalTimeline({ stages, currentStatus, compact = false }: ApprovalTimelineProps) {
  const resolvedStages: TimelineStage[] =
    stages ?? (currentStatus ? deriveStages(currentStatus) : deriveStages('Submitted'));

  if (compact) {
    return (
      <div className="flex items-center gap-0">
        {resolvedStages.map((stage, i) => {
          const isLast = i === resolvedStages.length - 1;
          return (
            <Fragment key={stage.id}>

              <div className="flex flex-col items-center gap-1">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                  stage.status === 'completed' ? 'bg-emerald-500 border-emerald-500' :
                  stage.status === 'active'    ? 'bg-[#FF9933] border-[#FF9933] shadow-[0_0_8px_rgba(255,153,51,0.5)]' :
                  'bg-transparent border-zinc-700'
                }`}>
                  {stage.status === 'completed' && <CheckCircle size={10} className="text-white" />}
                  {stage.status === 'active' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className={`text-[9px] font-medium text-center whitespace-nowrap ${
                  stage.status === 'active' ? 'text-[#FF9933]' :
                  stage.status === 'completed' ? 'text-emerald-400' : 'text-zinc-600'
                }`}>{stage.label}</span>
              </div>
              {!isLast && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 ${
                  stage.status === 'completed' ? 'bg-emerald-500' : 'bg-zinc-800'
                }`} />
              )}
            </Fragment>

          );
        })}
      </div>
    );
  }

  return (
    <div className="relative pl-6">
      {/* Vertical line */}
      <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-zinc-800" />

      <div className="space-y-5">
        {resolvedStages.map((stage) => {
          const Icon = stageIcons[stage.id] ?? Circle;
          return (
            <div key={stage.id} className="relative flex items-start gap-4">
              {/* Node */}
              <div className={`absolute -left-6 top-0.5 flex items-center justify-center w-6 h-6 rounded-full border-2 z-10 ${
                stage.status === 'completed' ? 'bg-emerald-500 border-emerald-500'  :
                stage.status === 'active'    ? 'bg-[#FF9933] border-[#FF9933] shadow-[0_0_10px_rgba(255,153,51,0.4)]' :
                'bg-[#0a1935] border-zinc-700'
              }`}>
                {stage.status === 'completed' && <CheckCircle size={12} className="text-white" />}
                {stage.status === 'active'    && <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse" />}
                {stage.status === 'pending'   && <Icon size={11} className="text-zinc-600" />}
              </div>

              {/* Content */}
              <div className={`transition-opacity ${stage.status === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
                <p className={`text-sm font-semibold ${
                  stage.status === 'active' ? 'text-[#FF9933]' :
                  stage.status === 'completed' ? 'text-zinc-200' : 'text-zinc-500'
                }`}>{stage.label}</p>
                {stage.sublabel && (
                  <p className="text-xs text-zinc-600 mt-0.5">{stage.sublabel}</p>
                )}
                {stage.date && (
                  <p className="text-[10px] text-zinc-700 mt-1">{stage.date}</p>
                )}
                {stage.status === 'active' && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-widest text-[#FF9933] bg-[#FF9933]/10 px-2 py-0.5 rounded border border-[#FF9933]/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF9933] animate-pulse" />
                    In Progress
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
