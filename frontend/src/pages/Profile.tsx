import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Shield, Building, Calendar, 
  ShieldCheck, 
  Clock, Edit3, Camera
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  const stats = [
    { label: 'Member Since', value: new Date(user.created_at || Date.now()).toLocaleDateString(), icon: Calendar },
    { label: 'Security Status', value: 'High', icon: ShieldCheck },
    { label: 'Last Login', value: 'Today, 05:22 AM', icon: Clock },
  ];

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar fade-in">
      <div className="flex flex-col gap-8">
        {/* Profile Header Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FF9933]/20 via-[#128807]/20 to-[#FF9933]/20 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-[#0a1935]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar section */}
              <div className="relative group/avatar">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-[#FF9933]/30 to-[#138808]/30 border border-[#FF9933]/40 shadow-2xl flex items-center justify-center text-4xl font-black text-amber-300">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-xl transition-all opacity-0 group-hover/avatar:opacity-100 scale-90 group-hover/avatar:scale-100">
                  <Camera size={16} />
                </button>
              </div>

              {/* Info section */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                  <h1 className="text-3xl font-black text-white tracking-tight">{user.name}</h1>
                  <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest self-center md:self-auto">
                    {user.role} Verified
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-zinc-400 text-sm">
                  <div className="flex items-center gap-1.5 ring-1 ring-white/5 bg-white/2 rounded-lg px-2.5 py-1">
                    <Mail size={14} className="text-zinc-500" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-1.5 ring-1 ring-white/5 bg-white/2 rounded-lg px-2.5 py-1">
                    <Building size={14} className="text-zinc-500" />
                    {user.organization || 'Individual Applicant'}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-3 shrink-0">
                <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-[#0a1935] rounded-xl font-bold text-sm hover:bg-zinc-200 transition-all shadow-xl shadow-white/5">
                  <Edit3 size={16} /> Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-2xl flex items-center gap-4 group hover:bg-zinc-800/50 transition-all border-b-2 border-b-transparent hover:border-b-[#FF9933]/50"
            >
              <div className="p-3 bg-white/5 rounded-xl text-zinc-400 group-hover:text-amber-400 transition-colors">
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <p className="text-base font-bold text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <User size={20} className="text-indigo-400" />
              Identity Details
            </h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Full Name</label>
                  <p className="text-sm text-zinc-200 font-medium">{user.name}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Username</label>
                  <p className="text-sm text-zinc-200 font-medium">@{user.name.toLowerCase().replace(' ', '_')}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Official Email</label>
                <p className="text-sm text-zinc-200 font-medium">{user.email}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Organization / Affiliation</label>
                <p className="text-sm text-zinc-200 font-medium">{user.organization || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-3xl p-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Shield size={20} className="text-emerald-400" />
              Access & Security
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-emerald-500" size={24} />
                  <div>
                    <p className="text-sm font-bold text-zinc-200">KYC Verified</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-tight">Identity verified via DigiLocker</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ACTIVE</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-300">Two-Factor Authentication</p>
                    <p className="text-xs text-zinc-500">Add an extra layer of security</p>
                  </div>
                  <div className="w-10 h-5 bg-zinc-800 rounded-full relative cursor-pointer border border-white/5">
                    <div className="absolute left-1 top-1 w-3 h-3 bg-zinc-600 rounded-full" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-300">Login Notifications</p>
                    <p className="text-xs text-zinc-500">Alert on new sign-ins</p>
                  </div>
                  <div className="w-10 h-5 bg-emerald-500 rounded-full relative cursor-pointer border border-emerald-400/20">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
