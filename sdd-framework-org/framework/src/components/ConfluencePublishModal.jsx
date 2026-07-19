import React, { useState, useEffect } from 'react';

export const ConfluencePublishModal = ({ isOpen, onClose, stageType, onSuccess, onError }) => {
  const [spaceKey, setSpaceKey] = useState('SDD');
  const [parentPageId, setParentPageId] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('prakash.s89@gmail.com');
  const [resultUrl, setResultUrl] = useState('');

  if (!isOpen) return null;

  const handlePublish = async () => {
    setIsPublishing(true);
    setResultUrl('');
    try {
      const response = await fetch('http://localhost:7001/api/confluence/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          stageType,
          spaceKey,
          parentPageId: parentPageId || undefined
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setResultUrl(data.pageUrl);
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        throw new Error(data.error || 'Failed to publish to Confluence.');
      }
    } catch (err) {
      if (onError) {
        onError(err.message);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div class="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div class="glass-panel max-w-md w-full mx-4 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
        
        {/* Header */}
        <div class="flex justify-between items-center border-b border-slate-850 pb-3">
          <h3 class="text-sm font-bold text-slate-200 flex items-center">
            <i class="fab fa-confluence mr-2 text-indigo-400"></i> Publish to Confluence
          </h3>
          <button onClick={onClose} class="text-slate-400 hover:text-white transition">
            <i class="fas fa-times"></i>
          </button>
        </div>

        {resultUrl ? (
          /* Success Screen */
          <div class="space-y-4 text-center py-2 animate-fade-in">
            <div class="w-12 h-12 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto text-xl">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="space-y-1">
              <p class="text-xs font-bold text-slate-200">Document Published Successfully!</p>
              <p class="text-[10px] text-slate-500">Your spec page was pushed to workspace space [{spaceKey}]</p>
            </div>
            <a 
              href={resultUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-block w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition duration-150 text-center shadow-lg border border-indigo-500/30"
            >
              Open Confluence Page <i class="fas fa-external-link-alt ml-1"></i>
            </a>
            <button 
              onClick={() => { setResultUrl(''); onClose(); }}
              class="w-full py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-lg transition"
            >
              Close
            </button>
          </div>
        ) : (
          /* Configuration Screen */
          <div class="space-y-4">
            
            {/* Choose Account */}
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Choose Authenticated Account</label>
              <div class="relative">
                <select 
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 font-semibold appearance-none"
                >
                  <option value="prakash.s89@gmail.com">prakash.s89@gmail.com (Atlassian Cloud)</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <i class="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>

            {/* Space Key */}
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confluence Space Key</label>
              <input 
                type="text" 
                value={spaceKey}
                onChange={(e) => setSpaceKey(e.target.value.toUpperCase())}
                placeholder="E.g. SDD" 
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-300 font-mono"
              />
            </div>

            {/* Parent Page ID */}
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parent Page ID (Optional)</label>
              <input 
                type="text" 
                value={parentPageId}
                onChange={(e) => setParentPageId(e.target.value)}
                placeholder="Leave blank for Root space page" 
                class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-300 font-mono"
              />
            </div>

            {/* Action Buttons */}
            <div class="flex space-x-2 pt-2 justify-end">
              <button 
                onClick={onClose}
                disabled={isPublishing}
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handlePublish}
                disabled={isPublishing || !spaceKey}
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-lg border border-indigo-500/30 transition flex items-center space-x-1.5"
              >
                {isPublishing ? (
                  <>
                    <i class="fas fa-circle-notch animate-spin"></i>
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Publish & Move</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
