import { useParams } from 'react-router-dom';

const MOCK_DOCS_FALLBACK = [
  { id: 1, name: 'EIA_Report_Final.pdf', type: 'EIA', size: '4.2 MB', date: '2026-03-10', status: 'Flagged' },
  { id: 2, name: 'Wildlife_Impact_Study.pdf', type: 'Special Study', size: '2.8 MB', date: '2026-03-11', status: 'Verified' },
  { id: 3, name: 'Site_Hydrology_Map.pdf', type: 'Technical Map', size: '15.4 MB', date: '2026-03-12', status: 'Pending' },
];

export default function ReviewDocuments() {
  const { projectId: routeId } = useParams();
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const { token } = useAuth();
  
  // Project State
  const [project, setProject] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  
  // Global Project Summary State
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [projectSummary, setProjectSummary] = useState<any>(null);

  // Deep Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    loadProjectData();
  }, [routeId]);

  const loadProjectData = async () => {
    setSummaryLoading(true);
    try {
      let activeId = routeId;
      if (!activeId) {
        // Fetch latest project if none selected
        const pRes = await fetch(`${API_BASE_URL}/api/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const projects = await pRes.json();
        if (projects && projects.length > 0) activeId = projects[0].id;
      }

      if (activeId) {
        // Fetch Project Details
        const projRes = await fetch(`${API_BASE_URL}/api/projects/${activeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const projData = await projRes.json();
        setProject(projData);

        // Fetch Documents
        const docRes = await fetch(`${API_BASE_URL}/api/projects/${activeId}/documents`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const docData = await docRes.json();
        const finalDocs = docData.length > 0 ? docData : MOCK_DOCS_FALLBACK;
        setDocuments(finalDocs);
        setSelectedDoc(finalDocs[0]);

        // Fetch AI Summary
        fetchProjectSummary(activeId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSummaryLoading(false);
    }
  };

  const fetchProjectSummary = async (id: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/project-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ projectId: id })
      });
      const data = await res.json();
      setProjectSummary(data);
    } catch (e) {
      console.error("Summary error:", e);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/analyze-document`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pdfUrl: selectedDoc.name })
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-full mx-auto h-[calc(100vh-100px)] flex flex-col fade-in">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Document Review</h1>
          <p className="text-zinc-500 text-sm">Reviewing Application: <span className="text-emerald-500">{project?.title || 'Loading...'}</span></p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              const content = `Parivesh 3.0 Document Export\nProject: Solar Park Alpha\nDocument: ${selectedDoc.name}\nGenerated: ${new Date().toLocaleString()}`;
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              window.open(url, '_blank');
            }}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-2"
          >
            <Download size={18} /> Export Document
          </button>
          <button 
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <MessageSquare size={18} /> Request More Info
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Sidebar: Document List (2 cols) */}
        <div className="lg:col-span-2 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
          <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Project Files</h2>
          {documents.map((doc) => (
            <div 
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`p-3 rounded-xl border transition-all cursor-pointer group ${
                selectedDoc?.id === doc.id 
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                  : 'bg-zinc-900 border-zinc-800/50 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <FileText className={selectedDoc?.id === doc.id ? 'text-emerald-500' : 'text-zinc-600'} size={18} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-zinc-200 truncate">{doc.fileName || doc.name}</div>
                  <div className="text-[9px] text-zinc-500 mt-0.5 uppercase tracking-wider">{doc.documentType || doc.type}</div>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                  doc.status === 'Verified' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                  doc.status === 'Flagged' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                  'bg-zinc-800 text-zinc-500'
                }`}>
                  {doc.status}
                </span>
                <span className="text-[8px] text-zinc-600 font-medium">{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : doc.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main: PDF Viewer Mock (6 cols) */}
        <div className="lg:col-span-6 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden flex flex-col relative shadow-2xl backdrop-blur-xl">
          <div className="bg-zinc-950/50 border-b border-zinc-800/50 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wide">Document View: {selectedDoc.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-500"><Search size={14} /></button>
              <div className="h-3 w-px bg-zinc-800"></div>
              <span className="text-[10px] text-zinc-500 font-bold">100%</span>
            </div>
          </div>
          <div className="flex-1 p-6 overflow-y-auto flex justify-center bg-zinc-950/30">
            <div className="w-full max-w-2xl bg-white shadow-2xl min-h-[1200px] p-16 relative rounded-sm">
              <div className="h-8 w-1/3 bg-zinc-200/50 rounded-sm mb-12"></div>
              <div className="space-y-6">
                <div className="h-4 w-full bg-zinc-100/80 rounded-sm"></div>
                <div className="h-4 w-full bg-zinc-100/80 rounded-sm"></div>
                <div className="h-4 w-4/5 bg-zinc-100/80 rounded-sm"></div>
                <div className="h-4 w-full bg-zinc-100/80 rounded-sm"></div>
                
                <div className="relative group p-1">
                  <div className="absolute -inset-1.5 bg-red-500/10 border border-red-200/50 rounded-md"></div>
                  <div className="h-4 w-full bg-red-50/50 relative z-10 rounded-sm"></div>
                  <div className="absolute -right-4 top-0 translate-x-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-red-600 text-white text-[9px] px-2.5 py-1.5 rounded-lg shadow-xl font-bold tracking-wide">AI FLAG: STATUTORY VIOLATION</div>
                  </div>
                </div>

                <div className="h-4 w-full bg-zinc-100/80 rounded-sm"></div>
                <div className="h-4 w-3/4 bg-zinc-100/80 rounded-sm"></div>
              </div>
              <div className="mt-16 h-48 w-full bg-zinc-50 border border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center gap-2">
                 <MapPin className="text-zinc-300" size={32} />
                 <span className="text-zinc-400 text-[10px] font-medium uppercase tracking-widest">Geospatial Overlay Layer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: AI Summary & Insights (4 cols) */}
        <div className="lg:col-span-4 space-y-6 overflow-y-auto pl-2 custom-scrollbar">
          {summaryLoading ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center">
              <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-400 text-sm font-medium">Generating AI Summary...</p>
            </div>
          ) : projectSummary && (
            <>
              {/* Project Insight Card */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-zinc-800/30 p-4 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrainCircuit size={18} className="text-emerald-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Application Summary</h3>
                  </div>
                  <div className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                    projectSummary.riskLevel === 'High Risk' ? 'bg-red-500/20 text-red-500' :
                    projectSummary.riskLevel === 'Medium Risk' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-emerald-500/20 text-emerald-500'
                  }`}>
                    {projectSummary.riskLevel}
                  </div>
                </div>
                
                <div className="p-5 space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Project Overview</label>
                    <p className="text-xs text-zinc-300 leading-relaxed">{projectSummary.overview}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                          <MapPin size={10} /> Location
                        </label>
                        <p className="text-[11px] text-zinc-400 leading-tight">{projectSummary.location.description}</p>
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                          <AlertTriangle size={10} /> Proximity
                        </label>
                        <p className="text-[11px] text-amber-500/80 font-medium leading-tight">{projectSummary.location.sensitivity}</p>
                     </div>
                  </div>

                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Key Environmental Risks</label>
                    <div className="space-y-1.5">
                      {projectSummary.impacts.map((impact: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-zinc-400">
                          <div className="w-1 h-1 rounded-full bg-red-500/50 mt-1.5 flex-shrink-0"></div>
                          <span>{impact}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Required Clearances</label>
                    <div className="grid grid-cols-2 gap-2">
                      {projectSummary.clearances.map((c: any, i: number) => (
                        <div key={i} className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between">
                          <span className="text-[10px] text-zinc-400 truncate mr-1">{c.name}</span>
                          <span className="text-[9px] font-bold text-amber-500">{c.status[0]}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                    <label className="text-[9px] font-bold text-emerald-500/70 uppercase tracking-widest mb-1.5 block">AI Recommendation</label>
                    <p className="text-xs text-zinc-300 font-medium italic">"{projectSummary.recommendation}"</p>
                  </div>
                </div>
              </div>

              {/* Deep Analysis Action */}
              {!analysisResult && !analyzing ? (
                <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-5 text-center">
                  <Zap className="mx-auto text-indigo-400 mb-2" size={24} />
                  <h4 className="text-xs font-bold text-white mb-1">Deep Document Forensic</h4>
                  <p className="text-[10px] text-zinc-400 mb-3 leading-snug">Run deep analysis on {selectedDoc.name} for plagiarism & compliance gaps.</p>
                  <button 
                    onClick={handleAnalyze}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-indigo-900/40"
                  >
                    Run Deep Analysis
                  </button>
                </div>
              ) : analyzing ? (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
                  <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-zinc-300 font-bold uppercase tracking-widest animate-pulse">Running Forensic Analysis...</p>
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden animate-in slide-in-from-right duration-500">
                  <div className="bg-indigo-600/20 p-3 border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Deep Analysis: {selectedDoc.name}</span>
                    <button onClick={() => setAnalysisResult(null)} className="text-zinc-500 hover:text-white">✕</button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase">Integrity Score</span>
                      <span className={`text-xs font-black ${analysisResult.score > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{analysisResult.score}%</span>
                    </div>
                    <div className="bg-zinc-950 p-3 rounded-lg border border-white/5">
                      <p className="text-[11px] text-zinc-400 italic">"{analysisResult.summary}"</p>
                    </div>
                    
                    {analysisResult.missingFiles?.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Missing Segments</label>
                        {analysisResult.missingFiles.map((file: string, i: number) => (
                           <div key={i} className="flex items-center gap-2 p-2 bg-red-500/5 rounded-lg border border-red-500/10">
                              <AlertCircle size={10} className="text-red-500" />
                              <span className="text-[10px] text-zinc-300">{file}</span>
                           </div>
                        ))}
                      </div>
                    )}

                    {analysisResult.copiedContent?.length > 0 && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Plagiarism Detected</label>
                        {analysisResult.copiedContent.map((item: any, i: number) => (
                           <div key={i} className="p-2 bg-amber-500/5 rounded-lg border border-amber-500/10">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[8px] font-bold text-amber-500 uppercase">Match Found</span>
                                <span className="text-[8px] text-zinc-600 truncate">{item.source}</span>
                              </div>
                              <p className="text-[9px] text-zinc-400 italic leading-tight">"{item.text.substring(0, 100)}..."</p>
                           </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
