import { useState } from 'react';
import { 
  Bell, Globe, 
  Zap, Save,
  ChevronRight, Lock, UserX
} from 'lucide-react';

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    updates: true
  });

  const [appearance] = useState('dark');

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Platform Settings</h1>
        <p className="text-zinc-500 text-sm">Manage your account preferences and security protocols. Mode: <span className="text-emerald-500 capitalize">{appearance}</span></p>
      </div>

      <div className="space-y-6">
        {/* Notifications Section */}
        <div className="bg-[#0a1935]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Bell size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">Notifications</h2>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(notifications).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between group">
                <div>
                  <p className="text-sm font-bold text-zinc-200 capitalize">{key} Alerts</p>
                  <p className="text-xs text-zinc-500">Receive real-time {key} updates about application status.</p>
                </div>
                <button 
                  onClick={() => toggleNotif(key as any)}
                  className={`w-11 h-6 rounded-full transition-all relative ${enabled ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]' : 'bg-zinc-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all ${enabled ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 hover:bg-zinc-800/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:scale-110 transition-transform">
                <Lock size={20} />
              </div>
              <ChevronRight size={16} className="text-zinc-600 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Update Password</h3>
            <p className="text-xs text-zinc-500">Change your account access credentials regularly.</p>
          </div>

          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-6 hover:bg-zinc-800/50 transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-500/10 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
                <UserX size={20} />
              </div>
              <ChevronRight size={16} className="text-zinc-600 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-sm font-bold text-white mb-1">Deactivate Account</h3>
            <p className="text-xs text-zinc-500">Temporarily disable or permanently delete your portal data.</p>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="bg-[#0a1935]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-500">
              <Zap size={20} />
            </div>
            <h2 className="text-lg font-bold text-white">System Preferences</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-zinc-200">Language</p>
                <p className="text-xs text-zinc-500">Select your preferred display language.</p>
              </div>
              <select className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500/50">
                <option>English (IN)</option>
                <option>Hindi (IN)</option>
                <option>Marathi (IN)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-zinc-200">Timezone</p>
                <p className="text-xs text-zinc-500">Adjust timings for notifications and reports.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase">
                <Globe size={14} />
                (GMT+05:30) IST
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-4 pt-4 pb-10">
          <button className="px-6 py-2.5 text-zinc-500 hover:text-zinc-300 text-sm font-bold uppercase tracking-widest transition-colors">
            Cancel Changes
          </button>
          <button className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-emerald-900/30">
            <Save size={18} /> Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
