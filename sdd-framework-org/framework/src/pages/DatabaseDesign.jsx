import React, { useState, useEffect, useRef } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { FileUpload } from '../components/FileUpload';
import { GeneratedOutput } from '../components/GeneratedOutput';
import { pdfGenerator } from '../utils/pdfGenerator';
import { markdownGenerator } from '../utils/markdownGenerator';
import { api } from '../services/api';

import { ConfluencePublishModal } from '../components/ConfluencePublishModal';

export default function DatabaseDesign() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['database-design'];

  const [activeTab, setActiveTab] = useState('erd'); // 'erd' | 'sql' | 'fsd'
  const [zoomScale, setZoomScale] = useState(1);
  const diagramRef = useRef(null);
  const [isConfluenceOpen, setIsConfluenceOpen] = useState(false);

  // Auto load latest workspace spec as reference on load
  useEffect(() => {
    const importSpec = async () => {
      try {
        const data = await api.getWorkspaceSpec();
        if (pageState.files.length === 0 && data.content) {
          updatePageState('database-design', {
            files: [{ name: 'spec.md', size: data.content.length * 2 }]
          });
        }
      } catch (err) {
        console.error('Failed to load spec file:', err);
      }
    };
    importSpec();
  }, []);

  // File handling
  const handleFileSelect = (file) => {
    updatePageState('database-design', {
      files: [...pageState.files, file]
    });
  };

  const handleFileDelete = (idx) => {
    const updated = [...pageState.files];
    updated.splice(idx, 1);
    updatePageState('database-design', { files: updated });
  };

  const handleTriggerGenerate = async () => {
    await backendAdapter.runGeneration('database-design', updatePageState);
  };

  // ERD Subgraph name sanitizer
  const sanitizeErd = (text) => {
    if (!text) return '';
    // Fix double colons class notation, e.g. NodeId::className -> NodeId:::className
    let clean = text.replace(/(?<!https?)::([a-zA-Z0-9_-]+)/gi, ':::$1');
    
    return clean.replace(/subgraph\s+([a-zA-Z0-9_\-&\s]+)(?:\r?\n)/g, (match, name) => {
      const trimmed = name.trim();
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) return match;
      if (/\s|&/.test(trimmed)) {
        return `subgraph "${trimmed}"\n`;
      }
      return match;
    });
  };

  // Render Mermaid ERD
  useEffect(() => {
    if (activeTab === 'erd' && pageState.output?.erd && window.mermaid) {
      const cleanDiagramCode = sanitizeErd(pageState.output.erd);
      try {
        if (diagramRef.current) {
          diagramRef.current.removeAttribute('data-processed');
          diagramRef.current.innerHTML = cleanDiagramCode;
          
          if (typeof window.mermaid.render === 'function') {
            window.mermaid.render('mermaid-svg-db', cleanDiagramCode)
              .then(({ svg }) => {
                if (diagramRef.current) {
                  diagramRef.current.innerHTML = svg;
                }
              })
              .catch((err) => {
                console.error('Mermaid render promise error (DB):', err);
                if (diagramRef.current) {
                  diagramRef.current.innerHTML = `<div class="text-red-400 p-4 border border-red-900 rounded bg-red-950/20">Mermaid Rendering Error: ${err.message}</div>`;
                }
              });
          } else if (typeof window.mermaid.draw === 'function') {
            window.mermaid.draw('mermaid-svg-db', cleanDiagramCode, (svgCode) => {
              if (diagramRef.current) {
                diagramRef.current.innerHTML = svgCode;
              }
            });
          } else {
            window.mermaid.init(undefined, diagramRef.current);
          }
        }
      } catch (err) {
        console.error('Mermaid render try-catch error (DB):', err);
        if (diagramRef.current) {
          diagramRef.current.innerHTML = `<div class="text-red-400 p-4 border border-red-900 rounded bg-red-950/20">Mermaid Rendering Error: ${err.message}</div>`;
        }
      }
    }
  }, [activeTab, pageState.output, pageState.isLoading]);

  // Export functions
  const handleExportSQL = () => {
    if (!pageState.output?.sql) return;
    markdownGenerator.download('schema_ddl.sql', pageState.output.sql);
  };

  const handleExportPDF = () => {
    if (!pageState.output) return;
    let htmlContent = `
      <h1>Database Architecture & Schema Documentation</h1>
      <h2>Entity-Relationship Layout</h2>
      <p>(See generated design vector models)</p>
      <h2>SQL DDL Scripts</h2>
      <pre>${pageState.output.sql}</pre>
      <h2>FSD Schema details</h2>
      <pre>${pageState.output.fsd}</pre>
    `;
    pdfGenerator.download('Database_Specification.pdf', htmlContent);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left panel */}
      <div class="lg:col-span-4 flex flex-col space-y-4">
        <FileUpload
          pageKey="database-design"
          title="Upload Spec or DDL drafts"
          subtitle="Drop specification files or SQL schemas to compile"
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
          title="Database Schema Design Reviewboard"
          subtitle="ERD layout maps, SQL schemas, and tables validations"
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
                  onClick={handleExportSQL}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="fas fa-file-code"></i>
                  <span>SQL</span>
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
                <i class="fas fa-database text-3xl"></i>
              </div>
              <div class="max-w-xs space-y-1.5">
                <p class="text-xs font-bold text-slate-300">Schema Reviewboard Offline</p>
                <p class="text-[11px] text-slate-500">Provide specs on the left and compile to explore SQL DDL codes and table layouts.</p>
              </div>
            </div>
          ) : (
            <div class="flex flex-col h-full space-y-4">
              
              {/* Tabs */}
              <div class="flex space-x-1.5 bg-slate-900/60 p-1 border border-slate-800 rounded-xl self-start">
                <button 
                  onClick={() => setActiveTab('erd')}
                  class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    activeTab === 'erd' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ERD Diagram
                </button>
                <button 
                  onClick={() => setActiveTab('sql')}
                  class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    activeTab === 'sql' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SQL DDL Script
                </button>
                <button 
                  onClick={() => setActiveTab('fsd')}
                  class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    activeTab === 'fsd' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  FSD Documentation
                </button>
              </div>

              {/* Viewport */}
              <div class="flex-1 bg-slate-950/60 rounded-xl border border-slate-900/80 p-5 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                
                {activeTab === 'erd' ? (
                  <div class="flex-1 relative flex flex-col overflow-hidden">
                    <div class="absolute top-2 right-2 bg-slate-900/80 border border-slate-850/80 p-1.5 rounded-lg flex space-x-1 z-10">
                      <button 
                        onClick={() => setZoomScale(prev => Math.min(prev + 0.1, 2))}
                        class="w-7 h-7 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => setZoomScale(prev => Math.max(prev - 0.1, 0.5))}
                        class="w-7 h-7 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => setZoomScale(1)}
                        class="px-2 h-7 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center text-[10px] font-bold"
                      >
                        Reset
                      </button>
                    </div>

                    <div class="flex-1 overflow-auto flex items-center justify-center custom-scroll bg-slate-950/20 rounded-lg border border-slate-900/50 p-4">
                      <div 
                        ref={diagramRef} 
                        style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}
                        class="mermaid text-center"
                      />
                    </div>
                  </div>
                ) : activeTab === 'sql' ? (
                  <div class="flex-1 overflow-auto custom-scroll fsd-document p-2">
                    <pre class="bg-slate-900/40 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 whitespace-pre-wrap leading-relaxed">
                      {pageState.output.sql}
                    </pre>
                  </div>
                ) : (
                  <div class="flex-1 overflow-auto custom-scroll fsd-document p-2">
                    <pre class="bg-slate-900/40 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {pageState.output.fsd}
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
        stageType="database-design"
      />

    </div>
  );
}
