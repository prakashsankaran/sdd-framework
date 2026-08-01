import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

const PageContext = createContext();

const initialPageState = {
  files: [],
  output: null,
  logs: [],
  isLoading: false
};

const keys = [
  'spec-to-story',
  'user-stories',
  'ux-wireframe',
  'functional-spec',
  'tech-architecture',
  'database-design',
  'test-cases',
  'traceability-matrix',
  'review-agent'
];

export const PageProvider = ({ children }) => {
  const [projectMode, setProjectModeState] = useState(() => localStorage.getItem('projectMode') || 'greenfield');
  const [brownfieldContext, setBrownfieldContext] = useState({
    codeSnippets: [],
    dbSchema: '',
    documents: [],
    legacyGuardrails: {
      frameworkVersion: '',
      apiPrefix: '/api/v1',
      preservationRules: ''
    }
  });

  const setProjectMode = (mode) => {
    setProjectModeState(mode);
    localStorage.setItem('projectMode', mode);
    fetch('http://localhost:7001/api/brownfield/mode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    }).catch(err => console.error('Failed to sync project mode with server:', err));
  };

  const [pages, setPages] = useState(() => {
    const state = {};
    keys.forEach((key) => {
      state[key] = { ...initialPageState };
    });
    return state;
  });

  // Helper function to update the page state statically
  const updatePageState = useCallback((key, updates) => {
    if (!keys.includes(key)) return;
    setPages((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        ...updates
      }
    }));
  }, []);

  const resetPageState = useCallback((key) => {
    if (!keys.includes(key)) return;
    setPages((prev) => ({
      ...prev,
      [key]: { ...initialPageState }
    }));
  }, []);

  // Fetch previously saved JSON outputs from backend
  const loadSavedOutputs = useCallback(async () => {
    for (const key of keys) {
      try {
        const res = await fetch(`http://localhost:7001/api/output/${key}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.output) {
            const outputVal = (key === 'functional-spec' || key === 'ux-wireframe') 
              ? data.output.html 
              : (key === 'tech-architecture')
              ? data.output  // Keep full { html, blueprint } object for the TechArchitecture page
              : data.output;
              
            setPages((prev) => ({
              ...prev,
              [key]: {
                ...prev[key],
                output: outputVal,
                logs: ['[Client] Loaded previously compiled output from backend storage.']
              }
            }));
          }
        }
      } catch (err) {
        console.error(`Failed to load saved output for ${key}:`, err);
      }
    }
  }, []);

  useEffect(() => {
    loadSavedOutputs();
    // Load initial brownfield context if present
    fetch('http://localhost:7001/api/brownfield/context')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.context) {
          setBrownfieldContext(data.context);
        }
      })
      .catch(err => console.error('Failed loading brownfield context:', err));
  }, [loadSavedOutputs]);

  return (
    <PageContext.Provider value={{ 
      pages, 
      updatePageState, 
      resetPageState, 
      loadSavedOutputs,
      projectMode,
      setProjectMode,
      brownfieldContext,
      setBrownfieldContext
    }}>
      {children}
    </PageContext.Provider>
  );
};

export const usePageContext = () => {
  const context = useContext(PageContext);
  if (!context) {
    throw new Error('usePageContext must be used within a PageProvider');
  }
  return context;
};


