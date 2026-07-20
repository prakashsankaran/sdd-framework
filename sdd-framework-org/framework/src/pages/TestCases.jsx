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
    const docHtml = pageState.output.html || '<p>No content generated.</p>';
    pdfGenerator.download('Test_Cases_Document.pdf', docHtml);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left panel */}
      <div class="lg:col-span-4 flex flex-col space-y-4">
        <FileUpload
          pageKey="test-cases"
          title="Upload Reference Specs"
          subtitle="Drop specs or story checklists to generate the test strategy document"
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
          title="Test Strategy & Test Cases Document"
          subtitle="Comprehensive QA test strategy, scenarios, and detailed test cases"
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
                <p class="text-xs font-bold text-slate-300">Test Document Not Generated</p>
                <p class="text-[11px] text-slate-500">Provide specs on the left and compile to generate the comprehensive test strategy & test cases document.</p>
              </div>
            </div>
          ) : (
            <iframe
              srcDoc={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      background: #0f172a;
      color: #e2e8f0;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      font-size: 13px;
      line-height: 1.6;
      width: 100%;
      overflow-x: hidden;
    }
    body { padding: 16px; }
    table {
      width: 100%;
      max-width: 100%;
      border-collapse: collapse;
      table-layout: auto;
      word-break: break-word;
    }
    td, th {
      word-break: break-word;
      overflow-wrap: break-word;
      max-width: 300px;
    }
    img { max-width: 100%; height: auto; }
    pre, code { white-space: pre-wrap; word-break: break-word; }
    * { max-width: 100%; }
    div, section, article, p { overflow-wrap: break-word; }
  </style>
</head>
<body>${pageState.output.html || ''}</body>
</html>`}
              title="Test Strategy & Test Cases Document"
              class="w-full h-full border border-slate-800 rounded-xl"
              style={{ background: '#0f172a' }}
            />
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
