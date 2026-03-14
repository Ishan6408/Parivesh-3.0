import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Leaf, Mail, Lock, User, Building, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const ROLE_INFO = {
  Applicant: { desc: 'Organizations submitting EIA reports for project clearance.', color: 'emerald' },
  Regulator: { desc: 'Government authorities reviewing and approving projects.', color: 'blue' },
  Citizen:   { desc: 'Public users who monitor projects and submit feedback.',    color: 'amber' },
};

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<keyof typeof ROLE_INFO>('Applicant');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email, password }
        : { name, email, password, role, organization };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      login(data.token, data.user);
      switch (data.user.role) {
        case 'Applicant': navigate('/applicant'); break;
        case 'Regulator': navigate('/regulator'); break;
        case 'Citizen':   navigate('/citizen');   break;
        default: navigate('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#050508]">
      {/* ── Left Hero Panel ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-14">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-teal-500/8 blur-[120px]" />
          <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-emerald-400/5 blur-[80px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(#888 1px,transparent 1px),linear-gradient(90deg,#888 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        {/* ── Top Header ── */}
        <header className="relative z-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="p-2.5 bg-emerald-500/15 rounded-xl border border-emerald-500/20 group-hover:border-emerald-500/40 transition-all leaf-pulse">
              <Leaf size={22} className="text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight leading-none">Parivesh 3.0</span>
              <span className="text-[10px] text-emerald-500/60 font-bold uppercase tracking-widest mt-1">v2.4 Stable</span>
            </div>
          </div>

          <nav className="hidden xl:flex items-center gap-6">
            {['Documentation', 'Safety Standards', 'Support'].map(item => (
              <a key={item} href="#" className="text-xs font-medium text-zinc-500 hover:text-emerald-400 transition-colors">
                {item}
              </a>
            ))}
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-800 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] text-zinc-400 font-medium">System Online</span>
            </div>
          </nav>
        </header>

        {/* Main hero content */}
        {/* Main hero content */}
        <motion.div
           initial={{ opacity: 0, y: 32 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.7, ease: 'easeOut' }}
           className="relative z-10 space-y-10"
         >
           <div className="space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 font-medium w-fit">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
               AI-Powered Environmental Portal
             </div>
             <h1 className="text-6xl font-black leading-[1.1] text-white tracking-tight">
               Clearing India's<br />
               <span className="gradient-text">Environmental Future</span>
             </h1>
             <p className="text-zinc-400 text-lg leading-relaxed max-w-lg">
               End-to-end environmental clearance management powered by Gemini AI — from risk analysis to public transparency.
             </p>
           </div>
 
           {/* Feature pills */}
           <div className="flex flex-wrap gap-3">
             {['AI Risk Scoring', 'GIS Project Map', 'Real-time Review', 'Public Comments'].map(f => (
               <span key={f} className="px-4 py-2 glass rounded-xl text-sm text-zinc-200 border border-white/8 hover:border-emerald-500/30 transition-all cursor-default">
                 {f}
               </span>
             ))}
           </div>
 
           {/* Stats */}
           <div className="grid grid-cols-3 gap-6 max-w-lg">
             {[
               { val: '2.4k+', label: 'Projects Reviewed' },
               { val: '98.4%', label: 'AI Accuracy' },
               { val: '12min', label: 'Response Time' },
             ].map(({ val, label }) => (
               <div key={label} className="glass rounded-2xl p-5 border border-white/6 group hover:border-emerald-500/20 transition-all">
                 <div className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{val}</div>
                 <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">{label}</div>
               </div>
             ))}
           </div>
         </motion.div>
 
         {/* ── Enhanced Footer ── */}
         <footer className="relative z-10 mt-20 pt-8 border-t border-white/5 grid grid-cols-2 gap-8 items-end">
           <div className="space-y-4">
             <div className="flex gap-4">
               {['Privacy', 'Legal', 'Data Policy', 'Cookies'].map(link => (
                 <a key={link} href="#" className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors font-medium">{link}</a>
               ))}
             </div>
             <div className="text-[11px] text-zinc-600 font-medium">
               © 2026 Parivesh 3.0 · Ministry of Environment & Forests (Mock)
             </div>
           </div>
           
           <div className="flex justify-end items-center gap-6">
             <div className="text-right">
               <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Compute Nodes</div>
               <div className="flex gap-1 justify-end">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="w-3 h-1 rounded-full bg-emerald-500/20" />
                 ))}
               </div>
             </div>
             <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-white transition-all cursor-pointer">
               <ArrowRight size={14} className="-rotate-45" />
             </div>
           </div>
         </footer>
      </div>

      {/* ── Right Auth Panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-14">
        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-emerald-500/15 rounded-xl border border-emerald-500/20">
              <Leaf size={20} className="text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight leading-none">Parivesh 3.0</span>
              <span className="text-[9px] text-emerald-500/60 font-bold uppercase tracking-widest mt-1">v2.4 Stable</span>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-white mb-1">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-zinc-500 text-sm">
              {isLogin ? "Don't have an account? " : 'Already registered? '}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                {isLogin ? 'Register here' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 text-sm text-red-400 flex items-start gap-2">
              <span>⚠</span> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* === Register-only fields === */}
            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-400">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                    <input required value={name} onChange={e => setName(e.target.value)}
                      placeholder="Jane Smith"
                      className="input-focus w-full pl-10 pr-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600" />
                  </div>
                </div>

                {/* Role selector */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400">Role</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(ROLE_INFO) as (keyof typeof ROLE_INFO)[]).map(r => (
                      <button type="button" key={r} onClick={() => setRole(r)}
                        className={`py-2.5 rounded-xl border text-xs font-medium transition-all ${
                          role === r
                            ? 'bg-emerald-500/12 border-emerald-500/40 text-emerald-300'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-600'
                        }`}
                      >{r}</button>
                    ))}
                  </div>
                  <p className="text-xs text-zinc-600 pl-1">{ROLE_INFO[role].desc}</p>
                </div>

                {role !== 'Citizen' && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-400">Organization</label>
                    <div className="relative">
                      <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input required value={organization} onChange={e => setOrganization(e.target.value)}
                        placeholder="Ministry / Company name"
                        className="input-focus w-full pl-10 pr-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600" />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-focus w-full pl-10 pr-4 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input required type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-focus w-full pl-10 pr-10 py-3 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-glow w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors">
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
              ) : (
                <>{isLogin ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-zinc-700">
            By continuing you agree to Parivesh 3.0's Environmental Data Policy.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
