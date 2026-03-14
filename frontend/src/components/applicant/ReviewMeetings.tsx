import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Calendar, Video, Clock, FileText, BrainCircuit, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import StatusBadge from '../ui/StatusBadge';

const MOCK_MEETINGS = [
  {
    id: 'MEET-8092',
    title: 'EAC Committee Review: Solar Park Alpha',
    date: '2026-03-20T10:30:00Z',
    status: 'Scheduled',
    committee: 'Expert Appraisal Committee (Infra-1)',
    link: 'https://meet.parivesh.gov.in/eac-8092',
    transcript: ''
  },
  {
    id: 'MEET-8041',
    title: 'SEIAA Initial Screening: Riverfront Dev',
    date: '2026-02-15T14:00:00Z',
    status: 'Completed',
    committee: 'State Environment Impact Assessment Authority',
    link: '',
    transcript: 'The committee reviewed the initial KML files and hydrology reports. The applicant was asked to explain the seasonal fluctuation data which was missing from the submitted addendum. The committee noted the proximity to the bird sanctuary and decided to raise a formal deficiency requesting a revised wildlife management plan within 15 days.'
  }
];

export default function ReviewMeetings() {
  const [meetings] = useState(MOCK_MEETINGS);
  const [activeMeeting, setActiveMeeting] = useState<any>(null);
  const [gist, setGist] = useState<string | null>(null);
  const [loadingGist, setLoadingGist] = useState(false);
  const { token } = useAuth();

  const handleGenerateGist = async (transcript: string) => {
    setLoadingGist(true);
    setGist(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/meeting-gist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transcript })
      });
      const data = await res.json();
      setGist(data.summary);
    } catch (err) {
      console.error(err);
      setGist("AI Summary unavailable right now.");
    } finally {
      setLoadingGist(false);
    }
  };

  const openMeetingDetail = (m: any) => {
    setActiveMeeting(m);
    setGist(null);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6 fade-up relative">
      <header>
        <p className="text-xs text-purple-400 uppercase font-bold tracking-widest mb-1 flex items-center gap-1.5">
          <Users size={14} /> Regulatory Hearings
        </p>
        <h1 className="text-3xl font-black text-white">Review Meetings</h1>
        <p className="text-zinc-400 text-sm mt-1">Join scheduled videoconferences with the EAC/SEIAA and access AI-generated Minutes of Meeting (MoM).</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {meetings.map((m) => {
          const isUpcoming = m.status === 'Scheduled';
          return (
            <div key={m.id} onClick={() => openMeetingDetail(m)} className="bg-[#0f1f4a]/50 border border-zinc-800 hover:border-purple-500/50 rounded-2xl p-5 cursor-pointer transition-all shadow-xl shadow-black/20 group">
              <div className="flex justify-between items-start mb-3">
                <StatusBadge status={isUpcoming ? 'Under Review' : 'Approved'} size="sm" /> 
                <span className="text-xs text-zinc-500 font-mono">{m.id}</span>
              </div>
              <h3 className="text-base font-bold text-white mb-1 group-hover:text-purple-300 transition-colors line-clamp-1">{m.title}</h3>
              <p className="text-xs text-zinc-400 mb-4">{m.committee}</p>
              
              <div className="flex items-center gap-4 text-sm font-medium">
                <div className={`flex items-center gap-1.5 ${isUpcoming ? 'text-purple-400' : 'text-zinc-500'}`}>
                  <Calendar size={16} /> {new Date(m.date).toLocaleDateString()}
                </div>
                <div className={`flex items-center gap-1.5 ${isUpcoming ? 'text-purple-400' : 'text-zinc-500'}`}>
                  <Clock size={16} /> {new Date(m.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {activeMeeting && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveMeeting(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} 
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-2xl bg-[#0a1935] border border-zinc-800 shadow-2xl rounded-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="p-5 border-b border-white/5 bg-zinc-950/30 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeMeeting.status === 'Scheduled' ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    <Video size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{activeMeeting.title}</h2>
                    <p className="text-xs text-zinc-400">{activeMeeting.committee}</p>
                  </div>
                </div>
                <button onClick={() => setActiveMeeting(null)} className="p-2 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                 {/* Detail Banner */}
                 <div className="flex gap-4 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                   <div className="flex-1">
                     <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Date & Time</p>
                     <p className="text-sm font-bold text-white">{new Date(activeMeeting.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                   </div>
                   <div className="flex-1">
                     <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Status</p>
                     <StatusBadge status={activeMeeting.status === 'Scheduled' ? 'Under Review' : 'Approved'} size="sm" />
                   </div>
                 </div>

                 {/* Join / Video link */}
                 {activeMeeting.status === 'Scheduled' ? (
                   <div className="text-center p-8 border-2 border-dashed border-purple-500/30 rounded-2xl bg-purple-500/5">
                     <Video size={40} className="mx-auto text-purple-400 mb-4 animate-pulse" />
                     <h3 className="text-lg font-bold text-white mb-2">Secure Videoconference</h3>
                     <p className="text-sm text-purple-200/80 mb-6">The meeting link will become active 15 minutes prior to the scheduled start time.</p>
                     <button className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled>
                       Join Meeting
                     </button>
                   </div>
                 ) : (
                   <div className="space-y-4">
                     <div className="flex items-center justify-between pointer-events-none">
                       <h3 className="text-sm font-bold text-white flex items-center gap-2"><FileText size={16} className="text-zinc-400"/> Meeting Transcript</h3>
                       <button 
                         onClick={() => handleGenerateGist(activeMeeting.transcript)} 
                         disabled={loadingGist || !!gist}
                         className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-colors pointer-events-auto shadow-[0_0_15px_rgba(16,185,129,0.15)] disabled:opacity-50"
                       >
                         {loadingGist ? <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : <BrainCircuit size={14} />}
                         {loadingGist ? 'Generating...' : gist ? 'Gist Generated' : 'Generate AI Gist'}
                       </button>
                     </div>
                     
                     <div className="p-4 bg-zinc-950 border border-zinc-800/80 rounded-xl">
                       <p className="text-sm text-zinc-400 leading-relaxed italic">"{activeMeeting.transcript}"</p>
                     </div>

                     <AnimatePresence>
                       {gist && (
                         <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                           <div className="p-5 bg-gradient-to-br from-emerald-950/40 to-[#0a1935] border border-emerald-500/30 rounded-xl relative">
                             <h4 className="flex items-center gap-2 text-xs font-black text-emerald-400 uppercase tracking-widest mb-3">
                                <SparklesIcon /> AI Action Items
                             </h4>
                             <p className="text-sm text-emerald-100/90 leading-relaxed font-medium">
                               {gist}
                             </p>
                           </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </div>
                 )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
