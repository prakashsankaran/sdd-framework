import React, { useState, useEffect } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { FileUpload } from '../components/FileUpload';
import { GeneratedOutput } from '../components/GeneratedOutput';
import { pdfGenerator } from '../utils/pdfGenerator';
import { api } from '../services/api';

import { ConfluencePublishModal } from '../components/ConfluencePublishModal';

export default function TestCases() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['test-cases'];

  const [activeTab, setActiveTab] = useState('suite'); // 'suite' | 'gherkin'
  const [isConfluenceOpen, setIsConfluenceOpen] = useState(false);

  // Load workspace spec on load to default files list
  useEffect(() => {
    const importSpec = async () => {
      try {
        const data = await api.getWorkspaceSpec();
        if (pageState.files.length === 0 && data.content) {
          updatePageState('test-cases', {
            files: [{ name: 'spec.md', size: data.content.length * 2 }]
          });
        }
      } catch (err) {
        console.error('Failed to load spec file:', err);
      }
    };
    importSpec();
  }, []);

  const handleFileSelect = (file) => {
    updatePageState('test-cases', {
      files: [...pageState.files, file]
    });
  };

  const handleFileDelete = (idx) => {
    const updated = [...pageState.files];
    updated.splice(idx, 1);
    updatePageState('test-cases', { files: updated });
  };

  const handleTriggerGenerate = async () => {
    await backendAdapter.runGeneration('test-cases', updatePageState);
  };

  const handleDownloadPDF = () => {
    if (!pageState.output) return;
    
    let htmlContent = `<h1>Manual Test Suite Blueprint</h1>`;
    htmlContent += `
      <table>
        <thead>
          <tr>
            <th>Test ID</th>
            <th>Description</th>
            <th>Pre-conditions</th>
            <th>Test Steps</th>
            <th>Expected Output</th>
          </tr>
        </thead>
        <tbody>
    `;
    pageState.output.suite?.forEach(tc => {
      htmlContent += `
        <tr>
          <td><strong>${tc.id}</strong></td>
          <td>${tc.desc}</td>
          <td>${tc.precondition}</td>
          <td>${tc.steps.replace(/\n/g, '<br>')}</td>
          <td>${tc.expected}</td>
        </tr>
      `;
    });
    htmlContent += `</tbody></table>`;
    
    htmlContent += `<h2>Gherkin Automated Specifications</h2>`;
    htmlContent += `<pre>${pageState.output.gherkin}</pre>`;

    pdfGenerator.download('Testing_Specs_Blueprint.pdf', htmlContent);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left panel */}
      <div class="lg:col-span-4 flex flex-col space-y-4">
        <FileUpload
          pageKey="test-cases"
          title="Upload Reference Specs"
          subtitle="Drop specs or story checklists to structure manual tests"
          files={pageState.files}
          logs={pageState.logs}
          isLoading={pageState.isLoading}
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
          onTriggerGenerate={handleTriggerGenerate}
        />
      </div>

      {/* Right panel: viewport */}
      <div class="lg:col-span-8 h-full flex flex-col overflow-hidden">
        <GeneratedOutput
          title="QA Testing Specifications board"
          subtitle="Manual test verification sheets & Gherkin scripts"
          actions={
            pageState.output && (
              <div class="flex items-center space-x-1.5">
                <button 
                  onClick={() => setIsConfluenceOpen(true)}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="fab fa-confluence"></i>
                  <span>Confluence</span>
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1.5"
                >
                  <i class="far fa-file-pdf"></i>
                  <span>Download PDF</span>
                </button>
              </div>
            )
          }
        >
          {!pageState.output ? (
            <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <div class="p-4 bg-indigo-500/5 text-indigo-400 rounded-full">
                <i class="fas fa-tasks text-3xl"></i>
              </div>
              <div class="max-w-xs space-y-1.5">
                <p class="text-xs font-bold text-slate-300">Test Cases Console Offline</p>
                <p class="text-[11px] text-slate-500">Provide specs on the left and compile to generate structured manual test logs & Gherkin scenarios.</p>
              </div>
            </div>
          ) : (
            <div class="flex flex-col h-full space-y-4">
              
              {/* Workspace Tab Selector */}
              <div class="flex space-x-1.5 bg-slate-900/60 p-1 border border-slate-800 rounded-xl self-start">
                <button 
                  onClick={() => setActiveTab('suite')}
                  class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    activeTab === 'suite' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Manual Test Suite
                </button>
                <button 
                  onClick={() => setActiveTab('gherkin')}
                  class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    activeTab === 'gherkin' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Gherkin Script Panel
                </button>
              </div>

              {/* Viewport content */}
              <div class="flex-1 bg-slate-950/60 rounded-xl border border-slate-900/80 p-4 overflow-auto custom-scroll min-h-[300px]">
                
                {activeTab === 'suite' ? (
                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr class="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                          <th class="p-3 border-r border-slate-800">Test ID</th>
                          <th class="p-3 border-r border-slate-800">Description</th>
                          <th class="p-3 border-r border-slate-800">Pre-conditions</th>
                          <th class="p-3 border-r border-slate-800">Steps</th>
                          <th class="p-3">Expected Result</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-850 bg-slate-950/20 text-slate-300">
                        {pageState.output.suite?.map(tc => (
                          <tr key={tc.id} class="hover:bg-slate-900/20">
                            <td class="p-3 border-r border-slate-800 font-bold text-indigo-400 whitespace-nowrap">{tc.id}</td>
                            <td class="p-3 border-r border-slate-800 font-medium text-slate-200">{tc.desc}</td>
                            <td class="p-3 border-r border-slate-800 text-slate-400">{tc.precondition}</td>
                            <td class="p-3 border-r border-slate-800 text-slate-400 whitespace-pre-wrap leading-relaxed">{tc.steps}</td>
                            <td class="p-3 text-emerald-400 font-semibold">{tc.expected}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div class="fsd-document">
                    <pre class="bg-slate-900/40 p-4 rounded-xl border border-slate-800 font-mono text-xs text-yellow-300 whitespace-pre-wrap leading-relaxed">
                      {pageState.output.gherkin}
                    </pre>
                  </div>
                )}
              </div>

            </div>
          )}
        </GeneratedOutput>
      </div>

      <ConfluencePublishModal 
        isOpen={isConfluenceOpen}
        onClose={() => setIsConfluenceOpen(false)}
        stageType="test-cases"
      />

    </div>
  );
}
