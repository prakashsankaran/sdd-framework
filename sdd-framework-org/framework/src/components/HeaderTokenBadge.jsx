import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:7001';

export default function HeaderTokenBadge({ onClick }) {
  const [totalTokens, setTotalTokens] = useState(0);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tokens/summary`);
      const data = await res.json();
      if (data.success) {
        setTotalTokens(data.grandTotalTokens || 0);
      }
    } catch (err) {
      // Silently fail if server is reloading
    }
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTokens = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <button
      onClick={onClick}
      class="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-900/60 hover:border-indigo-500/50 transition duration-300 shadow-sm cursor-pointer"
      title="View Model Token Consumption & History Log"
    >
      <i class="fas fa-bolt text-amber-400 text-xs animate-pulse"></i>
      <span class="text-[10px] font-black font-mono tracking-wider">
        {formatTokens(totalTokens)} Tokens
      </span>
    </button>
  );
}
