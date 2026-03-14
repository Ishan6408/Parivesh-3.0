import { useState } from 'react';
import { FileSignature, CheckCircle2, Download, AlertCircle, ShieldCheck } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const COMPLIANCE_POINTS = [
  { id: 'c1', text: 'Topsoil extracted from the project area will be preserved and stored properly.' },
  { id: 'c2', text: 'Control blasting will only be done by an authorized DGMS license holder.' },
  { id: 'c3', text: 'Plantation survival rate will be maintained above 90% and continuously monitored.' },
  { id: 'c4', text: 'High-pressure water sprinkling systems will be used to control fugitive dust emissions.' },
  { id: 'c5', text: 'Strict Zero Liquid Discharge (ZLD) will be maintained; no polluted water will be released into natural sources.' },
  { id: 'c6', text: 'Local employment will be prioritized according to state government regulations and rules.' },
  { id: 'c7', text: 'No excavation or operational activity will occur outside the approved lease boundary area.' },
  { id: 'c8', text: 'All Environmental Clearance (EC) conditions will be followed strictly without deviation.' },
  { id: 'c9', text: 'Transportation of minerals will be done in covered vehicles following CPCB/SPCB guidelines.' },
  { id: 'c10', text: 'Mining operations will be carried out such that they do not disturb local flora and fauna.' },
  { id: 'c11', text: 'Scientific restoration work will be completed for all excavated boundary zones post-mining.' },
  { id: 'c12', text: 'All CER (Corporate Environmental Responsibility) activities proposed in the plan will be implemented.' },
  { id: 'c13', text: 'A dense green belt of native trees will be planted and maintained around the entire lease boundary.' },
  { id: 'c14', text: 'Mining operations will strictly follow the Sustainable Sand Mining Guidelines and other environmental regulations.' }
];


export default function AffidavitDeclaration() {
  const { user } = useAuth();
  const [agreedPoints, setAgreedPoints] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [affidavitUrl, setAffidavitUrl] = useState<string | null>(null);

  const togglePoint = (id: string) => {
    setAgreedPoints(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allAgreed = COMPLIANCE_POINTS.every(p => agreedPoints[p.id]);

  const handleGenerate = () => {
    if (!allAgreed) return;
    setIsGenerating(true);
    
    // Simulate API generation delay
    setTimeout(() => {
      const affidavitText = `OFFICIAL ENVIRONMENTAL COMPLIANCE AFFIDAVIT
=========================================
Generated strictly for Ministry of Environment, Forest and Climate Change (MoEFCC)
Portal: PARIVESH 3.0 / Parivesh 3.0

Applicant Name: ${user?.name || 'Authorized Signatory'}
Organization: ${user?.organization || 'Applicant Organization'}
Date: ${new Date().toLocaleDateString()}
Electronic ID: AFF-${Math.random().toString(36).substr(2, 9).toUpperCase()}

I, the undersigned, solemnly declare and affirm the following 14-point compliance commitments:

${COMPLIANCE_POINTS.map((p, i) => `${i + 1}. ${p.text}`).join('\n\n')}

Legal Verification:
I solemnly state that the contents of the above affidavit are true to my knowledge and belief, and no part of it is false, and nothing material has been concealed. Violation of any point above may lead to immediate revocation of environmental clearance.

Digitally signed via Parivesh 3.0 Secure Authentication on ${new Date().toLocaleString()}
IP: Authenticated User Session`;


      const blob = new Blob([affidavitText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      setAffidavitUrl(url);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 fade-up">
      <header>
        <p className="text-xs text-zinc-500 uppercase font-semibold tracking-widest mb-1">Applicant · Legal</p>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <FileSignature size={28} className="text-emerald-400" />
          Affidavit Declaration System
        </h1>
        <p className="text-zinc-400 text-sm mt-2">
          Review and digitally affirm your environmental commitments to generate a formal compliance affidavit required for clearance.
        </p>
      </header>

      <div className="bg-[#0f1f4a]/80 border border-zinc-800 rounded-2xl p-6 lg:p-8">
        
        <div className="flex items-center gap-3 mb-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-amber-200/80 text-sm">
          <AlertCircle size={20} className="text-amber-500 shrink-0" />
          <p>This is a legally binding digital declaration. Please read each commitment carefully before accepting.</p>
        </div>

        <div className="space-y-4 mb-8">
          {COMPLIANCE_POINTS.map((point) => (
            <div 
              key={point.id}
              onClick={() => togglePoint(point.id)}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                agreedPoints[point.id] 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                agreedPoints[point.id] ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600 bg-zinc-950'
              }`}>
                {agreedPoints[point.id] && <CheckCircle2 size={14} className="text-white" />}
              </div>
              <p className={`text-sm leading-relaxed transition-colors ${
                agreedPoints[point.id] ? 'text-zinc-100 font-medium' : 'text-zinc-400'
              }`}>
                {point.text}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-zinc-400 font-medium flex items-center gap-2">
            {!allAgreed ? (
              <span className="text-amber-500">You must accept all {COMPLIANCE_POINTS.length} points to proceed.</span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-2"><ShieldCheck size={18} /> All points affirmed.</span>
            )}
          </div>

          {!affidavitUrl ? (
            <button
              disabled={!allAgreed || isGenerating}
              onClick={handleGenerate}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Affidavit...
                </>
              ) : (
                <>
                  <FileSignature size={18} /> Generate E-Affidavit
                </>
              )}
            </button>
          ) : (
            <a 
              href={affidavitUrl} 
              download={`Affidavit_${user?.organization || 'Applicant'}_${new Date().getTime()}.txt`}
              className="w-full sm:w-auto px-6 py-3 bg-[#FF9933] hover:bg-[#e68a2e] text-black font-black uppercase tracking-widest text-sm rounded-xl transition-transform hover:scale-105 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,153,51,0.25)]"
            >
              <Download size={18} /> Download Signed Affidavit
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
