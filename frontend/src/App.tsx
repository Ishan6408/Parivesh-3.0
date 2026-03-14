import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Map as MapIcon,
  FileText,
  ShieldAlert,
  MessageSquare,
  Menu,
  X,
  Leaf,
  Home,
  LogOut,
  Bell,
  CheckSquare,
  Search,
  AlertTriangle,
  Compass,
  Eye,
  Users,
  BarChart3,
  Camera,
  BarChart,
  Radio,
  ChevronDown,
  Settings as SettingsIcon,
  User
} from 'lucide-react';

// Auth
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';

// Pages
import ApplicantDashboard from './pages/ApplicantDashboard';
import RegulatorDashboard from './pages/RegulatorDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Chatbot from './components/Chatbot';

function Navigation() {
  const location = useLocation();
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, logout } = useAuth();

  if (location.pathname === '/login') return null;

  const links = [
    // Applicant Links
    { path: '/applicant', label: 'Dashboard', icon: Home, roles: ['Applicant'] },
    { path: '/applicant/applications', label: 'My Applications', icon: FileText, roles: ['Applicant'] },
    { path: '/applicant/submit', label: 'Submit Project', icon: FileText, roles: ['Applicant'], badge: 'NEW' },
    { path: '/applicant/advisor', label: 'Permission Advisor', icon: Compass, roles: ['Applicant'] },
    { path: '/applicant/simulation', label: 'Impact Simulation', icon: Eye, roles: ['Applicant'] },
    { path: '/applicant/meetings', label: 'Review Meetings', icon: Users, roles: ['Applicant'] },
    { path: '/applicant/compliance', label: 'Compliance Reports', icon: ShieldAlert, roles: ['Applicant'] },
    { path: '/applicant/notifications', label: 'Notifications', icon: Bell, roles: ['Applicant'] },

    // Regulator Links
    { path: '/regulator', label: 'Dashboard', icon: Home, roles: ['Regulator'] },
    { path: '/regulator/pending', label: 'Pending Applications', icon: FileText, roles: ['Regulator'] },
    { path: '/regulator/map', label: 'GIS Project Map', icon: MapIcon, roles: ['Regulator'] },
    { path: '/regulator/review', label: 'Review Documents', icon: Search, roles: ['Regulator'] },
    { path: '/regulator/decisions', label: 'Approval Decisions', icon: CheckSquare, roles: ['Regulator'] },
    { path: '/regulator/impact', label: 'Impact Analytics', icon: BarChart3, roles: ['Regulator'] },
    { path: '/regulator/alerts', label: 'Risk Alerts', icon: AlertTriangle, roles: ['Regulator'] },
    { path: '/regulator/monitoring', label: 'AI Monitoring', icon: Radio, roles: ['Regulator'] },

    // Citizen Links
    { path: '/citizen', label: 'Project Map', icon: MapIcon, roles: ['Citizen'] },
    { path: '/citizen/explorer', label: 'Project Explorer', icon: Search, roles: ['Citizen'] },
    { path: '/citizen/stats', label: 'Pollution Stats', icon: BarChart, roles: ['Citizen'] },
    { path: '/citizen/satellite', label: 'Satellite Analysis', icon: Camera, roles: ['Citizen'] },
    { path: '/citizen/comments', label: 'Public Complaints', icon: MessageSquare, roles: ['Citizen'] },
    { path: '/citizen/reports', label: 'Transparency Logs', icon: FileText, roles: ['Citizen'] },
  ] as const;

  const filteredLinks = links.filter(link => user && (link.roles as readonly string[]).includes(user.role));

  const roleColorMap: Record<string, { badge: string; glow: string; dot: string }> = {
    Applicant: { badge: 'text-amber-400 bg-amber-500/10 border-amber-500/25', glow: 'shadow-amber-900/50', dot: 'bg-amber-400' },
    Regulator: { badge: 'text-blue-300 bg-blue-500/10 border-blue-500/25', glow: 'shadow-blue-900/50', dot: 'bg-blue-400' },
    Citizen:   { badge: 'text-green-400 bg-green-500/10 border-green-500/25', glow: 'shadow-green-900/50', dot: 'bg-green-400' },
  };

  const currentRole = user?.role ? roleColorMap[user.role] : roleColorMap['Applicant'];

  // Group links by section for visual separation
  const sectionBreaks: Record<string, string> = {
    '/applicant/notifications': 'System',
    '/regulator/impact': 'AI & Analytics',
    '/citizen/stats': 'Data & Reports',
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsOpen(false)} />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 glass border border-white/10 text-zinc-300 rounded-xl shadow-lg hover:text-white transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* ── Sidebar ── */}
      <motion.nav
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0a1935]/97 backdrop-blur-xl border-r border-white/5 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}
      >
        {/* Tricolor top accent bar */}
        <div className="h-1 tricolor-bar w-full flex-shrink-0" />

        {/* Ambient saffron glow at top */}
        <div className="absolute top-1 left-0 right-0 h-28 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />

        {/* Logo / Brand */}
        <div className="relative flex items-center gap-3 px-5 py-4 border-b border-white/5">
          {/* Ashoka Chakra-inspired icon */}
          <div className="relative">
            <div className="p-2 bg-[#FF9933]/15 rounded-xl border border-[#FF9933]/30 leaf-pulse shadow-lg shadow-orange-900/20">
              <Leaf size={20} className="text-[#FF9933]" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#FF9933] rounded-full border-2 border-[#0a1935] animate-pulse" />
          </div>
          <div>
            <span className="text-base font-black text-white tracking-tight block gradient-text">PARIVESH 3.0</span>
            <span className="text-[9px] text-blue-300/60 font-medium uppercase tracking-widest">MoEFCC · Govt. of India</span>
          </div>
        </div>

        {/* Role badge */}
        {user && (
          <div className="px-3 pt-3 pb-1">
            <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border text-xs font-semibold ${currentRole.badge} shadow-sm`}>
              <div className={`w-1.5 h-1.5 rounded-full ${currentRole.dot} animate-pulse`} />
              {user.role} Portal
            </div>
          </div>
        )}

        {/* Nav links */}
        <div className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {filteredLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            const sectionLabel = sectionBreaks[link.path];

            return (
              <React.Fragment key={link.path}>
                {sectionLabel && (
                  <div className="pt-3 pb-1 px-2">
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{sectionLabel}</p>
                  </div>
                )}
                <Link
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative overflow-hidden ${
                    isActive
                      ? 'nav-active text-amber-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-emerald-500/8 rounded-xl"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Icon size={17} className={`relative z-10 ${isActive ? 'text-[#FF9933]' : 'text-slate-600 group-hover:text-slate-400 transition-colors'}`} />
                  <span className="text-sm font-medium relative z-10 flex-1">{link.label}</span>
                  {'badge' in link && link.badge && (
                    <span className="relative z-10 text-[8px] font-black px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded uppercase tracking-widest">{link.badge}</span>
                  )}
                  {isActive && (
                    <div className="ml-auto relative z-10 w-1.5 h-1.5 rounded-full bg-[#FF9933] shadow-[0_0_8px_rgba(255,153,51,0.9)]" />
                  )}
                </Link>
              </React.Fragment>
            );
          })}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* User footer */}
        {user && (
          <div className="p-3 space-y-1">
            <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/3 border border-white/5">
              {/* Avatar with ring */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF9933]/30 to-[#138808]/30 border border-[#FF9933]/30 flex items-center justify-center text-amber-300 font-black text-sm">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0a1935] ${currentRole.dot}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-zinc-100 truncate">{user.name}</p>
                <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/8 transition-all duration-150 text-sm font-medium"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        )}
      </motion.nav>
    </>
  );
}

function TopHeader() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  if (location.pathname === '/login') return null;

  const pageTitles: Record<string, string> = {
    '/applicant': 'Dashboard',
    '/applicant/applications': 'My Applications',
    '/applicant/submit': 'Submit a Project',
    '/applicant/advisor': 'Permission Advisor',
    '/applicant/simulation': 'Impact Simulation',
    '/applicant/meetings': 'Review Meetings',
    '/applicant/compliance': 'Compliance Reports',
    '/applicant/notifications': 'Notifications',
    '/regulator': 'Dashboard',
    '/regulator/pending': 'Pending Applications',
    '/regulator/map': 'GIS Project Map',
    '/regulator/review': 'Review Documents',
    '/regulator/decisions': 'Approval Decisions',
    '/regulator/impact': 'Impact Analytics',
    '/regulator/alerts': 'Risk Alerts',
    '/regulator/monitoring': 'AI Monitoring Center',
    '/citizen': 'Project Map',
    '/citizen/explorer': 'Project Explorer',
    '/citizen/stats': 'Pollution Statistics',
    '/citizen/satellite': 'Satellite Analysis',
    '/citizen/comments': 'Public Complaints',
    '/citizen/reports': 'Transparency Logs',
    '/profile': 'My Profile',
    '/settings': 'Platform Settings',
  };

  const title = pageTitles[location.pathname] ?? 'Parivesh 3.0';

  const handleNotificationClick = () => {
    if (user?.role === 'Applicant') navigate('/applicant/notifications');
    else if (user?.role === 'Regulator') navigate('/regulator/alerts');
    else alert('You have no new notifications.');
  };

  const handleGlobalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalSearch.trim()) return;
    // Navigate to relevant search result pages based on role
    if (user?.role === 'Applicant') navigate('/applicant/applications');
    else if (user?.role === 'Regulator') navigate('/regulator/pending');
    else navigate('/citizen/explorer');
    setGlobalSearch('');
  };

  return (
    <header className="sticky top-0 z-20 h-14 bg-[#0a1935]/95 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 gap-4">
      {/* Left: breadcrumb */}
      <div className="flex items-center gap-2 text-sm min-w-0">
        <span className="text-blue-300/50 shrink-0">{user?.role ?? 'Portal'}</span>
        <span className="text-zinc-700 shrink-0">/</span>
        <span className="font-semibold text-slate-100 truncate">{title}</span>
      </div>

      {/* Center: Global Search */}
      <form onSubmit={handleGlobalSearch} className="flex-1 max-w-xs hidden sm:block">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            placeholder="Search applications, alerts..."
            className="w-full pl-8 pr-4 py-1.5 text-xs bg-white/4 border border-white/7 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-[#FF9933]/30 focus:bg-white/6 transition-all"
          />
        </div>
      </form>

      {/* Right: notification + avatar */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleNotificationClick}
          className="relative p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-slate-200 transition-colors"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {/* Profile dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(m => !m)}
              className="flex items-center gap-1.5 h-8 px-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#FF9933]/30 to-[#138808]/30 border border-[#FF9933]/30 flex items-center justify-center text-amber-300 font-black text-xs">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-xs font-medium text-zinc-400 hidden md:block max-w-[72px] truncate">{user.name?.split(' ')[0]}</span>
              <ChevronDown size={12} className="text-zinc-600 hidden md:block" />
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-52 bg-[#0a1935] border border-white/8 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-20">
                  <div className="p-3 border-b border-white/5">
                    <p className="text-sm font-bold text-zinc-100">{user.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    <p className="text-[10px] text-zinc-600 mt-0.5">{user.role} · {user.organization || 'Individual'}</p>
                  </div>
                  <div className="p-1">
                    <button
                      onClick={() => { setShowProfileMenu(false); navigate('/profile'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <User size={14} /> My Profile
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <SettingsIcon size={14} /> Settings
                    </button>
                    <div className="h-px bg-white/5 my-1" />
                    <button
                      onClick={() => { setShowProfileMenu(false); logout(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 rounded-lg transition-colors"
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}


function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-[3px] border-[#FF9933] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-zinc-600 font-medium uppercase tracking-widest">PARIVESH 3.0</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const isLogin = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-50 font-sans flex">
      <Navigation />
      
      <main className={`flex-1 min-h-screen flex flex-col ${!isLogin ? 'md:ml-64' : ''}`}>
        <TopHeader />
        <div className="flex-1">
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              {user?.role === 'Applicant' && <Navigate to="/applicant" replace />}
              {user?.role === 'Regulator' && <Navigate to="/regulator" replace />}
              {user?.role === 'Citizen' && <Navigate to="/citizen" replace />}
            </ProtectedRoute>
          } />
          
          <Route path="/citizen/*" element={
            <ProtectedRoute allowedRoles={['Citizen']}>
              <CitizenDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/applicant/*" element={
            <ProtectedRoute allowedRoles={['Applicant']}>
              <ApplicantDashboard />
            </ProtectedRoute>
          } />
                    <Route path="/regulator/*" element={
            <ProtectedRoute allowedRoles={['Regulator']}>
              <RegulatorDashboard />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
        </Routes>
        </div>
      </main>

      {!isLogin && <Chatbot />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
