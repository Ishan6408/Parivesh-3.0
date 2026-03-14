import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { motion } from 'motion/react';
import { AlertTriangle, ShieldAlert, Zap, MapPin, ExternalLink, Clock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StatCard from './ui/StatCard';
import StatusBadge from './ui/StatusBadge';
import EmptyState from './ui/EmptyState';
import SearchFilterBar from './ui/SearchFilterBar';

interface Alert {
  id: number;
  projectId: number;
  projectTitle: string;
  type: string;
  severity: string;
  message: string;
  createdAt: string;
}

const SEVERITY_FILTERS = [
  { value: 'All', label: 'All Severities' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
];

export default function RiskAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const { token } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/alerts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setAlerts(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [token]);

  const filtered = alerts.filter(a => {
    const matchSearch = a.projectTitle?.toLowerCase().includes(search.toLowerCase()) ||
                        a.message?.toLowerCase().includes(search.toLowerCase());
    const matchSev = severityFilter === 'All' || a.severity === severityFilter;
    return matchSearch && matchSev;
  });

  const highCount = filtered.filter(a => a.severity === 'High').length;
  const medCount = filtered.filter(a => a.severity === 'Medium').length;
  const lowCount = filtered.filter(a => a.severity === 'Low').length;

  const severityBand = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'high': return { row: 'border-red-500/30 bg-red-500/5', badge: 'bg-red-500/10 text-red-400 border-red-500/30' };
      case 'medium': return { row: 'border-amber-500/30 bg-amber-500/5', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30' };
      default: return { row: 'border-blue-500/30 bg-blue-500/5', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30' };
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 fade-up">
      {/* Header */}
      <header>
        <p className="text-xs text-zinc-500 uppercase font-semibold tracking-widest mb-1">Regulator · Monitoring</p>
        <h1 className="text-2xl font-black text-white">Risk Alerts</h1>
        <p className="text-zinc-500 text-sm mt-1">Automated monitoring system flagging ecological and compliance violations.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Alerts" value={alerts.length} icon={AlertTriangle} color="default" index={0} />
        <StatCard label="High Severity" value={highCount} icon={ShieldAlert} color="danger" index={1} />
        <StatCard label="Medium" value={medCount} icon={AlertTriangle} color="warning" index={2} />
        <StatCard label="Compliance Rate" value="94.2%" icon={ShieldCheck} color="success" index={3} subtitle="Stable" />
      </div>

      {/* Search + Filter */}
      <SearchFilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search alerts by project or message..."
        filterOptions={SEVERITY_FILTERS}
        filterValue={severityFilter}
        onFilterChange={setSeverityFilter}
      />

      {/* Alert list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Zap}
          title="No active alerts"
          message="Satellite monitoring shows no immediate risks for your filter criteria."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => {
            const bands = severityBand(item.severity);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 rounded-2xl border transition-all hover:shadow-lg ${bands.row}`}
              >
                {/* Icon */}
                <div className={`p-3 rounded-xl border shrink-0 self-start ${bands.badge}`}>
                  {item.severity === 'High' ? <ShieldAlert size={22} /> : <AlertTriangle size={22} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${bands.badge}`}>
                      {item.type}
                    </span>
                    <StatusBadge status={item.severity} size="sm" />
                    <span className="text-[10px] text-zinc-600 flex items-center gap-1 ml-auto">
                      <Clock size={10} />{new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-100">{item.projectTitle}</h3>
                  <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{item.message}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => alert(`Centering map on: ${item.projectTitle}`)}
                    className="p-2.5 bg-white/5 border border-white/8 hover:bg-white/10 rounded-xl transition-colors text-zinc-400 hover:text-zinc-200"
                    title="View on Map"
                  >
                    <MapPin size={16} />
                  </button>
                  <button
                    onClick={() => alert(`Investigation started for: ${item.projectTitle}\nTriggering satellite imagery analysis...`)}
                    className="px-4 py-2 bg-white/90 text-zinc-900 font-bold rounded-xl hover:bg-white transition-all flex items-center gap-2 text-xs"
                  >
                    Investigate <ExternalLink size={13} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
