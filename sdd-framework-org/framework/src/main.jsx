import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { PageProvider } from './context/PageContext';

// Import Pages
import SpecToStory from './pages/SpecToStory';
import UserStories from './pages/UserStories';
import FunctionalSpec from './pages/FunctionalSpec';
import TechArchitecture from './pages/TechArchitecture';
import DatabaseDesign from './pages/DatabaseDesign';
import UXWireframe from './pages/UXWireframe';
import TestCases from './pages/TestCases';
import TraceabilityMatrix from './pages/TraceabilityMatrix';
import ReviewAgent from './pages/ReviewAgent';
import Repository from './pages/Repository';
import RequirementAgent from './pages/RequirementAgent';
import ValidatorAgent from './pages/ValidatorAgent';
import AgentOrchestrator from './pages/AgentOrchestrator';
import ChatbotWidget from './components/ChatbotWidget';

import './index.css';

const navigationItems = [
  { path: '/spec-to-story', label: 'Spec to Story', icon: 'fas fa-exchange-alt', desc: 'Agile story generator' },
  { path: '/user-stories', label: 'User Stories', icon: 'fas fa-clipboard-list', desc: 'Backlog decomposition' },
  { path: '/ux-wireframe', label: 'UX Wireframe', icon: 'fas fa-desktop', desc: 'Tailwind prototypes' },
  { path: '/functional-spec', label: 'Functional Spec', icon: 'fas fa-file-invoice', desc: 'FSD compilation' },
  { path: '/tech-architecture', label: 'Tech Architecture', icon: 'fas fa-sitemap', desc: 'Blueprints & stack spec' },
  { path: '/database-design', label: 'Database Design', icon: 'fas fa-database', desc: 'ERD & DDL creations' },
  { path: '/test-cases', label: 'Test Cases', icon: 'fas fa-tasks', desc: 'QA & Gherkin suites' },
  { path: '/traceability-matrix', label: 'Traceability Matrix', icon: 'fas fa-link', desc: 'Req cross-references' },
  { path: '/review-agent', label: 'Review Agent', icon: 'fas fa-shield-alt', desc: 'Compliance & code scans' }
];

