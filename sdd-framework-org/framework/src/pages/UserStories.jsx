import React, { useEffect, useState } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { api } from '../services/api';
import { pdfGenerator } from '../utils/pdfGenerator';
import { excelGenerator } from '../utils/excelGenerator';
import { markdownGenerator } from '../utils/markdownGenerator';

export default function UserStories() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['user-stories'];

  const [activeLeftTab, setActiveLeftTab] = useState('spec'); // 'spec' | 'logs'
  const [specContent, setSpecContent] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [editingCell, setEditingCell] = useState(null); // { rowIdx, colKey }
  const [editingValue, setEditingValue] = useState('');
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);

  // Load workspace specification on mount
  useEffect(() => {
    const loadSpec = async () => {
      try {
        const data = await api.getWorkspaceSpec();
        setSpecContent(data.content);
        
        // Add default fake file for workspace
        if (pageState.files.length === 0) {
          updatePageState('user-stories', {
            files: [{ name: 'spec.md', size: data.content.length * 2 }]
          });
        }
      } catch (err) {
        console.error('Failed to load spec file:', err);
      }
    };
    loadSpec();
  }, []);

  const handleUpdateSpecAndStories = async () => {
    try {
      updatePageState('user-stories', { isLoading: true });
      // Update backend spec
      await api.updateWorkspaceSpec(specContent + (customPrompt ? `\n\n## Custom Requirements Addendum\n* ${customPrompt}` : ''));
      
      // Run generation
      await backendAdapter.runGeneration('user-stories', updatePageState, customPrompt);
      setActiveLeftTab('logs');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAndSync = async () => {
    setIsSyncing(true);
    // Simulate API delay for sync
    setTimeout(() => {
      setIsSyncing(false);
      setShowSyncSuccess(true);
      setTimeout(() => setShowSyncSuccess(false), 3000);
    }, 1200);
  };

  const startEditCell = (rowIdx, colKey, val) => {
    setEditingCell({ rowIdx, colKey });
    setEditingValue(val);
  };

  const saveCellEdit = (rowIdx, colKey) => {
    if (!pageState.output || !pageState.output.spreadsheet) return;
    
    const updatedSpreadsheet = [...pageState.output.spreadsheet];
    updatedSpreadsheet[rowIdx] = {
      ...updatedSpreadsheet[rowIdx],
      [colKey]: colKey === 'storyPoints' ? Number(editingValue) || 0 : editingValue
    };
    
    updatePageState('user-stories', {
      output: {
        ...pageState.output,
        spreadsheet: updatedSpreadsheet
      }
    });
    setEditingCell(null);
  };

  const handleExportPDF = () => {
    if (!pageState.output || !pageState.output.spreadsheet) return;
    
    let htmlContent = `
      <h1>JIRA Compliance Backlog</h1>
      <table>
        <thead>
          <tr>
            <th>Summary</th>
            <th>Description</th>
            <th>Issue Type</th>
            <th>Priority</th>
            <th>Story Points</th>
            <th>Labels</th>
          </tr>
        </thead>
        <tbody>
    `;
    pageState.output.spreadsheet.forEach(row => {
      htmlContent += `
        <tr>
          <td><strong>${row.summary}</strong></td>
          <td>${row.description}</td>
          <td>${row.issueType}</td>
          <td>${row.priority}</td>
          <td>${row.storyPoints}</td>
          <td>${row.labels}</td>
        </tr>
      `;
    });
    htmlContent += '</tbody></table>';
    
    pdfGenerator.download('JIRA_Backlog.pdf', htmlContent);
  };

  const handleExportExcel = () => {
    if (!pageState.output || !pageState.output.spreadsheet) return;
    excelGenerator.download('JIRA_Backlog', pageState.output.spreadsheet);
  };

  const handleExportMarkdown = () => {
    if (!pageState.output || !pageState.output.spreadsheet) return;
    
    let md = '# JIRA Backlog Export\n\n';
    md += '| Summary | Description | Issue Type | Priority | Story Points | Labels |\n';
    md += '| --- | --- | --- | --- | --- | --- |\n';
    pageState.output.spreadsheet.forEach(row => {
      md += `| ${row.summary} | ${row.description} | ${row.issueType} | ${row.priority} | ${row.storyPoints} | ${row.labels} |\n`;
    });
    
    markdownGenerator.download('JIRA_Backlog.md', md);
  };

  const handleDownloadMD = () => {
    markdownGenerator.download('spec.md', specContent);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-100px)]">
      
      {/* LEFT PANEL: Spec Review Board */}
      <div class="glass-panel rounded-2xl flex flex-col overflow-hidden border border-slate-800 shadow-xl">
        <div class="px-4 py-3 bg-slate-900/80 border-b border-slate-800 flex justify-between items-center">
          <div class="flex space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button 
              onClick={() => setActiveLeftTab('spec')}
              class={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeLeftTab === 'spec' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Review Spec
            </button>
            <button 
              onClick={() => setActiveLeftTab('logs')}
              class={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                activeLeftTab === 'logs' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Thoughts Log
            </button>
          </div>
          {activeLeftTab === 'spec' && (
            <button 
              onClick={handleDownloadMD}
              class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
            >
              <i class="fas fa-download"></i>
              <span>Download MD</span>
            </button>
          )}
        </div>

        <div class="flex-1 p-4 overflow-auto custom-scroll space-y-4">
          {activeLeftTab === 'spec' ? (
            <div class="flex flex-col h-full space-y-4">
              <textarea 
                value={specContent} 
                onChange={(e) => setSpecContent(e.target.value)}
                class="flex-1 w-full bg-slate-950/70 text-slate-300 border border-slate-800 rounded-xl p-3.5 font-mono text-xs focus:outline-none focus:border-indigo-500 custom-scroll resize-none"
                placeholder="Spec file content loaded from specs/001-return-request-tracker/spec.md..."
              />
              
              <div class="bg-slate-900/60 p-4 border border-slate-800/80 rounded-xl space-y-3">
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Requirements Customization</label>
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="E.g. Add validation that refunds over $500 prompt SMS verification" 
                    class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-300"
                  />
                  <button 
                    onClick={handleUpdateSpecAndStories}
                    disabled={pageState.isLoading}
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-lg border border-indigo-500/30"
                  >
                    {pageState.isLoading ? <i class="fas fa-circle-notch animate-spin"></i> : <i class="fas fa-magic"></i>}
                    <span>Update Spec & Stories</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div class="bg-slate-950 font-mono text-xs text-slate-300 p-4 rounded-xl border border-slate-800 h-full overflow-auto custom-scroll flex flex-col space-y-1">
              {pageState.logs.length === 0 ? (
                <div class="text-slate-500 italic p-4 text-center">No execution log history. Trigger spec generation to start.</div>
              ) : (
                pageState.logs.map((log, idx) => (
                  <div key={idx} class={log.includes('[Error]') ? 'text-red-400' : log.includes('[Queue]') ? 'text-yellow-400' : 'text-slate-400'}>
                    {log}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: JIRA Spreadsheet Backlog */}
      <div class="glass-panel rounded-2xl flex flex-col overflow-hidden border border-slate-800 shadow-xl">
        <div class="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
          <div>
            <h2 class="text-sm font-bold text-slate-200 uppercase flex items-center">
              <span class="w-1.5 h-3 bg-purple-500 rounded-full mr-2"></span> JIRA Spreadsheet Backlog
            </h2>
            <p class="text-[10px] text-slate-500">Double click any cell to edit details inline</p>
          </div>
          <div class="flex items-center space-x-2">
            {showSyncSuccess && (
              <span class="px-2.5 py-1 bg-green-900/30 text-green-400 border border-green-800 text-[10px] font-bold rounded-lg animate-fade-in">
                Saved & Synchronized!
              </span>
            )}
            <button 
              onClick={handleSaveAndSync}
              disabled={isSyncing || !pageState.output}
              class="px-3 py-1.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-bold rounded-lg border border-green-500/30 shadow-lg flex items-center space-x-1.5"
            >
              {isSyncing ? <i class="fas fa-circle-notch animate-spin"></i> : <i class="fas fa-cloud-upload-alt"></i>}
              <span>Save Changes & Sync</span>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-auto custom-scroll">
          {!pageState.output ? (
            <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <div class="p-4 bg-indigo-500/5 text-indigo-400 rounded-full">
                <i class="fas fa-clipboard-list text-3xl"></i>
              </div>
              <div class="max-w-xs space-y-1.5">
                <p class="text-xs font-bold text-slate-300">Generate Backlog Stories</p>
                <p class="text-[11px] text-slate-500">Trigger compilation on the left to extract JIRA tasks directly from return request specifications.</p>
              </div>
            </div>
          ) : (
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                  <th class="p-3 border-r border-slate-800">Summary</th>
                  <th class="p-3 border-r border-slate-800">Description</th>
                  <th class="p-3 border-r border-slate-800">Type</th>
                  <th class="p-3 border-r border-slate-800 w-16">Priority</th>
                  <th class="p-3 border-r border-slate-800 w-12 text-center">SP</th>
                  <th class="p-3">Labels</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 bg-slate-950/20">
                {pageState.output.spreadsheet?.map((row, rowIdx) => (
                  <tr key={row.id} class="hover:bg-slate-900/30">
                    
                    {/* Summary */}
                    <td 
                      onDoubleClick={() => startEditCell(rowIdx, 'summary', row.summary)}
                      class="p-2.5 border-r border-slate-800 font-medium text-slate-200"
                    >
                      {editingCell?.rowIdx === rowIdx && editingCell?.colKey === 'summary' ? (
                        <input 
                          type="text" 
                          value={editingValue} 
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => saveCellEdit(rowIdx, 'summary')}
                          autoFocus
                          class="w-full bg-slate-950 text-white border border-indigo-500 rounded p-1 text-xs focus:outline-none"
                        />
                      ) : row.summary}
                    </td>

                    {/* Description */}
                    <td 
                      onDoubleClick={() => startEditCell(rowIdx, 'description', row.description)}
                      class="p-2.5 border-r border-slate-800 text-slate-400 truncate max-w-[200px]"
                    >
                      {editingCell?.rowIdx === rowIdx && editingCell?.colKey === 'description' ? (
                        <input 
                          type="text" 
                          value={editingValue} 
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => saveCellEdit(rowIdx, 'description')}
                          autoFocus
                          class="w-full bg-slate-950 text-white border border-indigo-500 rounded p-1 text-xs focus:outline-none"
                        />
                      ) : row.description}
                    </td>

                    {/* Issue Type */}
                    <td 
                      onDoubleClick={() => startEditCell(rowIdx, 'issueType', row.issueType)}
                      class="p-2.5 border-r border-slate-800"
                    >
                      {editingCell?.rowIdx === rowIdx && editingCell?.colKey === 'issueType' ? (
                        <select 
                          value={editingValue} 
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => saveCellEdit(rowIdx, 'issueType')}
                          autoFocus
                          class="w-full bg-slate-950 text-white border border-indigo-500 rounded p-1 text-xs focus:outline-none"
                        >
                          <option>Story</option>
                          <option>Task</option>
                          <option>Bug</option>
                        </select>
                      ) : (
                        <span class={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.issueType === 'Story' ? 'bg-indigo-900/30 text-indigo-400 border border-indigo-800' :
                          row.issueType === 'Bug' ? 'bg-red-900/30 text-red-400 border border-red-800' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {row.issueType}
                        </span>
                      )}
                    </td>

                    {/* Priority */}
                    <td 
                      onDoubleClick={() => startEditCell(rowIdx, 'priority', row.priority)}
                      class="p-2.5 border-r border-slate-800"
                    >
                      {editingCell?.rowIdx === rowIdx && editingCell?.colKey === 'priority' ? (
                        <select 
                          value={editingValue} 
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => saveCellEdit(rowIdx, 'priority')}
                          autoFocus
                          class="w-full bg-slate-950 text-white border border-indigo-500 rounded p-1 text-xs focus:outline-none"
                        >
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                      ) : (
                        <span class={row.priority === 'High' ? 'text-red-400 font-bold' : 'text-slate-400'}>
                          {row.priority}
                        </span>
                      )}
                    </td>

                    {/* Story Points */}
                    <td 
                      onDoubleClick={() => startEditCell(rowIdx, 'storyPoints', row.storyPoints)}
                      class="p-2.5 border-r border-slate-800 text-center font-bold text-indigo-400"
                    >
                      {editingCell?.rowIdx === rowIdx && editingCell?.colKey === 'storyPoints' ? (
                        <input 
                          type="number" 
                          value={editingValue} 
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => saveCellEdit(rowIdx, 'storyPoints')}
                          autoFocus
                          class="w-4 bg-slate-950 text-white border border-indigo-500 rounded p-1 text-xs focus:outline-none text-center"
                        />
                      ) : row.storyPoints}
                    </td>

                    {/* Labels */}
                    <td 
                      onDoubleClick={() => startEditCell(rowIdx, 'labels', row.labels)}
                      class="p-2.5 text-slate-400"
                    >
                      {editingCell?.rowIdx === rowIdx && editingCell?.colKey === 'labels' ? (
                        <input 
                          type="text" 
                          value={editingValue} 
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => saveCellEdit(rowIdx, 'labels')}
                          autoFocus
                          class="w-full bg-slate-950 text-white border border-indigo-500 rounded p-1 text-xs focus:outline-none"
                        />
                      ) : row.labels}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Spreadsheets Footer Exporters */}
        {pageState.output && (
          <div class="px-5 py-3 border-t border-slate-800 bg-slate-900/40 flex justify-end space-x-1.5">
            <button 
              onClick={handleExportExcel}
              class="px-3 py-1.5 bg-slate-850 hover:bg-slate-850/80 text-green-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
            >
              <i class="far fa-file-excel"></i>
              <span>Excel</span>
            </button>
            <button 
              onClick={handleExportPDF}
              class="px-3 py-1.5 bg-slate-850 hover:bg-slate-850/80 text-red-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
            >
              <i class="far fa-file-pdf"></i>
              <span>PDF</span>
            </button>
            <button 
              onClick={handleExportMarkdown}
              class="px-3 py-1.5 bg-slate-850 hover:bg-slate-850/80 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
            >
              <i class="fab fa-markdown"></i>
              <span>Markdown</span>
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
