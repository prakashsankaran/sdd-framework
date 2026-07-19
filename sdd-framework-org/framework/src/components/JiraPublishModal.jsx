import React, { useState, useEffect } from 'react';

export const JiraPublishModal = ({ isOpen, onClose, onSuccess, onError }) => {
  const [boards, setBoards] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [selectedSprintId, setSelectedSprintId] = useState('');
  const [isLoadingBoards, setIsLoadingBoards] = useState(false);
  const [isLoadingSprints, setIsLoadingSprints] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedAccount] = useState('prakash.s89@gmail.com');
  const [projectKey] = useState('SDD');

  useEffect(() => {
    if (isOpen) {
      fetchBoards();
    }
  }, [isOpen]);

  const fetchBoards = async () => {
    setIsLoadingBoards(true);
    try {
      const response = await fetch('http://localhost:7001/api/jira/boards');
      const data = await response.json();
      if (response.ok && data.success) {
        setBoards(data.boards);
        if (data.boards.length > 0) {
          setSelectedBoardId(data.boards[0].id.toString());
          fetchSprints(data.boards[0].id.toString());
        }
      } else {
        throw new Error(data.error || 'Failed to retrieve Jira boards.');
      }
    } catch (err) {
      console.error(err);
      if (onError) onError(err.message);
    } finally {
      setIsLoadingBoards(false);
    }
  };

  const fetchSprints = async (boardId) => {
    setIsLoadingSprints(true);
    setSprints([]);
    setSelectedSprintId('');
    try {
      const response = await fetch(`http://localhost:7001/api/jira/board/${boardId}/sprints`);
      const data = await response.json();
      if (response.ok && data.success) {
        setSprints(data.sprints);
        if (data.sprints.length > 0) {
          // Select the first sprint or active one by default
          const activeSprint = data.sprints.find(s => s.state === 'active');
          if (activeSprint) {
            setSelectedSprintId(activeSprint.id.toString());
          } else {
            setSelectedSprintId(data.sprints[0].id.toString());
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSprints(false);
    }
  };

  const handleBoardChange = (boardId) => {
    setSelectedBoardId(boardId);
    fetchSprints(boardId);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('http://localhost:7001/api/jira/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sprintId: selectedSprintId ? parseInt(selectedSprintId) : undefined
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (onSuccess) {
          onSuccess(data.createdIssues);
        }
        onClose();
      } else {
        throw new Error(data.error || 'Failed to upload user stories.');
      }
    } catch (err) {
      if (onError) {
        onError(err.message);
      }
      onClose();
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOpen) return null;

  const showSprintSelector = isLoadingSprints || sprints.length > 0;

  return (
    <div class="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div class="glass-panel max-w-md w-full mx-4 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">

        {/* Header */}
        <div class="flex justify-between items-center border-b border-slate-850 pb-3">
          <h3 class="text-sm font-bold text-slate-200 flex items-center">
            <i class="fab fa-jira mr-2 text-indigo-400"></i> Push Backlog to JIRA Board
          </h3>
          <button onClick={onClose} class="text-slate-400 hover:text-white transition">
            <i class="fas fa-times"></i>
          </button>
        </div>

        {/* Configuration Screen */}
        <div class="space-y-4">

          {/* Choose Account */}
          <div class="space-y-1.5">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jira Account & Project</label>
            <div class="p-2.5 bg-slate-950/60 border border-slate-900 rounded-lg text-xs text-slate-300 flex justify-between items-center">
              <div>
                <p class="font-semibold text-slate-200">{selectedAccount}</p>
                <p class="text-[10px] text-slate-500">Project Space Key: <span class="text-indigo-400 font-mono font-bold">{projectKey}</span></p>
              </div>
              <span class="px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] font-bold rounded">Connected</span>
            </div>
          </div>

          {/* Select JIRA Board */}
          <div class="space-y-1.5">
            <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Agile/Scrum Board</label>
            {isLoadingBoards ? (
              <div class="text-xs text-slate-500 flex items-center space-x-1.5 py-2">
                <i class="fas fa-circle-notch animate-spin"></i>
                <span>Loading boards from Atlassian...</span>
              </div>
            ) : boards.length === 0 ? (
              <p class="text-xs text-red-400">No boards found for project key {projectKey}</p>
            ) : (
              <div class="relative">
                <select
                  value={selectedBoardId}
                  onChange={(e) => handleBoardChange(e.target.value)}
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-250 font-semibold appearance-none"
                >
                  {boards.map(board => (
                    <option key={board.id} value={board.id}>
                      {board.name} ({board.type.toUpperCase()})
                    </option>
                  ))}
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <i class="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            )}
          </div>

          {/* Select Sprint (If Scrum Board) */}
          {showSprintSelector && (
            <div class="space-y-1.5 animate-fade-in">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Active/Future Sprint (To show under "TO DO" Board)
              </label>
              {isLoadingSprints ? (
                <div class="text-xs text-slate-500 flex items-center space-x-1.5 py-2">
                  <i class="fas fa-circle-notch animate-spin"></i>
                  <span>Retrieving sprint lists...</span>
                </div>
              ) : sprints.length === 0 ? (
                <div class="p-2.5 bg-yellow-950/20 border border-yellow-900/40 rounded-lg text-[11px] text-yellow-400">
                  No active sprints found on this scrum board. Issues will default to the board Backlog view. Create a sprint in Jira to link them directly to the board.
                </div>
              ) : (
                <div class="relative">
                  <select
                    value={selectedSprintId}
                    onChange={(e) => setSelectedSprintId(e.target.value)}
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-250 font-semibold appearance-none"
                  >
                    <option value="">-- Send to Backlog --</option>
                    {sprints.map(sprint => (
                      <option key={sprint.id} value={sprint.id}>
                        {sprint.name} ({sprint.state.toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <i class="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div class="flex space-x-2 pt-2 justify-end border-t border-slate-850">
            <button
              onClick={onClose}
              disabled={isSyncing}
              class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSync}
              disabled={isSyncing || isLoadingBoards || boards.length === 0}
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-lg border border-indigo-500/30 transition flex items-center space-x-1.5"
            >
              {isSyncing ? (
                <>
                  <i class="fas fa-circle-notch animate-spin"></i>
                  <span>Syncing to Jira...</span>
                </>
              ) : (
                <>
                  <i class="fab fa-jira"></i>
                  <span>Push to Board</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
