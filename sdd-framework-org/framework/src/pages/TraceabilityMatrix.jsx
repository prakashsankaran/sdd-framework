import React, { useEffect, useState } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { FileUpload } from '../components/FileUpload';
import { GeneratedOutput } from '../components/GeneratedOutput';
import { pdfGenerator } from '../utils/pdfGenerator';
import { excelGenerator } from '../utils/excelGenerator';
import { api } from '../services/api';
import { ConfluencePublishModal } from '../components/ConfluencePublishModal';

export default function TraceabilityMatrix() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['traceability-matrix'];
  const [isConfluenceOpen, setIsConfluenceOpen] = useState(false);

  // Load workspace spec on load to default files list
  useEffect(() => {
    const importSpec = async () => {
      try {
        const data = await api.getWorkspaceSpec();
        if (pageState.files.length === 0 && data.content) {
          updatePageState('traceability-matrix', {
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
    updatePageState('traceability-matrix', {
      files: [...pageState.files, file]
    });
  };

  const handleFileDelete = (idx) => {
    const updated = [...pageState.files];
    updated.splice(idx, 1);
    updatePageState('traceability-matrix', { files: updated });
  };

  const handleTriggerGenerate = async () => {
    await backendAdapter.runGeneration('traceability-matrix', updatePageState);
  };

  const handleExportExcel = () => {
    if (!pageState.output?.matrix) return;
    excelGenerator.download('Requirements_Traceability_Matrix', pageState.output.matrix);
  };

  const handleExportPDF = () => {
    if (!pageState.output?.matrix) return;
    
    let htmlContent = `
      <h1>Requirements Traceability Matrix</h1>
      <p>Status: <strong>${pageState.output.coverage} Traceability Coverage Achieved</strong></p>
      <table>
        <thead>
          <tr>
            <th>Requirement ID (FSD)</th>
            <th>User Story ID (JIRA)</th>
            <th>Tech Spec Section</th>
            <th>Database Tables</th>
            <th>Test Case IDs</th>
          </tr>
        </thead>
        <tbody>
    `;
    pageState.output.matrix.forEach(row => {
      htmlContent += `
        <tr>
          <td><strong>${row.reqId}</strong></td>
          <td>${row.userStoryId}</td>
          <td>${row.techSpec}</td>
          <td>${row.dbTables}</td>
          <td>${row.testCases}</td>
        </tr>
      `;
    });
    htmlContent += '</tbody></table>';

    pdfGenerator.download('Traceability_Matrix.pdf', htmlContent);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left panel */}
      <div class="lg:col-span-4 flex flex-col space-y-4">
        <FileUpload
          pageKey="traceability-matrix"
          title="Upload Spec for Trace Check"
          subtitle="Drop files to scan relationship metrics"
          files={pageState.files}
          logs={pageState.logs}
          isLoading={pageState.isLoading}
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
          onTriggerGenerate={handleTriggerGenerate}
        />
      </div>

      {/* Right panel */}
      <div class="lg:col-span-8 h-full flex flex-col overflow-hidden">
        <GeneratedOutput
          title="Engineering Traceability Matrix Workspace"
          subtitle="Cross-references from specification documents to code and test tasks"
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
                  onClick={handleExportExcel}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-green-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="far fa-file-excel"></i>
                  <span>Excel</span>
                </button>
                <button 
                  onClick={handleExportPDF}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="far fa-file-pdf"></i>
                  <span>PDF</span>
                </button>
              </div>
            )
          }
        >
          {!pageState.output ? (
            <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <div class="p-4 bg-indigo-500/5 text-indigo-400 rounded-full">
                <i class="fas fa-link text-3xl"></i>
              </div>
              <div class="max-w-xs space-y-1.5">
                <p class="text-xs font-bold text-slate-300">Traceability Reviewboard Offline</p>
                <p class="text-[11px] text-slate-500">Provide requirements specifications on the left to compile links linking specs, database records, and test plans.</p>
              </div>
            </div>
          ) : (
            <div class="flex flex-col h-full space-y-4">
              
              {/* Coverage statistics banner */}
              <div class="bg-indigo-950/40 border border-indigo-900/60 p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm">
                    <i class="fas fa-chart-line"></i>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-slate-200 uppercase tracking-wide">Status Trackers Coverage</h4>
                    <p class="text-[10px] text-slate-500 font-medium">Requirement-to-code traceability index</p>
                  </div>
                </div>
                
                <span class="px-3.5 py-1.5 bg-emerald-950/30 text-emerald-400 border border-emerald-900/60 text-xs font-bold rounded-full flex items-center">
                  <i class="fas fa-check-circle mr-1.5"></i>
                  <span>{pageState.output.coverage} Traceability Coverage achieved</span>
                </span>
              </div>

              {/* Table Matrix list */}
              <div class="flex-1 bg-slate-950/60 border border-slate-900 rounded-xl overflow-x-auto custom-scroll">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                      <th class="p-3 border-r border-slate-855">Requirement ID (FSD)</th>
                      <th class="p-3 border-r border-slate-855">User Story ID (JIRA)</th>
                      <th class="p-3 border-r border-slate-855">Tech Spec Section</th>
                      <th class="p-3 border-r border-slate-855">Database Tables</th>
                      <th class="p-3">Test Case IDs</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-850 bg-slate-950/20 text-slate-300">
                    {pageState.output.matrix?.map((row, idx) => (
                      <tr key={idx} class="hover:bg-slate-900/20">
                        <td class="p-3 border-r border-slate-800 font-bold text-indigo-400">{row.reqId}</td>
                        <td class="p-3 border-r border-slate-800 font-medium text-slate-200">{row.userStoryId}</td>
                        <td class="p-3 border-r border-slate-800 text-slate-400">{row.techSpec}</td>
                        <td class="p-3 border-r border-slate-800 font-mono text-purple-400">{row.dbTables}</td>
                        <td class="p-3 text-emerald-400 font-medium">{row.testCases}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </GeneratedOutput>
      </div>

      <ConfluencePublishModal 
        isOpen={isConfluenceOpen}
        onClose={() => setIsConfluenceOpen(false)}
        stageType="traceability-matrix"
      />

    </div>
  );
}
