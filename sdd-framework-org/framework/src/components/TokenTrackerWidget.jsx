import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:7001';

export default function TokenTrackerWidget({ isOpen, onClose }) {
  const [summary, setSummary] = useState({
    grandTotalTokens: 0,
    grandTotalPromptTokens: 0,
    grandTotalCompletionTokens: 0,
    totalCalls: 0,
    byModel: []
  });
  const [history, setHistory] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'history'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sumRes, histRes] = await Promise.all([
        fetch(`${API_BASE}/api/tokens/summary`),
        fetch(`${API_BASE}/api/tokens/history${selectedModel ? `?model=${encodeURIComponent(selectedModel)}` : ''}`)
      ]);

      const sumData = await sumRes.json();
      const histData = await histRes.json();

      if (sumData.success) {
        setSummary(sumData);
      }
      if (histData.success) {
        setHistory(histData.history || []);
      }
    } catch (err) {
      console.error('[TokenTrackerWidget] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
      const interval = setInterval(fetchData, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen, selectedModel]);

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all token usage history?')) {
      try {
        await fetch(`${API_BASE}/api/tokens/clear`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        console.error('Failed to clear token history:', err);
      }
    }
  };

  if (!isOpen) return null;

  const filteredHistory = history.filter(item => {
    const matchesModel = !selectedModel || item.model.toLowerCase() === selectedModel.toLowerCase();
    const matchesSearch = !searchTerm || 
      item.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesModel && matchesSearch;
  });

  const formatNumber = (num) => (num || 0).toLocaleString();

  const getModelBadgeColor = (modelName) => {
    const lower = (modelName || '').toLowerCase();
    if (lower.includes('2.0-flash')) return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    if (lower.includes('3.5-flash') || lower.includes('3.1-flash')) return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
    if (lower.includes('1.5-flash')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (lower.includes('gpt-4')) return 'bg-green-500/10 text-green-400 border-green-500/30';
    if (lower.includes('claude')) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  };

  return (
    <div class="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        class="w-full max-w-2xl bg-[#0b0f19] border-l border-slate-800 text-slate-100 flex flex-col h-full shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div class="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <i class="fas fa-coins text-white text-sm"></i>
            </div>
            <div>
              <h2 class="text-sm font-black uppercase tracking-wider text-white">Token Usage & History</h2>
              <p class="text-[10px] text-slate-400">Real-time model token consumption telemetry</p>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <button
              onClick={fetchData}
              class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer text-xs"
              title="Refresh Data"
            >
              <i class={`fas fa-sync-alt ${loading ? 'animate-spin text-indigo-400' : ''}`}></i>
            </button>
            <button
              onClick={onClose}
              class="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition cursor-pointer text-xs"
              title="Close Panel"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Global Summary KPI Bar */}
        <div class="grid grid-cols-4 gap-3 p-4 border-b border-slate-800/80 bg-slate-900/30">
          <div class="bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-3">
            <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Tokens</div>
            <div class="text-base font-black text-indigo-400 mt-1 font-mono">{formatNumber(summary.grandTotalTokens)}</div>
          </div>
          <div class="bg-blue-950/30 border border-blue-900/50 rounded-xl p-3">
            <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Prompt (In)</div>
            <div class="text-base font-black text-blue-400 mt-1 font-mono">{formatNumber(summary.grandTotalPromptTokens)}</div>
          </div>
          <div class="bg-purple-950/30 border border-purple-900/50 rounded-xl p-3">
            <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Completion (Out)</div>
            <div class="text-base font-black text-purple-400 mt-1 font-mono">{formatNumber(summary.grandTotalCompletionTokens)}</div>
          </div>
          <div class="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-3">
            <div class="text-[9px] font-bold text-slate-400 uppercase tracking-wider">LLM Calls</div>
            <div class="text-base font-black text-emerald-400 mt-1 font-mono">{formatNumber(summary.totalCalls)}</div>
          </div>
        </div>

        {/* Tab Navigation & Filters Header */}
        <div class="px-6 py-3 border-b border-slate-800/60 bg-slate-950/20 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('summary')}
              class={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'summary'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <i class="fas fa-chart-pie mr-1.5"></i> Model Grouping
            </button>
            <button
              onClick={() => setActiveTab('history')}
              class={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <i class="fas fa-history mr-1.5"></i> Call History ({filteredHistory.length})
            </button>
          </div>

          <div class="flex items-center space-x-2">
            {/* Model Filter Dropdown */}
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              class="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-2.5 py-1.5 rounded-xl font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">All Models</option>
              {summary.byModel.map(m => (
                <option key={m.model} value={m.model}>{m.model}</option>
              ))}
            </select>

            {activeTab === 'history' && (
              <button
                onClick={handleClearHistory}
                class="px-2.5 py-1.5 rounded-xl bg-red-950/40 border border-red-900/50 text-red-400 hover:bg-red-900/40 text-xs font-semibold transition cursor-pointer"
                title="Clear History Logs"
              >
                <i class="fas fa-trash-alt mr-1"></i> Clear
              </button>
            )}
          </div>
        </div>

        {/* Tab Content Wrapper */}
        <div class="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll">
          {/* TAB 1: MODEL GROUPING ACCORDION / CARDS */}
          {activeTab === 'summary' && (
            <div class="space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Consumption Grouped by Model</h3>

              {summary.byModel.length === 0 ? (
                <div class="text-center py-12 bg-slate-900/20 border border-slate-800/60 rounded-2xl">
                  <i class="fas fa-robot text-3xl text-slate-600 mb-3"></i>
                  <p class="text-xs text-slate-400 font-medium">No LLM token consumption recorded yet.</p>
                  <p class="text-[10px] text-slate-500 mt-1">Run an agent or scaffolding task to start tracking.</p>
                </div>
              ) : (
                summary.byModel.map((m) => {
                  const pct = summary.grandTotalTokens > 0 
                    ? Math.round((m.totalTokens / summary.grandTotalTokens) * 100) 
                    : 0;

                  return (
                    <div key={m.model} class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2.5">
                          <span class={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${getModelBadgeColor(m.model)}`}>
                            {m.model}
                          </span>
                          <span class="text-[10px] font-semibold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full">
                            {m.callCount} {m.callCount === 1 ? 'call' : 'calls'}
                          </span>
                        </div>

                        <div class="text-right">
                          <span class="text-sm font-black text-white font-mono">{formatNumber(m.totalTokens)}</span>
                          <span class="text-[10px] text-slate-500 ml-1">tokens ({pct}%)</span>
                        </div>
                      </div>

                      {/* Usage Breakdown Bar */}
                      <div class="space-y-1">
                        <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
                          <div 
                            class="h-full bg-blue-500" 
                            style={{ width: `${m.totalTokens ? (m.promptTokens / m.totalTokens) * 100 : 0}%` }}
                            title={`Prompt Tokens: ${formatNumber(m.promptTokens)}`}
                          ></div>
                          <div 
                            class="h-full bg-purple-500" 
                            style={{ width: `${m.totalTokens ? (m.completionTokens / m.totalTokens) * 100 : 0}%` }}
                            title={`Completion Tokens: ${formatNumber(m.completionTokens)}`}
                          ></div>
                        </div>

                        <div class="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                          <span class="flex items-center"><span class="w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Prompt: {formatNumber(m.promptTokens)}</span>
                          <span class="flex items-center"><span class="w-2 h-2 rounded-full bg-purple-500 mr-1"></span> Completion: {formatNumber(m.completionTokens)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: CHRONOLOGICAL HISTORY TIMELINE */}
          {activeTab === 'history' && (
            <div class="space-y-3">
              {/* Search Bar */}
              <div class="relative">
                <i class="fas fa-search absolute left-3 top-2.5 text-slate-500 text-xs"></i>
                <input
                  type="text"
                  placeholder="Search by agent or model name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  class="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {filteredHistory.length === 0 ? (
                <div class="text-center py-12 bg-slate-900/20 border border-slate-800/60 rounded-2xl">
                  <i class="fas fa-clock text-3xl text-slate-600 mb-3"></i>
                  <p class="text-xs text-slate-400 font-medium">No matching history records found.</p>
                </div>
              ) : (
                <div class="space-y-2">
                  {filteredHistory.map((item) => {
                    const formattedTime = new Date(item.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    });
                    const formattedDate = new Date(item.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric'
                    });

                    return (
                      <div 
                        key={item.id}
                        class="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3 flex items-center justify-between transition"
                      >
                        <div class="space-y-1 min-w-0 pr-2">
                          <div class="flex items-center space-x-2">
                            <span class="text-xs font-bold text-white truncate">{item.agentName}</span>
                            <span class={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getModelBadgeColor(item.model)}`}>
                              {item.model}
                            </span>
                          </div>
                          <div class="text-[10px] text-slate-500 font-mono">
                            <i class="far fa-clock mr-1"></i>{formattedDate} at {formattedTime}
                          </div>
                        </div>

                        <div class="text-right shrink-0">
                          <div class="text-xs font-black text-indigo-400 font-mono">
                            ⚡ {formatNumber(item.totalTokens)}
                          </div>
                          <div class="text-[9px] text-slate-500 font-mono space-x-1.5">
                            <span>In: {formatNumber(item.promptTokens)}</span>
                            <span>•</span>
                            <span>Out: {formatNumber(item.completionTokens)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