function Layout({ children }) {
  const location = useLocation();
  const [specs, setSpecs] = useState([]);
  const [activeSpec, setActiveSpec] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  useEffect(() => {
    // Fetch active spec
    fetch('http://localhost:7001/api/specs/active')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setActiveSpec(data.activeSpec);
        }
      })
      .catch(err => console.error(err));

    // Fetch specs list
    fetch('http://localhost:7001/api/specs/list')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSpecs(data.specs);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleSpecChange = async (newSpec) => {
    try {
      const res = await fetch('http://localhost:7001/api/specs/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeSpec: newSpec })
      });
      if (res.ok) {
        localStorage.removeItem('orchestrator_thread_id');
        setActiveSpec(newSpec);
        window.location.reload();
      }
    } catch (err) {
      console.error('Failed to change active spec:', err);
    }
  };

  return (
    <div class={`flex h-screen overflow-hidden bg-[#070a13] text-[#f3f4f6] ${theme}`}>
      {/* Sidebar Navigation */}
      <aside class="w-64 border-r border-slate-800 bg-[#0b0f19] flex flex-col justify-between shrink-0">
        <div>
          {/* Brand header */}
          <Link 
            to="/requirements" 
            class="px-5 py-5 border-b border-slate-800 flex items-center space-x-3 bg-slate-950/20 hover:bg-slate-950/40 transition cursor-pointer"
          >
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <i class="fas fa-bolt text-white text-sm"></i>
            </div>
            <div>
              <h1 class="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">SDD AI Studio</h1>
              <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Requirements Framework</p>
            </div>
          </Link>

          {/* Navigation Links list */}
          <nav class="p-3 space-y-1 overflow-y-auto custom-scroll">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  class={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 text-white font-semibold'
                      : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <div class={`w-7 h-7 rounded-lg flex items-center justify-center transition duration-200 ${
                    isActive 
                      ? 'bg-indigo-500/10 text-indigo-400' 
                      : 'bg-slate-900/50 text-slate-500 group-hover:bg-slate-900 group-hover:text-slate-300'
                  }`}>
                    <i class={`${item.icon} text-xs`}></i>
                  </div>
                  <div class="truncate">
                    <p class="text-xs">{item.label}</p>
                    <p class="text-[9px] text-slate-500 group-hover:text-slate-400 transition truncate">{item.desc}</p>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer System Status details */}
        <div class="p-4 border-t border-slate-800 bg-slate-950/20 space-y-3">
          <div class="flex items-center justify-between text-[10px]">
            <span class="text-slate-500 font-bold uppercase tracking-wider">Workspace:</span>
            <span 
              class="text-indigo-400 font-semibold font-mono truncate max-w-[130px] capitalize" 
              title={activeSpec}
            >
              {activeSpec.replace(/^\d+-/, '').replace(/-/g, ' ')}
            </span>
          </div>
          <div class="flex items-center justify-between text-[10px]">
            <span class="text-slate-500 font-bold uppercase tracking-wider">API Server:</span>
            <span class="text-green-400 font-semibold flex items-center">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse"></span> Port 7001
            </span>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main class="flex-1 flex flex-col min-w-0 bg-[#070a13] relative">
        {/* Top bar header */}
        <header class="h-14 border-b border-slate-800 bg-[#0b0f19]/80 backdrop-blur flex justify-between items-center px-6 shrink-0 min-w-0">
          <div class="flex items-center space-x-3 min-w-0">
            <h2 class="text-xs font-black text-slate-400 uppercase tracking-widest hidden lg:block shrink-0">Workspace Spec Board</h2>
            <div class="h-5 w-px bg-slate-850 hidden lg:block shrink-0"></div>
            
            {/* Step 1: Requirement Agent */}
            <Link
              to="/requirements"
              class={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition duration-300 whitespace-nowrap shrink-0 ${
                location.pathname === '/requirements'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span class={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-black font-mono transition duration-300 ${
                location.pathname === '/requirements'
                  ? 'bg-white text-indigo-600'
                  : 'bg-slate-800 text-slate-400'
              }`}>1</span>
              <span>Requirement Agent</span>
            </Link>

            {/* Step 2: Validator */}
            <Link
              to="/validator"
              class={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition duration-300 whitespace-nowrap shrink-0 ${
                location.pathname === '/validator'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span class={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-black font-mono transition duration-300 ${
                location.pathname === '/validator'
                  ? 'bg-white text-indigo-600'
                  : 'bg-slate-800 text-slate-400'
              }`}>2</span>
              <span>Validator Agent</span>
            </Link>

            {/* Step 3: Agent Orchestrator */}
            <Link
              to="/orchestrator"
              class={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider transition duration-300 whitespace-nowrap shrink-0 ${
                location.pathname === '/orchestrator'
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <span class={`w-4.5 h-4.5 rounded-full flex items-center justify-center text-[9px] font-black font-mono transition duration-300 ${
                location.pathname === '/orchestrator'
                  ? 'bg-white text-indigo-600'
                  : 'bg-slate-800 text-slate-400'
              }`}>3</span>
              <span>Orchestrator Agent</span>
            </Link>
          </div>
          <div class="flex items-center space-x-2 text-[10px] shrink-0 ml-4">
            <span class="text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">Selected Spec:</span>
            <select
              value={activeSpec}
              onChange={(e) => handleSpecChange(e.target.value)}
              class="bg-indigo-950/60 border border-indigo-900/60 text-indigo-400 hover:text-indigo-300 px-2.5 py-1 rounded-lg font-bold font-mono text-[9px] focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {specs.map(spec => (
                <option key={spec.name} value={spec.name} class="bg-[#0b0f19] text-slate-350">
                  {spec.name}
                </option>
              ))}
            </select>

            {/* Light bulb theme toggle */}
            <button
              onClick={toggleTheme}
              class="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-900/60 hover:border-indigo-500 flex items-center justify-center text-slate-400 hover:text-white transition duration-200 cursor-pointer ml-1"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              <i class={`fas ${theme === 'dark' ? 'fa-lightbulb text-amber-400 animate-pulse' : 'fa-moon text-indigo-500'} text-xs`}></i>
            </button>
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <div class="flex-1 p-6 overflow-y-auto custom-scroll">
          {children}
        </div>
      </main>
      <ChatbotWidget />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PageProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/requirements" replace />} />
            <Route path="/orchestrator" element={<AgentOrchestrator />} />
            <Route path="/requirements" element={<RequirementAgent />} />
            <Route path="/validator" element={<ValidatorAgent />} />
            <Route path="/spec-to-story" element={<SpecToStory />} />
            <Route path="/user-stories" element={<UserStories />} />
            <Route path="/ux-wireframe" element={<UXWireframe />} />
            <Route path="/functional-spec" element={<FunctionalSpec />} />
            <Route path="/tech-architecture" element={<TechArchitecture />} />
            <Route path="/database-design" element={<DatabaseDesign />} />
            <Route path="/test-cases" element={<TestCases />} />
            <Route path="/traceability-matrix" element={<TraceabilityMatrix />} />
            <Route path="/review-agent" element={<ReviewAgent />} />
            <Route path="/repo" element={<Repository />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </PageProvider>
  </React.StrictMode>
);
