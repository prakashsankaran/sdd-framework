import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { pdfGenerator } from '../utils/pdfGenerator';
import { ConfluencePublishModal } from '../components/ConfluencePublishModal';

export default function ValidatorAgent() {
  const navigate = useNavigate();
  const [activeSpec, setActiveSpec] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [report, setReport] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [error, setError] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isConfluenceModalOpen, setIsConfluenceModalOpen] = useState(false);

  // Fetch active spec and its validation status on mount
  useEffect(() => {
    const fetchActiveSpecAndStatus = async () => {
      try {
        const specRes = await fetch('http://localhost:7001/api/specs/active');
        const specData = await specRes.json();
        if (specData.success && specData.activeSpec) {
          setActiveSpec(specData.activeSpec);
          
          // Fetch validation status for active spec
          const statusRes = await fetch(`http://localhost:7001/api/specs/validate/status/${encodeURIComponent(specData.activeSpec)}`);
          const statusData = await statusRes.json();
          if (statusData.success) {
            setReport(statusData.report);
            setIsApproved(statusData.approved);
          }
        }
      } catch (err) {
        console.error('Failed to initialize Validator:', err);
        setError('Failed to connect to the backend server.');
      }
    };
    fetchActiveSpecAndStatus();
  }, []);

  const handleValidate = async () => {
    if (!activeSpec) return;
    setIsValidating(true);
    setError('');
    try {
      const response = await fetch('http://localhost:7001/api/specs/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder: activeSpec })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setReport(data.report);
        setIsApproved(data.approved);
      } else {
        throw new Error(data.error || 'Validation execution failed.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleApprove = async () => {
    if (!activeSpec) return;
    setIsApproving(true);
    try {
      const response = await fetch('http://localhost:7001/api/specs/validate/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder: activeSpec })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsApproved(true);
        // Navigate to the Agent Orchestrator
        navigate('/orchestrator');
      } else {
        throw new Error(data.error || 'Failed to approve validation.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    const styledHtml = `
      <div style="padding: 10px;">
        <h1>Architecture Validation & Model Recommendation Report</h1>
        <p style="font-size: 12px; color: #64748b; margin-top: -10px; margin-bottom: 20px;">Workspace Folder: ${activeSpec}</p>
        ${parseMarkdown(report)}
      </div>
    `;
    pdfGenerator.download('Specification_Validation_Report.pdf', styledHtml);
  };

  // Convert simple markdown styling to HTML for report view
  const parseMarkdown = (md) => {
    if (!md) return '';
    let html = md;
    // headers
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-base font-bold text-white border-b border-slate-800 pb-2 mt-6 mb-3 uppercase tracking-wider">$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-sm font-bold text-indigo-400 mt-5 mb-2.5 uppercase tracking-wide">$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xs font-bold text-slate-200 mt-4 mb-2">$1</h3>');
    // bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300 font-bold">$1</strong>');
    // code blocks
    html = html.replace(/```markdown([\s\S]*?)```/g, '<pre class="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-300 my-4 overflow-auto">$1</pre>');
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-indigo-300 my-4 overflow-auto">$1</pre>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-900 font-mono text-[9px] text-indigo-400 font-semibold">$1</code>');
    // bullet lists
    html = html.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-slate-300 py-0.5">$1</li>');
    html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4 list-disc text-slate-300 py-0.5">$1</li>');
    // paragraph breaks
    html = html.replace(/\n/g, '<br/>');
    return html;
  };

  return (
    <div class="space-y-6">
      
      {/* Page Title & Intro */}
      <div class="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <h1 class="text-xl font-black text-white uppercase tracking-wider flex items-center">
            <i class="fas fa-shield-alt text-indigo-500 mr-3"></i> Spec & Tech Stack Validator Agent
          </h1>
          <p class="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Cross-verifies the SpecKit files against original functional requirements, evaluates architectural technology alignments, and recommends ideal LLM/SLM sub-agent orchestrations. Performs verification using a premium model (<code class="text-indigo-400 font-bold">Gemini 3.5 Flash</code>) to assure clean builds.
          </p>
        </div>
        {activeSpec && (
          <div class="px-4 py-2 bg-slate-950/80 border border-slate-850 rounded-xl flex items-center space-x-2 text-xs">
            <i class="fas fa-folder text-amber-500"></i>
            <span class="font-mono text-slate-300 font-bold">{activeSpec}</span>
          </div>
        )}
      </div>

      {error && (
        <div class="bg-red-950/20 border border-red-900/60 p-4 rounded-2xl text-red-400 text-xs flex items-start space-x-2.5 max-w-2xl">
          <i class="fas fa-exclamation-triangle mt-0.5 shrink-0 text-red-500"></i>
          <div>
            <p class="font-bold">System Error</p>
            <p class="leading-normal mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!report ? (
        /* Run Validation View */
        <div class="glass-panel max-w-2xl mx-auto p-8 rounded-2xl border border-slate-800 shadow-xl text-center space-y-6">
          <div class="w-16 h-16 bg-indigo-500/5 text-indigo-400 rounded-full flex items-center justify-center mx-auto text-2xl border border-indigo-500/10 shadow-lg shadow-indigo-500/5 animate-pulse">
            <i class="fas fa-microchip"></i>
          </div>
          <div class="space-y-2">
            <h3 class="text-sm font-bold text-slate-200 uppercase tracking-wide">Validation Report Required</h3>
            <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              No validation scan has been executed for this specification folder yet. Trigger the validation model to analyze files, verify dependencies, and generate LLM sub-agent cards.
            </p>
          </div>
          <button 
            onClick={handleValidate}
            disabled={isValidating || !activeSpec}
            class="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl border border-indigo-500/20 shadow-lg flex items-center space-x-2 mx-auto transition"
          >
            {isValidating ? (
              <>
                <i class="fas fa-circle-notch animate-spin"></i>
                <span>Running Architecture Audit...</span>
              </>
            ) : (
              <>
                <i class="fas fa-shield-alt"></i>
                <span>Run Spec & Tech Stack Audit</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Validation Dashboard */
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-230px)] overflow-hidden">
          
          {/* Left Panel: Validation Report Details */}
          <div class="lg:col-span-2 glass-panel rounded-2xl flex flex-col overflow-hidden border border-slate-800 shadow-xl">
            <div class="px-5 py-4 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center shrink-0">
              <div>
                <h2 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <span class="w-1.5 h-3 bg-indigo-500 rounded-full mr-2"></span> Architecture Audit Report
                </h2>
                <p class="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Dual-Model Verification Summary</p>
              </div>
              <div class="flex items-center space-x-2">
                <button 
                  onClick={() => setIsConfluenceModalOpen(true)}
                  disabled={isValidating || !report}
                  class="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 text-xs font-bold rounded-lg border border-indigo-900/60 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <i class="fab fa-confluence"></i>
                  <span>Confluence</span>
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isValidating || !report}
                  class="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 text-xs font-bold rounded-lg border border-indigo-900/60 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <i class="fas fa-file-pdf"></i>
                  <span>Download PDF</span>
                </button>
                <button 
                  onClick={handleValidate}
                  disabled={isValidating}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-350 text-xs font-bold rounded-lg border border-slate-750 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {isValidating ? <i class="fas fa-circle-notch animate-spin"></i> : <i class="fas fa-redo"></i>}
                  <span>Re-audit Spec</span>
                </button>
              </div>
            </div>

            <div class="flex-1 p-5 overflow-y-auto custom-scroll bg-slate-950/40 relative">
              {isValidating && (
                <div class="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-10">
                  <div class="flex flex-col items-center space-y-2">
                    <i class="fas fa-circle-notch animate-spin text-indigo-500 text-xl"></i>
                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Running Audit Scan...</span>
                  </div>
                </div>
              )}
              <div 
                class="validation-document text-xs leading-relaxed text-slate-350 space-y-4"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(report) }}
              />
            </div>
          </div>

          {/* Right Panel: Human in the loop checks */}
          <div class="glass-panel rounded-2xl flex flex-col overflow-hidden border border-slate-800 shadow-xl p-5 space-y-4 justify-between bg-slate-900/10">
            <div class="space-y-4">
              <div class="border-b border-slate-850 pb-3">
                <h3 class="text-xs font-black text-white uppercase tracking-wider">Human-In-The-Loop Review</h3>
                <p class="text-[9px] text-slate-500 mt-0.5">Approve findings or iterate on requirements specs</p>
              </div>

              {/* Status Indicator */}
              <div class={`p-4 rounded-xl border flex items-start space-x-3 ${
                isApproved 
                  ? 'bg-green-950/10 border-green-800/40 text-green-400' 
                  : 'bg-yellow-950/10 border-yellow-800/40 text-yellow-400'
              }`}>
                <div class={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isApproved ? 'bg-green-500/10' : 'bg-yellow-500/10'
                }`}>
                  <i class={`fas ${isApproved ? 'fa-check' : 'fa-clock'} text-xs`}></i>
                </div>
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider">{isApproved ? 'Approved & Ready' : 'Pending Human Approval'}</p>
                  <p class="text-[10px] text-slate-400 leading-normal mt-0.5">
                    {isApproved 
                      ? 'The spec validation has been signed off. You can proceed directly to orchestrating the sub-agent pipeline.' 
                      : 'Thoroughly review the generated audit report and technology alignments on the left. Once you are satisfied, click Approve.'}
                  </p>
                </div>
              </div>

              {/* Actions details */}
              <div class="space-y-2 bg-slate-950/60 border border-slate-850 p-4.5 rounded-xl text-[11px] text-slate-400 leading-relaxed">
                <p class="font-bold text-slate-200">How to handle conflicts:</p>
                <ul class="space-y-1 mt-1.5 list-disc pl-4">
                  <li>If there are requirement conflicts, click **Edit Specifications** to adjust specs in the editor.</li>
                  <li>Once specs are updated, run the audit scan again to compile the updated report.</li>
                  <li>When conflicts are cleared, click **Approve Specifications** below to release workspace to the orchestrator.</li>
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div class="space-y-2 border-t border-slate-850 pt-4 shrink-0">
              <button 
                onClick={() => navigate('/requirements')}
                class="w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2"
              >
                <i class="fas fa-edit"></i>
                <span>Edit Specifications</span>
              </button>

              <button 
                onClick={handleApprove}
                disabled={isApproving || isApproved}
                class={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-lg border border-indigo-500/30 transition flex items-center justify-center space-x-2 ${
                  isApproved 
                    ? 'bg-green-600 hover:bg-green-700 from-green-600 to-emerald-600 cursor-not-allowed opacity-80' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'
                }`}
              >
                {isApproving ? (
                  <>
                    <i class="fas fa-circle-notch animate-spin"></i>
                    <span>Signing off spec...</span>
                  </>
                ) : isApproved ? (
                  <>
                    <i class="fas fa-check-double"></i>
                    <span>Signed Off & Approved</span>
                  </>
                ) : (
                  <>
                    <i class="fas fa-thumbs-up"></i>
                    <span>Approve Specifications</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      )}

      <ConfluencePublishModal 
        isOpen={isConfluenceModalOpen} 
        onClose={() => setIsConfluenceModalOpen(false)} 
        stageType="validator" 
        onSuccess={(msg) => alert(msg)} 
        onError={(err) => alert(err)} 
      />
    </div>
  );
}
