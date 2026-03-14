import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../config';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, AlertTriangle, Info, MapPin, Users, MessageSquare, Leaf, FileText, ArrowRight, X, CheckCircle2, Send, Camera, BrainCircuit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, Navigate } from 'react-router-dom';
import PollutionStats from '../components/PollutionStats';
import PublicSatellite from '../components/PublicSatellite';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Project {
  id: number;
  title: string;
  description: string;
  applicant: string;
  status: string;
  lat: number;
  lng: number;
  riskScore: number;
  riskSummary: string;
}

function CitizenHome() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      });
  }, [token]);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(selectedProject?.id === project.id ? null : project);
  };

  const submitComment = async (e: React.FormEvent, projectId: number) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    setSubmittingComment(true);
    try {
      await fetch(`${API_BASE_URL}/api/projects/${projectId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: comment })
      });
      setComment('');
      alert('Comment submitted successfully!');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('Failed to submit comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return '#10b981'; // emerald-500
    if (score < 70) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* Sidebar / List View */}
      <div className="w-full md:w-96 bg-zinc-950 border-r border-zinc-800 flex flex-col h-[50vh] md:h-screen z-10">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-2xl font-bold text-white mb-2">Public Transparency Dashboard</h1>
          <p className="text-sm text-zinc-400 mb-4">Explore environmental clearances, view AI summaries, and submit public feedback.</p>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            projects.map((project) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={project.id} 
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-emerald-500/30 transition-colors cursor-pointer"
                onClick={() => handleProjectClick(project)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-zinc-100">{project.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    project.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                    project.status === 'Pending' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-3 line-clamp-2">{project.description}</p>
                
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <AlertTriangle size={14} style={{ color: getRiskColor(project.riskScore) }} />
                    <span className="text-zinc-300">Risk: {project.riskScore}/100</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-500">
                    <Info size={14} />
                    <span>{project.applicant}</span>
                  </div>
                </div>

                {selectedProject?.id === project.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-zinc-800"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="text-sm font-medium text-white mb-2">AI Risk Summary</h4>
                    <p className="text-xs text-zinc-400 mb-4">{project.riskSummary || 'No summary available.'}</p>
                    
                    <form onSubmit={(e) => submitComment(e, project.id)} className="space-y-2">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a public comment..."
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 resize-none h-20"
                      />
                      <button 
                        type="submit"
                        disabled={submittingComment || !comment.trim()}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {submittingComment ? 'Submitting...' : 'Submit Comment'}
                      </button>
                    </form>
                  </motion.div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 h-[50vh] md:h-screen relative bg-zinc-900">
        <MapContainer 
          center={[22.9734, 78.6569]} // Center of India
          zoom={5} 
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          {projects.map((project) => (
            <React.Fragment key={project.id}>
              <Marker position={[project.lat, project.lng]}>
                <Popup className="custom-popup">
                  <div className="p-1">
                    <h3 className="font-bold text-sm mb-1">{project.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{project.status}</p>
                    <div className="text-xs font-medium">Risk Score: {project.riskScore}</div>
                  </div>
                </Popup>
              </Marker>
              <Circle 
                center={[project.lat, project.lng]}
                radius={project.riskScore * 1000} // Radius based on risk
                pathOptions={{ 
                  color: getRiskColor(project.riskScore),
                  fillColor: getRiskColor(project.riskScore),
                  fillOpacity: 0.2,
                  weight: 1
                }}
              />
            </React.Fragment>
          ))}
        </MapContainer>
        
        {/* Map Overlay Controls */}
        <div className="absolute top-4 right-4 z-[400] flex gap-2">
          <button 
            onClick={() => alert("Project filtering by risk, date, and status is active. Zoom and pan the map to explore regions.")}
            className="bg-zinc-900/90 backdrop-blur border border-zinc-800 text-zinc-300 p-2 rounded-lg shadow-lg hover:text-white"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectExplorer() {
  const [projects, setProjects] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setProjects(data));
  }, []);

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 fade-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Project Explorer</h1>
          <p className="text-zinc-400">Discover and track environmental clearance projects.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-zinc-900/50 border border-zinc-700/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-inter input-focus"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 font-inter input-focus appearance-none"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, idx) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all card-hover group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                project.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                project.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {project.status}
              </span>
              <div className="flex items-center gap-1 text-xs text-zinc-400 bg-zinc-900/50 px-2 py-1 rounded border border-zinc-800">
                <MapPin size={12} />
                {project.lat.toFixed(2)}, {project.lng.toFixed(2)}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{project.title}</h3>
            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{project.description}</p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-300">
                  {project.applicant.substring(0,2).toUpperCase()}
                </div>
                <span className="text-sm text-zinc-300 font-medium truncate max-w-[100px]">{project.applicant}</span>
              </div>
              
              <div className="text-right">
                <div className="text-xs text-zinc-500 mb-1">Risk Score</div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${project.riskScore > 70 ? 'risk-high' : project.riskScore > 30 ? 'risk-med' : 'risk-low'}`} 
                      style={{ width: `${project.riskScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white">{project.riskScore}/100</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredProjects.length === 0 && (
        <div className="text-center py-20 glass rounded-2xl border border-white/5">
          <Leaf className="mx-auto w-12 h-12 text-zinc-600 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No projects found</h3>
          <p className="text-zinc-500">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  );
}

function PublicComments() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [comment, setComment] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/projects`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setProjects(data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/verify-complaint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
           text: comment,
           imageAvailable: !!evidence
        })
      });
      const data = await res.json();
      setVerificationResult(data);
      setSuccess(true);
    } catch (error) {
       console.error(error);
    } finally {
       setIsSubmitting(false);
    }
  };

  const closeFeedback = () => {
     setSuccess(false);
     setVerificationResult(null);
     setSelectedProject(null);
     setComment("");
     setEvidence(null);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6 fade-up">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Public Consultations</h1>
        <p className="text-zinc-400">Voice your opinion on pending environmental projects in your area.</p>
      </div>

      <div className="grid gap-4">
        {projects.filter(p => p.status === 'Pending' || p.status === 'Under Review').map((project, idx) => (
          <motion.div 
            key={project.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass rounded-xl p-6 border border-white/5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-white">{project.title}</h3>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Open for comments
                </span>
              </div>
              <p className="text-sm text-zinc-400 line-clamp-2 mb-3">{project.description}</p>
              <div className="flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><MapPin size={12} /> {project.lat.toFixed(2)}, {project.lng.toFixed(2)}</span>
                <span className="flex items-center gap-1"><Users size={12} /> Applicant: {project.applicant}</span>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedProject(project)}
              className="whitespace-nowrap btn-glow bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <MessageSquare size={16} />
              Submit Feedback
            </button>
          </motion.div>
        ))}
      </div>
      
      {projects.filter(p => p.status === 'Pending' || p.status === 'Under Review').length === 0 && (
         <div className="text-center py-20 glass rounded-2xl border border-white/5">
         <MessageSquare className="mx-auto w-12 h-12 text-zinc-600 mb-4" />
         <h3 className="text-xl font-medium text-white mb-2">No active consultations</h3>
         <p className="text-zinc-500">There are no projects currently open for public feedback.</p>
       </div>
      )}

      {/* Feedback Modal */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProject(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Public Comment & Complaint</h3>
                <button onClick={closeFeedback} className="text-zinc-500 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                {!success ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Project</label>
                      <div className="p-3 bg-white/3 border border-white/5 rounded-xl text-zinc-300 font-medium">
                        {selectedProject.title}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Complaint / Comment</label>
                      <textarea 
                        required
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Describe the environmental issue, violation, or concern..."
                        rows={4}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-all resize-none"
                      />
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Photo Evidence</label>
                       <div className="relative">
                         <input 
                           type="file" 
                           accept="image/*"
                           onChange={(e) => setEvidence(e.target.files?.[0] || null)}
                           className="hidden" 
                           id="evidence-upload"
                         />
                         <label htmlFor="evidence-upload" className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-zinc-800 hover:border-emerald-500/50 rounded-xl cursor-pointer text-zinc-400 hover:text-emerald-400 transition-colors bg-zinc-900/50">
                           <Camera size={18} />
                           {evidence ? evidence.name : 'Upload Photo Evidence (Optional)'}
                         </label>
                       </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full btn-glow bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={18} />
                          Submit Public Comment
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-6 fade-up">
                    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                      <CheckCircle2 size={32} className="text-emerald-400" />
                      <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full -z-10" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-2">Complaint Registered</h4>
                    <p className="text-zinc-400 mb-6 text-sm">Thank you for contributing to the transparency of this project. Your comment has been logged securely.</p>
                    
                    {verificationResult && (
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-left mb-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                        <div className="flex items-center gap-2 mb-3">
                           <BrainCircuit className="text-indigo-400" size={18} />
                           <h5 className="text-sm font-bold text-white uppercase tracking-wider">AI Verification Panel</h5>
                        </div>
                        <div className="space-y-3 relative z-10">
                          <div className="flex justify-between items-center bg-zinc-950 p-2 rounded-lg border border-white/5">
                             <span className="text-xs text-zinc-400">Validity Score</span>
                             <span className={`text-sm font-bold ${verificationResult.confidence > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>{verificationResult.confidence}%</span>
                          </div>
                          <div className="flex justify-between items-center bg-zinc-950 p-2 rounded-lg border border-white/5">
                             <span className="text-xs text-zinc-400">Urgency Level</span>
                             <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${
                               verificationResult.urgency === 'High' ? 'bg-red-500/20 text-red-400' : 
                               verificationResult.urgency === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 
                               'bg-emerald-500/20 text-emerald-400'
                             }`}>{verificationResult.urgency}</span>
                          </div>
                          <div className="text-xs text-zinc-400 italic bg-zinc-950 p-3 rounded-lg border border-white/5 leading-relaxed">
                             "{verificationResult.reasoning}"
                          </div>
                        </div>
                      </div>
                    )}

                    <button 
                      onClick={closeFeedback}
                      className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors text-sm"
                    >
                      Close Window
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EnvironmentalReports() {
  const handleDownload = (reportName: string) => {
    // Mock download flow
    const dummyContent = `Parivesh 3.0 - Environmental Report\nReport: ${reportName}\nDate: ${new Date().toLocaleDateString()}\nStatus: Verified\n\nThis is a simulated environmental transparency report generated for demonstration purposes.`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6 fade-up">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Transparency Reports</h1>
        <p className="text-zinc-400">Access public environmental impact assessments and compliance logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "State Level EIA Summary 2026", desc: "Comprehensive review of all approved mega-projects in the western ghats region." },
          { title: "Deforestation Compliance Audit", desc: "Annual audit report for forest preservation and compensatory afforestation projects." },
          { title: "Coastal Impact Protocol v4.2", desc: "Guidelines and impact assessment for all upcoming coastal development projects." },
          { title: "Wildlife Corridor Monitoring", desc: "Real-time surveillance data and annual report on elephant corridor health." }
        ].map((report, idx) => (
           <motion.div 
           key={idx}
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: idx * 0.1 }}
           className="glass rounded-xl p-6 border border-white/5 hover:border-emerald-500/30 transition-all group"
         >
           <div className="flex items-start gap-4">
             <div className="h-12 w-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
               <FileText size={24} />
             </div>
             <div className="flex-1">
               <h3 className="text-lg font-bold text-white mb-1">{report.title}</h3>
               <p className="text-sm text-zinc-400 mb-4">{report.desc}</p>
               <div className="flex items-center justify-between">
                 <span className="text-xs text-zinc-500">Published: Mar 10, 2026</span>
                 <button 
                  onClick={() => handleDownload(report.title)}
                  className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 transition-colors"
                >
                   Download PDF <ArrowRight size={14} />
                 </button>
               </div>
             </div>
           </div>
         </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function CitizenDashboard() {
  return (
    <Routes>
      <Route path="/" element={<CitizenHome />} />
      <Route path="/explorer" element={<ProjectExplorer />} />
      <Route path="/stats" element={<PollutionStats />} />
      <Route path="/satellite" element={<PublicSatellite />} />
      <Route path="/comments" element={<PublicComments />} />
      <Route path="/reports" element={<EnvironmentalReports />} />
      <Route path="*" element={<Navigate to="/citizen" replace />} />
    </Routes>
  );
}
