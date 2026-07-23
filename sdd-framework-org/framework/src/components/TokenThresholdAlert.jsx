import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:7001';

export default function TokenThresholdAlert({ onOpenWidget }) {
  const [totalTokens, setTotalTokens] = useState(0);
  const [threshold, setThreshold] = useState(() => {
    return parseInt(localStorage.getItem('token_alert_threshold') || '10000', 10);
  });
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return localStorage.getItem('token_alerts_enabled') !== 'false';
  });
  const [isDismissed, setIsDismissed] = useState(false);

  // Poll server for total tokens
  useEffect(() => {
    const checkThreshold = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/tokens/summary`);
        const data = await res.json();
        if (data.success) {
          setTotalTokens(data.grandTotalTokens || 0);
        }
      } catch (err) {}
    };

    checkThreshold();
    const interval = setInterval(checkThreshold, 3000);
    return () => clearInterval(interval);
  }, []);

  // Listen for storage / threshold updates and reset dismissal state
  useEffect(() => {
    const handleStorageChange = () => {
      const newThreshold = parseInt(localStorage.getItem('token_alert_threshold') || '10000', 10);
      const newAlertsEnabled = localStorage.getItem('token_alerts_enabled') !== 'false';
      setThreshold(newThreshold);
      setAlertsEnabled(newAlertsEnabled);
      setIsDismissed(false); // Reset dismissal on threshold update
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('token_threshold_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('token_threshold_updated', handleStorageChange);
    };
  }, []);

  const isExceeded = alertsEnabled && threshold > 0 && totalTokens >= threshold;

  if (!isExceeded || isDismissed) return null;

  const pct = Math.round((totalTokens / threshold) * 100);

  return (
    <div class="fixed top-16 right-6 z-[9999] max-w-md w-full bg-[#111625]/95 border-2 border-red-500/70 text-slate-100 rounded-2xl shadow-2xl p-4 backdrop-blur-md transition-all duration-300">
      <div class="flex items-start space-x-3">
        <div class="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30 mt-0.5">
          <i class="fas fa-exclamation-triangle text-red-400 text-lg animate-pulse"></i>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-black uppercase tracking-wider text-red-400">Token Limit Exceeded Alert</h4>
            <div class="flex items-center space-x-2">
              <span class="text-[10px] font-mono font-bold bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full border border-red-500/40">
                {pct}% of Limit
              </span>
              <button
                onClick={() => setIsDismissed(true)}
                class="text-slate-400 hover:text-white transition text-xs p-0.5"
                title="Close Alert"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <p class="text-xs text-slate-300 mt-1">
            Total LLM consumption has reached <strong class="text-white font-mono">{totalTokens.toLocaleString()}</strong> tokens, exceeding your configured threshold of <strong class="text-white font-mono">{threshold.toLocaleString()}</strong> tokens.
          </p>

          {/* Progress bar */}
          <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden mt-2.5">
            <div class="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%` }}></div>
          </div>

          {/* Action buttons */}
          <div class="flex items-center justify-end space-x-2 mt-3 pt-2 border-t border-slate-800/80">
            <button
              onClick={() => setIsDismissed(true)}
              class="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                if (onOpenWidget) onOpenWidget();
              }}
              class="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition shadow-md shadow-red-600/30 cursor-pointer"
            >
              Configure Limit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
