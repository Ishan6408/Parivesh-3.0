import { useState } from 'react';
import { API_BASE_URL } from '../config';
import { FileText, Search, BrainCircuit, AlertCircle, CheckCircle, ChevronRight, Download, MessageSquare, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MOCK_DOCS = [
  { id: 1, name: 'EIA_Report_Final.pdf', type: 'EIA', size: '4.2 MB', date: '2026-03-10', status: 'Flagged' },
  { id: 2, name: 'Wildlife_Impact_Study.pdf', type: 'Special Study', size: '2.8 MB', date: '2026-03-11', status: 'Verified' },
  { id: 3, name: 'Site_Hydrology_Map.pdf', type: 'Technical Map', size: '15.4 MB', date: '2026-03-12', status: 'Pending' },
];

const AI_FLAGS = [
  { page: 12, type: 'Inconsistency', message: 'Water usage estimates contradict the site hydrology report (p. 45).' },
  { page: 28, type: 'Missing Data', message: 'Seasonal migration patterns for local avian species are not documented.' },
  { page: 42, type: 'Compliance', message: 'Proposed buffer zone is 15m less than the statutory requirement for Category A projects.' },
];

export default function ReviewDocuments() {
  const [selectedDoc, setSelectedDoc] = useState(MOCK_DOCS[0]);
  const { token } = useAuth();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

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
    <div className="p-6 md:p-10 max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Document Review</h1>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              const content = `Parivesh 3.0 Document Export\nProject: Solar Park Alpha\nDocument: ${selectedDoc.name}\nGenerated: ${new Date().toLocaleString()}`;
              const blob = new Blob([content], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `export_${selectedDoc.name.replace('.pdf', '.txt')}`;
              a.click();
            }}
            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-2"
          >
            <Download size={18} /> Export Document
          </button>
          <button 
            onClick={() => alert(`Clarification request for "${selectedDoc.name}" has been sent to the applicant.`)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20"
          >
            <MessageSquare size={18} /> Request More Info
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 overflow-hidden">
        {/* Sidebar: Document List */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Project Files</h2>
          {MOCK_DOCS.map((doc) => (
            <div 
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group ${
                selectedDoc.id === doc.id 
                  ? 'bg-emerald-500/10 border-emerald-500/50' 
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <FileText className={selectedDoc.id === doc.id ? 'text-emerald-500' : 'text-zinc-500'} size={20} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-zinc-100 truncate">{doc.name}</div>
                  <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider">{doc.type} • {doc.size}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${
                  doc.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-400' :
                  doc.status === 'Flagged' ? 'bg-red-500/20 text-red-400' :
                  'bg-zinc-800 text-zinc-400'
                }`}>
                  {doc.status}
                </span>
                <span className="text-[10px] text-zinc-600">{doc.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Main: PDF Viewer Mock */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col relative">
          <div className="bg-zinc-950 border-b border-zinc-800 p-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-xs text-zinc-500">Page 1 of 124</span>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-zinc-800 rounded text-zinc-400"><ChevronRight className="rotate-180" size={16} /></button>
                <button className="p-1 hover:bg-zinc-800 rounded text-zinc-400"><ChevronRight size={16} /></button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-1.5 hover:bg-zinc-800 rounded text-zinc-400"><Search size={16} /></button>
              <div className="h-4 w-px bg-zinc-800"></div>
              <span className="text-xs text-zinc-400">100%</span>
            </div>
          </div>
          <div className="flex-1 bg-zinc-800/50 p-8 overflow-y-auto flex justify-center">
            <div className="w-full max-w-2xl bg-white shadow-2xl min-h-[1000px] p-12 relative">
              {/* Mock Content */}
              <div className="h-8 w-1/3 bg-zinc-200 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 w-full bg-zinc-100"></div>
                <div className="h-4 w-full bg-zinc-100"></div>
                <div className="h-4 w-4/5 bg-zinc-100"></div>
                <div className="h-4 w-full bg-zinc-100"></div>
                
                {/* AI Flag Highlight */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-red-500/20 border border-red-500/30 rounded"></div>
                  <div className="h-4 w-full bg-red-100 relative z-10"></div>
                  <div className="absolute -right-4 top-0 translate-x-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-red-500 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">AI Flag: Compliance Risk</div>
                  </div>
                </div>

                <div className="h-4 w-full bg-zinc-100"></div>
                <div className="h-4 w-3/4 bg-zinc-100"></div>
              </div>
              <div className="mt-12 h-40 w-full bg-zinc-50 border border-zinc-100 rounded flex items-center justify-center">
                <span className="text-zinc-300 text-xs italic">Map Data Visualization Placeholder</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: AI Insights */}
        <div className="lg:col-span-1 space-y-6 overflow-y-auto pl-2">
          {!analysisResult && !analyzing ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <BrainCircuit className="mx-auto text-indigo-400 mb-3" size={32} />
              <h3 className="text-white font-bold mb-2">AI Document Analyzer</h3>
              <p className="text-sm text-zinc-400 mb-4">Run a deep forensic analysis on {selectedDoc.name} to detect missing files, copied text, and logical inconsistencies.</p>
              <button 
                onClick={handleAnalyze}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2"
              >
                <Zap size={18} /> Run Deep Analysis
              </button>
            </div>
          ) : analyzing ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-zinc-300 font-medium animate-pulse">Analyzing Document...</p>
              <p className="text-xs text-zinc-500 mt-2">Checking for plagiarism & compliance.</p>
            </div>
          ) : (
             <>
               <section>
                 <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   <BrainCircuit size={14} className="text-indigo-400" /> AI Verification Result
                 </h2>
                 <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-xs text-zinc-400">Integrity Score</span>
                     <span className={`text-sm font-bold ${analysisResult.score > 70 ? 'text-emerald-500' : 'text-amber-500'}`}>{analysisResult.score}/100</span>
                   </div>
                   <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                     <div className={`h-full ${analysisResult.score > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${analysisResult.score}%` }}></div>
                   </div>
                   <div className="bg-zinc-950 p-3 rounded-xl border border-white/5">
                     <p className="text-xs text-zinc-300 italic">"{analysisResult.summary}"</p>
                   </div>
                 </div>
               </section>

               {(analysisResult.missingFiles?.length > 0 || analysisResult.copiedContent?.length > 0) && (
                 <section>
                   <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Flagged Issues</h2>
                   <div className="space-y-3">
                     {analysisResult.missingFiles?.map((file: string, i: number) => (
                       <div key={`missing-${i}`} className="p-4 bg-zinc-900 border border-red-500/20 rounded-xl">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Missing Required File</span>
                         </div>
                         <p className="text-xs text-zinc-300 font-medium">{file}</p>
                       </div>
                     ))}
                     {analysisResult.copiedContent?.map((copied: any, i: number) => (
                       <div key={`copy-${i}`} className="p-4 bg-zinc-900 border border-amber-500/20 rounded-xl">
                         <div className="flex items-center justify-between mb-2">
                           <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Plagiarism Alert</span>
                           <span className="text-[10px] text-zinc-500 truncate max-w-[100px]" title={copied.source}>Source: {copied.source}</span>
                         </div>
                         <p className="text-xs text-zinc-400 italic">"{copied.text}"</p>
                       </div>
                     ))}
                   </div>
                 </section>
               )}
               
               <button 
                 onClick={() => setAnalysisResult(null)}
                 className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-xl transition-all"
               >
                 Close Analysis
               </button>
             </>
          )}
        </div>
      </div>
    </div>
  );
}
