import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { PageProvider, usePageContext } from './context/PageContext';

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
import BrownfieldContextView from './pages/BrownfieldContextView';
import CodeToSpecView from './pages/CodeToSpecView';
import ImpactAnalysisView from './pages/ImpactAnalysisView';
import WipPlaceholder from './components/WipPlaceholder';
import ChatbotWidget from './components/ChatbotWidget';

import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import AdminPersonas from './pages/admin/AdminPersonas';
import AdminAgents from './pages/admin/AdminAgents';
import AdminWorkflows from './pages/admin/AdminWorkflows';
import { Outlet } from 'react-router-dom';

import HeaderTokenBadge from './components/HeaderTokenBadge';
import TokenTrackerWidget from './components/TokenTrackerWidget';
import TokenThresholdAlert from './components/TokenThresholdAlert';

import './index.css';


const greenfieldNavigationItems = [
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

const brownfieldNavigationItems = [
  { path: '/brownfield-context', label: '1. Project Context', icon: 'fas fa-folder-plus', desc: 'Code, DDL & legacy docs', badge: 'Context' },
  { path: '/code-to-spec', label: '2. Code to Spec', icon: 'fas fa-microchip', desc: 'Reverse-engineer v1 baseline', badge: 'Baseline' },
  { path: '/impact-analysis', label: 'Impact & Gap Specs', icon: 'fas fa-search-minus', desc: 'System impact analysis', badge: 'Impact' },
  { path: '/user-stories', label: 'Delta Stories', icon: 'fas fa-tasks', desc: 'Refactoring & new backlog', badge: 'WIP', wip: true },
  { path: '/ux-wireframe', label: 'UX Wireframe (Delta)', icon: 'fas fa-desktop', desc: 'Integrated UI prototypes', badge: 'WIP', wip: true },
  { path: '/functional-spec', label: 'Functional Spec (Delta)', icon: 'fas fa-file-invoice', desc: 'Modified FSD & API specs', badge: 'WIP', wip: true },
  { path: '/tech-architecture', label: 'Tech Arch & Migration', icon: 'fas fa-sitemap', desc: 'Blueprints & legacy rules', badge: 'WIP', wip: true },
  { path: '/database-design', label: 'DB Migration & DDL', icon: 'fas fa-database', desc: 'ALTER TABLE & backfills', badge: 'WIP', wip: true },
  { path: '/test-cases', label: 'Regression Suite', icon: 'fas fa-vial', desc: 'Integration & QA matrix', badge: 'WIP', wip: true },
  { path: '/traceability-matrix', label: 'Traceability Matrix', icon: 'fas fa-link', desc: 'Req to legacy code map', badge: 'WIP', wip: true },
  { path: '/review-agent', label: 'Review & Security', icon: 'fas fa-shield-alt', desc: 'Breaking change scans', badge: 'WIP', wip: true }
];



function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectMode, setProjectMode } = usePageContext();

  const activeNavigationItems = projectMode === 'brownfield' ? brownfieldNavigationItems : greenfieldNavigationItems;

  const [specs, setSpecs] = useState([]);
  const [activeSpec, setActiveSpec] = useState('');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const handleModeToggle = (mode) => {
    setProjectMode(mode);
    if (mode === 'brownfield') {
      if (location.pathname !== '/brownfield-context') {
        navigate('/brownfield-context');
      }
    } else if (mode === 'greenfield') {
      if (location.pathname === '/brownfield-context') {
        navigate('/spec-to-story');
      }
    }
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
      <aside 
        class={`${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } border-r border-slate-800 bg-[#0b0f19] flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out`}
      >
        <div>
          {/* Brand header */}
          <Link 
            to="/requirements" 
            class={`px-4 py-4 border-b border-slate-800 flex items-center bg-slate-950/20 hover:bg-slate-950/40 transition cursor-pointer ${
              isSidebarCollapsed ? 'justify-center' : 'space-x-3'
            }`}
            title="SDD AI Studio"
          >
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <i class="fas fa-bolt text-white text-sm"></i>
            </div>
            {!isSidebarCollapsed && (
              <div class="truncate">
                <h1 class="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">SDD AI Studio</h1>
                <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Requirements Framework</p>
              </div>
            )}
          </Link>

          {/* Project Mode Toggle Switch (Above Navigation) */}
          {!isSidebarCollapsed ? (
            <div class="px-3 py-2.5 border-b border-slate-800/80 bg-slate-950/40">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <i class={`fas ${projectMode === 'brownfield' ? 'fa-cubes text-amber-400' : 'fa-seedling text-emerald-400'} text-xs`}></i>
                  <span class="text-[10px] font-black uppercase tracking-wider text-slate-300">
                    {projectMode === 'brownfield' ? 'Brown Field' : 'Green Field'}
                  </span>
                </div>

                {/* Single Toggle Switch */}
                <button
                  type="button"
                  onClick={() => handleModeToggle(projectMode === 'greenfield' ? 'brownfield' : 'greenfield')}
                  class={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    projectMode === 'brownfield' ? 'bg-amber-500 shadow-md shadow-amber-500/30' : 'bg-emerald-600 shadow-md shadow-emerald-500/30'
                  }`}
                  title={`Mode: ${projectMode.toUpperCase()}. Click to switch to ${projectMode === 'greenfield' ? 'Brown Field' : 'Green Field'}`}
                >
                  <span
                    class={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      projectMode === 'brownfield' ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {projectMode === 'brownfield' && (
                <Link
                  to="/brownfield-context"
                  class={`mt-2 flex items-center justify-between px-3 py-1.5 rounded-xl border text-[10px] font-bold transition ${
                    location.pathname === '/brownfield-context'
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-amber-950/20 border-amber-500/30 text-amber-400 hover:bg-amber-950/40'
                  }`}
                >
                  <div class="flex items-center space-x-2">
                    <i class="fas fa-folder-plus text-xs"></i>
                    <span>Attach Project Context</span>
                  </div>
                  <i class="fas fa-chevron-right text-[9px]"></i>
                </Link>
              )}
            </div>
          ) : (
            <div class="p-2 border-b border-slate-800 flex justify-center">
              <button
                type="button"
                onClick={() => handleModeToggle(projectMode === 'greenfield' ? 'brownfield' : 'greenfield')}
                class={`w-10 h-10 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                  projectMode === 'brownfield' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                }`}
                title={`Current: ${projectMode.toUpperCase()} Mode. Click to toggle.`}
              >
                <i class={`fas ${projectMode === 'brownfield' ? 'fa-cubes' : 'fa-seedling'} text-sm`}></i>
              </button>
            </div>
          )}


          {/* Dynamic Navigation Links List */}
          <nav class="p-2 space-y-1 overflow-y-auto custom-scroll">
            {activeNavigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const isWip = projectMode === 'brownfield' && item.wip;

              if (isWip) {
                return (
                  <div
                    key={item.path}
                    title={isSidebarCollapsed ? `${item.label} (Work In Progress)` : 'Work In Progress'}
                    class={`flex items-center rounded-xl border border-transparent opacity-40 cursor-not-allowed select-none ${
                      isSidebarCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'
                    }`}
                  >
                    <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-slate-950/60 text-slate-600 border border-slate-900">
                      <i class={`${item.icon} text-xs`}></i>
                    </div>
                    {!isSidebarCollapsed && (
                      <div class="truncate flex-1 min-w-0">
                        <div class="flex items-center justify-between">
                          <p class="text-xs truncate text-slate-500">{item.label}</p>
                          <span class="text-[8px] font-bold px-1.5 py-0.2 rounded border border-slate-800/80 bg-slate-950 text-slate-500 font-mono">
                            WIP
                          </span>
                        </div>
                        <p class="text-[9px] text-slate-600 truncate">{item.desc}</p>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isSidebarCollapsed ? item.label : undefined}
                  class={`flex items-center rounded-xl transition duration-200 group ${
                    isSidebarCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? projectMode === 'brownfield'
                        ? 'bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 text-white font-semibold'
                        : 'bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 text-white font-semibold'
                      : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <div class={`w-7 h-7 rounded-lg flex items-center justify-center transition duration-200 shrink-0 ${
                    isActive 
                      ? projectMode === 'brownfield' ? 'bg-amber-500/10 text-amber-400' : 'bg-indigo-500/10 text-indigo-400' 
                      : 'bg-slate-900/50 text-slate-500 group-hover:bg-slate-900 group-hover:text-slate-300'
                  }`}>
                    <i class={`${item.icon} text-xs`}></i>
                  </div>
                  {!isSidebarCollapsed && (
                    <div class="truncate flex-1 min-w-0">
                      <div class="flex items-center justify-between">
                        <p class="text-xs truncate">{item.label}</p>
                        {item.badge && (
                          <span class={`text-[8px] font-bold px-1.5 py-0.2 rounded border ml-1 shrink-0 ${
                            isActive 
                              ? projectMode === 'brownfield' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : 'bg-slate-900 text-slate-400 border-slate-800'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p class="text-[9px] text-slate-500 group-hover:text-slate-400 transition truncate">{item.desc}</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>

        </div>


        {/* Footer System Status & Collapse Toggle */}
        <div class="p-3 border-t border-slate-800 bg-slate-950/20 space-y-2">
          {!isSidebarCollapsed ? (
            <>
              <div class="flex items-center justify-between text-[10px]">
                <span class="text-slate-500 font-bold uppercase tracking-wider">Workspace:</span>
                <span 
                  class="text-indigo-400 font-semibold font-mono truncate max-w-[120px] capitalize" 
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
            </>
          ) : (
            <div class="flex justify-center" title="API Server: Port 7001">
              <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={() => navigate('/login')}
            class="w-full py-1.5 mt-2 mb-2 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 text-xs flex items-center justify-center transition cursor-pointer gap-2"
            title="Sign Out"
          >
            <i class="fas fa-sign-out-alt"></i>
            {!isSidebarCollapsed && <span>Sign Out</span>}
          </button>

          {/* Bottom Sidebar Collapse Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            class="w-full py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center transition cursor-pointer"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <i class={`fas ${isSidebarCollapsed ? 'fa-angle-double-right' : 'fa-angle-double-left'}`}></i>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main class="flex-1 flex flex-col min-w-0 bg-[#070a13] relative">
        {/* Top bar header */}
        <header class="h-14 border-b border-slate-800 bg-[#0b0f19]/80 backdrop-blur flex justify-between items-center px-6 shrink-0 min-w-0">
          <div class="flex items-center space-x-3 min-w-0">
            {/* Sidebar Toggle in Top Header */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              class="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-center text-slate-400 hover:text-white transition duration-200 cursor-pointer shrink-0"
              title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <i class={`fas ${isSidebarCollapsed ? 'fa-bars text-indigo-400' : 'fa-outdent'} text-xs`}></i>
            </button>

            <h2 class="text-xs font-black text-slate-400 uppercase tracking-widest hidden lg:block shrink-0">
              {projectMode === 'brownfield' ? 'Brownfield Spec Board' : 'Workspace Spec Board'}
            </h2>
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

            {/* Token Tracker Header Badge */}
            <HeaderTokenBadge onClick={() => setIsTokenModalOpen(true)} />

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
          {projectMode === 'brownfield' && brownfieldNavigationItems.find(item => item.path === location.pathname && item.wip) ? (
            (() => {
              const item = brownfieldNavigationItems.find(i => i.path === location.pathname);
              return (
                <WipPlaceholder
                  title={item.label}
                  description={`The Brownfield capability for "${item.label}" (${item.desc}) is currently under active development.`}
                  icon={item.icon}
                  badge="WIP"
                />
              );
            })()
          ) : (
            children
          )}
        </div>

      </main>
      <ChatbotWidget />
      <TokenThresholdAlert onOpenWidget={() => setIsTokenModalOpen(true)} />
      <TokenTrackerWidget 
        isOpen={isTokenModalOpen} 
        onClose={() => setIsTokenModalOpen(false)} 
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="personas" element={<AdminPersonas />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="workflows" element={<AdminWorkflows />} />
          </Route>

          <Route element={<Layout><Outlet /></Layout>}>
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
            <Route path="/brownfield-context" element={<BrownfieldContextView />} />
            <Route path="/code-to-spec" element={<CodeToSpecView />} />
            <Route path="/impact-analysis" element={<ImpactAnalysisView />} />
            <Route path="/repo" element={<Repository />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PageProvider>
  </React.StrictMode>
);

