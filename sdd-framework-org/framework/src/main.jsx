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
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPersonas from './pages/admin/AdminPersonas';
import AdminAgents from './pages/admin/AdminAgents';
import AdminAgentMapping from './pages/admin/AdminAgentMapping';
import AdminWorkflows from './pages/admin/AdminWorkflows';
import AdminProjects from './pages/admin/AdminProjects';
import AdminUsers from './pages/admin/AdminUsers';
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

  const [users] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sdd_users')) || []; } catch { return []; }
  });
  
  const activeUserId = Number(localStorage.getItem('activeUserId'));
  const activeUser = users.find(u => u.id === activeUserId);
  
  const [allProjects] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sdd_projects')) || []; } catch { return []; }
  });

  const userProjects = activeUser 
    ? (activeUser.isSuperAdmin 
        ? allProjects.map(p => ({ projectId: p.name, personas: ['Super Admin'] })) 
        : (activeUser.projectAccess || []))
    : [];

  const [activeProject, setActiveProject] = useState(() => {
    return userProjects.length > 0 ? userProjects[0].projectId : 'sdd-enterprise-dev';
  });

  const activeUserAccess = userProjects.find(p => p.projectId === activeProject);
  const activePersona = activeUserAccess && activeUserAccess.personas.length > 0 ? activeUserAccess.personas[0] : (activeUser?.isSuperAdmin ? 'Super Admin' : 'Admin');

  useEffect(() => {
    const proj = allProjects.find(p => p.name === activeProject);
    if (proj && proj.type === 'Brown Field') {
      setProjectMode('brownfield');
    } else {
      setProjectMode('greenfield');
    }
  }, [activeProject, allProjects, setProjectMode]);
  
  const baseNavigationItems = projectMode === 'brownfield' ? brownfieldNavigationItems : greenfieldNavigationItems;
  
  let activeNavigationItems = [];
  if (activePersona === 'Admin' || activePersona === 'Super Admin') {
    activeNavigationItems = baseNavigationItems;
  } else {
    try {
      const savedMappingsStr = localStorage.getItem('agentMappings');
      let savedMappings = [];
      if (savedMappingsStr) {
        savedMappings = JSON.parse(savedMappingsStr);
      } else {
        savedMappings = [
          { id: 1, project: 'sdd-enterprise-dev', persona: 'Product Owner', agents: ['Spec to Story', 'User Stories'] },
          { id: 2, project: 'sdd-enterprise-dev', persona: 'Business Analyst', agents: ['Functional Spec', 'Traceability Matrix'] },
          { id: 3, project: 'mobile-app-v2', persona: 'UX Designer', agents: ['UX Wireframe'] },
          { id: 4, project: 'legacy-migration', persona: 'Business Analyst', agents: ['Impact & Gap Specs', 'Delta Stories', 'Tech Arch & Migration'] }
        ];
      }
      const applicableMapping = savedMappings.find(m => m.persona === activePersona && m.project === activeProject);
      if (applicableMapping && applicableMapping.agents) {
        activeNavigationItems = baseNavigationItems.filter(item => applicableMapping.agents.includes(item.label));
      }
    } catch (e) {
      console.error('Failed to load agent mappings', e);
    }
  }

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

  useEffect(() => {
    if (location.pathname === '/') {
      if (activeNavigationItems.length > 0) {
        navigate(activeNavigationItems[0].path, { replace: true });
      } else {
        navigate('/requirements', { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

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
            title="Frugal Forge"
          >
            <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
              <i class="fas fa-bolt text-white text-sm"></i>
            </div>
            {!isSidebarCollapsed && (
              <div class="truncate">
                <h1 class="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Frugal Forge</h1>
                <p class="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Intelligent Requirements Framework</p>
              </div>
            )}
          </Link>




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

            <div class="h-5 w-px bg-slate-800 mx-3 hidden lg:block"></div>
            
            {/* Project Chip Dropdown */}
            <div className="hidden lg:flex relative items-center">
              <div className="absolute left-3 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
              </div>
              <select 
                value={activeProject}
                onChange={(e) => setActiveProject(e.target.value)}
                className="bg-slate-800/30 border border-slate-800 hover:bg-slate-800/60 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-300 transition-colors focus:outline-none cursor-pointer appearance-none h-[34px]"
              >
                {userProjects.map(up => (
                  <option key={up.projectId} value={up.projectId}>{up.projectId}</option>
                ))}
                {userProjects.length === 0 && <option value="">No Projects Assigned</option>}
              </select>
              <div className="absolute right-3 pointer-events-none">
                <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
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
          {activeNavigationItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <i className="fas fa-robot text-5xl mb-4 opacity-50"></i>
              <h2 className="text-xl font-semibold text-slate-400">No Agents Mapped</h2>
              <p className="text-sm mt-2 max-w-md text-center">
                Your assigned persona (<span className="text-indigo-400">{activePersona}</span>) for project <span className="text-indigo-400">{activeProject}</span> has not been mapped to any agents yet. This will be configured by the Super Administrator.
              </p>
            </div>
          ) : projectMode === 'brownfield' && brownfieldNavigationItems.find(item => item.path === location.pathname && item.wip) ? (
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
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="personas" element={<AdminPersonas />} />
            <Route path="agents" element={<AdminAgents />} />
            <Route path="agent-mapping" element={<AdminAgentMapping />} />
            <Route path="workflows" element={<AdminWorkflows />} />
          </Route>

          <Route element={<Layout><Outlet /></Layout>}>
            <Route path="/" element={null} />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PageProvider>
  </React.StrictMode>
);

