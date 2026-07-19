import React, { useState, useEffect } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { markdownGenerator } from '../utils/markdownGenerator';
import { api } from '../services/api';

export default function UXWireframe() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['ux-wireframe'];

  const [feedback, setFeedback] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  // Auto load workspace spec on load to default files list
  useEffect(() => {
    const importSpec = async () => {
      try {
        const data = await api.getWorkspaceSpec();
        if (pageState.files.length === 0 && data.content) {
          updatePageState('ux-wireframe', {
            files: [{ name: 'spec.md', size: data.content.length * 2 }]
          });
        }
      } catch (err) {
        console.error('Failed to load spec file:', err);
      }
    };
    importSpec();
  }, []);

  const handleTriggerGenerate = async () => {
    await backendAdapter.runGeneration('ux-wireframe', updatePageState, feedback);
  };

  const handleReload = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleDownloadHTML = () => {
    if (!pageState.output) return;
    markdownGenerator.download('wireframe_prototype.html', pageState.output);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left panel: Form input and logs */}
      <div class="lg:col-span-4 flex flex-col space-y-4">
        
        {/* Wireframe Config Form */}
        <div class="glass-panel p-5 rounded-2xl flex flex-col space-y-4 shadow-xl border border-slate-800">
          <h3 class="text-sm font-bold tracking-wide text-slate-300 uppercase">Prototype Configuration</h3>
          
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspace Context</label>
              <div class="bg-slate-950/80 border border-slate-850 p-3 rounded-lg text-xs flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <i class="fab fa-html5 text-orange-400 text-lg"></i>
                  <div>
                    <p class="text-slate-300 font-semibold">Tailwind Sandbox Engine</p>
                    <p class="text-[10px] text-slate-500">Generates responsive single-page prototypes</p>
                  </div>
                </div>
                <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Modify Prototype Feedback</label>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="E.g., Add a customer order tracking step, or color CSR risk badges red/yellow/green depending on fraud history."
                class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-300 h-28 resize-none custom-scroll"
              />
            </div>
          </div>

          <button
            onClick={handleTriggerGenerate}
            disabled={pageState.isLoading}
            class={`w-full py-3 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition duration-300 ${
              pageState.isLoading 
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg border border-indigo-500/40 glow-indigo'
            }`}
          >
            {pageState.isLoading ? (
              <>
                <i class="fas fa-circle-notch animate-spin text-sm"></i>
                <span>Compiling Code Layouts...</span>
              </>
            ) : (
              <>
                <i class="fas fa-magic text-sm"></i>
                <span>Generate/Modify Prototype</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time thoughts console */}
        {(pageState.isLoading || pageState.logs.length > 0) && (
          <div class="glass-panel p-4 rounded-2xl flex flex-col space-y-2 border border-slate-800 shadow-lg">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <i class="fas fa-terminal mr-1 text-orange-400"></i> Prototype build logs
            </p>
            <div class="bg-slate-950 font-mono text-[10px] text-slate-400 p-3 rounded-lg border border-slate-850 h-32 overflow-y-auto custom-scroll flex flex-col space-y-1">
              {pageState.logs.map((log, idx) => (
                <div key={idx} class={log.includes('[Error]') ? 'text-red-400' : 'text-slate-400'}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Right panel: Full-height iframe preview */}
      <div class="lg:col-span-8 h-full flex flex-col overflow-hidden">
        <div class="glass-panel rounded-2xl flex flex-col h-full overflow-hidden shadow-xl border border-slate-800">
          
          {/* Action Header */}
          <div class="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
            <div>
              <h2 class="text-sm font-bold text-slate-200 uppercase flex items-center">
                <span class="w-1.5 h-3 bg-orange-500 rounded-full mr-2"></span> Tailwind UX Prototype Viewport
              </h2>
              <p class="text-[10px] text-slate-500 font-medium">Click around the generated app panels to simulate user interactions</p>
            </div>
            
            {pageState.output && (
              <div class="flex items-center space-x-1.5">
                <button 
                  onClick={handleReload}
                  class="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1.5"
                  title="Reload sandbox environment"
                >
                  <i class="fas fa-redo-alt"></i>
                  <span>Reload</span>
                </button>
                <button 
                  onClick={handleDownloadHTML}
                  class="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-850/80 text-orange-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1.5"
                >
                  <i class="fab fa-html5"></i>
                  <span>Download HTML</span>
                </button>
              </div>
            )}
          </div>

          {/* Sandbox Frame Container */}
          <div class="flex-1 p-4 bg-slate-950/60">
            {!pageState.output ? (
              <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                <div class="p-4 bg-indigo-500/5 text-indigo-400 rounded-full">
                  <i class="fas fa-desktop text-3xl"></i>
                </div>
                <div class="max-w-xs space-y-1.5">
                  <p class="text-xs font-bold text-slate-300">UX Sandbox Offline</p>
                  <p class="text-[11px] text-slate-500">Select specifications and trigger prototype creation to view a live interactive mockup of the application UI.</p>
                </div>
              </div>
            ) : (
              <iframe
                key={iframeKey}
                srcDoc={pageState.output}
                title="UX Wireframe sandbox frame"
                class="w-full h-full border border-slate-800 rounded-xl bg-[#0b0f19]"
                sandbox="allow-scripts allow-popups allow-modals allow-downloads"
              />
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
