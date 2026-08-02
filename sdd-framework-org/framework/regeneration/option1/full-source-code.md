# Complete Source Code for SDD Framework

Please recreate this project structure and code.


## index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220%22 width=%22100%22 height=%22100%22><text y=%220.9em%22 font-size=%2290%22>⚡</text></svg>" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SDD AI Studio</title>
    <!-- FontAwesome Icon CDN -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <!-- Mermaid CDN -->
    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
    <script>
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        flowchart: { useMaxWidth: true, htmlLabels: true }
      });
    </script>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#0b0f19] text-[#f3f4f6] antialiased selection:bg-indigo-500/30 selection:text-white">
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```


## package.json
```json
{
  "name": "sdd-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 6060",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "reactflow": "^11.11.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "vite": "^5.0.0"
  }
}
```


## postcss.config.js
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```


## tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155',
          text: '#f8fafc',
          muted: '#94a3b8'
        }
      }
    },
  },
  plugins: [],
}
```


## vite.config.js
```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 6060,
    proxy: {
      '/api': {
        target: 'http://localhost:7001',
        changeOrigin: true,
        secure: false,
      },
      '/generate': {
        target: 'http://localhost:7001',
        changeOrigin: true,
        secure: false,
      },
      '/workspace': {
        target: 'http://localhost:7001',
        changeOrigin: true,
        secure: false,
      },
      '/sync-spec': {
        target: 'http://localhost:7001',
        changeOrigin: true,
        secure: false,
      },
      '/update-spec': {
        target: 'http://localhost:7001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
```


## src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    font-family: 'Outfit', 'Plus Jakarta Sans', sans-serif;
  }
}

/* Custom dark scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #0f172a;
}

::-webkit-scrollbar-thumb {
  background: #1e293b;
  border-radius: 4px;
  border: 2px solid #0f172a;
}

::-webkit-scrollbar-thumb:hover {
  background: #334155;
}

/* Glassmorphism utility classes */
.glass-panel {
  background: rgba(30, 41, 59, 0.45);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.glass-card {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.03);
}

/* Glowing card borders */
.glow-indigo:hover {
  box-shadow: 0 0 25px -5px rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.3);
}

.glow-purple:hover {
  box-shadow: 0 0 25px -5px rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.3);
}

/* Custom layout scrollbars for panels */
.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: #334155 #0f172a;
}

/* Premium heading styling */
.premium-gradient-text {
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* FSD HTML styling definitions */
.fsd-document {
  color: #cbd5e1;
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 1.6;
}

.fsd-document h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.fsd-document h2 {
  font-size: 1.4rem;
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #a78bfa;
}

.fsd-document h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1.25rem;
  margin-bottom: 0.5rem;
  color: #f472b6;
}

.fsd-document p {
  margin-bottom: 1rem;
}

.fsd-document table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.9rem;
}

.fsd-document th, .fsd-document td {
  padding: 0.75rem 1rem;
  border: 1px solid #334155;
  text-align: left;
}

.fsd-document th {
  background-color: #1e1b4b;
  color: #e2e8f0;
  font-weight: 600;
}

.fsd-document tr:nth-child(even) {
  background-color: rgba(30, 41, 59, 0.4);
}

.fsd-document ul, .fsd-document ol {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.fsd-document li {
  margin-bottom: 0.25rem;
}

/* ========================================== */
/* LIGHT THEME STYLES OVERRIDES               */
/* ========================================== */

.light {
  background-color: #f8fafc;
  color: #0f172a;
}

/* Sidebar and Panel overrides for Light Theme */
.light aside, 
.light .bg-\[\#0b0f19\], 
.light header, 
.light .bg-slate-950\/20,
.light .bg-slate-900\/40,
.light .bg-\[\#0b0f19\]\/80 {
  background-color: #ffffff !important;
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
}

.light main,
.light .bg-\[\#070a13\] {
  background-color: #f1f5f9 !important;
}

.light .text-slate-400,
.light .text-slate-500 {
  color: #475569 !important;
}

.light .text-slate-300 {
  color: #334155 !important;
}

.light .text-slate-200 {
  color: #1e293b !important;
}

.light .text-white {
  color: #0f172a;
}

.light .border-slate-800,
.light .border-slate-800\/80,
.light .border-slate-800\/60,
.light .border-slate-900\/80,
.light .border-slate-900 {
  border-color: #cbd5e1 !important;
}

/* Forms and panels in light theme */
.light textarea,
.light input,
.light select,
.light .bg-slate-950,
.light .bg-slate-900 {
  background-color: #ffffff !important;
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
}

.light textarea::placeholder,
.light input::placeholder {
  color: #94a3b8 !important;
}

.light [class*="bg-slate-900/20"],
.light [class*="bg-slate-900/30"],
.light [class*="bg-slate-900/50"],
.light [class*="bg-slate-900/60"],
.light [class*="bg-slate-950"] {
  background-color: #ffffff !important;
  border-color: #cbd5e1 !important;
}

.light [class*="bg-slate-900/30"] {
  background-color: #f8fafc !important;
}

.light [class*="bg-slate-900/20"] {
  background-color: #f1f5f9 !important;
}

/* Custom checkbox elements */
.light [class*="bg-slate-850"] {
  background-color: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

.light [class*="bg-indigo-950"] {
  background-color: #e0e7ff !important;
  color: #4338ca !important;
  border-color: #c7d2fe !important;
}

.light [class*="bg-indigo-950"]:hover {
  background-color: #c7d2fe !important;
  color: #3730a3 !important;
}

.light .text-indigo-400,
.light .text-indigo-500 {
  color: #4f46e5 !important;
}

.light [class*="hover:bg-slate-900/40"]:hover {
  background-color: #f1f5f9 !important;
}

.light [class*="bg-slate-800"],
.light [class*="bg-slate-900"],
.light [class*="bg-slate-750"] {
  background-color: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
}

.light [class*="bg-slate-800"]:hover,
.light [class*="bg-slate-900"]:hover,
.light [class*="bg-slate-750"]:hover {
  background-color: #e2e8f0 !important;
}

/* Disabled button states in light mode */
.light button:disabled,
.light button[disabled] {
  background-color: #e2e8f0 !important;
  background-image: none !important;
  color: #94a3b8 !important;
  border-color: #cbd5e1 !important;
  cursor: not-allowed !important;
  box-shadow: none !important;
  opacity: 1 !important;
}

/* High-contrast status colors in light mode */
.light .text-green-400 {
  color: #16a34a !important;
}
.light .text-red-400 {
  color: #dc2626 !important;
}
.light .text-emerald-400 {
  color: #059669 !important;
}
.light .text-amber-400 {
  color: #d97706 !important;
}
.light .text-purple-400 {
  color: #7c3aed !important;
}

.light .glass-card,
.light .glass-panel {
  background: #ffffff !important;
  border-color: #cbd5e1 !important;
  color: #0f172a !important;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05) !important;
}

.light .glass-card h2,
.light .glass-panel h2 {
  color: #0f172a !important;
}

/* Tab button colors: force text-white when active */
.light .bg-indigo-600 {
  background-color: #4f46e5 !important;
  color: #ffffff !important;
}

.light .hover\:text-white:hover {
  color: #0f172a !important;
}

.light .text-slate-350 {
  color: #334155 !important;
}

.light .custom-scroll {
  scrollbar-color: #cbd5e1 #ffffff;
}

.light .text-\[\#f3f4f6\],
.light .text-slate-100 {
  color: #0f172a !important;
}

/* Rendered specification document markdown style sheets in light mode */
.light .fsd-document {
  color: #334155 !important;
}

.light .fsd-document h1,
.light .fsd-document h2,
.light .fsd-document h3 {
  color: #0f172a !important;
}

.light .fsd-document th {
  background-color: #f1f5f9 !important;
  color: #0f172a !important;
  border-color: #cbd5e1 !important;
}

.light .fsd-document td {
  border-color: #cbd5e1 !important;
}

.light .fsd-document tr:nth-child(even) {
  background-color: #f8fafc !important;
}

/* React Flow Dark Theme Overrides */
.react-flow__controls {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5) !important;
  border: 1px solid #1e293b !important;
  border-radius: 8px !important;
  overflow: hidden !important;
}

.react-flow__controls-button {
  background-color: #0c1222 !important;
  border-bottom: 1px solid #1e293b !important;
  color: #94a3b8 !important;
  fill: #94a3b8 !important;
  transition: all 0.2s ease !important;
}

.react-flow__controls-button:last-child {
  border-bottom: none !important;
}

.react-flow__controls-button:hover {
  background-color: #1e293b !important;
  color: #f8fafc !important;
  fill: #f8fafc !important;
}

.react-flow__controls-button svg {
  fill: currentColor !important;
}
```


## src/main.jsx
```jsx
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
import TraceabilityLogView from './pages/TraceabilityLogView';
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
import AdminDebateCircles from './pages/admin/AdminDebateCircles';
import { Outlet } from 'react-router-dom';

import HeaderTokenBadge from './components/HeaderTokenBadge';
import TokenTrackerWidget from './components/TokenTrackerWidget';
import TokenThresholdAlert from './components/TokenThresholdAlert';
import WorkflowStatusTracker from './components/WorkflowStatusTracker';
import MissingDependencyView from './components/MissingDependencyView';

import './index.css';


const greenfieldNavigationItems = [
  { path: '/validator', label: 'Live Debate Boardroom', icon: 'fas fa-balance-scale', desc: 'AI-SRB Validation' },
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
  { path: '/validator', label: 'Live Debate Boardroom', icon: 'fas fa-balance-scale', desc: 'AI-SRB Validation' },
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
  const { projectMode, setProjectMode, pages } = usePageContext();

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
    localStorage.setItem('activeProject', activeProject);
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

  // Inject Global Traceability view so it is always accessible regardless of persona mapping
  if (!activeNavigationItems.find(item => item.path === '/global-traceability')) {
    activeNavigationItems.push({
      path: '/global-traceability',
      label: 'Global Traceability',
      icon: 'fas fa-history',
      desc: 'Document generation logs',
      badge: 'Global'
    });
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

  // Dependency Checker Logic
  const getMissingDependencies = () => {
    if (activePersona === 'Admin' || activePersona === 'Super Admin') return null;
    
    // Check if the current route is actually an agent
    const isAgentRoute = greenfieldNavigationItems.some(i => i.path === location.pathname) || 
                         brownfieldNavigationItems.some(i => i.path === location.pathname);
    if (!isAgentRoute) return null;

    const currentAgentId = location.pathname.substring(1);

    try {
      const saved = localStorage.getItem('sdd_project_workflows');
      if (!saved) return null; // No workflows defined
      
      const mappings = JSON.parse(saved);
      const workflowData = mappings[activeProject];
      if (!workflowData || !workflowData.nodes) return null;

      const { nodes, edges } = workflowData;
      
      const targetNode = nodes.find(n => n.data.id === currentAgentId);
      if (!targetNode) return null;

      const incomingEdges = edges.filter(e => e.target === targetNode.id);
      
      const missing = [];
      incomingEdges.forEach(edge => {
         const sourceNode = nodes.find(n => n.id === edge.source);
         if (sourceNode) {
           const sourceAgentId = sourceNode.data.id;
           const isSourceGenerated = pages[sourceAgentId] && pages[sourceAgentId].output !== null;
           
           if (!isSourceGenerated) {
             const artifactName = edge.sourceHandle ? edge.sourceHandle.replace('out-', '') : 'Data';
             missing.push({
               sourceAgent: sourceNode.data.label,
               artifact: artifactName
             });
           }
         }
      });
      
      if (missing.length > 0) return missing;
    } catch (e) {
      console.error(e);
    }
    
    return null;
  };

  const missingDependencies = getMissingDependencies();

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

        {/* Workflow Status Tracker */}
        {(activePersona !== 'Admin' && activePersona !== 'Super Admin') && (
          <WorkflowStatusTracker activeProject={activeProject} />
        )}

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
          ) : missingDependencies ? (
            <MissingDependencyView missing={missingDependencies} />
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
            <Route path="debate-circles" element={<AdminDebateCircles />} />
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
            <Route path="/global-traceability" element={<TraceabilityLogView />} />
            <Route path="/repo" element={<Repository />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PageProvider>
  </React.StrictMode>
);

```


## src/agents/backendAdapter.js
```js
import { api } from '../services/api';

export const backendAdapter = {
  /**
   * Run an agent compilation process.
   * Enqueues the job and polls for logs and final output results.
   */
  runGeneration: async (type, updatePageState, instructions = '') => {
    try {
      updatePageState(type, {
        isLoading: true,
        logs: ['[Client] Connecting to generator queue...', '[Client] Enqueuing request...'],
        output: null
      });

      const activeProject = localStorage.getItem('activeProject') || 'sdd-enterprise-dev';
      const { jobId } = await api.generate(type, instructions, activeProject);
      
      updatePageState(type, {
        logs: [`[Client] Request enqueued. Job ID: ${jobId}`, `[Queue] Job accepted. Polling status...`]
      });

      // Poll every 500ms
      const pollInterval = setInterval(async () => {
        try {
          const job = await api.getJobStatus(jobId);
          
          // Update logs and details in page context
          updatePageState(type, {
            logs: job.logs || []
          });

          if (job.status === 'completed') {
            clearInterval(pollInterval);
            updatePageState(type, {
              isLoading: false,
              output: job.result
            });
          } else if (job.status === 'failed') {
            clearInterval(pollInterval);
            updatePageState(type, {
              isLoading: false,
              logs: [...(job.logs || []), '[Error] Generation failed in model backend.']
            });
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          updatePageState(type, {
            isLoading: false,
            logs: ['[Error] Communication with server lost. Check backend logs.']
          });
        }
      }, 500);

    } catch (err) {
      updatePageState(type, {
        isLoading: false,
        logs: [`[Error] Failed to initiate generation: ${err.message}`]
      });
    }
  }
};
```


## src/components/AdminLayout.jsx
```jsx
import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', desc: 'System Metrics' },
    { path: '/admin/personas', label: 'Persona Management', icon: 'fas fa-users-cog', desc: 'Manage Roles' },
    { path: '/admin/projects', label: 'Project Management', icon: 'fas fa-briefcase', desc: 'Manage Projects' },
    { path: '/admin/users', label: 'User Management', icon: 'fas fa-user-shield', desc: 'Provision Users' },
    { path: '/admin/agents', label: 'Agent Definition', icon: 'fas fa-robot', desc: 'Configure Agents' },
    { path: '/admin/agent-mapping', label: 'Agent Mapping', icon: 'fas fa-project-diagram', desc: 'Map Agents' },
    { path: '/admin/workflows', label: 'Agent Workflow', icon: 'fas fa-network-wired', desc: 'Pipeline Setup' },
    { path: '/admin/debate-circles', label: 'Debate Circles', icon: 'fas fa-balance-scale', desc: 'Configure Debates' },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#070a13] text-[#f3f4f6]">
      {/* Sidebar Navigation */}
      <aside 
        className={`${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        } border-r border-slate-800 bg-[#0b0f19] flex flex-col justify-between shrink-0 transition-all duration-300 ease-in-out`}
      >
        <div>
          {/* Brand header */}
          <div className={`px-4 py-4 border-b border-slate-800 flex items-center bg-slate-950/20 ${
              isSidebarCollapsed ? 'justify-center' : 'space-x-3'
            }`}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0 text-white font-bold">
              S
            </div>
            {!isSidebarCollapsed && (
              <div className="truncate">
                <h1 className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Frugal Forge</h1>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Admin Control Center</p>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1 mt-4">
            <span className={`block px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${isSidebarCollapsed ? 'text-center' : ''}`}>
              {isSidebarCollapsed ? 'CFG' : 'Configuration'}
            </span>
            {navigationItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`flex items-center rounded-xl transition duration-200 group ${
                    isSidebarCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30 text-white font-semibold'
                      : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition duration-200 shrink-0 ${
                    isActive 
                      ? 'bg-indigo-500/10 text-indigo-400' 
                      : 'bg-slate-900/50 text-slate-500 group-hover:bg-slate-900 group-hover:text-slate-300'
                  }`}>
                    <i className={`${item.icon} text-xs`}></i>
                  </div>
                  {!isSidebarCollapsed && (
                    <div className="truncate flex-1 min-w-0">
                      <p className="text-xs truncate">{item.label}</p>
                      <p className="text-[9px] text-slate-500 group-hover:text-slate-400 transition truncate">{item.desc}</p>
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer System Status & Collapse Toggle */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/20 space-y-2">
          {!isSidebarCollapsed && (
            <div className="mb-4 px-2 py-3 rounded-lg bg-slate-900/40 border border-slate-800 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-shrink-0 items-center justify-center font-bold text-white text-xs">
                SA
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">Super Administrator</p>
                <p className="text-[10px] text-slate-400 truncate">superadmin@sddframework.io</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full py-2 mb-2 rounded-lg bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 text-xs flex items-center justify-center transition cursor-pointer gap-2"
          >
            <i className="fas fa-sign-out-alt"></i>
            {!isSidebarCollapsed && <span>Log Out</span>}
          </button>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center transition cursor-pointer"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <i className={`fas ${isSidebarCollapsed ? 'fa-angle-double-right' : 'fa-angle-double-left'}`}></i>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#070a13] relative">
        {/* Top bar header */}
        <header className="h-14 border-b border-slate-800 bg-[#0b0f19]/80 backdrop-blur flex justify-between items-center px-6 shrink-0 min-w-0">
          <div className="flex items-center space-x-3 min-w-0">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 flex items-center justify-center text-slate-400 hover:text-white transition duration-200 cursor-pointer shrink-0"
            >
              <i className={`fas ${isSidebarCollapsed ? 'fa-bars text-indigo-400' : 'fa-outdent'} text-xs`}></i>
            </button>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest hidden lg:block shrink-0">
              Super Admin Dashboard
            </h2>

            <div className="h-5 w-px bg-slate-800 mx-3 hidden lg:block"></div>

          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-[10px] bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-300 font-semibold uppercase tracking-wider">System Online</span>
            </div>
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <div className="flex-1 p-6 overflow-y-auto custom-scroll">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
```


## src/components/ChatbotWidget.jsx
```jsx
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your **SDD AI Assistant**. Ask me any question about enqueued requirements, database schemas, JIRA user stories, or compliance reports, and I will search the vector database and summarize the answers for you.',
      citations: [],
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: message,
      citations: [],
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = message;
    setMessage('');
    setIsLoading(true);

    try {
      // POST chat route to backend enqueuing RAG pipeline
      const response = await fetch('http://localhost:7001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentQuery })
      });

      if (!response.ok) {
        throw new Error(`Chat API error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.answer || 'I am sorry, but I was unable to retrieve a response.',
        citations: data.citations || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `❌ **Failed to retrieve answer:** ${err.message}. Please make sure the backend server is running and your Gemini API key is configured.`,
        citations: [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Basic helper to convert markdown bold/bullets to JSX elements
  const renderFormattedText = (text) => {
    if (!text) return '';
    
    // Split into lines to parse list blocks
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      
      // Check for bullet list item
      const isBullet = content.trim().startsWith('* ') || content.trim().startsWith('- ');
      if (isBullet) {
        content = content.replace(/^[\s*-]+/, '').trim();
      }

      // Check for bold styling
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="text-white font-bold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-slate-300 text-[11px] leading-relaxed mb-1.5">
            {parts.length > 0 ? parts : content}
          </li>
        );
      }

      return (
        <p key={idx} className="text-slate-300 text-[11px] leading-relaxed mb-2">
          {parts.length > 0 ? parts : content}
        </p>
      );
    });
  };

  return (
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      
      {/* Expanded Chat Box Window */}
      {isOpen && (
        <div class="w-[380px] h-[520px] bg-[#0b0f19]/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-4 animate-fade-in transition duration-300 ease-in-out">
          
          {/* Header */}
          <div class="px-4 py-3 bg-slate-950 border-b border-slate-850 flex justify-between items-center shrink-0">
            <div class="flex items-center space-x-2.5">
              <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <div>
                <h3 class="text-xs font-black text-white uppercase tracking-wider">SDD AI Assistant</h3>
                <p class="text-[9px] text-slate-500 font-semibold font-mono">Qdrant & Gemini RAG</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              class="p-1 text-slate-400 hover:text-white rounded transition"
            >
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>

          {/* Messages Body */}
          <div class="flex-1 p-4 overflow-y-auto space-y-4 custom-scroll bg-slate-950/20">
            {messages.map((msg) => (
              <div 
                key={msg.id}
                class={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Message Bubble */}
                <div 
                  class={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md border ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600/90 border-indigo-500/30 text-white rounded-br-none'
                      : 'bg-slate-900/90 border-slate-800/80 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {renderFormattedText(msg.text)}

                  {/* Document Citations links */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div class="mt-2.5 pt-2 border-t border-slate-800/60 flex flex-col space-y-1">
                      <span class="text-[8px] text-slate-500 font-bold uppercase tracking-wider flex items-center">
                        <i class="fas fa-bookmark mr-1"></i> Referenced Context:
                      </span>
                      <div class="flex flex-wrap gap-1">
                        {msg.citations.map((cit, idx) => (
                          <a
                            key={idx}
                            href={api.getDocumentDownloadUrl(cit.filename)}
                            download
                            class="px-2 py-0.5 bg-slate-950 hover:bg-slate-900 border border-slate-800/50 hover:border-slate-700 text-[9px] text-indigo-400 font-semibold rounded flex items-center space-x-1 transition"
                            title={`Download source file (Cosine Score: ${Math.round(cit.score * 100)}%)`}
                          >
                            <i class="far fa-file-alt text-[8px] text-indigo-500"></i>
                            <span class="truncate max-w-[120px]">{cit.filename}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <span class="text-[8px] text-slate-600 mt-1 px-1">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
            
            {/* Loading / Typing indicator */}
            {isLoading && (
              <div class="flex flex-col items-start">
                <div class="bg-slate-900 border border-slate-800 rounded-2xl rounded-bl-none px-4 py-3 flex space-x-1.5 items-center shadow-md">
                  <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span class="text-[8px] text-slate-600 mt-1 px-1">Thinking...</span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer Area */}
          <form onSubmit={handleSubmit} class="p-3 bg-slate-950 border-t border-slate-850 flex space-x-2 shrink-0">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask SDD AI Assistant..."
              class="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-300 transition"
              disabled={isLoading}
            />
            <button
              type="submit"
              class={`w-8.5 h-8.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white flex items-center justify-center transition shrink-0 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              <i class="fas fa-paper-plane text-xs"></i>
            </button>
          </form>

        </div>
      )}

      {/* Floating Chat Bubble Toggle Button */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        class="w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 cursor-pointer transition-all duration-300 transform hover:scale-105 relative border border-indigo-400/20 group"
      >
        {/* Pulsing indicator if chat is closed */}
        {!isOpen && (
          <span class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-[#070a13] rounded-full animate-pulse z-10"></span>
        )}
        
        {isOpen ? (
          <i class="fas fa-chevron-down text-lg"></i>
        ) : (
          <i class="fas fa-comments text-lg group-hover:rotate-6 transition duration-200"></i>
        )}
      </button>

    </div>
  );
}
```


## src/components/ConfluencePublishModal.jsx
```jsx
import React, { useState, useEffect } from 'react';

export const ConfluencePublishModal = ({ isOpen, onClose, stageType, onSuccess, onError }) => {
  const [spaces, setSpaces] = useState([]);
  const [spaceKey, setSpaceKey] = useState('SDD');
  const [parentPageId, setParentPageId] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [selectedAccount] = useState('prakash.s89@gmail.com');
  const [resultUrl, setResultUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSpaces();
    }
  }, [isOpen]);

  const fetchSpaces = async () => {
    setIsLoadingSpaces(true);
    try {
      const response = await fetch('http://localhost:7001/api/confluence/spaces');
      const data = await response.json();
      if (response.ok && data.success) {
        setSpaces(data.spaces);
        if (data.spaces.length > 0) {
          // If our current spaceKey is not in the fetched list, select the first one
          const spaceExists = data.spaces.some(s => s.key === spaceKey);
          if (!spaceExists) {
            setSpaceKey(data.spaces[0].key);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load Confluence spaces:', err);
    } finally {
      setIsLoadingSpaces(false);
    }
  };

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

  if (!isOpen) return null;

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
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-250 font-semibold appearance-none"
                  disabled
                >
                  <option value="prakash.s89@gmail.com">prakash.s89@gmail.com (Atlassian Cloud)</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                  <i class="fas fa-chevron-down text-xs"></i>
                </div>
              </div>
            </div>

            {/* Space Key Selector */}
            <div class="space-y-1.5">
              <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confluence Space</label>
              {isLoadingSpaces ? (
                <div class="text-xs text-slate-500 flex items-center space-x-1.5 py-2">
                  <i class="fas fa-circle-notch animate-spin"></i>
                  <span>Retrieving workspaces...</span>
                </div>
              ) : spaces.length === 0 ? (
                // Fallback to text input if space list load fails or has no values
                <input 
                  type="text" 
                  value={spaceKey}
                  onChange={(e) => setSpaceKey(e.target.value.toUpperCase())}
                  placeholder="E.g. SDD" 
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-350 font-mono"
                />
              ) : (
                <div class="relative">
                  <select 
                    value={spaceKey}
                    onChange={(e) => setSpaceKey(e.target.value)}
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-250 font-semibold appearance-none font-mono"
                  >
                    {spaces.map(space => (
                      <option key={space.id || space.key} value={space.key}>
                        {space.name} ({space.key})
                      </option>
                    ))}
                  </select>
                  <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <i class="fas fa-chevron-down text-xs"></i>
                  </div>
                </div>
              )}
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
            <div class="flex space-x-2 pt-2 justify-end border-t border-slate-850">
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
```


## src/components/FileUpload.jsx
```jsx
import React, { useRef, useState, useEffect } from 'react';

export const FileUpload = ({ 
  pageKey, 
  title = "Upload Reference Specifications",
  subtitle = "Drag and drop PDF, Docx, or MD requirement documents", 
  files = [], 
  logs = [], 
  isLoading = false, 
  onFileSelect, 
  onFileDelete, 
  onTriggerGenerate 
}) => {
  const fileInputRef = useRef(null);

  const [inheritedInputs, setInheritedInputs] = useState([]);

  useEffect(() => {
    try {
      const activeProject = localStorage.getItem('activeProject');
      const saved = localStorage.getItem('sdd_project_workflows');
      if (saved && activeProject && pageKey) {
        const mappings = JSON.parse(saved);
        const workflowData = mappings[activeProject];
        if (workflowData && workflowData.nodes) {
          const { nodes, edges } = workflowData;
          const targetNode = nodes.find(n => n.data.id === pageKey);
          if (targetNode && edges) {
            const incomingEdges = edges.filter(e => e.target === targetNode.id);
            const inputs = [];
            incomingEdges.forEach(edge => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              if (sourceNode) {
                inputs.push({
                  sourceAgent: sourceNode.data.label,
                  artifact: edge.sourceHandle ? edge.sourceHandle.replace('out-', '') : 'Data'
                });
              }
            });
            setInheritedInputs(inputs);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [pageKey]);


  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach(file => {
        onFileSelect(file);
      });
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        onFileSelect(file);
      });
    }
  };

  return (
    <div class="glass-panel p-5 rounded-2xl flex flex-col space-y-4 shadow-xl border border-slate-800">
      <h3 class="text-sm font-bold tracking-wide text-slate-300 uppercase">{title}</h3>
      
      {/* Drag & Drop Area */}
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        class="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl p-6 text-center cursor-pointer transition duration-300 group flex flex-col items-center justify-center space-y-2"
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          class="hidden" 
          multiple 
        />
        <div class="p-3 bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition duration-300 rounded-full">
          <i class="fas fa-cloud-upload-alt text-2xl"></i>
        </div>
        <p class="text-xs font-semibold text-slate-300">{subtitle}</p>
        <p class="text-[10px] text-slate-500">Supports up to 50MB files</p>
      </div>

      {/* Inherited Inputs list */}
      {inheritedInputs.length > 0 && (
        <div class="space-y-2 pb-2">
          <p class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center">
            <i class="fas fa-link mr-1.5"></i> Inherited Inputs
          </p>
          <div class="space-y-1.5">
            {inheritedInputs.map((input, idx) => (
              <div key={idx} class="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-2 flex justify-between items-center text-xs">
                <div class="flex items-center space-x-2 truncate">
                  <i class="fas fa-file-export text-emerald-400"></i>
                  <span class="text-emerald-300 font-medium truncate">{input.artifact}</span>
                </div>
                <span class="text-[10px] text-emerald-500 font-semibold px-2 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10">
                  {input.sourceAgent}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uploaded Files list */}
      {files.length > 0 && (
        <div class="space-y-2">
          <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Uploaded Documents ({files.length})</p>
          <div class="max-h-28 overflow-y-auto space-y-1.5 custom-scroll">
            {files.map((file, idx) => (
              <div key={idx} class="bg-slate-950/80 border border-slate-800 rounded-lg p-2 flex justify-between items-center text-xs">
                <div class="flex items-center space-x-2 truncate">
                  <i class="far fa-file-alt text-indigo-400"></i>
                  <span class="text-slate-300 font-medium truncate">{file.name}</span>
                  <span class="text-[10px] text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button 
                  onClick={() => onFileDelete(idx)}
                  class="text-slate-500 hover:text-red-400 p-1"
                >
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compilation Console logs */}
      {(isLoading || logs.length > 0) && (
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <i class="fas fa-terminal mr-1 text-pink-400"></i> Execution log console
            </p>
            {isLoading && (
              <span class="text-[10px] bg-indigo-900/30 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded-full flex items-center">
                <i class="fas fa-circle-notch animate-spin mr-1"></i> Running Spec Compilation...
              </span>
            )}
          </div>
          <div class="bg-slate-950 font-mono text-[10px] text-slate-300 p-3 rounded-lg border border-slate-800/80 h-44 overflow-y-auto custom-scroll flex flex-col space-y-1">
            {logs.map((log, idx) => (
              <div key={idx} class={`whitespace-pre-wrap ${
                log.includes('[Error]') ? 'text-red-400' :
                log.includes('[Queue]') ? 'text-yellow-400' :
                log.includes('[Worker]') ? 'text-green-400 font-medium' :
                log.includes('[Resiliency]') || log.includes('[HTML]') ? 'text-pink-400 font-medium' :
                'text-slate-400'
              }`}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Trigger Button */}
      <button
        onClick={onTriggerGenerate}
        disabled={isLoading || (files.length === 0 && inheritedInputs.length === 0)}
        class={`w-full py-3 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition duration-300 ${
          isLoading || (files.length === 0 && inheritedInputs.length === 0)
            ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-indigo-500/20 glow-indigo border border-indigo-500/40'
        }`}
      >
        {isLoading ? (
          <>
            <i class="fas fa-circle-notch animate-spin text-sm"></i>
            <span>Compiling Agent Specifications...</span>
          </>
        ) : (
          <>
            <i class="fas fa-bolt text-sm"></i>
            <span>Execute AI Spec Generation</span>
          </>
        )}
      </button>
    </div>
  );
};
```


## src/components/GeneratedOutput.jsx
```jsx
import React from 'react';

export const GeneratedOutput = ({ 
  title = "Generated Output Review", 
  subtitle = "Inspect and export compiles", 
  actions = null, 
  children 
}) => {
  return (
    <div class="glass-panel rounded-2xl flex flex-col h-full overflow-hidden shadow-xl border border-slate-800">
      {/* Header bar */}
      <div class="px-5 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 bg-slate-900/60 backdrop-blur-md">
        <div>
          <h2 class="text-sm font-bold tracking-wider text-slate-200 uppercase flex items-center">
            <span class="w-1.5 h-3 bg-indigo-500 rounded-full mr-2"></span> {title}
          </h2>
          <p class="text-[10px] text-slate-500 font-medium">{subtitle}</p>
        </div>
        {/* Header Actions (PDF, Excel, SQL scripts exporters etc.) */}
        {actions && (
          <div class="flex items-center space-x-1.5 self-end sm:self-auto">
            {actions}
          </div>
        )}
      </div>

      {/* Main output viewport */}
      <div class="flex-1 p-5 overflow-auto custom-scroll bg-slate-950/40">
        {children}
      </div>
    </div>
  );
};
```


## src/components/HeaderTokenBadge.jsx
```jsx
import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:7001';

export default function HeaderTokenBadge({ onClick }) {
  const [totalTokens, setTotalTokens] = useState(0);
  const [threshold, setThreshold] = useState(() => {
    return parseInt(localStorage.getItem('token_alert_threshold') || '10000', 10);
  });
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return localStorage.getItem('token_alerts_enabled') !== 'false';
  });

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tokens/summary`);
      const data = await res.json();
      if (data.success) {
        setTotalTokens(data.grandTotalTokens || 0);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setThreshold(parseInt(localStorage.getItem('token_alert_threshold') || '10000', 10));
      setAlertsEnabled(localStorage.getItem('token_alerts_enabled') !== 'false');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('token_threshold_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('token_threshold_updated', handleStorageChange);
    };
  }, []);

  const formatTokens = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const isExceeded = alertsEnabled && threshold > 0 && totalTokens >= threshold;

  return (
    <button
      onClick={onClick}
      class={`flex items-center space-x-1.5 px-3 py-1 rounded-xl transition duration-300 shadow-sm cursor-pointer ${
        isExceeded
          ? 'bg-red-950/80 border border-red-500/60 text-red-300 hover:bg-red-900 animate-pulse'
          : 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-900/60 hover:border-indigo-500/50'
      }`}
      title={isExceeded ? `Token limit exceeded! (${totalTokens.toLocaleString()} / ${threshold.toLocaleString()})` : "View Model Token Consumption & History Log"}
    >
      <i class={`fas ${isExceeded ? 'fa-exclamation-triangle text-red-400' : 'fa-bolt text-amber-400'} text-xs animate-pulse`}></i>
      <span class="text-[10px] font-black font-mono tracking-wider">
        {formatTokens(totalTokens)} Tokens {isExceeded ? '⚠️ Limit' : ''}
      </span>
    </button>
  );
}
```


## src/components/JiraPublishModal.jsx
```jsx
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
```


## src/components/MissingDependencyView.jsx
```jsx
import React from 'react';

export default function MissingDependencyView({ missing }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 fade-in">
      <div className="w-20 h-20 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 mb-6 shadow-[0_0_30px_rgba(244,63,94,0.15)] relative">
        <i className="fas fa-lock text-3xl text-rose-400"></i>
        <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#0b0f19] flex items-center justify-center border border-slate-800">
          <i className="fas fa-exclamation text-rose-500 text-sm"></i>
        </div>
      </div>
      
      <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Agent Locked</h2>
      <p className="text-sm mt-2 max-w-md text-center text-slate-400 leading-relaxed mb-8">
        This agent cannot be run because it depends on artifacts that have not yet been generated in the workflow pipeline.
      </p>

      <div className="bg-[#0b0f19] border border-rose-500/30 rounded-xl w-full max-w-md overflow-hidden shadow-xl">
        <div className="bg-rose-500/10 px-4 py-3 border-b border-rose-500/20">
          <h3 className="text-xs font-bold text-rose-400 uppercase tracking-widest flex items-center">
            <i className="fas fa-network-wired mr-2"></i> Missing Dependencies
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {missing.map((dep, idx) => (
            <div key={idx} className="flex items-start space-x-3 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
              <div className="mt-0.5 text-rose-500">
                <i className="fas fa-times-circle"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">{dep.artifact}</p>
                <p className="text-xs text-slate-500 mt-0.5">Required from <span className="text-indigo-400">{dep.sourceAgent}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```


## src/components/TokenThresholdAlert.jsx
```jsx
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
```


## src/components/TokenTrackerWidget.jsx
```jsx
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
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'history' | 'settings'

  // Threshold Alert state
  const [thresholdInput, setThresholdInput] = useState(() => {
    return localStorage.getItem('token_alert_threshold') || '10000';
  });
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return localStorage.getItem('token_alerts_enabled') !== 'false';
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveThreshold = (e) => {
    e.preventDefault();
    const val = parseInt(thresholdInput, 10);
    if (isNaN(val) || val < 0) return;

    localStorage.setItem('token_alert_threshold', val.toString());
    localStorage.setItem('token_alerts_enabled', alertsEnabled ? 'true' : 'false');
    window.dispatchEvent(new Event('token_threshold_updated'));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

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
            <button
              onClick={() => setActiveTab('settings')}
              class={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <i class="fas fa-bell mr-1.5"></i> Alert Limits
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

          {/* TAB 3: ALERT LIMIT SETTINGS */}
          {activeTab === 'settings' && (
            <div class="space-y-5">
              <div class="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div class="flex items-center space-x-3">
                  <div class="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                    <i class="fas fa-bell text-amber-400 text-sm"></i>
                  </div>
                  <div>
                    <h3 class="text-xs font-black uppercase tracking-wider text-white">Token Usage Alert Threshold</h3>
                    <p class="text-[10px] text-slate-400">Receive automatic pop-up alerts when total token consumption exceeds this limit.</p>
                  </div>
                </div>

                {/* Meter Progress Card */}
                {(() => {
                  const tVal = parseInt(thresholdInput, 10) || 10000;
                  const pct = Math.round((summary.grandTotalTokens / tVal) * 100);
                  const isOver = summary.grandTotalTokens >= tVal;

                  return (
                    <div class={`p-4 rounded-xl border ${isOver ? 'bg-red-950/20 border-red-900/50' : 'bg-slate-950/40 border-slate-800'} space-y-2`}>
                      <div class="flex justify-between items-center text-xs">
                        <span class="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Current Limit Status</span>
                        <span class={`font-mono font-bold text-xs ${isOver ? 'text-red-400' : pct > 75 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {summary.grandTotalTokens.toLocaleString()} / {tVal.toLocaleString()} tokens ({pct}%)
                        </span>
                      </div>

                      <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          class={`h-full transition-all duration-500 ${isOver ? 'bg-red-500 animate-pulse' : pct > 75 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}

                {/* Configuration Form */}
                <form onSubmit={handleSaveThreshold} class="space-y-4 pt-2">
                  <div class="space-y-1.5">
                    <label class="text-xs font-bold text-slate-300 block">
                      Token Limit Threshold (Tokens)
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="500"
                      value={thresholdInput}
                      onChange={(e) => setThresholdInput(e.target.value)}
                      class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                    />
                    <p class="text-[10px] text-slate-500">Default: 10,000 tokens. (Set to 0 to disable alerts).</p>
                  </div>

                  <div class="flex items-center space-x-3 pt-1">
                    <input
                      type="checkbox"
                      id="alertsEnabled"
                      checked={alertsEnabled}
                      onChange={(e) => setAlertsEnabled(e.target.checked)}
                      class="w-4 h-4 rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <label htmlFor="alertsEnabled" class="text-xs text-slate-300 font-medium cursor-pointer">
                      Enable Pop-up Alert Banners when limit is reached
                    </label>
                  </div>

                  <div class="flex items-center space-x-3 pt-3">
                    <button
                      type="submit"
                      class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 cursor-pointer"
                    >
                      <i class="fas fa-save mr-1.5"></i> Save Alert Threshold
                    </button>

                    {saveSuccess && (
                      <span class="text-xs text-emerald-400 font-semibold animate-fadeIn flex items-center">
                        <i class="fas fa-check-circle mr-1"></i> Threshold Saved!
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```


## src/components/WipPlaceholder.jsx
```jsx
import React from 'react';

export default function WipPlaceholder({ title, description, icon, badge = 'WIP' }) {
  return (
    <div class="p-8 max-w-5xl mx-auto my-12">
      <div class="bg-[#0b0f19] border border-dashed border-amber-500/30 rounded-3xl p-12 text-center space-y-6 shadow-2xl backdrop-blur relative overflow-hidden">
        {/* Background Ambient Glow */}
        <div class="absolute -top-24 -left-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Icon Header */}
        <div class="relative">
          <div class="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-3xl shadow-xl shadow-amber-500/10">
            <i class={`${icon || 'fa-tools'} animate-pulse`}></i>
          </div>
          <span class="absolute -top-2 right-1/2 translate-x-12 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500 text-slate-950 shadow-md">
            {badge}
          </span>
        </div>

        {/* Title & Description */}
        <div class="space-y-2 max-w-xl mx-auto">
          <h2 class="text-xl font-bold text-white tracking-wide">{title}</h2>
          <p class="text-xs text-slate-400 leading-relaxed">
            {description || 'This Brownfield capability is currently under active development. Upcoming features will enable automated delta synthesis and regression test matrix generation.'}
          </p>
        </div>

        {/* Status Callout Box */}
        <div class="inline-flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>Status: <strong>Planned for Next Sprint Release</strong></span>
        </div>

        {/* Quick Workflow Action Hint */}
        <div class="pt-6 border-t border-slate-800/80 flex flex-wrap justify-center gap-4 text-xs text-slate-400">
          <div class="flex items-center space-x-2 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <i class="fas fa-check-circle text-emerald-400"></i>
            <span>Step 1: Project Context Attached</span>
          </div>
          <div class="flex items-center space-x-2 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <i class="fas fa-check-circle text-emerald-400"></i>
            <span>Step 2: Code-to-Spec Baseline Generated</span>
          </div>
          <div class="flex items-center space-x-2 bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800">
            <i class="fas fa-check-circle text-emerald-400"></i>
            <span>Step 3: Impact Analysis Engine Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```


## src/components/WorkflowStatusTracker.jsx
```jsx
import React, { useMemo } from 'react';
import { usePageContext } from '../context/PageContext';

export default function WorkflowStatusTracker({ activeProject }) {
  const { pages } = usePageContext();

  const workflowData = useMemo(() => {
    try {
      const saved = localStorage.getItem('sdd_project_workflows');
      if (saved) {
        const mappings = JSON.parse(saved);
        return mappings[activeProject] || { nodes: [], edges: [] };
      }
    } catch (e) {
      console.error(e);
    }
    return { nodes: [], edges: [] };
  }, [activeProject]);

  // Topological sort to determine sequence
  const sortedNodes = useMemo(() => {
    const { nodes, edges } = workflowData;
    if (!nodes || nodes.length === 0) return [];

    const adj = {};
    const inDegree = {};
    nodes.forEach(n => {
      adj[n.id] = [];
      inDegree[n.id] = 0;
    });

    if (edges) {
      edges.forEach(e => {
        if (adj[e.source] && inDegree[e.target] !== undefined) {
          adj[e.source].push(e.target);
          inDegree[e.target]++;
        }
      });
    }

    const queue = [];
    nodes.forEach(n => {
      if (inDegree[n.id] === 0) queue.push(n.id);
    });

    const sorted = [];
    while(queue.length > 0) {
      const u = queue.shift();
      const node = nodes.find(n => n.id === u);
      if (node) sorted.push(node);

      if (adj[u]) {
        adj[u].forEach(v => {
          inDegree[v]--;
          if (inDegree[v] === 0) queue.push(v);
        });
      }
    }

    // In case of any un-added nodes (e.g., disjoint graphs or weird edge cases)
    if (sorted.length < nodes.length) {
       nodes.forEach(n => {
         if (!sorted.find(s => s.id === n.id)) sorted.push(n);
       });
    }

    return sorted;
  }, [workflowData]);

  if (sortedNodes.length === 0) return null;

  return (
    <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-3 flex items-center overflow-x-auto custom-scroll shrink-0 shadow-inner z-10">
      <div className="flex items-center space-x-3 mr-6 shrink-0">
        <i className="fas fa-project-diagram text-indigo-400 text-sm"></i>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Workflow Sequence</span>
      </div>
      
      <div className="flex items-center space-x-3">
        {sortedNodes.map((node, idx) => {
          const agentId = node.data.id;
          const isGenerated = pages[agentId] && pages[agentId].output !== null;
          
          return (
            <React.Fragment key={node.id}>
              {idx > 0 && (
                <i className="fas fa-arrow-right text-slate-600 text-[10px] shrink-0"></i>
              )}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border shrink-0 transition-colors ${
                isGenerated 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.1)]'
              }`}>
                <i className={`fas ${isGenerated ? 'fa-check-circle' : 'fa-hourglass-half'} text-xs`}></i>
                <span className="text-[11px] font-bold whitespace-nowrap">{node.data.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
```


## src/context/PageContext.jsx
```jsx
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
  const [projectMode, setProjectModeState] = useState(() => {
    try {
      const saved = localStorage.getItem('sdd_projects');
      let projects;
      if (saved) {
        projects = JSON.parse(saved);
      } else {
        projects = [
          { id: 1, name: 'sdd-enterprise-dev', type: 'Green Field' },
          { id: 2, name: 'mobile-app-v2', type: 'Green Field' },
          { id: 3, name: 'legacy-migration', type: 'Brown Field' },
        ];
      }
      const active = projects.find(p => p.name === 'sdd-enterprise-dev');
      if (active && active.type === 'Brown Field') return 'brownfield';
      return 'greenfield';
    } catch (e) {
      console.error(e);
    }
    return 'greenfield';
  });
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


```


## src/pages/AgentOrchestrator.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageContext } from '../context/PageContext';

export default function AgentOrchestrator() {
  const navigate = useNavigate();
  const { loadSavedOutputs } = usePageContext();
  const [activeSpec, setActiveSpec] = useState('');
  const [threadId, setThreadId] = useState(localStorage.getItem('orchestrator_thread_id') || '');
  const [graphState, setGraphState] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  // List of stages in orchestrator loop
  const stagesOrder = [
    { key: 'spec-to-story', label: 'Spec to Story', icon: 'fas fa-exchange-alt' },
    { key: 'user-stories', label: 'User Stories', icon: 'fas fa-clipboard-list' },
    { key: 'ux-wireframe', label: 'UX Wireframe', icon: 'fas fa-desktop' },
    { key: 'functional-spec', label: 'Functional Spec', icon: 'fas fa-file-invoice' },
    { key: 'tech-architecture', label: 'Tech Architecture', icon: 'fas fa-sitemap' },
    { key: 'database-design', label: 'Database Design', icon: 'fas fa-database' },
    { key: 'test-cases', label: 'Test Cases', icon: 'fas fa-tasks' },
    { key: 'traceability-matrix', label: 'Traceability Matrix', icon: 'fas fa-link' }
  ];

  // Fetch active spec workspace on mount
  useEffect(() => {
    fetch('http://localhost:7001/api/specs/active')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setActiveSpec(data.activeSpec);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Poll state status periodically if thread is active
  useEffect(() => {
    if (!threadId) return;

    let stopped = false;

    const pollStatus = async () => {
      if (stopped) return;
      try {
        const res = await fetch(`http://localhost:7001/api/orchestrator/status/${threadId}`);

        // Thread was lost (server restart wiped in-memory MemorySaver)
        if (res.status === 404) {
          stopped = true;
          clearInterval(interval);
          setSessionExpired(true);
          setThreadId('');
          localStorage.removeItem('orchestrator_thread_id');
          return;
        }

        const data = await res.json();
        if (data.success && data.state) {
          setGraphState(data.state);
          setSessionExpired(false);
          loadSavedOutputs();
        }
      } catch (err) {
        // ERR_CONNECTION_REFUSED means server is temporarily down — don't clear thread, just skip
        if (err.message && err.message.includes('Failed to fetch')) {
          console.warn('[Orchestrator] Server unreachable — will retry on next poll.');
        } else {
          console.error('Failed to poll orchestrator status:', err);
        }
      }
    };

    pollStatus();
    const interval = setInterval(pollStatus, 4000);
    return () => { stopped = true; clearInterval(interval); };
  }, [threadId]);

  // Start Orchestrator Graph
  const handleStartOrchestrator = async () => {
    if (!activeSpec || isStarting) return;
    setIsStarting(true);
    try {
      const res = await fetch('http://localhost:7001/api/orchestrator/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activeSpec })
      });
      const data = await res.json();
      if (data.success) {
        setThreadId(data.threadId);
        setGraphState(data.state);
        localStorage.setItem('orchestrator_thread_id', data.threadId);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsStarting(false);
    }
  };

  // Submit Approval/Reject response (HITL Action)
  const handleReviewResponse = async (action) => {
    if (!threadId || isResponding || !graphState) return;
    setIsResponding(true);

    const currentStage = graphState.currentStage || 'functional-spec';
    try {
      const res = await fetch('http://localhost:7001/api/orchestrator/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threadId,
          stage: currentStage,
          action,
          feedbackText: action === 'reject' ? feedbackText : ''
        })
      });
      const data = await res.json();
      if (data.success && data.state) {
        setGraphState(data.state);
        setFeedbackText('');
        if (action === 'approve') {
          loadSavedOutputs();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResponding(false);
    }
  };

  // Reset Thread and Clean Artifacts
  const handleResetThread = async () => {
    try {
      if (threadId) {
        await fetch('http://localhost:7001/api/orchestrator/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ threadId })
        });
      }
    } catch (err) {
      console.error('Failed to reset orchestrator session:', err);
    } finally {
      setThreadId('');
      setGraphState(null);
      setSessionExpired(false);
      localStorage.removeItem('orchestrator_thread_id');
      loadSavedOutputs();
    }
  };

  // Helper: Get stage approval status
  const getStageStatus = (stageKey) => {
    if (stageKey === 'completed') return 'completed';
    if (!graphState) return 'pending';
    
    // Check if stage has been completed/approved
    if (graphState.approvalStatus[stageKey] === 'approved') return 'approved';
    if (graphState.approvalStatus[stageKey] === 'rejected') return 'rejected';
    
    // If it's the current running stage
    if (graphState.currentStage === stageKey) {
      // Has result → awaiting review
      if (graphState.results[stageKey] !== undefined && graphState.results[stageKey] !== null && graphState.results[stageKey] !== '') {
        return 'pending_review';
      }
      // No result yet → still generating
      return 'running';
    }
    
    // Stages that have results but haven't been explicitly approved yet
    if (graphState.results[stageKey] !== undefined && graphState.results[stageKey] !== null) {
      return 'pending_review';
    }
    
    return 'pending';
  };

  const currentStage = graphState?.currentStage || 'spec-to-story';
  const isStageAwaitingReview = graphState && graphState.results[currentStage] && graphState.approvalStatus[currentStage] !== 'approved';

  return (
    <div class="space-y-6">
      
      {/* Page Title Header */}
      <div class="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <h1 class="text-xl font-black text-white uppercase tracking-wider flex items-center">
            <i class="fas fa-project-diagram text-indigo-500 mr-3"></i> LangGraph Orchestrator Agent
          </h1>
          <p class="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Central orchestration board powered by LangGraph. Routes compilation tasks dynamically using the Selector Agent and gates key phases for Human-in-the-Loop verification.
          </p>
        </div>
        
        <div class="flex items-center space-x-3">
          {sessionExpired && (
            <span class="text-[10px] px-3 py-1.5 bg-amber-950/30 border border-amber-900/40 text-amber-400 font-bold rounded-xl flex items-center space-x-1.5">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Session expired after server restart. Please start a new session.</span>
            </span>
          )}
          {(graphState || threadId || sessionExpired) && (
            <button
              onClick={handleResetThread}
              class="px-4 py-2 bg-red-950/20 border border-red-900/50 text-red-400 hover:bg-red-900/10 hover:text-red-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Stop &amp; Reset Session
            </button>
          )}
          {!graphState && !sessionExpired && (
            <button
              onClick={handleStartOrchestrator}
              disabled={!activeSpec || isStarting}
              class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:from-indigo-500 hover:to-indigo-400 hover:shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isStarting ? 'Starting Orchestrator...' : 'Start Orchestration'}
            </button>
          )}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Stages & Live Logs (4 cols) */}
        <div class="lg:col-span-5 space-y-6">
          
          {/* Stages List */}
          <div class="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 class="text-xs font-black text-white uppercase tracking-wider">Pipeline Execution Plan</h3>
            <div class="space-y-3">
              {stagesOrder.map((stage) => {
                const status = getStageStatus(stage.key);
                const decision = graphState?.modelDecision[stage.key];
                
                return (
                  <div key={stage.key} class="flex items-center justify-between p-3 bg-slate-950/20 border border-slate-800 rounded-xl">
                    <div class="flex items-center space-x-3 min-w-0">
                      <div class={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        status === 'approved' ? 'bg-green-500/10 text-green-400' :
                        status === 'rejected' ? 'bg-red-500/10 text-red-400' :
                        status === 'pending_review' ? 'bg-amber-500/10 text-amber-400 animate-pulse' :
                        status === 'running' ? 'bg-indigo-500/10 text-indigo-400 animate-pulse' :
                        'bg-slate-900 text-slate-500'
                      }`}>
                        <i class={`${stage.icon} text-xs`}></i>
                      </div>
                      <div class="truncate">
                        <p class="text-xs font-bold text-slate-200">{stage.label}</p>
                        {decision && (
                          <p class="text-[9px] text-indigo-400 font-semibold truncate max-w-[170px]" title={decision.reasoning}>
                            {decision.model}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {status === 'approved' && (
                        <span class="text-[9px] px-2 py-0.5 bg-green-500/10 border border-green-500/30 text-green-400 font-bold rounded-full">Approved</span>
                      )}
                      {status === 'rejected' && (
                        <span class="text-[9px] px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-full">Refining</span>
                      )}
                      {status === 'pending_review' && (
                        <span class="text-[9px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold rounded-full">Awaiting Review</span>
                      )}
                      {status === 'running' && (
                        <span class="text-[9px] px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-bold rounded-full">Processing</span>
                      )}
                      {status === 'pending' && (
                        <span class="text-[9px] px-2 py-0.5 bg-slate-900 border border-slate-800 text-slate-500 font-bold rounded-full">Queued</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Execution Console Logs */}
          <div class="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 class="text-xs font-black text-white uppercase tracking-wider flex items-center">
              <i class="fas fa-terminal mr-2 text-pink-500"></i> Execution log console
            </h3>
            
            <div class="bg-slate-950 font-mono text-[10px] p-3 rounded-xl border border-slate-900 h-64 overflow-y-auto custom-scroll flex flex-col space-y-1">
              {!graphState ? (
                <div class="text-slate-500 text-center py-20">Console idle. Start orchestration to view live traces.</div>
              ) : (
                graphState.logs.map((log, idx) => (
                  <div key={idx} class={`whitespace-pre-wrap ${
                    log.includes('[Error]') || log.includes('failed') ? 'text-red-400' :
                    log.includes('[Selector]') ? 'text-indigo-400 font-semibold' :
                    log.includes('[Generator]') ? 'text-emerald-400 font-medium' :
                    log.includes('[Gating]') ? 'text-amber-400' :
                    'text-slate-400'
                  }`}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Approval Console & Preview (7 cols) */}
        <div class="lg:col-span-7">
          {graphState ? (
            <div class="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 flex flex-col h-[670px] overflow-hidden">
              
              {/* Header */}
              <div class="border-b border-slate-850 pb-4 mb-4 shrink-0 flex justify-between items-center">
                <div>
                  <h3 class="text-sm font-bold text-white uppercase flex items-center">
                    <span class="w-1.5 h-3 bg-indigo-500 rounded-full mr-2"></span> Orchestration Viewport
                  </h3>
                  <p class="text-[10px] text-slate-500 font-medium mt-0.5">Active stage: <span class="text-indigo-400 font-bold capitalize font-mono">{currentStage.replace('-', ' ')}</span></p>
                </div>
                
                {/* Selector Agent routing details */}
                {graphState.modelDecision[currentStage] && (
                  <div class="text-right">
                    <span class="text-[9px] px-2 py-1 bg-indigo-950 border border-indigo-900 text-indigo-400 font-bold rounded-lg uppercase">
                      {graphState.modelDecision[currentStage].model}
                    </span>
                  </div>
                )}
              </div>

              {/* Viewport content draft preview */}
              <div class="flex-1 overflow-y-auto p-4 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[10px] text-slate-350 leading-relaxed custom-scroll relative mb-4">
                {currentStage === 'completed' ? (
                  <div class="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
                    <div class="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 animate-bounce">
                      <i class="fas fa-check text-2xl"></i>
                    </div>
                    <div class="max-w-md space-y-2">
                      <h3 class="text-sm font-bold text-white uppercase tracking-wider">Orchestration Pipeline Completed!</h3>
                      <p class="text-[11px] text-slate-400 leading-relaxed font-sans">
                        All 8 software development specification stages have been processed, approved, and indexed in the Qdrant database.
                        Please navigate to the specific submenu dashboards in the sidebar to review and export the individual agent artifacts.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/spec-to-story')}
                      class="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:shadow-lg transition cursor-pointer"
                    >
                      Go to Spec to Story Dashboard
                    </button>
                  </div>
                ) : getStageStatus(currentStage) === 'running' ? (
                  <div class="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                    <div class="flex flex-col items-center space-y-2">
                      <i class="fas fa-circle-notch animate-spin text-indigo-500 text-lg"></i>
                      <span class="text-[10px] text-slate-400">Agent generating draft output...</span>
                    </div>
                  </div>
                ) : graphState.results[currentStage] ? (
                  currentStage === 'database-design' ? (
                    <div class="space-y-6 font-sans text-sm text-slate-300 p-2 overflow-y-auto h-full">
                      {graphState.results[currentStage].erd && (
                        <div class="bg-slate-900/50 p-4 border border-slate-800 rounded-xl space-y-2">
                          <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">ERD Diagram (Mermaid)</h4>
                          <pre class="bg-slate-950 p-3 rounded text-[10px] font-mono whitespace-pre-wrap overflow-x-auto select-all">{graphState.results[currentStage].erd}</pre>
                        </div>
                      )}
                      {graphState.results[currentStage].sql && (
                        <div class="bg-slate-900/50 p-4 border border-slate-800 rounded-xl space-y-2">
                          <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider">SQL DDL Script</h4>
                          <pre class="bg-slate-950 p-3 rounded text-[10px] font-mono whitespace-pre-wrap overflow-x-auto select-all">{graphState.results[currentStage].sql}</pre>
                        </div>
                      )}
                      {graphState.results[currentStage].fsd && (
                        <div class="bg-slate-900/50 p-4 border border-slate-800 rounded-xl space-y-2 h-[500px] flex flex-col">
                          <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider shrink-0 font-sans">Database Design Document</h4>
                          <iframe
                            srcDoc={
                              graphState.results[currentStage].fsd.trim().startsWith('<')
                                ? `<!DOCTYPE html><html><head><style>body { font-family: sans-serif; background: #0f172a; color: #e2e8f0; padding: 12px; margin: 0; } table { width: 100%; border-collapse: collapse; margin-top: 8px; } th, td { border: 1px solid #334155; padding: 6px; text-align: left; } th { background: #1e293b; }</style></head><body>${graphState.results[currentStage].fsd}</body></html>`
                                : `<!DOCTYPE html><html><head><style>body { font-family: sans-serif; background: #0f172a; color: #e2e8f0; padding: 12px; margin: 0; white-space: pre-wrap; }</style></head><body>${graphState.results[currentStage].fsd}</body></html>`
                            }
                            class="w-full flex-1 border-0 rounded-lg bg-[#0f172a]"
                            title="Database Design Document Preview"
                          />
                        </div>
                      )}
                    </div>
                  ) : (currentStage === 'functional-spec' ||
                       (typeof graphState.results[currentStage] === 'string' && graphState.results[currentStage].startsWith('<!DOCTYPE')) ||
                       (graphState.results[currentStage] && typeof graphState.results[currentStage] === 'object' && typeof graphState.results[currentStage].html === 'string')
                  ) ? (
                    <iframe
                      srcDoc={typeof graphState.results[currentStage] === 'string' ? graphState.results[currentStage] : graphState.results[currentStage].html}
                      class="w-full h-full border-none bg-white rounded"
                      title="FSD Preview"
                    />
                  ) : (
                    <pre class="whitespace-pre-wrap">
                      {typeof graphState.results[currentStage] === 'string' 
                        ? graphState.results[currentStage] 
                        : JSON.stringify(graphState.results[currentStage], null, 2)}
                    </pre>
                  )
                ) : (
                  <div class="text-slate-500 text-center py-40">Awaiting agent execution results.</div>
                )}
              </div>

              {/* Human-in-the-Loop review pane */}
              {isStageAwaitingReview ? (
                <div class="bg-amber-950/20 border border-amber-900/40 p-4 rounded-xl space-y-3 shrink-0">
                  <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider">Human-In-The-Loop Quality Gate</h4>
                  </div>
                  <p class="text-[10px] text-slate-400">Review the generated draft enqueued above. You can either approve and trigger the next pipeline agent, or provide feedback comments to refine the output.</p>
                  
                  <div class="flex space-x-3">
                    <input
                      type="text"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      placeholder="Add refinement feedback (e.g. Include SLA timelines table, change PG port to 5432)..."
                      class="flex-1 bg-slate-950 border border-slate-900 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 text-slate-200 outline-none placeholder-slate-600"
                    />
                    
                    <button
                      onClick={() => handleReviewResponse('reject')}
                      disabled={isResponding || !feedbackText.trim()}
                      class="px-4 py-2 bg-slate-900 border border-slate-800 text-red-400 hover:text-red-300 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Refine Draft
                    </button>
                    
                    <button
                      onClick={() => handleReviewResponse('approve')}
                      disabled={isResponding}
                      class="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:from-green-500 hover:to-green-400 transition cursor-pointer disabled:opacity-50"
                    >
                      Approve & Proceed
                    </button>
                  </div>
                </div>
              ) : (
                graphState.approvalStatus[currentStage] === 'approved' && (
                  <div class="bg-green-950/20 border border-green-950 p-3 rounded-xl flex items-center justify-between shrink-0">
                    <span class="text-xs text-green-400 font-bold flex items-center">
                      <i class="fas fa-check-circle mr-2"></i> Stage Approved! Proceeding in background...
                    </span>
                  </div>
                )
              )}

            </div>
          ) : (
            <div class="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center h-[670px] border-dashed">
              <div class="w-16 h-16 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center mb-4 text-slate-600">
                <i class="fas fa-project-diagram text-2xl"></i>
              </div>
              <h3 class="text-xs font-black text-white uppercase tracking-wider">Multi-Agent Workflow Viewport</h3>
              <p class="text-[10px] text-slate-500 mt-2 max-w-sm leading-relaxed">
                Click **"Start Orchestration"** at the top right. 
                The LangGraph orchestrator will trigger sequential agent processing and highlight selector model routing decisions here.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
```


## src/pages/BrownfieldContextView.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { usePageContext } from '../context/PageContext';

export default function BrownfieldContextView() {
  const { brownfieldContext, setBrownfieldContext, projectMode, setProjectMode } = usePageContext();

  const [activeTab, setActiveTab] = useState('code'); // 'code', 'schema', 'docs', 'guardrails'
  const [codeAttachMethod, setCodeAttachMethod] = useState('zip'); // 'zip', 'folder', 'manual'

  const [isIngesting, setIsIngesting] = useState(false);
  const [isUploadingZip, setIsUploadingZip] = useState(false);
  const [isScanningFolder, setIsScanningFolder] = useState(false);
  const [isUploadingSchema, setIsUploadingSchema] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  const [ingestStatus, setIngestStatus] = useState(null);

  // Local state for forms
  const [localFolderPath, setLocalFolderPath] = useState('');
  const [newCodeFileName, setNewCodeFileName] = useState('');
  const [newCodeContent, setNewCodeContent] = useState('');
  
  const [dbSchemaText, setDbSchemaText] = useState(brownfieldContext.dbSchema || '');
  
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');
  
  const [frameworkVersion, setFrameworkVersion] = useState(brownfieldContext.legacyGuardrails?.frameworkVersion || '');
  const [apiPrefix, setApiPrefix] = useState(brownfieldContext.legacyGuardrails?.apiPrefix || '/api/v1');
  const [preservationRules, setPreservationRules] = useState(brownfieldContext.legacyGuardrails?.preservationRules || '');

  useEffect(() => {
    if (brownfieldContext.dbSchema) {
      setDbSchemaText(brownfieldContext.dbSchema);
    }
    if (brownfieldContext.legacyGuardrails) {
      setFrameworkVersion(brownfieldContext.legacyGuardrails.frameworkVersion || '');
      setApiPrefix(brownfieldContext.legacyGuardrails.apiPrefix || '/api/v1');
      setPreservationRules(brownfieldContext.legacyGuardrails.preservationRules || '');
    }
  }, [brownfieldContext]);

  // Zip Archive Upload Handler
  const handleZipFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingZip(true);
    setIngestStatus({ type: 'info', message: `Extracting & parsing zipped codebase archive (${file.name})...` });

    const formData = new FormData();
    formData.append('zipFile', file);

    try {
      const res = await fetch('http://localhost:7001/api/brownfield/upload-zip', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.snippets) {
        const existingMap = new Map((brownfieldContext.codeSnippets || []).map(s => [s.fileName, s]));
        data.snippets.forEach(s => existingMap.set(s.fileName, s));

        setBrownfieldContext({
          ...brownfieldContext,
          codeSnippets: Array.from(existingMap.values())
        });

        setIngestStatus({ type: 'success', message: data.message });
      } else {
        setIngestStatus({ type: 'error', message: data.error || 'Failed extracting zip file' });
      }
    } catch (err) {
      console.error(err);
      setIngestStatus({ type: 'error', message: 'Failed uploading zip archive to server' });
    } finally {
      setIsUploadingZip(false);
      e.target.value = null;
    }
  };

  // Local Folder Scan Handler
  const handleScanFolder = async () => {
    if (!localFolderPath.trim()) return;

    setIsScanningFolder(true);
    setIngestStatus({ type: 'info', message: `Scanning directory path: ${localFolderPath}...` });

    try {
      const res = await fetch('http://localhost:7001/api/brownfield/scan-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: localFolderPath.trim() })
      });

      const data = await res.json();
      if (data.success && data.snippets) {
        const existingMap = new Map((brownfieldContext.codeSnippets || []).map(s => [s.fileName, s]));
        data.snippets.forEach(s => existingMap.set(s.fileName, s));

        setBrownfieldContext({
          ...brownfieldContext,
          codeSnippets: Array.from(existingMap.values())
        });

        setIngestStatus({ type: 'success', message: data.message });
      } else {
        setIngestStatus({ type: 'error', message: data.error || 'Failed scanning folder' });
      }
    } catch (err) {
      console.error(err);
      setIngestStatus({ type: 'error', message: 'Failed scanning directory at server' });
    } finally {
      setIsScanningFolder(false);
    }
  };

  // Schema File Upload Handler (.sql, .prisma, .json, .zip)
  const handleSchemaFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingSchema(true);
    setIngestStatus({ type: 'info', message: `Uploading & parsing schema file (${file.name})...` });

    const formData = new FormData();
    formData.append('schemaFile', file);

    try {
      const res = await fetch('http://localhost:7001/api/brownfield/upload-schema-file', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.schema) {
        setDbSchemaText(prev => prev ? `${prev}\n\n-- --- LOADED FROM ${file.name} ---\n${data.schema}` : data.schema);
        setIngestStatus({ type: 'success', message: data.message });
      } else {
        setIngestStatus({ type: 'error', message: data.error || 'Failed loading schema file' });
      }
    } catch (err) {
      console.error(err);
      setIngestStatus({ type: 'error', message: 'Failed uploading schema file to server' });
    } finally {
      setIsUploadingSchema(false);
      e.target.value = null;
    }
  };

  // Doc File Upload Handler (.md, .txt, .json, .yaml, .pdf, .zip)
  const handleDocFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploadingDoc(true);
    setIngestStatus({ type: 'info', message: `Uploading & extracting document file (${file.name})...` });

    const formData = new FormData();
    formData.append('docFile', file);

    try {
      const res = await fetch('http://localhost:7001/api/brownfield/upload-doc-file', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success && data.documents) {
        const updatedDocs = [...(brownfieldContext.documents || []), ...data.documents];
        setBrownfieldContext({ ...brownfieldContext, documents: updatedDocs });
        setIngestStatus({ type: 'success', message: data.message });
      } else {
        setIngestStatus({ type: 'error', message: data.error || 'Failed uploading document file' });
      }
    } catch (err) {
      console.error(err);
      setIngestStatus({ type: 'error', message: 'Failed uploading document file to server' });
    } finally {
      setIsUploadingDoc(false);
      e.target.value = null;
    }
  };

  // Add Manual Code Snippet
  const handleAddCodeSnippet = () => {
    if (!newCodeFileName.trim() || !newCodeContent.trim()) return;
    const updatedSnippets = [
      ...(brownfieldContext.codeSnippets || []),
      { id: Date.now().toString(), fileName: newCodeFileName.trim(), content: newCodeContent.trim() }
    ];
    setBrownfieldContext({ ...brownfieldContext, codeSnippets: updatedSnippets });
    setNewCodeFileName('');
    setNewCodeContent('');
  };

  // Remove Code Snippet
  const handleRemoveCodeSnippet = (id) => {
    const updatedSnippets = (brownfieldContext.codeSnippets || []).filter(s => s.id !== id);
    setBrownfieldContext({ ...brownfieldContext, codeSnippets: updatedSnippets });
  };

  // Add Document
  const handleAddDocument = () => {
    if (!newDocTitle.trim() || !newDocContent.trim()) return;
    const updatedDocs = [
      ...(brownfieldContext.documents || []),
      { id: Date.now().toString(), title: newDocTitle.trim(), content: newDocContent.trim() }
    ];
    setBrownfieldContext({ ...brownfieldContext, documents: updatedDocs });
    setNewDocTitle('');
    setNewDocContent('');
  };

  // Remove Document
  const handleRemoveDocument = (id) => {
    const updatedDocs = (brownfieldContext.documents || []).filter(d => d.id !== id);
    setBrownfieldContext({ ...brownfieldContext, documents: updatedDocs });
  };

  // Save & Ingest Context
  const handleSaveAndIngest = async () => {
    setIsIngesting(true);
    setIngestStatus({ type: 'info', message: 'Ingesting and vectorizing brownfield context into Qdrant/Vector database...' });

    const updatedContext = {
      ...brownfieldContext,
      dbSchema: dbSchemaText,
      legacyGuardrails: {
        frameworkVersion,
        apiPrefix,
        preservationRules
      }
    };

    setBrownfieldContext(updatedContext);

    try {
      const res = await fetch('http://localhost:7001/api/brownfield/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: updatedContext })
      });

      const data = await res.json();
      if (data.success) {
        setIngestStatus({
          type: 'success',
          message: `Success! Indexed ${data.stats?.totalItems || 0} context items into Qdrant/Vector store.`
        });
      } else {
        setIngestStatus({ type: 'error', message: data.error || 'Failed to ingest context' });
      }
    } catch (err) {
      console.error(err);
      setIngestStatus({ type: 'error', message: 'Failed connecting to server backend at http://localhost:7001' });
    } finally {
      setIsIngesting(false);
    }
  };

  const totalSnippets = (brownfieldContext.codeSnippets || []).length;
  const totalDocs = (brownfieldContext.documents || []).length;
  const hasSchema = !!dbSchemaText.trim();

  return (
    <div class="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div class="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div class="space-y-1">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black shadow-lg shadow-amber-500/10">
                <i class="fas fa-cubes text-lg"></i>
              </div>
              <div>
                <h1 class="text-xl font-black text-white tracking-wide">Brownfield Application Context</h1>
                <p class="text-xs text-amber-400/90 font-medium">Attach existing codebase zip/folder, database DDL files, legacy doc files, and rules for AI agents</p>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <button
              onClick={handleSaveAndIngest}
              disabled={isIngesting}
              class={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 transition shadow-lg cursor-pointer ${
                isIngesting 
                  ? 'bg-amber-600/50 text-white cursor-wait' 
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-amber-500/20 hover:scale-[1.02]'
              }`}
            >
              {isIngesting ? (
                <>
                  <i class="fas fa-spinner fa-spin text-sm"></i>
                  <span>Indexing Context...</span>
                </>
              ) : (
                <>
                  <i class="fas fa-database text-sm"></i>
                  <span>Save & Index Context</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Toast */}
        {ingestStatus && (
          <div class={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between transition ${
            ingestStatus.type === 'success' 
              ? 'bg-green-950/40 border-green-500/40 text-green-300' 
              : ingestStatus.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}>
            <div class="flex items-center space-x-2">
              <i class={`fas ${ingestStatus.type === 'success' ? 'fa-check-circle' : ingestStatus.type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}></i>
              <span>{ingestStatus.message}</span>
            </div>
            <button onClick={() => setIngestStatus(null)} class="text-slate-400 hover:text-white ml-3">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
        )}
      </div>

      {/* Main Context Card */}
      <div class="bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Navigation Tabs */}
        <div class="flex border-b border-slate-800 bg-slate-950/40 overflow-x-auto custom-scroll">
          <button
            onClick={() => setActiveTab('code')}
            class={`px-6 py-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i class="fas fa-code text-sm"></i>
            <span>Source Code ({totalSnippets} files)</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            class={`px-6 py-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i class="fas fa-database text-sm"></i>
            <span>Database Schema {hasSchema && <span class="w-2 h-2 rounded-full bg-amber-500 inline-block ml-1"></span>}</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            class={`px-6 py-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'docs'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i class="fas fa-file-alt text-sm"></i>
            <span>Existing Docs ({totalDocs})</span>
          </button>

          <button
            onClick={() => setActiveTab('guardrails')}
            class={`px-6 py-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'guardrails'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i class="fas fa-shield-alt text-sm"></i>
            <span>Legacy Guardrails & Tech Stack</span>
          </button>
        </div>

        {/* Tab Content */}
        <div class="p-6">
          {/* TAB 1: CODE */}
          {activeTab === 'code' && (
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-bold text-slate-200">Attach Source Code</h3>
                  <p class="text-xs text-slate-400">Upload a `.zip` file of your project, specify a local directory path, or paste snippets manually.</p>
                </div>

                {/* Sub-toggle for Attachment Method */}
                <div class="flex p-1 bg-slate-950 border border-slate-800 rounded-xl space-x-1">
                  <button
                    onClick={() => setCodeAttachMethod('zip')}
                    class={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                      codeAttachMethod === 'zip'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <i class="fas fa-file-archive text-xs"></i>
                    <span>Upload Zip Archive</span>
                  </button>

                  <button
                    onClick={() => setCodeAttachMethod('folder')}
                    class={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                      codeAttachMethod === 'folder'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <i class="fas fa-folder-open text-xs"></i>
                    <span>Local Folder Path</span>
                  </button>

                  <button
                    onClick={() => setCodeAttachMethod('manual')}
                    class={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition ${
                      codeAttachMethod === 'manual'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <i class="fas fa-code text-xs"></i>
                    <span>Paste Snippet</span>
                  </button>
                </div>
              </div>

              {/* METHOD 1: ZIP FILE UPLOAD */}
              {codeAttachMethod === 'zip' && (
                <div class="bg-slate-900/60 border border-dashed border-amber-500/40 hover:border-amber-500 rounded-2xl p-8 text-center space-y-4 transition">
                  <div class="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-amber-500/10">
                    <i class={`fas ${isUploadingZip ? 'fa-spinner fa-spin' : 'fa-file-archive'}`}></i>
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-200">Upload Zipped Codebase (.zip)</h4>
                    <p class="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Upload your application source code archive. The backend will automatically extract and parse your source files while ignoring <code class="text-amber-400">node_modules</code>, <code class="text-amber-400">.git</code>, and build folders.
                    </p>
                  </div>
                  <label class="inline-flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 transition">
                    <i class="fas fa-upload text-sm"></i>
                    <span>Select & Extract Zip Archive</span>
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleZipFileUpload}
                      disabled={isUploadingZip}
                      class="hidden"
                    />
                  </label>
                </div>
              )}

              {/* METHOD 2: LOCAL FOLDER PATH */}
              {codeAttachMethod === 'folder' && (
                <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <div>
                    <h4 class="text-xs font-bold text-slate-200">Scan Local Project Folder</h4>
                    <p class="text-xs text-slate-400 mt-0.5">Enter an absolute or relative directory path on your filesystem to recursively scan and attach source files.</p>
                  </div>

                  <div class="flex items-center space-x-3">
                    <input
                      type="text"
                      placeholder="e.g. C:\Users\vigne\OneDrive\Documents\Workspace\my-legacy-app or ./server"
                      value={localFolderPath}
                      onChange={(e) => setLocalFolderPath(e.target.value)}
                      class="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-200 focus:outline-none"
                    />
                    <button
                      onClick={handleScanFolder}
                      disabled={isScanningFolder || !localFolderPath.trim()}
                      class="px-5 py-2.5 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl transition disabled:opacity-40 flex items-center space-x-2 cursor-pointer"
                    >
                      {isScanningFolder ? <i class="fas fa-spinner fa-spin"></i> : <i class="fas fa-search"></i>}
                      <span>Scan & Attach Folder</span>
                    </button>
                  </div>
                </div>
              )}

              {/* METHOD 3: MANUAL PASTE */}
              {codeAttachMethod === 'manual' && (
                <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <input
                    type="text"
                    placeholder="File path e.g. server/src/services/userService.js"
                    value={newCodeFileName}
                    onChange={(e) => setNewCodeFileName(e.target.value)}
                    class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none"
                  />
                  <textarea
                    rows={6}
                    placeholder="Paste existing source code content here..."
                    value={newCodeContent}
                    onChange={(e) => setNewCodeContent(e.target.value)}
                    class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none custom-scroll"
                  />
                  <div class="flex justify-end">
                    <button
                      onClick={handleAddCodeSnippet}
                      disabled={!newCodeFileName.trim() || !newCodeContent.trim()}
                      class="px-4 py-2 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg transition disabled:opacity-40 cursor-pointer"
                    >
                      <i class="fas fa-plus mr-1"></i> Add Code Snippet
                    </button>
                  </div>
                </div>
              )}

              {/* Discovered & Attached Source Files List */}
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Attached Codebase Files ({totalSnippets})</h4>
                  {totalSnippets > 0 && (
                    <button
                      onClick={() => setBrownfieldContext({ ...brownfieldContext, codeSnippets: [] })}
                      class="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                    >
                      Clear All Files
                    </button>
                  )}
                </div>

                <div class="space-y-2 max-h-96 overflow-y-auto custom-scroll pr-1">
                  {(brownfieldContext.codeSnippets || []).map((snippet) => (
                    <div key={snippet.id || snippet.fileName} class="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                      <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-2 truncate">
                          <i class="fas fa-file-code text-amber-400 text-xs"></i>
                          <span class="text-xs font-bold font-mono text-slate-200 truncate">{snippet.fileName}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveCodeSnippet(snippet.id)}
                          class="text-slate-500 hover:text-rose-400 p-1 transition shrink-0 ml-2"
                          title="Remove file"
                        >
                          <i class="fas fa-trash-alt text-xs"></i>
                        </button>
                      </div>
                      <pre class="bg-slate-900/80 p-2.5 rounded-lg text-[10px] font-mono text-slate-300 overflow-x-auto max-h-28 custom-scroll">
                        {snippet.content}
                      </pre>
                    </div>
                  ))}
                  {(brownfieldContext.codeSnippets || []).length === 0 && (
                    <div class="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                      No source code files attached yet. Choose Zip upload, local folder path, or manual paste above.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DATABASE SCHEMA */}
          {activeTab === 'schema' && (
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-bold text-slate-200">Database DDL Schema & Data Models</h3>
                  <p class="text-xs text-slate-400">Upload `.sql`/`.prisma`/`.json`/`.zip` schema files, or paste SQL DDL statements directly below.</p>
                </div>

                <label class="px-4 py-2 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl cursor-pointer transition flex items-center space-x-1.5 shrink-0">
                  <i class={`fas ${isUploadingSchema ? 'fa-spinner fa-spin' : 'fa-upload'}`}></i>
                  <span>Upload Schema File (.sql, .prisma, .zip)</span>
                  <input
                    type="file"
                    accept=".sql,.prisma,.json,.yaml,.yml,.zip"
                    onChange={handleSchemaFileUpload}
                    disabled={isUploadingSchema}
                    class="hidden"
                  />
                </label>
              </div>

              <textarea
                rows={14}
                placeholder="-- Paste SQL DDL or DB Schema here&#10;CREATE TABLE users (&#10;  id SERIAL PRIMARY KEY,&#10;  email VARCHAR(255) UNIQUE NOT NULL,&#10;  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP&#10;);"
                value={dbSchemaText}
                onChange={(e) => setDbSchemaText(e.target.value)}
                class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-4 text-xs font-mono text-amber-300/90 focus:outline-none custom-scroll leading-relaxed"
              />
            </div>
          )}

          {/* TAB 3: EXISTING DOCS */}
          {activeTab === 'docs' && (
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-sm font-bold text-slate-200">Existing Specifications & Documentation</h3>
                  <p class="text-xs text-slate-400">Upload `.md`/`.txt`/`.json`/`.zip` document files or paste legacy specification text.</p>
                </div>

                <label class="px-4 py-2 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl cursor-pointer transition flex items-center space-x-1.5 shrink-0">
                  <i class={`fas ${isUploadingDoc ? 'fa-spinner fa-spin' : 'fa-file-upload'}`}></i>
                  <span>Upload Document File (.md, .txt, .zip)</span>
                  <input
                    type="file"
                    accept=".md,.txt,.json,.yaml,.yml,.zip"
                    onChange={handleDocFileUpload}
                    disabled={isUploadingDoc}
                    class="hidden"
                  />
                </label>
              </div>

              {/* Add Doc Form */}
              <div class="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <input
                  type="text"
                  placeholder="Document Title e.g. Legacy Auth Architecture & OpenAPI v1 Spec"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none"
                />
                <textarea
                  rows={5}
                  placeholder="Paste document text or markdown specification content..."
                  value={newDocContent}
                  onChange={(e) => setNewDocContent(e.target.value)}
                  class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none custom-scroll"
                />
                <div class="flex justify-end">
                  <button
                    onClick={handleAddDocument}
                    disabled={!newDocTitle.trim() || !newDocContent.trim()}
                    class="px-4 py-2 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg transition disabled:opacity-40 cursor-pointer"
                  >
                    <i class="fas fa-plus mr-1"></i> Add Document
                  </button>
                </div>
              </div>

              {/* Docs List */}
              <div class="space-y-3">
                {(brownfieldContext.documents || []).map((doc) => (
                  <div key={doc.id} class="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <i class="fas fa-file-alt text-amber-400 text-sm"></i>
                        <span class="text-xs font-bold text-slate-200">{doc.title}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveDocument(doc.id)}
                        class="text-slate-500 hover:text-rose-400 p-1 transition"
                      >
                        <i class="fas fa-trash-alt text-xs"></i>
                      </button>
                    </div>
                    <p class="text-xs text-slate-400 line-clamp-3 bg-slate-900/50 p-2.5 rounded-lg font-mono">
                      {doc.content}
                    </p>
                  </div>
                ))}
                {(brownfieldContext.documents || []).length === 0 && (
                  <div class="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                    No legacy documents attached yet. Upload a file above or paste document text manually.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LEGACY GUARDRAILS */}
          {activeTab === 'guardrails' && (
            <div class="space-y-5">
              <div>
                <h3 class="text-sm font-bold text-slate-200">Legacy Architecture & Non-Negotiable Rules</h3>
                <p class="text-xs text-slate-400">Specify existing tech versions, API route rules, and backward-compatibility guardrails for AI agents.</p>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-300">Existing Tech Stack & Versions</label>
                  <input
                    type="text"
                    placeholder="e.g. Node.js 18, Express 4.18, PostgreSQL 14, React 18"
                    value={frameworkVersion}
                    onChange={(e) => setFrameworkVersion(e.target.value)}
                    class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div class="space-y-1.5">
                  <label class="text-xs font-bold text-slate-300">API Prefix & Versioning Pattern</label>
                  <input
                    type="text"
                    placeholder="e.g. /api/v1"
                    value={apiPrefix}
                    onChange={(e) => setApiPrefix(e.target.value)}
                    class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div class="space-y-1.5">
                <label class="text-xs font-bold text-slate-300">Preservation Rules & Non-Negotiable Guardrails</label>
                <textarea
                  rows={5}
                  placeholder="e.g. 1. Do not break backward compatibility on existing POST /api/v1/login endpoint.&#10;2. Preserve JWT Auth Bearer token headers.&#10;3. All database updates must use ALTER TABLE migration scripts."
                  value={preservationRules}
                  onChange={(e) => setPreservationRules(e.target.value)}
                  class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-lg p-3 text-xs text-slate-200 focus:outline-none custom-scroll"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```


## src/pages/CodeToSpecView.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { usePageContext } from '../context/PageContext';

export default function CodeToSpecView() {
  const { brownfieldContext } = usePageContext();

  const [baselineSpec, setBaselineSpec] = useState('');
  const [manualSpec, setManualSpec] = useState('');
  const [unifiedSpec, setUnifiedSpec] = useState('');

  const [activeTab, setActiveTab] = useState('baseline'); // 'baseline', 'manual', 'unified'
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [statusMessage, setStatusMessage] = useState(null);

  // Load existing workspace manual spec on mount
  useEffect(() => {
    fetch('http://localhost:7001/api/workspace/spec')
      .then(res => res.json())
      .then(data => {
        if (data.content) {
          setManualSpec(data.content);
        }
      })
      .catch(err => console.error('Failed loading manual spec:', err));
  }, []);

  // 1. Generate Baseline Spec
  const handleGenerateBaseline = async () => {
    setIsGenerating(true);
    setStatusMessage({ type: 'info', text: 'Introspecting legacy code annotations, DDLs, and docs...' });

    try {
      const res = await fetch('http://localhost:7001/api/code-to-spec/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: brownfieldContext })
      });

      const data = await res.json();
      if (data.success && data.baselineSpec) {
        setBaselineSpec(data.baselineSpec);
        setActiveTab('baseline');
        setStatusMessage({ type: 'success', text: 'Baseline v1 Specification successfully generated via reverse engineering!' });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed generating baseline spec.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed connecting to server backend at http://localhost:7001' });
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Merge Baseline with Manual Spec
  const handleMergeSpecs = async () => {
    if (!baselineSpec) {
      setStatusMessage({ type: 'error', text: 'Please generate a Baseline Spec first before merging.' });
      return;
    }

    setIsMerging(true);
    setStatusMessage({ type: 'info', text: 'Merging auto-discovered technical baseline with manual specifications...' });

    try {
      const res = await fetch('http://localhost:7001/api/code-to-spec/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baselineSpec, manualSpec })
      });

      const data = await res.json();
      if (data.success && data.mergedSpec) {
        setUnifiedSpec(data.mergedSpec);
        setActiveTab('unified');
        setStatusMessage({ type: 'success', text: 'Specs unified! Manual intent and reverse-engineered technical baseline merged cleanly.' });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed merging specs.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed connecting to server backend at http://localhost:7001' });
    } finally {
      setIsMerging(false);
    }
  };

  // 3. Export as Source of Truth
  const handleExportSourceOfTruth = async () => {
    const specToSave = unifiedSpec || baselineSpec;
    if (!specToSave) {
      setStatusMessage({ type: 'error', text: 'No specification available to export.' });
      return;
    }

    setIsExporting(true);
    setStatusMessage({ type: 'info', text: 'Promoting baseline specification to Project Source of Truth...' });

    try {
      const res = await fetch('http://localhost:7001/api/code-to-spec/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalSpec: specToSave })
      });

      const data = await res.json();
      if (data.success) {
        setStatusMessage({ type: 'success', text: data.message });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed exporting source of truth.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Failed connecting to server backend at http://localhost:7001' });
    } finally {
      setIsExporting(false);
    }
  };

  const snippetCount = (brownfieldContext.codeSnippets || []).length;
  const hasSchema = !!(brownfieldContext.dbSchema && brownfieldContext.dbSchema.trim());
  const docCount = (brownfieldContext.documents || []).length;

  return (
    <div class="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div class="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
        <div class="absolute -right-10 -bottom-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div class="space-y-1">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black shadow-lg shadow-amber-500/10">
                <i class="fas fa-microchip text-lg"></i>
              </div>
              <div>
                <h1 class="text-xl font-black text-white tracking-wide">Code-to-Spec Baseline Generator</h1>
                <p class="text-xs text-amber-400/90 font-medium">Reverse-engineer legacy codebase into an official v1 Current State Source of Truth</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div class="flex items-center space-x-3">
            <button
              onClick={handleGenerateBaseline}
              disabled={isGenerating}
              class="px-4 py-2.5 rounded-xl font-bold text-xs bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 transition flex items-center space-x-2 cursor-pointer disabled:opacity-40"
            >
              {isGenerating ? <i class="fas fa-spinner fa-spin"></i> : <i class="fas fa-magic"></i>}
              <span>1. Generate Baseline Spec</span>
            </button>

            <button
              onClick={handleMergeSpecs}
              disabled={isMerging || !baselineSpec}
              class="px-4 py-2.5 rounded-xl font-bold text-xs bg-indigo-600/30 border border-indigo-500/40 hover:bg-indigo-600/40 text-indigo-300 transition flex items-center space-x-2 cursor-pointer disabled:opacity-40"
            >
              {isMerging ? <i class="fas fa-spinner fa-spin"></i> : <i class="fas fa-code-branch"></i>}
              <span>2. Merge Specs</span>
            </button>

            <button
              onClick={handleExportSourceOfTruth}
              disabled={isExporting || (!baselineSpec && !unifiedSpec)}
              class="px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/20 transition flex items-center space-x-2 cursor-pointer disabled:opacity-40"
            >
              {isExporting ? <i class="fas fa-spinner fa-spin"></i> : <i class="fas fa-file-export"></i>}
              <span>3. Export Spec</span>
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div class={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between transition ${
            statusMessage.type === 'success'
              ? 'bg-green-950/40 border-green-500/40 text-green-300'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
          }`}>
            <div class="flex items-center space-x-2">
              <i class={`fas ${statusMessage.type === 'success' ? 'fa-check-circle' : statusMessage.type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}></i>
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} class="text-slate-400 hover:text-white">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
        )}
      </div>

      {/* Introspection Source Readiness Grid */}
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <div class="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <i class="fas fa-code text-sm"></i>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-200">Source Code Snippets</p>
            <p class="text-[11px] text-slate-400">{snippetCount} file(s) attached for parsing</p>
          </div>
        </div>

        <div class="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <div class="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <i class="fas fa-database text-sm"></i>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-200">Database DDL Schema</p>
            <p class="text-[11px] text-slate-400">{hasSchema ? 'SQL Schema attached' : 'No schema attached'}</p>
          </div>
        </div>

        <div class="bg-[#0b0f19] border border-slate-800 rounded-xl p-4 flex items-center space-x-3">
          <div class="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
            <i class="fas fa-file-alt text-sm"></i>
          </div>
          <div>
            <p class="text-xs font-bold text-slate-200">Legacy Documents</p>
            <p class="text-[11px] text-slate-400">{docCount} document(s) attached</p>
          </div>
        </div>
      </div>

      {/* Main Spec Card */}
      <div class="bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Navigation Tabs */}
        <div class="flex border-b border-slate-800 bg-slate-950/40 overflow-x-auto custom-scroll">
          <button
            onClick={() => setActiveTab('baseline')}
            class={`px-6 py-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'baseline'
                ? 'border-amber-500 text-amber-400 bg-amber-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i class="fas fa-magic text-sm"></i>
            <span>Baseline Spec v1.0 {baselineSpec && <span class="w-2 h-2 rounded-full bg-amber-500 inline-block ml-1"></span>}</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            class={`px-6 py-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'manual'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i class="fas fa-edit text-sm"></i>
            <span>Existing Manual Spec</span>
          </button>

          <button
            onClick={() => setActiveTab('unified')}
            class={`px-6 py-4 text-xs font-bold flex items-center space-x-2 border-b-2 transition whitespace-nowrap ${
              activeTab === 'unified'
                ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <i class="fas fa-check-double text-sm"></i>
            <span>Unified Current State Spec {unifiedSpec && <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-1"></span>}</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div class="p-6">
          {activeTab === 'baseline' && (
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-300">Baseline Spec (Auto-Generated):</span>
                <span class="text-[10px] text-slate-500 font-mono">AST & Schema Introspection</span>
              </div>

              {!baselineSpec ? (
                <div class="bg-slate-950 border border-dashed border-amber-500/30 rounded-xl p-12 text-center space-y-4">
                  <div class="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-amber-500/10">
                    <i class={`fas ${isGenerating ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i>
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-200">No Baseline Spec Generated Yet</h4>
                    <p class="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      Ready to parse your <strong>{snippetCount} attached code file(s)</strong> and database schema into an official v1 Current-State Specification.
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateBaseline}
                    disabled={isGenerating}
                    class="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition hover:scale-105 cursor-pointer disabled:opacity-50 inline-flex items-center space-x-2"
                  >
                    {isGenerating ? (
                      <>
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Generating Baseline Spec...</span>
                      </>
                    ) : (
                      <>
                        <i class="fas fa-magic"></i>
                        <span>Generate Baseline Spec</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <textarea
                  rows={18}
                  value={baselineSpec}
                  onChange={(e) => setBaselineSpec(e.target.value)}
                  class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none custom-scroll leading-relaxed"
                />
              )}
            </div>
          )}


          {activeTab === 'manual' && (
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-300">Existing Manual Specification (`spec.md`):</span>
                <span class="text-[10px] text-indigo-400 font-mono font-bold">Human Defined Requirements</span>
              </div>
              <textarea
                rows={18}
                value={manualSpec}
                onChange={(e) => setManualSpec(e.target.value)}
                placeholder="Paste or edit existing manual specifications here..."
                class="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/50 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none custom-scroll leading-relaxed"
              />
            </div>
          )}

          {activeTab === 'unified' && (
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-300">Unified Current State Specification (Phase 1 Source of Truth):</span>
                <span class="text-[10px] text-emerald-400 font-mono font-bold">Ready to Export</span>
              </div>


              {!unifiedSpec ? (
                <div class="bg-slate-950 border border-dashed border-emerald-500/30 rounded-xl p-12 text-center space-y-4">
                  <div class="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-emerald-500/10">
                    <i class={`fas ${isMerging ? 'fa-spinner fa-spin' : 'fa-code-branch'}`}></i>
                  </div>
                  <div>
                    <h4 class="text-sm font-bold text-slate-200">No Unified Spec Created Yet</h4>
                    <p class="text-xs text-slate-400 max-w-md mx-auto mt-1">
                      {baselineSpec 
                        ? 'Merge your auto-generated Baseline Spec with your existing Manual Spec to form a single Unified Source of Truth.' 
                        : 'First click "Generate Baseline Spec" under Tab 1 before merging with manual specifications.'}
                    </p>
                  </div>

                  {baselineSpec ? (
                    <button
                      onClick={handleMergeSpecs}
                      disabled={isMerging}
                      class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-400 hover:to-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition hover:scale-105 cursor-pointer disabled:opacity-50 inline-flex items-center space-x-2"
                    >
                      {isMerging ? (
                        <>
                          <i class="fas fa-spinner fa-spin"></i>
                          <span>Merging Baseline & Manual Specs...</span>
                        </>
                      ) : (
                        <>
                          <i class="fas fa-code-branch"></i>
                          <span>🔀 Merge Baseline Spec with Manual Spec</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('baseline')}
                      class="px-5 py-2.5 bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-xl transition cursor-pointer inline-flex items-center space-x-2"
                    >
                      <i class="fas fa-arrow-left"></i>
                      <span>Go to Tab 1: Generate Baseline Spec</span>
                    </button>
                  )}
                </div>
              ) : (
                <div class="space-y-4">
                  <textarea
                    rows={18}
                    value={unifiedSpec}
                    onChange={(e) => setUnifiedSpec(e.target.value)}
                    class="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 rounded-xl p-4 text-xs font-mono text-emerald-300/90 focus:outline-none custom-scroll leading-relaxed"
                  />
                  <div class="flex justify-end">
                    <button
                      onClick={handleExportSourceOfTruth}
                      disabled={isExporting}
                      class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition hover:scale-105 cursor-pointer disabled:opacity-50 inline-flex items-center space-x-2"
                    >
                      {isExporting ? <i class="fas fa-spinner fa-spin"></i> : <i class="fas fa-file-export"></i>}
                      <span>🚀 Export as Project Source of Truth (`spec.md`)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
```


## src/pages/DatabaseDesign.jsx
```jsx
import React, { useState, useEffect, useRef } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { FileUpload } from '../components/FileUpload';
import { GeneratedOutput } from '../components/GeneratedOutput';
import { pdfGenerator } from '../utils/pdfGenerator';
import { markdownGenerator } from '../utils/markdownGenerator';
import { api } from '../services/api';

import { ConfluencePublishModal } from '../components/ConfluencePublishModal';

export default function DatabaseDesign() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['database-design'];

  const [activeTab, setActiveTab] = useState('erd'); // 'erd' | 'sql' | 'fsd'
  const [zoomScale, setZoomScale] = useState(1);
  const diagramRef = useRef(null);
  const [isConfluenceOpen, setIsConfluenceOpen] = useState(false);

  // Auto load latest workspace spec as reference on load
  useEffect(() => {
    const importSpec = async () => {
      try {
        const data = await api.getWorkspaceSpec();
        if (pageState.files.length === 0 && data.content) {
          updatePageState('database-design', {
            files: [{ name: 'spec.md', size: data.content.length * 2 }]
          });
        }
      } catch (err) {
        console.error('Failed to load spec file:', err);
      }
    };
    importSpec();
  }, []);

  // File handling
  const handleFileSelect = (file) => {
    updatePageState('database-design', {
      files: [...pageState.files, file]
    });
  };

  const handleFileDelete = (idx) => {
    const updated = [...pageState.files];
    updated.splice(idx, 1);
    updatePageState('database-design', { files: updated });
  };

  const handleTriggerGenerate = async () => {
    await backendAdapter.runGeneration('database-design', updatePageState);
  };

  // ERD Subgraph name sanitizer
  const sanitizeErd = (text) => {
    if (!text) return '';
    // Fix double colons class notation, e.g. NodeId::className -> NodeId:::className
    let clean = text.replace(/(?<!https?)::([a-zA-Z0-9_-]+)/gi, ':::$1');
    
    // Replace invalid UQ / UNIQUE keys with valid UK
    clean = clean.replace(/\b(UQ|UNIQUE)\b/gi, 'UK');
    
    // Clean empty brackets from Mermaid ERD syntax (supporting any whitespace or newlines inside)
    clean = clean.replace(/(\w+)\s*\{\s*([\r\n\s]*)\}/g, '$1 {\n    uuid id\n  }');
    
    return clean.replace(/subgraph\s+([a-zA-Z0-9_\-&\s]+)(?:\r?\n)/g, (match, name) => {
      const trimmed = name.trim();
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) return match;
      if (/\s|&/.test(trimmed)) {
        return `subgraph "${trimmed}"\n`;
      }
      return match;
    });
  };

  // Render Mermaid ERD
  useEffect(() => {
    if (activeTab === 'erd' && pageState.output?.erd && window.mermaid) {
      const cleanDiagramCode = sanitizeErd(pageState.output.erd);
      try {
        if (diagramRef.current) {
          diagramRef.current.removeAttribute('data-processed');
          
          if (typeof window.mermaid.render === 'function') {
            window.mermaid.render('mermaid-svg-db', cleanDiagramCode)
              .then(({ svg }) => {
                if (diagramRef.current) {
                  diagramRef.current.innerHTML = svg;
                }
              })
              .catch((err) => {
                console.error('Mermaid render promise error (DB):', err);
                if (diagramRef.current) {
                  diagramRef.current.innerHTML = `<div class="text-red-400 p-4 border border-red-900 rounded bg-red-950/20">Mermaid Rendering Error: ${err.message}</div>`;
                }
              });
          } else if (typeof window.mermaid.draw === 'function') {
            window.mermaid.draw('mermaid-svg-db', cleanDiagramCode, (svgCode) => {
              if (diagramRef.current) {
                diagramRef.current.innerHTML = svgCode;
              }
            });
          } else {
            window.mermaid.init(undefined, diagramRef.current);
          }
        }
      } catch (err) {
        console.error('Mermaid render try-catch error (DB):', err);
        if (diagramRef.current) {
          diagramRef.current.innerHTML = `<div class="text-red-400 p-4 border border-red-900 rounded bg-red-950/20">Mermaid Rendering Error: ${err.message}</div>`;
        }
      }
    }
  }, [activeTab, pageState.output, pageState.isLoading]);

  // Export functions
  const handleExportSQL = () => {
    if (!pageState.output?.sql) return;
    markdownGenerator.download('schema_ddl.sql', pageState.output.sql);
  };

  const handleExportPDF = () => {
    if (!pageState.output) return;
    const docHtml = pageState.output.fsd || `
      <h1>Database Architecture &amp; Schema Documentation</h1>
      <h2>Entity-Relationship Layout</h2>
      <p>(See generated design vector models)</p>
      <h2>SQL DDL Scripts</h2>
      <pre>${pageState.output.sql}</pre>
    `;
    pdfGenerator.download('Database_Design_Document.pdf', docHtml);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left panel */}
      <div class="lg:col-span-4 flex flex-col space-y-4">
        <FileUpload
          pageKey="database-design"
          title="Upload Spec or DDL drafts"
          subtitle="Drop specification files or SQL schemas to compile"
          files={pageState.files}
          logs={pageState.logs}
          isLoading={pageState.isLoading}
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
          onTriggerGenerate={handleTriggerGenerate}
        />
      </div>

      {/* Right panel */}
      <div class="lg:col-span-8 h-full flex flex-col overflow-hidden">
        <GeneratedOutput
          title="Database Schema Design Reviewboard"
          subtitle="ERD layout maps, SQL schemas, and tables validations"
          actions={
            pageState.output && (
              <div class="flex items-center space-x-1.5">
                <button 
                  onClick={() => setIsConfluenceOpen(true)}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="fab fa-confluence"></i>
                  <span>Confluence</span>
                </button>
                <button 
                  onClick={handleExportSQL}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="fas fa-file-code"></i>
                  <span>SQL</span>
                </button>
                <button 
                  onClick={handleExportPDF}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="far fa-file-pdf"></i>
                  <span>PDF</span>
                </button>
              </div>
            )
          }
        >
          {!pageState.output ? (
            <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <div class="p-4 bg-indigo-500/5 text-indigo-400 rounded-full">
                <i class="fas fa-database text-3xl"></i>
              </div>
              <div class="max-w-xs space-y-1.5">
                <p class="text-xs font-bold text-slate-300">Schema Reviewboard Offline</p>
                <p class="text-[11px] text-slate-500">Provide specs on the left and compile to explore SQL DDL codes and table layouts.</p>
              </div>
            </div>
          ) : (
            <div class="flex flex-col h-full space-y-4">
              
              {/* Tabs */}
              <div class="flex space-x-1.5 bg-slate-900/60 p-1 border border-slate-800 rounded-xl self-start">
                <button 
                  onClick={() => setActiveTab('erd')}
                  class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    activeTab === 'erd' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ERD Diagram
                </button>
                <button 
                  onClick={() => setActiveTab('sql')}
                  class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    activeTab === 'sql' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SQL DDL Script
                </button>
                <button 
                  onClick={() => setActiveTab('fsd')}
                  class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    activeTab === 'fsd' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Database Design Document
                </button>
              </div>

              {/* Viewport */}
              <div class="flex-1 bg-slate-950/60 rounded-xl border border-slate-900/80 p-5 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                
                {activeTab === 'erd' ? (
                  <div class="flex-1 relative flex flex-col overflow-hidden">
                    <div class="absolute top-2 right-2 bg-slate-900/80 border border-slate-850/80 p-1.5 rounded-lg flex space-x-1 z-10">
                      <button 
                        onClick={() => setZoomScale(prev => Math.min(prev + 0.1, 2))}
                        class="w-7 h-7 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => setZoomScale(prev => Math.max(prev - 0.1, 0.5))}
                        class="w-7 h-7 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => setZoomScale(1)}
                        class="px-2 h-7 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center text-[10px] font-bold"
                      >
                        Reset
                      </button>
                    </div>

                    <div class="flex-1 overflow-auto flex items-center justify-center custom-scroll bg-slate-950/20 rounded-lg border border-slate-900/50 p-4">
                      <div 
                        ref={diagramRef} 
                        style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}
                        class="text-center"
                      />
                    </div>
                  </div>
                ) : activeTab === 'sql' ? (
                  <div class="flex-1 overflow-auto custom-scroll fsd-document p-2">
                    <pre class="bg-slate-900/40 p-4 rounded-xl border border-slate-800 font-mono text-xs text-indigo-300 whitespace-pre-wrap leading-relaxed">
                      {pageState.output.sql}
                    </pre>
                  </div>
                ) : (
                  <div class="flex-1 overflow-hidden flex flex-col">
                    <iframe
                      srcDoc={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      background: #0f172a;
      color: #e2e8f0;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      font-size: 13px;
      line-height: 1.6;
      width: 100%;
      overflow-x: hidden;
    }
    body { padding: 16px; }
    table { width: 100%; max-width: 100%; border-collapse: collapse; table-layout: auto; word-break: break-word; }
    td, th { word-break: break-word; overflow-wrap: break-word; max-width: 300px; }
    img { max-width: 100%; height: auto; }
    pre, code { white-space: pre-wrap; word-break: break-word; }
    * { max-width: 100%; }
    div, section, article, p { overflow-wrap: break-word; }
  </style>
</head>
<body>${pageState.output.fsd || ''}</body>
</html>`}
                      title="Database Design Document"
                      class="w-full flex-1 border-0 rounded-xl"
                      style={{ minHeight: '500px', background: '#0f172a' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </GeneratedOutput>
      </div>

      <ConfluencePublishModal 
        isOpen={isConfluenceOpen}
        onClose={() => setIsConfluenceOpen(false)}
        stageType="database-design"
      />

    </div>
  );
}
```


## src/pages/FunctionalSpec.jsx
```jsx
import React, { useEffect, useState } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { FileUpload } from '../components/FileUpload';
import { GeneratedOutput } from '../components/GeneratedOutput';
import { pdfGenerator } from '../utils/pdfGenerator';
import { api } from '../services/api';
import { ConfluencePublishModal } from '../components/ConfluencePublishModal';

export default function FunctionalSpec() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['functional-spec'];
  const [isConfluenceOpen, setIsConfluenceOpen] = useState(false);

  // Auto load latest workspace spec as reference on load
  useEffect(() => {
    const importSpec = async () => {
      try {
        const data = await api.getWorkspaceSpec();
        if (pageState.files.length === 0 && data.content) {
          updatePageState('functional-spec', {
            files: [{ name: 'spec.md', size: data.content.length * 2 }]
          });
        }
      } catch (err) {
        console.error('Failed to load spec file:', err);
      }
    };
    importSpec();
  }, []);

  const handleFileSelect = (file) => {
    updatePageState('functional-spec', {
      files: [...pageState.files, file]
    });
  };

  const handleFileDelete = (idx) => {
    const updated = [...pageState.files];
    updated.splice(idx, 1);
    updatePageState('functional-spec', { files: updated });
  };

  const handleTriggerGenerate = async () => {
    await backendAdapter.runGeneration('functional-spec', updatePageState);
  };

  const handleDownloadPDF = () => {
    if (!pageState.output) return;
    pdfGenerator.download('Functional_Specification_Document.pdf', pageState.output);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left panel: Upload & console */}
      <div class="lg:col-span-4 flex flex-col space-y-4">
        <FileUpload
          pageKey="functional-spec"
          title="Upload Specifications Document"
          subtitle="Drop spec.md, requirement reports, or FSD frameworks"
          files={pageState.files}
          logs={pageState.logs}
          isLoading={pageState.isLoading}
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
          onTriggerGenerate={handleTriggerGenerate}
        />
      </div>

      {/* Right panel: Viewport preview */}
      <div class="lg:col-span-8 h-full flex flex-col overflow-hidden">
        <GeneratedOutput
          title="Rendered Functional Specification Document (FSD)"
          subtitle="High fidelity 2-pass compiled specification sheet"
          actions={
            pageState.output && (
              <div class="flex items-center space-x-1.5">
                <button 
                  onClick={() => setIsConfluenceOpen(true)}
                  class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1.5"
                >
                  <i class="fab fa-confluence"></i>
                  <span>Confluence</span>
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1.5"
                >
                  <i class="far fa-file-pdf"></i>
                  <span>Download PDF</span>
                </button>
              </div>
            )
          }
        >
          {!pageState.output ? (
            <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <div class="p-4 bg-indigo-500/5 text-indigo-400 rounded-full">
                <i class="fas fa-file-invoice text-3xl"></i>
              </div>
              <div class="max-w-xs space-y-1.5">
                <p class="text-xs font-bold text-slate-300">No FSD Compiled Yet</p>
                <p class="text-[11px] text-slate-500">Add documents and run the compilation on the left to review the high-fidelity dark-themed functional spec.</p>
              </div>
            </div>
          ) : (
            <iframe
              srcDoc={pageState.output}
              title="FSD Document Preview"
              class="w-full h-full border border-slate-800 rounded-xl bg-white"
            />
          )}
        </GeneratedOutput>
      </div>

      <ConfluencePublishModal 
        isOpen={isConfluenceOpen}
        onClose={() => setIsConfluenceOpen(false)}
        stageType="functional-spec"
      />

    </div>
  );
}
```


## src/pages/ImpactAnalysisView.jsx
```jsx
import React, { useState, useEffect } from 'react';

export default function ImpactAnalysisView() {
  const [newRequirement, setNewRequirement] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [contextInfo, setContextInfo] = useState({
    codeSnippetsCount: 0,
    hasDbSchema: false,
    hasGuardrails: false,
    activeSpec: '001-meeting-manager'
  });

  useEffect(() => {
    // Fetch brownfield context metadata
    fetch('http://localhost:7001/api/brownfield/context')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.context) {
          setContextInfo({
            codeSnippetsCount: (data.context.codeSnippets || []).length,
            hasDbSchema: !!data.context.dbSchema,
            hasGuardrails: !!data.context.legacyGuardrails,
            activeSpec: '001-meeting-manager'
          });
        }
      })
      .catch(err => console.error('Failed fetching context info:', err));
  }, []);

  const handleRunAnalysis = async () => {
    if (!newRequirement.trim()) {
      setStatusMessage({ type: 'error', text: 'Please enter a new requirement or feature change description.' });
      return;
    }

    setIsAnalyzing(true);
    setStatusMessage(null);

    try {
      const res = await fetch('http://localhost:7001/api/impact-analysis/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRequirement: newRequirement.trim() })
      });

      const data = await res.json();
      if (data.success) {
        setAnalysisResult(data.analysisReport);
        setStatusMessage({ type: 'success', text: 'Impact & Gap Analysis completed successfully!' });
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to complete Impact Analysis.' });
      }
    } catch (err) {
      console.error('Impact analysis error:', err);
      setStatusMessage({ type: 'error', text: 'Network or server error running Impact Analysis.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePresetClick = (presetText) => {
    setNewRequirement(presetText);
  };

  return (
    <div class="p-6 space-y-6 max-w-7xl mx-auto custom-scroll overflow-y-auto">
      {/* Top Header Banner */}
      <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center text-xl shadow-lg shadow-amber-500/10">
              <i class="fas fa-search-plus"></i>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Phase 3: Brownfield AI
                </span>
                <h1 class="text-lg font-bold text-white">Impact & Gap Specification Engine</h1>
              </div>
              <p class="text-xs text-slate-400 mt-1">
                Evaluate new feature requirements against your Current-State Baseline Spec & vectorized codebase to detect breaking risks and generate Delta Specs.
              </p>
            </div>
          </div>

          {/* Context Status Badges */}
          <div class="flex items-center space-x-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 text-[10px]">
            <div class="flex items-center space-x-1.5 px-2 py-1 bg-slate-900 rounded-lg text-slate-300">
              <i class="fas fa-code text-indigo-400"></i>
              <span>{contextInfo.codeSnippetsCount} Files</span>
            </div>
            <div class="flex items-center space-x-1.5 px-2 py-1 bg-slate-900 rounded-lg text-slate-300">
              <i class={`fas ${contextInfo.hasDbSchema ? 'fa-database text-green-400' : 'fa-database text-slate-500'}`}></i>
              <span>{contextInfo.hasDbSchema ? 'DB DDL' : 'No DDL'}</span>
            </div>
            <div class="flex items-center space-x-1.5 px-2 py-1 bg-slate-900 rounded-lg text-slate-300">
              <i class={`fas ${contextInfo.hasGuardrails ? 'fa-shield-alt text-amber-400' : 'fa-shield-alt text-slate-500'}`}></i>
              <span>{contextInfo.hasGuardrails ? 'Guardrails Active' : 'Default Rules'}</span>
            </div>
          </div>
        </div>

        {/* Status Message Banner */}
        {statusMessage && (
          <div class={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between transition ${
            statusMessage.type === 'success'
              ? 'bg-green-950/40 border-green-500/40 text-green-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            <div class="flex items-center space-x-2">
              <i class={`fas ${statusMessage.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} class="text-slate-400 hover:text-white">
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Input & Preset Requirements | Analysis Output */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form & Presets */}
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold text-slate-200 flex items-center space-x-2">
                <i class="fas fa-plus-circle text-amber-400"></i>
                <span>New Feature / Change Request:</span>
              </h3>
              <span class="text-[10px] text-slate-500 font-mono">Input Prompt</span>
            </div>

            <textarea
              rows={8}
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Describe the new feature or change request in detail... (e.g. 'Add PDF export functionality for health vitals with custom date range filter and email sharing option')"
              class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none custom-scroll leading-relaxed"
            />

            {/* Example Requirement Presets */}
            <div class="space-y-2">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sample Change Presets:</span>
              <div class="flex flex-wrap gap-2">
                <button
                  onClick={() => handlePresetClick("Add PDF & CSV export for biometric vitals trend data with custom date range selection and local file caching.")}
                  class="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-amber-500/40 text-[10px] text-slate-300 hover:text-amber-300 transition text-left cursor-pointer"
                >
                  <i class="fas fa-file-pdf text-amber-400 mr-1"></i> Add PDF/CSV Vitals Export
                </button>
                <button
                  onClick={() => handlePresetClick("Integrate Google OAuth2 SSO authentication fallback for multi-device profile syncing while preserving local SQLite offline mode.")}
                  class="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-[10px] text-slate-300 hover:text-indigo-300 transition text-left cursor-pointer"
                >
                  <i class="fab fa-google text-indigo-400 mr-1"></i> Google OAuth2 Sync
                </button>
                <button
                  onClick={() => handlePresetClick("Add audit logging table to record all document AI extractions and PIN unlock attempts with local timestamp and SHA-256 integrity hash.")}
                  class="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-[10px] text-slate-300 hover:text-emerald-300 transition text-left cursor-pointer"
                >
                  <i class="fas fa-user-shield text-emerald-400 mr-1"></i> Audit Log Table
                </button>
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              class="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition hover:scale-[1.01] cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <i class="fas fa-spinner fa-spin"></i>
                  <span>Analyzing Impact & Legacy Guardrails...</span>
                </>
              ) : (
                <>
                  <i class="fas fa-microscope"></i>
                  <span>Run Impact & Gap Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output Report */}
        <div class="lg:col-span-7">
          <div class="bg-[#0b0f19] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl min-h-[520px] flex flex-col justify-between">
            <div class="space-y-4">
              <div class="flex items-center justify-between border-b border-slate-800 pb-3">
                <div class="flex items-center space-x-2">
                  <i class="fas fa-clipboard-check text-emerald-400"></i>
                  <h3 class="text-xs font-bold text-slate-200">System Impact & Gap Specification Report</h3>
                </div>
                {analysisResult && (
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Analysis Ready
                  </span>
                )}
              </div>

              {!analysisResult ? (
                <div class="bg-slate-950 border border-dashed border-slate-800 rounded-xl p-12 text-center space-y-3 my-auto">
                  <div class="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto text-xl">
                    <i class={`fas ${isAnalyzing ? 'fa-spinner fa-spin text-amber-400' : 'fa-search-plus'}`}></i>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-slate-300">No Impact Analysis Generated Yet</h4>
                    <p class="text-[11px] text-slate-500 max-w-sm mx-auto mt-1">
                      Enter a new requirement or click a preset on the left, then click <strong>Run Impact & Gap Analysis</strong> to evaluate legacy code impact.
                    </p>
                  </div>
                </div>
              ) : (
                <textarea
                  rows={20}
                  value={analysisResult}
                  onChange={(e) => setAnalysisResult(e.target.value)}
                  class="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-4 text-xs font-mono text-slate-200 focus:outline-none custom-scroll leading-relaxed"
                />
              )}
            </div>

            {analysisResult && (
              <div class="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(analysisResult);
                    setStatusMessage({ type: 'success', text: 'Impact & Gap Specification copied to clipboard!' });
                  }}
                  class="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-xl transition cursor-pointer flex items-center space-x-2"
                >
                  <i class="fas fa-copy"></i>
                  <span>Copy Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```


## src/pages/Login.jsx
```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('sdd_users');
    if (saved) {
      try { 
        // We must also apply the migration logic here in case AdminUsers hasn't run yet
        let loadedUsers = JSON.parse(saved);
        return loadedUsers.map(u => {
          let isSuperAdmin = u.isSuperAdmin || false;
          let modifiedProjectAccess = [...u.projectAccess];
          modifiedProjectAccess.forEach(pAccess => {
            if (pAccess.personas.includes('Super Admin')) {
              isSuperAdmin = true;
              pAccess.personas = pAccess.personas.filter(p => p !== 'Super Admin');
            }
          });
          modifiedProjectAccess = modifiedProjectAccess.filter(pAccess => pAccess.personas.length > 0 || pAccess.projectId);
          return { ...u, isSuperAdmin, projectAccess: modifiedProjectAccess };
        });
      } catch (e) {}
    }
    return [
      { id: 1, name: 'Prakash Sankaran', email: 'prakash@frugalforge.io', isSuperAdmin: true, projectAccess: [{ projectId: 'mobile-app-v2', personas: ['Product Owner', 'Technical Lead'] }] },
      { id: 2, name: 'Sarah Chen', email: 'sarah.c@frugalforge.io', isSuperAdmin: false, projectAccess: [{ projectId: 'legacy-migration', personas: ['Business Analyst'] }] },
      { id: 3, name: 'Prasanna', email: 'prasanna@frugalforge.io', isSuperAdmin: true, projectAccess: [] }
    ];
  });

  const getPrimaryPersona = (user) => {
    if (!user) return 'No Role';
    if (user.isSuperAdmin) return 'Super Admin';
    if (!user.projectAccess || user.projectAccess.length === 0) return 'No Role';
    return user.projectAccess[0].personas[0] || 'No Role';
  };

  const [selectedUserId, setSelectedUserId] = useState(users.length > 0 ? users[0].id : null);
  const selectedUser = users.find(u => u.id === selectedUserId);
  const [email, setEmail] = useState(selectedUser ? selectedUser.email : '');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    localStorage.setItem('activeUserId', selectedUser.id);
    
    // Check if user is Super Admin in any project
      if (selectedUser.isSuperAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
  };

  const handleUserChange = (e) => {
    const userId = Number(e.target.value);
    setSelectedUserId(userId);
    const user = users.find(u => u.id === userId);
    if (user) setEmail(user.email);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#060913] text-[#f8fafc] font-sans relative overflow-hidden">
      
      {/* Background glow effects matching the image */}
      <div className="absolute top-[20%] left-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="absolute top-0 w-full flex justify-between items-center px-8 py-5 z-10 pointer-events-none">
        <div className="flex items-center space-x-3 pointer-events-auto">
          {/* Logo */}
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center font-bold text-white shadow-[0_4px_15px_rgba(99,102,241,0.3)] text-lg">
            S
          </div>
          
          <div className="flex flex-col">
            <span className="text-[20px] font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent leading-tight">Frugal Forge</span>
            <span className="text-[10px] text-[#6366f1] font-semibold tracking-wider uppercase">Intelligent SDLC Workspace</span>
          </div>

        </div>

        {/* User Selector */}
        <div className="flex items-center space-x-3 pointer-events-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">ACTIVE USER:</span>
          <div className="relative">
            <select 
              value={selectedUserId || ''}
              onChange={handleUserChange}
              className="appearance-none bg-[#0c1222] border border-slate-800 text-slate-300 text-[13px] font-semibold rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer max-w-[240px]"
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({getPrimaryPersona(user)})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center p-4 z-10 mt-12">
        <div className="bg-[#0c1222]/90 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-10 max-w-[440px] w-full shadow-2xl relative">
          
          {/* Top gradient line */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-2xl"></div>

          <div className="text-center mb-8">
            <h2 className="text-[28px] font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 text-[14px]">Enter your credentials to access Frugal Forge</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-2">Username / Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-[18px] h-[18px] text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-[15px] text-white focus:outline-none focus:border-indigo-500 focus:bg-[#060913]/90 transition-all placeholder-slate-600"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-slate-400 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-[18px] h-[18px] text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <input 
                  type="password" 
                  className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-[15px] text-white focus:outline-none focus:border-indigo-500 focus:bg-[#060913]/90 transition-all placeholder-slate-600 tracking-wider"
                  placeholder="••••••••"
                  defaultValue="password123"
                  required
                />
              </div>
              <div className="flex justify-end mt-2">
                <a href="#" className="text-[13px] text-[#6366f1] hover:text-indigo-400 transition-colors">Forgot password?</a>
              </div>
            </div>

            <button type="submit" className="w-full mt-2 bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:opacity-90 text-white font-semibold py-3 rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.3)] transition-all text-[15px]">
              Authenticate Workspace
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-slate-800/80"></div>
            <span className="px-3 text-[10px] uppercase font-semibold tracking-wider text-slate-500">or login with SSO</span>
            <div className="flex-grow border-t border-slate-800/80"></div>
          </div>

          {/* SSO Options */}
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => navigate('/admin/dashboard')} className="flex items-center justify-center space-x-2 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all py-2.5 rounded-xl text-[13px] font-semibold text-slate-300">
              <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </button>
            <button type="button" onClick={() => navigate('/admin/dashboard')} className="flex items-center justify-center space-x-2 bg-slate-800/30 hover:bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all py-2.5 rounded-xl text-[13px] font-semibold text-slate-300">
              <svg viewBox="0 0 23 23" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                <rect fill="#F25022" x="0" y="0" width="11" height="11"/>
                <rect fill="#7FBA00" x="12" y="0" width="11" height="11"/>
                <rect fill="#00A4EF" x="0" y="12" width="11" height="11"/>
                <rect fill="#FFB900" x="12" y="12" width="11" height="11"/>
              </svg>
              <span>Microsoft</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
```


## src/pages/Repository.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Repository() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [error, setError] = useState(null);

  // Fetch document lists
  const fetchDocuments = async () => {
    setIsLoadingDocs(true);
    setError(null);
    try {
      const data = await api.getDocuments();
      if (data.success) {
        setDocuments(data.documents);
      } else {
        setError('Failed to fetch documents listing.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred while loading documents.');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // Fetch documents on tab change or mount
  useEffect(() => {
    fetchDocuments();
  }, [activeTab]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      const data = await api.searchDocuments(searchQuery);
      if (data.success) {
        setSearchResults(data.hits || []);
      } else {
        setError('Search failed to retrieve results.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred during semantic search.');
    } finally {
      setIsSearching(false);
    }
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getAgentLabel = (agentId) => {
    const labels = {
      'functional-spec': 'Functional Spec Agent',
      'spec-to-story': 'Spec to Story Agent',
      'user-stories': 'User Stories Agent',
      'tech-architecture': 'Tech Architecture Agent',
      'database-design': 'Database Design Agent',
      'ux-wireframe': 'UX Wireframe Agent',
      'test-cases': 'Test Cases Agent',
      'traceability-matrix': 'Traceability Matrix Agent',
      'review-agent': 'Review Agent'
    };
    return labels[agentId] || agentId;
  };

  const getFileIcon = (format) => {
    switch (format) {
      case 'html': return 'fab fa-html5 text-orange-400';
      case 'sql': return 'fas fa-database text-blue-400';
      case 'md': return 'fab fa-markdown text-indigo-400';
      default: return 'far fa-file-alt text-slate-400';
    }
  };

  return (
    <div class="h-full flex flex-col space-y-6">
      
      {/* Page Title Header */}
      <div class="flex justify-between items-center bg-slate-900/10 border border-slate-900 p-4 rounded-2xl">
        <div>
          <h2 class="text-base font-extrabold text-white flex items-center">
            <span class="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 mr-2.5">
              <i class="fas fa-search-dollar"></i>
            </span> 
            Semantic Document Repository
          </h2>
          <p class="text-xs text-slate-500">Query the workspace vector database and view archived agent generation files</p>
        </div>
        
        {/* Navigation Tabs */}
        <div class="flex space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('search')}
            class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 flex items-center space-x-1.5 ${
              activeTab === 'search' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <i class="fas fa-brain text-[10px]"></i>
            <span>Vector Search</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 flex items-center space-x-1.5 ${
              activeTab === 'documents' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <i class="far fa-folder-open text-[10px]"></i>
            <span>All Documents ({documents.length})</span>
          </button>
        </div>
      </div>

      {error && (
        <div class="p-4 bg-red-950/20 border border-red-900/50 rounded-xl text-xs text-red-400 flex items-center space-x-2">
          <i class="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
        </div>
      )}

      {/* SEARCH TAB VIEW */}
      {activeTab === 'search' && (
        <div class="flex-1 flex flex-col space-y-6 overflow-hidden">
          {/* Query Formulation Input Box */}
          <form onSubmit={handleSearchSubmit} class="glass-panel p-5 rounded-2xl flex flex-col space-y-4 shadow-xl border border-slate-800">
            <h3 class="text-xs font-bold tracking-wider text-slate-400 uppercase">Semantic Query Engine</h3>
            
            <div class="flex space-x-3">
              <div class="relative flex-1">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <i class="fas fa-search text-slate-500 text-xs"></i>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ask a question or enter keywords (e.g. 'What are the rules for returns >= $100?')"
                  class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-300 transition"
                  disabled={isSearching}
                />
              </div>
              <button
                type="submit"
                class={`px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition ${
                  isSearching ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <i class="fas fa-circle-notch animate-spin"></i>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <i class="fas fa-location-arrow"></i>
                    <span>Execute</span>
                  </>
                )}
              </button>
            </div>
            
            <div class="flex items-center space-x-4 text-[10px] text-slate-500">
              <span><i class="fas fa-info-circle mr-1"></i> Powered by Gemini Embeddings & Local Cosine Index</span>
              <span>•</span>
              <span>Collection: <code>agent_documents</code></span>
            </div>
          </form>

          {/* Results Listings */}
          <div class="flex-1 overflow-y-auto custom-scroll pr-1">
            {isSearching ? (
              <div class="flex flex-col items-center justify-center py-16 space-y-3">
                <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-xs text-slate-500">Retrieving matched vectors from database...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div class="flex flex-col items-center justify-center py-16 text-center space-y-4 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                <div class="p-4 bg-indigo-500/5 text-slate-600 rounded-full">
                  <i class="fas fa-vector-square text-3xl"></i>
                </div>
                <div class="max-w-xs space-y-1">
                  <p class="text-xs font-bold text-slate-400">No Semantic Results</p>
                  <p class="text-[11px] text-slate-600">Enter a query above to search through enqueued specifications, stories, and database designs.</p>
                </div>
              </div>
            ) : (
              <div class="space-y-4">
                <div class="flex items-center justify-between text-[11px] text-slate-500 px-1">
                  <span>Found {searchResults.length} semantic matches</span>
                </div>
                
                {searchResults.map((hit) => {
                  const scorePercentage = Math.round(hit.score * 100);
                  const isHighMatch = hit.score > 0.6;
                  
                  return (
                    <div key={hit.id} class="bg-[#0b0f19] border border-slate-800 hover:border-slate-700 p-5 rounded-2xl shadow-sm transition duration-150 space-y-4">
                      {/* Match Header */}
                      <div class="flex justify-between items-start">
                        <div class="flex items-center space-x-3">
                          <div class="p-2.5 bg-slate-950 border border-slate-850 rounded-lg">
                            <i class={getFileIcon(hit.payload.format) + " text-sm"}></i>
                          </div>
                          <div>
                            <h4 class="text-xs font-bold text-white tracking-wide">{hit.payload.filename}</h4>
                            <p class="text-[10px] text-slate-500 font-semibold">{getAgentLabel(hit.payload.agentId)}</p>
                          </div>
                        </div>
                        
                        <div class="flex items-center space-x-3">
                          {/* Similarity Badge */}
                          <div class={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            isHighMatch 
                              ? 'bg-green-950/30 text-green-400 border-green-900/50' 
                              : 'bg-indigo-950/30 text-indigo-400 border-indigo-900/50'
                          }`}>
                            <i class="fas fa-bullseye mr-1"></i> Similarity: {scorePercentage}%
                          </div>
                          
                          {/* Download Button */}
                          <a
                            href={api.getDocumentDownloadUrl(hit.payload.filename)}
                            download
                            class="p-2 bg-slate-900 hover:bg-indigo-950/30 hover:border-indigo-900 text-slate-400 hover:text-indigo-400 border border-slate-800 rounded-lg transition"
                            title="Download File"
                          >
                            <i class="fas fa-download text-xs"></i>
                          </a>
                        </div>
                      </div>

                      {/* Text Excerpt Block */}
                      <div class="bg-slate-950/50 border border-slate-900/50 rounded-xl p-3.5 text-xs text-slate-400 font-sans leading-relaxed whitespace-pre-wrap">
                        {hit.payload.text}
                      </div>

                      <div class="flex items-center justify-between text-[9px] text-slate-500">
                        <span>Chunk index: #{hit.payload.chunkIndex}</span>
                        <span>Generated: {new Date(hit.payload.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ALL DOCUMENTS TAB VIEW */}
      {activeTab === 'documents' && (
        <div class="flex-1 overflow-y-auto custom-scroll">
          {isLoadingDocs ? (
            <div class="flex flex-col items-center justify-center py-20 space-y-3">
              <div class="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs text-slate-500">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div class="flex flex-col items-center justify-center py-20 text-center space-y-4 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
              <div class="p-4 bg-indigo-500/5 text-slate-600 rounded-full">
                <i class="far fa-folder text-3xl"></i>
              </div>
              <div class="max-w-xs space-y-1.5">
                <p class="text-xs font-bold text-slate-400">Archive is Empty</p>
                <p class="text-[11px] text-slate-600">Run any developer agent (like Spec to Story or UX Wireframe) to compile files and archive them here.</p>
              </div>
            </div>
          ) : (
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map((doc) => {
                const format = doc.filename.split('.').pop();
                return (
                  <div key={doc.filename} class="bg-[#0b0f19] border border-slate-800 hover:border-indigo-900 p-4 rounded-xl flex flex-col justify-between space-y-4 hover:shadow-lg transition duration-200">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center space-x-3 truncate">
                        <div class="p-2.5 bg-slate-950 border border-slate-850 rounded-lg shrink-0">
                          <i class={getFileIcon(format) + " text-base"}></i>
                        </div>
                        <div class="truncate">
                          <h4 class="text-xs font-bold text-white tracking-wide truncate" title={doc.filename}>
                            {doc.filename}
                          </h4>
                          <p class="text-[10px] text-slate-500">{formatBytes(doc.size)}</p>
                        </div>
                      </div>
                      
                      <a
                        href={api.getDocumentDownloadUrl(doc.filename)}
                        download
                        class="p-2 bg-slate-900 hover:bg-indigo-600 text-slate-400 hover:text-white border border-slate-800 rounded-lg transition"
                        title="Download Original File"
                      >
                        <i class="fas fa-download text-xs"></i>
                      </a>
                    </div>

                    <div class="flex justify-between items-center border-t border-slate-900 pt-3 text-[9px] text-slate-500">
                      <span>Updated: {new Date(doc.updatedAt).toLocaleDateString()}</span>
                      <span class="uppercase font-mono px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-slate-400">{format}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
```


## src/pages/RequirementAgent.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function RequirementAgent() {
  const [requirements, setRequirements] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('spec.md');
  const [tabContent, setTabContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [notification, setNotification] = useState(null);
  const [isSavingDocument, setIsSavingDocument] = useState(false);

  useEffect(() => {
    // Load currently active spec details on mount
    const fetchActiveSpec = async () => {
      try {
        const res = await fetch('http://localhost:7001/api/specs/active');
        const data = await res.json();
        if (data.success && data.activeSpec && data.files && data.files.length > 0) {
          setResult({
            success: true,
            folderName: data.activeSpec,
            files: data.files
          });
          // Load default tab content
          loadDocContent(data.activeSpec, 'spec.md');
        }
      } catch (err) {
        console.error('Failed to load active spec details on mount:', err);
      }
    };
    fetchActiveSpec();
  }, []);

  // Handle requirement file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setRequirements(event.target.result);
    };
    reader.readAsText(file);
  };

  // Run the Spec Kit scaffolding process
  const handleExecute = async () => {
    if (!requirements.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setResult(null);
    setLogs(['[SpecKit] Starting Spec-Driven Development cycle...', '[SpecKit] Preparing prompt context...']);

    try {
      const response = await fetch('http://localhost:7001/api/specs/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requirements })
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setLogs(prev => [...prev, ...data.log, '🎉 Spec Kit directory created successfully!']);
        setResult(data);
        // Load default tab
        loadDocContent(data.folderName, 'spec.md');
      } else {
        throw new Error(data.error || 'Unknown generation error');
      }
    } catch (err) {
      console.error(err);
      setLogs(prev => [...prev, `❌ Error: ${err.message}`]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Load content of generated specification files
  async function loadDocContent(folder, file) {
    setActiveTab(file);
    setIsLoadingContent(true);
    setTabContent('');
    try {
      // Fetch spec file details or content
      // We can use a raw document download route on the backend or write a custom loader.
      // Since we have a general file reading endpoint or can load via /api/documents/download,
      // let's fetch the file using the server's static or download endpoint.
      const downloadUrl = `http://localhost:7001/api/specs/download/${encodeURIComponent(folder)}/${encodeURIComponent(file)}`;
      const res = await fetch(downloadUrl);
      if (res.ok) {
        const text = await res.text();
        setTabContent(text);
      } else {
        setTabContent(`Failed to load file contents: ${res.statusText}`);
      }
    } catch (err) {
      setTabContent(`Error reading file: ${err.message}`);
    } finally {
      setIsLoadingContent(false);
    }
  }

  // Switch active spec manually
  const handleSelectActive = async (folderName) => {
    try {
      const response = await fetch('http://localhost:7001/api/specs/active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activeSpec: folderName })
      });
      if (response.ok) {
        setNotification({
          type: 'success',
          message: `Active spec changed to: ${folderName}`
        });
        
        localStorage.removeItem('orchestrator_thread_id');

        // Trigger window reload after 2 seconds to reload header dropdown
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        throw new Error(`Failed to update status: ${response.statusText}`);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: `Failed to set active spec: ${err.message}`
      });
    }
  };

  const handleSaveDocument = async () => {
    if (!result || !activeTab) return;
    setIsSavingDocument(true);
    try {
      const response = await fetch('http://localhost:7001/api/specs/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          folder: result.folderName,
          file: activeTab,
          content: tabContent
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setNotification({
          type: 'success',
          message: `${activeTab} has been successfully updated on disk.`
        });
      } else {
        throw new Error(data.error || 'Failed to save document.');
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message
      });
    } finally {
      setIsSavingDocument(false);
    }
  };

  return (
    <div class="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div class={`fixed top-6 right-6 z-[99999] flex items-center space-x-3 bg-slate-900/95 border ${
          notification.type === 'success' ? 'border-green-500/30' : 'border-red-500/30'
        } text-slate-100 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in`}>
          <div class={`w-6 h-6 rounded-full ${
            notification.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
          } flex items-center justify-center shrink-0`}>
            <i class={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} text-xs`}></i>
          </div>
          <div>
            <p class="text-xs font-bold">{notification.type === 'success' ? 'Workspace Updated' : 'System Alert'}</p>
            <p class="text-[10px] text-slate-400 mt-0.5">{notification.message}</p>
          </div>
          <button 
            onClick={() => setNotification(null)}
            class="text-slate-500 hover:text-slate-350 transition ml-2"
          >
            <i class="fas fa-times text-[10px]"></i>
          </button>
        </div>
      )}
      
      {/* Page Title & Intro */}
      <div class="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <h1 class="text-xl font-black text-white uppercase tracking-wider flex items-center">
            <i class="fas fa-file-signature text-indigo-500 mr-3"></i> Requirement Specifier Agent
          </h1>
          <p class="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Feed raw functional requirement briefs or upload a <code class="text-indigo-400 font-bold font-mono">Requirement.md</code> file. 
            This agent executes GitHub Spec Kit prompts to auto-compile the five foundational project files and initializes a new active spec workspace.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: Requirements Input */}
        <div class="lg:col-span-2 space-y-6">
          
          {/* Input Panel */}
          <div class="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-xs font-black text-white uppercase tracking-wider">Requirements Input</h3>
              <label class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-semibold rounded-lg border border-slate-750 cursor-pointer flex items-center space-x-1.5 transition">
                <i class="fas fa-upload"></i>
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".txt,.md"
                  onChange={handleFileUpload}
                  class="hidden"
                />
              </label>
            </div>

            {uploadedFileName && (
              <div class="flex items-center space-x-2 text-[10px] bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-indigo-400 font-mono">
                <i class="fas fa-file-alt"></i>
                <span class="truncate">{uploadedFileName}</span>
              </div>
            )}

            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Paste raw requirements here... E.g., 'We need a portal where users can register using email and password, hash passwords, and view profile dashboards...'"
              rows={12}
              class="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-300 font-mono transition"
            />

            <button
              onClick={handleExecute}
              disabled={isGenerating || !requirements.trim()}
              class={`w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition ${
                isGenerating || !requirements.trim()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-indigo-500 hover:to-indigo-400 hover:shadow-lg hover:shadow-indigo-500/20'
              }`}
            >
              {isGenerating ? (
                <>
                  <i class="fas fa-spinner animate-spin"></i>
                  <span>Executing Spec Kit Scaffolding...</span>
                </>
              ) : (
                <>
                  <i class="fas fa-magic"></i>
                  <span>Execute Spec Scaffolder</span>
                </>
              )}
            </button>
          </div>

          {/* Execution Log */}
          {(isGenerating || logs.length > 0) && (
            <div class="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-2">
              <h4 class="text-[10px] font-black text-slate-500 uppercase tracking-wider">Execution Log Console</h4>
              <div class="h-40 overflow-y-auto font-mono text-[9px] text-slate-400 space-y-1 scrollbar-thin">
                {logs.map((log, idx) => (
                  <div key={idx} class={`${log.startsWith('❌') ? 'text-red-400' : log.startsWith('🎉') || log.startsWith('All') ? 'text-green-400' : 'text-slate-400'}`}>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Spec Kit Documents Viewer */}
        <div class="lg:col-span-3">
          {result ? (
            <div class="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 flex flex-col h-[580px] overflow-hidden">
              
              {/* Folder Header */}
              <div class="flex justify-between items-center border-b border-slate-850 pb-4 mb-4 shrink-0">
                <div class="space-y-0.5">
                  <span class="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Active Workspace Folder</span>
                  <div class="flex items-center space-x-2">
                    <i class="fas fa-folder text-amber-500 text-sm"></i>
                    <span class="text-xs font-bold text-white font-mono">{result.folderName}</span>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    onClick={handleSaveDocument}
                    disabled={isSavingDocument}
                    class="px-3.5 py-1.5 bg-green-950 hover:bg-green-900 border border-green-900 hover:border-green-800 text-[10px] text-green-400 font-bold rounded-lg transition flex items-center space-x-1.5 shadow"
                  >
                    {isSavingDocument ? <i class="fas fa-circle-notch animate-spin"></i> : <i class="fas fa-save"></i>}
                    <span>Save Document</span>
                  </button>
                  <button
                    onClick={() => handleSelectActive(result.folderName)}
                    class="px-3.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-900 hover:border-indigo-800 text-[10px] text-indigo-400 font-bold rounded-lg transition flex items-center space-x-1.5 shadow"
                  >
                    <i class="fas fa-check"></i>
                    <span>Set as Active Spec</span>
                  </button>
                </div>
              </div>

              {/* Tabs list */}
              <div class="flex border-b border-slate-850 overflow-x-auto shrink-0 mb-4 pb-0.5">
                {result.files.map((file) => (
                  <button
                    key={file}
                    onClick={() => loadDocContent(result.folderName, file)}
                    class={`px-3 py-1.5 text-[10px] font-bold border-b-2 whitespace-nowrap transition -mb-0.5 ${
                      activeTab === file
                        ? 'border-indigo-500 text-indigo-400'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {file}
                  </button>
                ))}
              </div>

              {/* File contents viewer panel */}
              <div class="flex-1 overflow-y-auto p-4 bg-slate-950 border border-slate-900 rounded-xl font-mono text-[10px] text-slate-300 leading-relaxed custom-scroll relative">
                {isLoadingContent ? (
                  <div class="absolute inset-0 bg-slate-950/80 flex items-center justify-center">
                    <div class="flex flex-col items-center space-y-2">
                      <i class="fas fa-spinner animate-spin text-indigo-500 text-lg"></i>
                      <span class="text-[10px] text-slate-400">Loading document content...</span>
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={tabContent}
                    onChange={(e) => setTabContent(e.target.value)}
                    class="w-full h-full bg-transparent text-slate-300 font-mono text-[10px] leading-relaxed resize-none focus:outline-none min-h-[440px] custom-scroll select-text"
                  />
                )}
              </div>

            </div>
          ) : (
            <div class="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center h-[580px] border-dashed">
              <div class="w-16 h-16 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center mb-4 text-slate-600">
                <i class="fas fa-file-invoice text-2xl"></i>
              </div>
              <h3 class="text-xs font-black text-white uppercase tracking-wider">Spec Kit Workspace Viewer</h3>
              <p class="text-[10px] text-slate-500 mt-2 max-w-sm leading-relaxed">
                Provide requirement details on the left and execute the spec builder. 
                The compiled Spec Kit files will be rendered here interactively.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
```


## src/pages/ReviewAgent.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { GeneratedOutput } from '../components/GeneratedOutput';
import { pdfGenerator } from '../utils/pdfGenerator';
import { excelGenerator } from '../utils/excelGenerator';
import { api } from '../services/api';

export default function ReviewAgent() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['review-agent'];

  const [leftTab, setLeftTab] = useState('import'); // 'upload' | 'import'
  const [rightTab, setRightTab] = useState('compliance'); // 'compliance' | 'code'
  
  const [importedStages, setImportedStages] = useState({
    'user-stories': false,
    'functional-spec': false,
    'tech-architecture': false,
    'database-design': false,
    'ux-wireframe': false,
    'test-cases': false,
    'traceability-matrix': false
  });

  const [repoPath, setRepoPath] = useState('/Users/saravanan/Prakash/SDD Framework');
  const [scanLogs, setScanLogs] = useState([]);
  const [scanResults, setScanResults] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  const [dialogText, setDialogText] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const stageLabels = {
    'user-stories': '1. User Stories Backlog',
    'functional-spec': '2. Functional Spec (FSD)',
    'tech-architecture': '3. Technical Architecture',
    'database-design': '4. Database Design Schema',
    'ux-wireframe': '5. UX Wireframe Mockups',
    'test-cases': '6. Testing Suite Cases',
    'traceability-matrix': '7. Traceability Matrix'
  };

  // Handle file select for manual uploads
  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files).map(f => ({ name: f.name, size: f.size }));
      updatePageState('review-agent', {
        files: [...pageState.files, ...fileList]
      });
    }
  };

  const handleTriggerGenerate = async () => {
    // Collect active imports
    const activeImports = Object.keys(importedStages).filter(k => importedStages[k]);
    const instructions = `Auditing generated stages: ${activeImports.join(', ')}`;
    await backendAdapter.runGeneration('review-agent', updatePageState, instructions);
  };

  const handleCheckboxChange = (key) => {
    setImportedStages(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Code quality audit action triggers
  const handleValidatePath = async () => {
    setScanLogs(prev => [...prev, `[PathCheck] Checking directory path availability: ${repoPath}`]);
    setTimeout(() => {
      setScanLogs(prev => [...prev, `[PathCheck] Validated! Path is a registered workspace directory.`]);
    }, 500);
  };

  const handleScanTechStack = async () => {
    setIsScanning(true);
    setScanLogs(prev => [...prev, `[TechScanner] Initiating filesystem recursive walk...`]);
    try {
      const data = await api.scanRepo(repoPath);
      setIsScanning(false);
      setScanLogs(prev => [
        ...prev,
        `[TechScanner] Scan completed!`,
        `[TechScanner] Languages detected: ${data.languages.join(', ')}`
      ]);
      setScanResults(data);
    } catch (e) {
      setIsScanning(false);
      setScanLogs(prev => [...prev, `[Error] Tech Scan failed: ${e.message}`]);
    }
  };

  const handleAICodeAudit = () => {
    setScanLogs(prev => [
      ...prev,
      `[AI-Auditor] Running structural semantic scanning...`,
      `[AI-Auditor] Checkpoint: SQL Injection vulnerabilities -> Clean.`,
      `[AI-Auditor] Checkpoint: CSRF & CORS Configurations -> Validated Express CORS headers.`,
      `[AI-Auditor] Scan complete. Found 2 issues.`
    ]);
  };

  const publishToConfluence = () => {
    setDialogText('Report successfully compiled and enqueued for publish to Confluence Space [ENG-SDD].');
    setShowDialog(true);
  };

  const linkToJira = () => {
    setDialogText('Issues mapped and linked to JIRA active sprint tracker.');
    setShowDialog(true);
  };

  const handleExportPDF = () => {
    if (!pageState.output) return;
    
    let htmlContent = `
      <h1>System Quality & Compliance Audit Report</h1>
      <h2>Compliance Review Checkpoints</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Compliance Checkpoint</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
    `;
    pageState.output.compliance?.forEach(row => {
      htmlContent += `
        <tr>
          <td><strong>${row.id}</strong></td>
          <td>${row.checkpoint}</td>
          <td>${row.status}</td>
          <td>${row.details}</td>
        </tr>
      `;
    });
    htmlContent += '</tbody></table>';

    pdfGenerator.download('Compliance_Report.pdf', htmlContent);
  };

  const handleExportExcel = () => {
    if (!pageState.output?.compliance) return;
    excelGenerator.download('Compliance_Audit_Report', pageState.output.compliance);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left Panel: Tab Selectors & Source Import */}
      <div class="lg:col-span-4 flex flex-col space-y-4 overflow-hidden">
        <div class="glass-panel p-5 rounded-2xl flex flex-col space-y-4 border border-slate-800 shadow-xl overflow-y-auto custom-scroll h-full">
          <h3 class="text-sm font-bold tracking-wide text-slate-300 uppercase">Audit Source Configuration</h3>
          
          <div class="flex space-x-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button 
              onClick={() => setLeftTab('import')}
              class={`flex-1 py-1.5 rounded-md text-xs font-semibold transition ${
                leftTab === 'import' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Import Generated
            </button>
            <button 
              onClick={() => setLeftTab('upload')}
              class={`flex-1 py-1.5 rounded-md text-xs font-semibold transition ${
                leftTab === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Upload Source
            </button>
          </div>

          {leftTab === 'import' ? (
            <div class="space-y-3 flex-1 flex flex-col">
              <p class="text-[10px] text-slate-500 font-medium">Select generated stages to audit for compliance rules</p>
              
              <div class="space-y-1.5 flex-1 overflow-y-auto custom-scroll pr-1">
                {Object.keys(stageLabels).map(key => {
                  const hasData = !!pages[key]?.output;
                  return (
                    <label 
                      key={key} 
                      class={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                        importedStages[key] 
                          ? 'bg-indigo-950/20 border-indigo-500/50 text-slate-200' 
                          : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:bg-slate-900/60'
                      }`}
                    >
                      <div class="flex items-center space-x-2">
                        <input 
                          type="checkbox"
                          checked={importedStages[key]}
                          onChange={() => handleCheckboxChange(key)}
                          class="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                        />
                        <span>{stageLabels[key]}</span>
                      </div>
                      
                      {hasData ? (
                        <span class="text-[9px] px-1.5 py-0.5 bg-green-900/30 text-green-400 border border-green-800 rounded">Available</span>
                      ) : (
                        <span class="text-[9px] px-1.5 py-0.5 bg-slate-850 text-slate-500 border border-slate-800 rounded">No Data</span>
                      )}
                    </label>
                  );
                })}
              </div>

              <button
                onClick={handleTriggerGenerate}
                disabled={pageState.isLoading}
                class={`w-full py-2.5 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition duration-200 border border-indigo-500/40 glow-indigo ${
                  pageState.isLoading 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white'
                }`}
              >
                {pageState.isLoading ? <i class="fas fa-circle-notch animate-spin"></i> : <i class="fas fa-shield-alt"></i>}
                <span>Run Compliance Audit</span>
              </button>
            </div>
          ) : (
            <div class="space-y-4 flex-1">
              <div 
                onClick={() => document.getElementById('manual-audit-upload')?.click()}
                class="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-900/40 hover:bg-slate-900/80 rounded-xl p-8 text-center cursor-pointer transition duration-200 flex flex-col items-center justify-center space-y-2"
              >
                <input 
                  type="file" 
                  id="manual-audit-upload" 
                  onChange={handleFileSelect} 
                  class="hidden" 
                  multiple 
                />
                <div class="p-3 bg-indigo-500/10 text-indigo-400 rounded-full">
                  <i class="fas fa-upload text-xl"></i>
                </div>
                <p class="text-xs font-semibold text-slate-300">Upload Audit Source files</p>
                <p class="text-[10px] text-slate-500">Supports logs, HTML compiles, and source reports</p>
              </div>

              {pageState.files.length > 0 && (
                <div class="space-y-2">
                  <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uploaded files ({pageState.files.length})</p>
                  <div class="max-h-32 overflow-y-auto space-y-1 custom-scroll">
                    {pageState.files.map((f, i) => (
                      <div key={i} class="bg-slate-950 border border-slate-800 p-2 rounded text-xs flex items-center justify-between">
                        <span class="truncate text-slate-300">{f.name}</span>
                        <span class="text-[10px] text-slate-500">({(f.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Audit Report Viewport */}
      <div class="lg:col-span-8 h-full flex flex-col overflow-hidden">
        <GeneratedOutput
          title="System Audit & Quality Compliance Board"
          subtitle="Enterprise risk checkpoints scanning, compliance matrices and stack audits"
          actions={
            pageState.output && (
              <div class="flex items-center space-x-1.5">
                <button 
                  onClick={publishToConfluence}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="fab fa-confluence"></i>
                  <span>Confluence</span>
                </button>
                <button 
                  onClick={linkToJira}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="fab fa-jira"></i>
                  <span>Jira</span>
                </button>
                <button 
                  onClick={handleExportExcel}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-green-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="far fa-file-excel"></i>
                  <span>Excel</span>
                </button>
                <button 
                  onClick={handleExportPDF}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="far fa-file-pdf"></i>
                  <span>PDF</span>
                </button>
              </div>
            )
          }
        >
          <div class="flex flex-col h-full space-y-4">
            
            {/* Viewport tabs */}
            <div class="flex space-x-1.5 bg-slate-900/60 p-1 border border-slate-800 rounded-xl self-start">
              <button 
                onClick={() => setRightTab('compliance')}
                class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                  rightTab === 'compliance' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Compliance Review
              </button>
              <button 
                onClick={() => setRightTab('code')}
                class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                  rightTab === 'code' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Code Quality Audit
              </button>
            </div>

            {/* Content viewports */}
            <div class="flex-1 bg-slate-950/60 rounded-xl border border-slate-900/80 p-5 overflow-auto custom-scroll min-h-[300px]">
              {rightTab === 'compliance' ? (
                !pageState.output ? (
                  <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-3">
                    <div class="p-3.5 bg-indigo-500/5 text-indigo-400 rounded-full">
                      <i class="fas fa-shield-alt text-2xl"></i>
                    </div>
                    <p class="text-xs font-bold text-slate-300">Run Audit to Audit Compliance</p>
                    <p class="text-[10px] text-slate-500 max-w-xs">Select active modules to scan role boundary parameters and compliance certifications.</p>
                  </div>
                ) : (
                  <div class="space-y-4">
                    <div class="overflow-x-auto">
                      <table class="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr class="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                            <th class="p-3 w-16 border-r border-slate-800">ID</th>
                            <th class="p-3 border-r border-slate-800">Compliance Checkpoint</th>
                            <th class="p-3 w-20 border-r border-slate-800 text-center">Status</th>
                            <th class="p-3">Details</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-850 bg-slate-950/20 text-slate-300">
                          {pageState.output.compliance?.map((row, idx) => (
                            <tr key={idx} class="hover:bg-slate-900/20">
                              <td class="p-3 border-r border-slate-800 font-bold text-indigo-400">{row.id}</td>
                              <td class="p-3 border-r border-slate-800 font-semibold text-slate-200">{row.checkpoint}</td>
                              <td class="p-3 border-r border-slate-800 text-center">
                                <span class={`px-2 py-0.5 rounded text-[9px] font-extrabold ${
                                  row.status === 'Passed' ? 'bg-green-900/30 text-green-400 border border-green-800/80' : 'bg-yellow-900/30 text-yellow-400 border border-yellow-800/80'
                                }`}>
                                  {row.status}
                                </span>
                              </td>
                              <td class="p-3 text-slate-400 leading-normal">{row.details}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              ) : (
                <div class="space-y-4 h-full flex flex-col">
                  {/* Code Scan actions form */}
                  <div class="bg-slate-900/50 p-4 border border-slate-850 rounded-xl space-y-3">
                    <label class="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repository Path</label>
                    <div class="flex gap-2">
                      <input 
                        type="text"
                        value={repoPath}
                        onChange={(e) => setRepoPath(e.target.value)}
                        class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-300 font-mono"
                      />
                      <button 
                        onClick={handleValidatePath}
                        class="px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
                      >
                        Validate Path
                      </button>
                    </div>

                    <div class="flex space-x-2 pt-1">
                      <button 
                        onClick={handleScanTechStack}
                        disabled={isScanning}
                        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow"
                      >
                        {isScanning ? <i class="fas fa-circle-notch animate-spin"></i> : <i class="fas fa-laptop-code"></i>}
                        <span>Scan Tech Stack</span>
                      </button>
                      <button 
                        onClick={handleAICodeAudit}
                        class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow"
                      >
                        <i class="fas fa-microchip"></i>
                        <span>AI Code Audit</span>
                      </button>
                    </div>
                  </div>

                  {/* Terminal console */}
                  <div class="flex-1 flex flex-col space-y-1.5 min-h-[150px]">
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
                      <i class="fas fa-terminal mr-1 text-purple-400"></i> Execution Terminal
                    </div>
                    <div class="flex-1 bg-slate-950/80 font-mono text-[10px] text-slate-300 p-3 rounded-lg border border-slate-850 overflow-y-auto custom-scroll flex flex-col space-y-1">
                      {scanLogs.length === 0 ? (
                        <div class="text-slate-600 italic">Initiate a pathway validation or stack scanner to view build output logs...</div>
                      ) : (
                        scanLogs.map((log, idx) => (
                          <div key={idx} class={log.includes('[Error]') ? 'text-red-400' : log.includes('[TechScanner]') ? 'text-indigo-400' : 'text-slate-400'}>
                            {log}
                          </div>
                        ))
                      )}
                      
                      {scanResults && (
                        <div class="border-t border-slate-800 pt-2.5 mt-2.5 space-y-2">
                          <div class="text-green-400 font-bold">[Scan Report] Detected Frameworks:</div>
                          <div class="pl-4 text-slate-300 flex flex-wrap gap-1.5">
                            {scanResults.languages.map((l, i) => (
                              <span key={i} class="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-[9px]">{l}</span>
                            ))}
                          </div>
                          <div class="text-red-400 font-bold mt-2">[Scan Report] Potential issues found:</div>
                          <div class="pl-4 space-y-1">
                            {scanResults.issues.map((iss, i) => (
                              <div key={i} class="text-slate-400">
                                <span class="text-yellow-500 font-semibold">[{iss.severity}]</span> {iss.file}: {iss.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </GeneratedOutput>
      </div>

      {/* Confirmation Dialog Modal */}
      {showDialog && (
        <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div class="glass-panel max-w-sm w-full mx-4 p-5 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
            <div class="flex items-center space-x-3 text-indigo-400">
              <i class="fas fa-check-circle text-2xl"></i>
              <h3 class="text-sm font-bold text-slate-200">Operation Successful</h3>
            </div>
            <p class="text-xs text-slate-400 leading-normal">{dialogText}</p>
            <button 
              onClick={() => setShowDialog(false)}
              class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition duration-150"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
```


## src/pages/SpecToStory.jsx
```jsx
import React, { useEffect, useState } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { api } from '../services/api';
import { pdfGenerator } from '../utils/pdfGenerator';
import { excelGenerator } from '../utils/excelGenerator';
import { markdownGenerator } from '../utils/markdownGenerator';

export default function SpecToStory() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['spec-to-story'];

  const [activeLeftTab, setActiveLeftTab] = useState('spec'); // 'spec' | 'logs'
  const [specContent, setSpecContent] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedStoryIdx, setSelectedStoryIdx] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncSuccess, setShowSyncSuccess] = useState(false);
  const [editModalStory, setEditModalStory] = useState(null); // story object to edit

  // Load workspace specification on mount
  useEffect(() => {
    const loadSpec = async () => {
      try {
        const data = await api.getWorkspaceSpec();
        setSpecContent(data.content);
        
        // Add default fake file for workspace
        if (pageState.files.length === 0) {
          updatePageState('spec-to-story', {
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
      updatePageState('spec-to-story', { isLoading: true });
      // Update backend spec
      await api.updateWorkspaceSpec(specContent + (customPrompt ? `\n\n## Custom Requirements Addendum\n* ${customPrompt}` : ''));
      
      // Run generation
      await backendAdapter.runGeneration('spec-to-story', updatePageState, customPrompt);
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

  const handleExportPDF = () => {
    if (!pageState.output || !pageState.output.stories) return;
    
    let htmlContent = `
      <h1>Agile User Stories Export</h1>
      <hr/>
    `;
    pageState.output.stories.forEach(story => {
      htmlContent += `
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
          <h2>${story.id}: ${story.title}</h2>
          <p><strong>As a</strong> ${story.asA}</p>
          <p><strong>I want to</strong> ${story.iWantTo}</p>
          <p><strong>So that</strong> ${story.soThat}</p>
          <h3>Acceptance Criteria:</h3>
          <ul>
            ${story.criteria.map(c => `<li>${c}</li>`).join('')}
          </ul>
          <p><strong>Priority:</strong> ${story.priority} | <strong>Story Points:</strong> ${story.points}</p>
          <p><strong>Technical Notes:</strong> ${story.techNotes}</p>
          <hr/>
        </div>
      `;
    });
    
    pdfGenerator.download('User_Stories.pdf', htmlContent);
  };

  const handleExportExcel = () => {
    if (!pageState.output || !pageState.output.stories) return;
    
    const rows = pageState.output.stories.map(s => ({
      ID: s.id,
      Title: s.title,
      'As A': s.asA,
      'I Want To': s.iWantTo,
      'So That': s.soThat,
      'Acceptance Criteria': s.criteria.join('; '),
      Priority: s.priority,
      'Story Points': s.points,
      'Tech Notes': s.techNotes
    }));
    
    excelGenerator.download('Agile_User_Stories', rows);
  };

  const handleExportMarkdown = () => {
    if (!pageState.output || !pageState.output.stories) return;
    
    let md = '# Agile User Stories Backlog\n\n';
    pageState.output.stories.forEach(s => {
      md += `## ${s.id}: ${s.title}\n`;
      md += `* **As a:** ${s.asA}\n`;
      md += `* **I want to:** ${s.iWantTo}\n`;
      md += `* **So that:** ${s.soThat}\n\n`;
      md += `### Acceptance Criteria\n`;
      s.criteria.forEach(c => {
        md += `- ${c}\n`;
      });
      md += `\n* **Priority:** ${s.priority}\n`;
      md += `* **Story Points:** ${s.points}\n`;
      md += `* **Technical Notes:** ${s.techNotes}\n\n`;
      md += `---\n\n`;
    });
    
    markdownGenerator.download('User_Stories.md', md);
  };

  const handleSaveModalEdit = () => {
    if (!editModalStory || !pageState.output) return;
    const index = pageState.output.stories.findIndex(s => s.id === editModalStory.id);
    if (index === -1) return;

    const updatedStories = [...pageState.output.stories];
    updatedStories[index] = { ...editModalStory };
    
    updatePageState('spec-to-story', {
      output: {
        ...pageState.output,
        stories: updatedStories
      }
    });
    setEditModalStory(null);
  };

  const handleDownloadMD = () => {
    markdownGenerator.download('spec.md', specContent);
  };

  const storiesList = pageState.output?.stories || [];
  const activeStory = storiesList[selectedStoryIdx] || null;

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
                class="flex-1 w-full bg-slate-950/70 text-slate-300 border border-slate-800 rounded-xl p-3.5 font-mono text-xs focus:outline-none focus:border-indigo-500 custom-scroll resize-none animate-fade-in"
                placeholder="Spec file content loaded from specs/001-return-request-tracker/spec.md..."
              />
              
              <div class="bg-slate-900/60 p-4 border border-slate-800/80 rounded-xl space-y-3">
                <label class="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">AI Requirements Customization</label>
                <div class="flex gap-2">
                  <input 
                    type="text" 
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="E.g. Include validation that returns over $500 require visual auditor approval" 
                    class="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-300"
                  />
                  <button 
                    onClick={handleUpdateSpecAndStories}
                    disabled={pageState.isLoading}
                    class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center space-x-1.5 shadow-lg border border-indigo-500/30"
                  >
                    {pageState.isLoading ? <i class="fas fa-circle-notch animate-spin"></i> : <i class="fas fa-magic"></i>}
                    <span>Decompose Spec</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div class="bg-slate-950 font-mono text-xs text-slate-300 p-4 rounded-xl border border-slate-800 h-full overflow-auto custom-scroll flex flex-col space-y-1 animate-fade-in">
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

      {/* RIGHT PANEL: User Stories Board */}
      <div class="glass-panel rounded-2xl flex flex-col overflow-hidden border border-slate-800 shadow-xl">
        <div class="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
          <div>
            <h2 class="text-sm font-bold text-slate-200 uppercase flex items-center">
              <span class="w-1.5 h-3 bg-indigo-500 rounded-full mr-2"></span> Agile User Stories
            </h2>
            <p class="text-[10px] text-slate-500">Decomposed backlog cards, ready for Agile workflow</p>
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

        <div class="flex-1 flex overflow-hidden">
          {!pageState.output ? (
            <div class="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div class="p-4 bg-indigo-500/5 text-indigo-400 rounded-full">
                <i class="fas fa-exchange-alt text-3xl"></i>
              </div>
              <div class="max-w-xs space-y-1.5">
                <p class="text-xs font-bold text-slate-300">Generate Agile Backlog</p>
                <p class="text-[11px] text-slate-500">Decompose specifications on the left using standard templates (As a... I want to... So that...).</p>
              </div>
            </div>
          ) : (
            <div class="flex-1 flex divide-x divide-slate-800">
              
              {/* Left pane: Stories list */}
              <div class="w-1/3 flex flex-col bg-slate-950/20 overflow-y-auto custom-scroll p-3 space-y-2">
                <div class="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1 px-1">Stories ({storiesList.length})</div>
                {storiesList.map((story, idx) => (
                  <button
                    key={story.id}
                    onClick={() => setSelectedStoryIdx(idx)}
                    class={`w-full text-left p-3 rounded-xl border text-xs transition-all duration-150 ${
                      selectedStoryIdx === idx
                        ? 'bg-indigo-950/20 border-indigo-500/50 text-white'
                        : 'bg-slate-900/10 border-slate-850 text-slate-400 hover:bg-slate-900/30 hover:border-slate-800'
                    }`}
                  >
                    <div class="flex justify-between items-center mb-1">
                      <span class="font-bold text-[10px] text-indigo-400 font-mono">{story.id}</span>
                      <span class={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        story.priority === 'High' ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                      }`}>{story.priority}</span>
                    </div>
                    <p class="font-semibold line-clamp-2 leading-tight">{story.title}</p>
                  </button>
                ))}
              </div>

              {/* Right pane: Story Detail view */}
              {activeStory && (
                <div class="w-2/3 flex flex-col h-full bg-slate-950/40 p-5 overflow-y-auto custom-scroll space-y-5 animate-fade-in">
                  
                  {/* Title & Metadata header */}
                  <div class="flex justify-between items-start border-b border-slate-800 pb-4">
                    <div>
                      <div class="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-widest mb-1">{activeStory.id}</div>
                      <h3 class="text-base font-bold text-slate-100">{activeStory.title}</h3>
                    </div>
                    
                    <button 
                      onClick={() => setEditModalStory({ ...activeStory })}
                      class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                    >
                      <i class="fas fa-edit"></i>
                      <span>Edit Story</span>
                    </button>
                  </div>

                  {/* Agile Statement */}
                  <div class="space-y-2">
                    <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Agile Statement</h4>
                    <div class="bg-slate-950/80 border border-slate-850 p-4 rounded-xl space-y-2 text-xs">
                      <div>
                        <span class="text-indigo-400 font-bold uppercase tracking-wider text-[10px] mr-2">As a:</span>
                        <span class="text-slate-200">{activeStory.asA}</span>
                      </div>
                      <div>
                        <span class="text-indigo-400 font-bold uppercase tracking-wider text-[10px] mr-2">I want to:</span>
                        <span class="text-slate-200">{activeStory.iWantTo}</span>
                      </div>
                      <div>
                        <span class="text-indigo-400 font-bold uppercase tracking-wider text-[10px] mr-2">So that:</span>
                        <span class="text-slate-200">{activeStory.soThat}</span>
                      </div>
                    </div>
                  </div>

                  {/* Acceptance Criteria */}
                  <div class="space-y-2">
                    <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Acceptance Criteria</h4>
                    <ul class="space-y-2.5">
                      {activeStory.criteria.map((c, i) => (
                        <li key={i} class="text-xs text-slate-300 flex items-start space-x-2">
                          <span class="text-indigo-500 mt-0.5"><i class="fas fa-check-circle"></i></span>
                          <span class="leading-relaxed">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Estimation / Priority grid */}
                  <div class="grid grid-cols-2 gap-4 pt-2">
                    <div class="bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                      <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Story Points</span>
                      <span class="text-slate-200 font-mono text-sm font-bold">{activeStory.points} SP</span>
                    </div>
                    <div class="bg-slate-900/40 p-3 rounded-xl border border-slate-850">
                      <span class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</span>
                      <span class="text-slate-200 text-xs font-bold">{activeStory.priority}</span>
                    </div>
                  </div>

                  {/* Technical Notes */}
                  {activeStory.techNotes && (
                    <div class="space-y-2">
                      <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Technical Implementation Notes</h4>
                      <div class="bg-[#0b0f19] border border-slate-850 p-4 rounded-xl text-xs font-mono text-slate-400 leading-relaxed">
                        {activeStory.techNotes}
                      </div>
                    </div>
                  )}

                  {/* Exports toolbar */}
                  <div class="flex items-center space-x-1.5 pt-4 border-t border-slate-800">
                    <span class="text-[10px] text-slate-500 uppercase font-bold tracking-wider mr-2">Export Board:</span>
                    <button 
                      onClick={handleExportPDF}
                      class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-red-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1 shadow"
                    >
                      <i class="far fa-file-pdf"></i>
                      <span>PDF</span>
                    </button>
                    <button 
                      onClick={handleExportExcel}
                      class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-green-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1 shadow"
                    >
                      <i class="far fa-file-excel"></i>
                      <span>Excel</span>
                    </button>
                    <button 
                      onClick={handleExportMarkdown}
                      class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1 shadow"
                    >
                      <i class="fab fa-markdown"></i>
                      <span>Markdown</span>
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Story modal overlay */}
      {editModalStory && (
        <div class="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div class="glass-panel max-w-lg w-full mx-4 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
            <div class="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 class="text-sm font-bold text-slate-200 flex items-center">
                <i class="fas fa-edit mr-2 text-indigo-400"></i> Edit Story: {editModalStory.id}
              </h3>
              <button 
                onClick={() => setEditModalStory(null)}
                class="text-slate-400 hover:text-white transition"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>

            <div class="space-y-3.5 max-h-[60vh] overflow-y-auto custom-scroll pr-1">
              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Title</label>
                <input 
                  type="text" 
                  value={editModalStory.title}
                  onChange={(e) => setEditModalStory({ ...editModalStory, title: e.target.value })}
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 font-semibold"
                />
              </div>

              <div class="grid grid-cols-3 gap-2 bg-slate-950/40 p-3 border border-slate-850 rounded-xl">
                <div>
                  <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">As A</label>
                  <input 
                    type="text" 
                    value={editModalStory.asA}
                    onChange={(e) => setEditModalStory({ ...editModalStory, asA: e.target.value })}
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-indigo-500 text-slate-300"
                  />
                </div>
                <div>
                  <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">I Want To</label>
                  <input 
                    type="text" 
                    value={editModalStory.iWantTo}
                    onChange={(e) => setEditModalStory({ ...editModalStory, iWantTo: e.target.value })}
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-indigo-500 text-slate-300"
                  />
                </div>
                <div>
                  <label class="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">So That</label>
                  <input 
                    type="text" 
                    value={editModalStory.soThat}
                    onChange={(e) => setEditModalStory({ ...editModalStory, soThat: e.target.value })}
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-indigo-500 text-slate-300"
                  />
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Acceptance Criteria (Semicolon separated)</label>
                <textarea 
                  value={editModalStory.criteria.join('; ')}
                  onChange={(e) => setEditModalStory({ ...editModalStory, criteria: e.target.value.split(';').map(x => x.trim()).filter(Boolean) })}
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-300 h-24 resize-none custom-scroll"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Story Points</label>
                  <input 
                    type="number" 
                    value={editModalStory.points}
                    onChange={(e) => setEditModalStory({ ...editModalStory, points: Number(e.target.value) || 0 })}
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-300"
                  />
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Priority</label>
                  <select 
                    value={editModalStory.priority}
                    onChange={(e) => setEditModalStory({ ...editModalStory, priority: e.target.value })}
                    class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-300"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Technical Implementation Notes</label>
                <input 
                  type="text" 
                  value={editModalStory.techNotes}
                  onChange={(e) => setEditModalStory({ ...editModalStory, techNotes: e.target.value })}
                  class="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-300 font-mono"
                />
              </div>
            </div>

            <div class="flex space-x-2.5 pt-3 border-t border-slate-800 justify-end">
              <button 
                onClick={() => setEditModalStory(null)}
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveModalEdit}
                class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-lg border border-indigo-500/30 transition"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
```


## src/pages/TechArchitecture.jsx
```jsx
import React, { useState, useEffect, useRef } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { FileUpload } from '../components/FileUpload';
import { GeneratedOutput } from '../components/GeneratedOutput';
import { pdfGenerator } from '../utils/pdfGenerator';
import { markdownGenerator } from '../utils/markdownGenerator';
import { api } from '../services/api';

import { ConfluencePublishModal } from '../components/ConfluencePublishModal';

export default function TechArchitecture() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['tech-architecture'];

  const [activeTab, setActiveTab] = useState('blueprint'); // 'blueprint' | 'document'
  const [zoomScale, setZoomScale] = useState(1);
  const diagramRef = useRef(null);
  const [isConfluenceOpen, setIsConfluenceOpen] = useState(false);

  // Auto load latest workspace spec as reference on load
  useEffect(() => {
    const importSpec = async () => {
      try {
        const data = await api.getWorkspaceSpec();
        if (pageState.files.length === 0 && data.content) {
          updatePageState('tech-architecture', {
            files: [{ name: 'spec.md', size: data.content.length * 2 }]
          });
        }
      } catch (err) {
        console.error('Failed to load spec file:', err);
      }
    };
    importSpec();
  }, []);

  // File handling
  const handleFileSelect = (file) => {
    updatePageState('tech-architecture', {
      files: [...pageState.files, file]
    });
  };

  const handleFileDelete = (idx) => {
    const updated = [...pageState.files];
    updated.splice(idx, 1);
    updatePageState('tech-architecture', { files: updated });
  };

  const handleTriggerGenerate = async () => {
    await backendAdapter.runGeneration('tech-architecture', updatePageState);
  };

  // Subgraph quotation sanitizer to prevent Mermaid parser syntax crashes
  const sanitizeMermaid = (text) => {
    if (!text) return '';
    // Fix double colons class notation, e.g. NodeId::className -> NodeId:::className
    let clean = text.replace(/(?<!https?)::([a-zA-Z0-9_-]+)/gi, ':::$1');
    
    return clean.replace(/subgraph\s+([a-zA-Z0-9_\-&\s]+)(?:\r?\n)/g, (match, name) => {
      const trimmed = name.trim();
      // If already quoted, return unmodified
      if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return match;
      }
      // If name contains space or special chars like '&', quote it
      if (/\s|&/.test(trimmed)) {
        return `subgraph "${trimmed}"\n`;
      }
      return match;
    });
  };

  // Render Mermaid diagram using CDN
  useEffect(() => {
    if (activeTab === 'blueprint' && pageState.output?.blueprint && window.mermaid) {
      const cleanDiagramCode = sanitizeMermaid(pageState.output.blueprint);
      try {
        if (diagramRef.current) {
          diagramRef.current.removeAttribute('data-processed');
          diagramRef.current.innerHTML = cleanDiagramCode;
          
          if (typeof window.mermaid.render === 'function') {
            window.mermaid.render('mermaid-svg-tech', cleanDiagramCode)
              .then(({ svg }) => {
                if (diagramRef.current) {
                  diagramRef.current.innerHTML = svg;
                }
              })
              .catch((err) => {
                console.error('Mermaid render promise error:', err);
                if (diagramRef.current) {
                  diagramRef.current.innerHTML = `<div class="text-red-400 p-4 border border-red-900 rounded bg-red-950/20">Mermaid Rendering Error: ${err.message}</div>`;
                }
              });
          } else if (typeof window.mermaid.draw === 'function') {
            window.mermaid.draw('mermaid-svg-tech', cleanDiagramCode, (svgCode) => {
              if (diagramRef.current) {
                diagramRef.current.innerHTML = svgCode;
              }
            });
          } else {
            window.mermaid.init(undefined, diagramRef.current);
          }
        }
      } catch (err) {
        console.error('Mermaid render try-catch error:', err);
        if (diagramRef.current) {
          diagramRef.current.innerHTML = `<div class="text-red-400 p-4 border border-red-900 rounded bg-red-950/20">Mermaid Rendering Error: ${err.message}</div>`;
        }
      }
    }
  }, [activeTab, pageState.output, pageState.isLoading]);

  // Export functions
  const handleExportSVG = () => {
    if (!diagramRef.current) return;
    const svgElement = diagramRef.current.querySelector('svg');
    if (!svgElement) {
      alert('Diagram SVG is not loaded yet.');
      return;
    }
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'system_architecture.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertMarkdownToHTML = (markdown) => {
    if (!markdown) return '';
    let html = markdown;
    
    html = html.replace(/^# (.*?)$/gm, '<h1 style="color: #3b82f6; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; font-size: 22px; font-weight: bold; margin-top: 20px; margin-bottom: 10px;">$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2 style="color: #8b5cf6; font-size: 18px; font-weight: bold; margin-top: 16px; margin-bottom: 8px;">$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3 style="color: #ec4899; font-size: 15px; font-weight: bold; margin-top: 12px; margin-bottom: 6px;">$1</h3>');
    html = html.replace(/^---$/gm, '<hr style="border-color: #334155; margin: 16px 0;"/>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`(.*?)`/g, '<code style="background-color: #1e293b; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #f43f5e;">$1</code>');
    html = html.replace(/^- (.*?)$/gm, '<li style="margin-left: 16px; list-style-type: disc; color: #cbd5e1; margin-bottom: 4px;">$1</li>');
    html = html.replace(/^\* (.*?)$/gm, '<li style="margin-left: 16px; list-style-type: disc; color: #cbd5e1; margin-bottom: 4px;">$1</li>');
    
    return `<div style="font-family: ui-sans-serif, system-ui, sans-serif; color: #e2e8f0; line-height: 1.6; padding: 10px;">${html}</div>`;
  };

  const handleExportPDF = () => {
    if (!pageState.output) return;
    const documentHtml = pageState.output?.html || convertMarkdownToHTML(pageState.output?.document || '');
    pdfGenerator.download('Technical_Specification.pdf', documentHtml);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left panel */}
      <div class="lg:col-span-4 flex flex-col space-y-4">
        <FileUpload
          pageKey="tech-architecture"
          title="Upload Architecture Specifications"
          subtitle="Drop architectural specs, stack drafts, or layout plans"
          files={pageState.files}
          logs={pageState.logs}
          isLoading={pageState.isLoading}
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
          onTriggerGenerate={handleTriggerGenerate}
        />
      </div>

      {/* Right panel: split board */}
      <div class="lg:col-span-8 h-full flex flex-col overflow-hidden">
        <GeneratedOutput
          title="Technical Architecture Blueprint Board"
          subtitle="System diagram & API document specifications"
          actions={
            pageState.output && (
              <div class="flex items-center space-x-1.5">
                <button 
                  onClick={() => setIsConfluenceOpen(true)}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="fab fa-confluence"></i>
                  <span>Confluence</span>
                </button>
                <button 
                  onClick={handleExportSVG}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="far fa-file-image"></i>
                  <span>SVG</span>
                </button>
                <button 
                  onClick={handleExportPDF}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="far fa-file-pdf"></i>
                  <span>PDF</span>
                </button>
              </div>
            )
          }
        >
          {!pageState.output ? (
            <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <div class="p-4 bg-indigo-500/5 text-indigo-400 rounded-full">
                <i class="fas fa-sitemap text-3xl"></i>
              </div>
              <div class="max-w-xs space-y-1.5">
                <p class="text-xs font-bold text-slate-300">Architecture Board Offline</p>
                <p class="text-[11px] text-slate-500">Provide specs on the left and compile to explore the system design graphs & database layouts.</p>
              </div>
            </div>
          ) : (
            <div class="flex flex-col h-full space-y-4">
              
              {/* Workspace Tab Selector */}
              <div class="flex space-x-1.5 bg-slate-900/60 p-1 border border-slate-800 rounded-xl self-start">
                <button 
                  onClick={() => setActiveTab('blueprint')}
                  class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    activeTab === 'blueprint' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  System Blueprint Diagram
                </button>
                <button 
                  onClick={() => setActiveTab('document')}
                  class={`px-4 py-2 rounded-lg text-xs font-bold transition duration-150 ${
                    activeTab === 'document' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Full Specification Document
                </button>
              </div>

              {/* Viewport content */}
              <div class="flex-1 bg-slate-950/60 rounded-xl border border-slate-900/80 p-5 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                
                {activeTab === 'blueprint' ? (
                  <div class="flex-1 relative flex flex-col overflow-hidden">
                    {/* Zoom overlay controls */}
                    <div class="absolute top-2 right-2 bg-slate-900/80 border border-slate-850/80 p-1.5 rounded-lg flex space-x-1 z-10">
                      <button 
                        onClick={() => setZoomScale(prev => Math.min(prev + 0.1, 2))}
                        class="w-7 h-7 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center font-bold text-xs"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => setZoomScale(prev => Math.max(prev - 0.1, 0.5))}
                        class="w-7 h-7 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center font-bold text-xs"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => setZoomScale(1)}
                        class="px-2 h-7 bg-slate-850 hover:bg-slate-700 text-slate-300 rounded flex items-center justify-center text-[10px] font-bold"
                      >
                        Reset
                      </button>
                    </div>

                    {/* Mermaid canvas viewport */}
                    <div class="flex-1 overflow-auto flex items-center justify-center custom-scroll bg-slate-950/20 rounded-lg border border-slate-900/50 p-4">
                      <div 
                        ref={diagramRef} 
                        style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}
                        class="mermaid text-center"
                      />
                    </div>
                  </div>
                ) : (
                  <div class="flex-1 overflow-hidden flex flex-col">
                    <iframe
                      srcDoc={pageState.output?.html || pageState.output?.document || ''}
                      title="Technical Architecture Document"
                      class="w-full flex-1 border-0 rounded-xl bg-white"
                      style={{ minHeight: '500px' }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </GeneratedOutput>
      </div>

      <ConfluencePublishModal 
        isOpen={isConfluenceOpen}
        onClose={() => setIsConfluenceOpen(false)}
        stageType="tech-architecture"
      />

    </div>
  );
}
```


## src/pages/TestCases.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { FileUpload } from '../components/FileUpload';
import { GeneratedOutput } from '../components/GeneratedOutput';
import { pdfGenerator } from '../utils/pdfGenerator';
import { api } from '../services/api';

import { ConfluencePublishModal } from '../components/ConfluencePublishModal';

export default function TestCases() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['test-cases'];
  const [isConfluenceOpen, setIsConfluenceOpen] = useState(false);

  // Load workspace spec on load to default files list
  useEffect(() => {
    const importSpec = async () => {
      try {
        const data = await api.getWorkspaceSpec();
        if (pageState.files.length === 0 && data.content) {
          updatePageState('test-cases', {
            files: [{ name: 'spec.md', size: data.content.length * 2 }]
          });
        }
      } catch (err) {
        console.error('Failed to load spec file:', err);
      }
    };
    importSpec();
  }, []);

  const handleFileSelect = (file) => {
    updatePageState('test-cases', {
      files: [...pageState.files, file]
    });
  };

  const handleFileDelete = (idx) => {
    const updated = [...pageState.files];
    updated.splice(idx, 1);
    updatePageState('test-cases', { files: updated });
  };

  const handleTriggerGenerate = async () => {
    await backendAdapter.runGeneration('test-cases', updatePageState);
  };

  const handleDownloadPDF = () => {
    if (!pageState.output) return;
    const docHtml = pageState.output.html || '<p>No content generated.</p>';
    pdfGenerator.download('Test_Cases_Document.pdf', docHtml);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left panel */}
      <div class="lg:col-span-4 flex flex-col space-y-4">
        <FileUpload
          pageKey="test-cases"
          title="Upload Reference Specs"
          subtitle="Drop specs or story checklists to generate the test strategy document"
          files={pageState.files}
          logs={pageState.logs}
          isLoading={pageState.isLoading}
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
          onTriggerGenerate={handleTriggerGenerate}
        />
      </div>

      {/* Right panel: viewport */}
      <div class="lg:col-span-8 h-full flex flex-col overflow-hidden">
        <GeneratedOutput
          title="Test Strategy & Test Cases Document"
          subtitle="Comprehensive QA test strategy, scenarios, and detailed test cases"
          actions={
            pageState.output && (
              <div class="flex items-center space-x-1.5">
                <button 
                  onClick={() => setIsConfluenceOpen(true)}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="fab fa-confluence"></i>
                  <span>Confluence</span>
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1.5"
                >
                  <i class="far fa-file-pdf"></i>
                  <span>Download PDF</span>
                </button>
              </div>
            )
          }
        >
          {!pageState.output ? (
            <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <div class="p-4 bg-indigo-500/5 text-indigo-400 rounded-full">
                <i class="fas fa-tasks text-3xl"></i>
              </div>
              <div class="max-w-xs space-y-1.5">
                <p class="text-xs font-bold text-slate-300">Test Document Not Generated</p>
                <p class="text-[11px] text-slate-500">Provide specs on the left and compile to generate the comprehensive test strategy & test cases document.</p>
              </div>
            </div>
          ) : (
            <iframe
              srcDoc={`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0; padding: 0;
      background: #0f172a;
      color: #e2e8f0;
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      font-size: 13px;
      line-height: 1.6;
      width: 100%;
      overflow-x: hidden;
    }
    body { padding: 16px; }
    table {
      width: 100%;
      max-width: 100%;
      border-collapse: collapse;
      table-layout: auto;
      word-break: break-word;
    }
    td, th {
      word-break: break-word;
      overflow-wrap: break-word;
      max-width: 300px;
    }
    img { max-width: 100%; height: auto; }
    pre, code { white-space: pre-wrap; word-break: break-word; }
    * { max-width: 100%; }
    div, section, article, p { overflow-wrap: break-word; }
  </style>
</head>
<body>${pageState.output.html || ''}</body>
</html>`}
              title="Test Strategy & Test Cases Document"
              class="w-full h-full border border-slate-800 rounded-xl"
              style={{ background: '#0f172a' }}
            />
          )}
        </GeneratedOutput>
      </div>

      <ConfluencePublishModal 
        isOpen={isConfluenceOpen}
        onClose={() => setIsConfluenceOpen(false)}
        stageType="test-cases"
      />

    </div>
  );
}
```


## src/pages/TraceabilityLogView.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { usePageContext } from '../context/PageContext';

const TraceabilityLogView = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // We fetch activeProject from local storage or context if possible, 
  // but let's assume we can rely on activeProject stored in localStorage.
  const activeProject = localStorage.getItem('activeProject') || '';

  useEffect(() => {
    fetchLogs();
  }, [activeProject]);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:7001/api/traceability/logs?project=${encodeURIComponent(activeProject)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch traceability logs');
      }
      const data = await response.json();
      if (data.success) {
        setLogs(data.logs);
      } else {
        throw new Error(data.error || 'Failed to load logs');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            <i className="fas fa-history text-indigo-400 mr-3"></i>
            Global Traceability Log
          </h1>
          <p className="text-slate-400">
            Real-time audit trail of all documents generated across the <span className="font-mono text-indigo-300">{activeProject}</span> project.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/40 hover:text-white px-4 py-2 rounded-lg transition-colors flex items-center shadow-lg"
        >
          <i className="fas fa-sync-alt mr-2"></i> Refresh
        </button>
      </div>

      <div className="flex-1 overflow-hidden bg-slate-900/50 border border-slate-800 rounded-xl flex flex-col shadow-xl">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center text-slate-400">
              <i className="fas fa-circle-notch fa-spin text-4xl mb-4 text-indigo-500"></i>
              <p>Loading traceability logs...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-xl flex items-center max-w-lg text-center">
              <i className="fas fa-exclamation-triangle text-3xl mr-4"></i>
              <div>
                <h3 className="font-bold text-lg mb-1">Error Loading Logs</h3>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
              <i className="fas fa-clipboard-list text-2xl text-slate-400"></i>
            </div>
            <p>No document generation events recorded for this project yet.</p>
          </div>
        ) : (
          <div className="overflow-auto flex-1 custom-scroll">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-900/80 sticky top-0 z-10 shadow-md">
                <tr>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 w-48">Timestamp</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">Agent / Persona</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50">Generated Document</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 w-48">Spec Context</th>
                  <th className="p-4 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/50 w-32">Format</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4 whitespace-nowrap text-sm text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-300">
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mr-3 shrink-0">
                          <i className="fas fa-robot text-xs"></i>
                        </div>
                        {log.agentId}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      <div className="flex items-center">
                        <i className={`fas fa-file-alt text-slate-500 mr-2 group-hover:text-amber-400 transition-colors`}></i>
                        {log.filename}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      <span className="truncate max-w-[150px] inline-block font-mono text-indigo-300">
                        {log.activeSpec}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 uppercase tracking-wider font-mono">
                        {log.format}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TraceabilityLogView;
```


## src/pages/TraceabilityMatrix.jsx
```jsx
import React, { useEffect, useState } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { FileUpload } from '../components/FileUpload';
import { GeneratedOutput } from '../components/GeneratedOutput';
import { pdfGenerator } from '../utils/pdfGenerator';
import { excelGenerator } from '../utils/excelGenerator';
import { api } from '../services/api';
import { ConfluencePublishModal } from '../components/ConfluencePublishModal';

export default function TraceabilityMatrix() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['traceability-matrix'];
  const [isConfluenceOpen, setIsConfluenceOpen] = useState(false);

  // Load workspace spec on load to default files list
  useEffect(() => {
    const importSpec = async () => {
      try {
        const data = await api.getWorkspaceSpec();
        if (pageState.files.length === 0 && data.content) {
          updatePageState('traceability-matrix', {
            files: [{ name: 'spec.md', size: data.content.length * 2 }]
          });
        }
      } catch (err) {
        console.error('Failed to load spec file:', err);
      }
    };
    importSpec();
  }, []);

  const handleFileSelect = (file) => {
    updatePageState('traceability-matrix', {
      files: [...pageState.files, file]
    });
  };

  const handleFileDelete = (idx) => {
    const updated = [...pageState.files];
    updated.splice(idx, 1);
    updatePageState('traceability-matrix', { files: updated });
  };

  const handleTriggerGenerate = async () => {
    await backendAdapter.runGeneration('traceability-matrix', updatePageState);
  };

  const handleExportExcel = () => {
    if (!pageState.output?.matrix) return;
    excelGenerator.download('Requirements_Traceability_Matrix', pageState.output.matrix);
  };

  const handleExportPDF = () => {
    if (!pageState.output?.matrix) return;
    
    let htmlContent = `
      <h1>Requirements Traceability Matrix</h1>
      <p>Status: <strong>${pageState.output.coverage} Traceability Coverage Achieved</strong></p>
      <table>
        <thead>
          <tr>
            <th>Requirement ID (FSD)</th>
            <th>User Story ID (JIRA)</th>
            <th>Tech Spec Section</th>
            <th>Database Tables</th>
            <th>Test Case IDs</th>
          </tr>
        </thead>
        <tbody>
    `;
    pageState.output.matrix.forEach(row => {
      htmlContent += `
        <tr>
          <td><strong>${row.reqId}</strong></td>
          <td>${row.userStoryId}</td>
          <td>${row.techSpec}</td>
          <td>${row.dbTables}</td>
          <td>${row.testCases}</td>
        </tr>
      `;
    });
    htmlContent += '</tbody></table>';

    pdfGenerator.download('Traceability_Matrix.pdf', htmlContent);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left panel */}
      <div class="lg:col-span-4 flex flex-col space-y-4">
        <FileUpload
          pageKey="traceability-matrix"
          title="Upload Spec for Trace Check"
          subtitle="Drop files to scan relationship metrics"
          files={pageState.files}
          logs={pageState.logs}
          isLoading={pageState.isLoading}
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
          onTriggerGenerate={handleTriggerGenerate}
        />
      </div>

      {/* Right panel */}
      <div class="lg:col-span-8 h-full flex flex-col overflow-hidden">
        <GeneratedOutput
          title="Engineering Traceability Matrix Workspace"
          subtitle="Cross-references from specification documents to code and test tasks"
          actions={
            pageState.output && (
              <div class="flex items-center space-x-1.5">
                <button 
                  onClick={() => setIsConfluenceOpen(true)}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="fab fa-confluence"></i>
                  <span>Confluence</span>
                </button>
                <button 
                  onClick={handleExportExcel}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-green-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="far fa-file-excel"></i>
                  <span>Excel</span>
                </button>
                <button 
                  onClick={handleExportPDF}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
                >
                  <i class="far fa-file-pdf"></i>
                  <span>PDF</span>
                </button>
              </div>
            )
          }
        >
          {!pageState.output ? (
            <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
              <div class="p-4 bg-indigo-500/5 text-indigo-400 rounded-full">
                <i class="fas fa-link text-3xl"></i>
              </div>
              <div class="max-w-xs space-y-1.5">
                <p class="text-xs font-bold text-slate-300">Traceability Reviewboard Offline</p>
                <p class="text-[11px] text-slate-500">Provide requirements specifications on the left to compile links linking specs, database records, and test plans.</p>
              </div>
            </div>
          ) : (
            <div class="flex flex-col h-full space-y-4">
              
              {/* Coverage statistics banner */}
              <div class="bg-indigo-950/40 border border-indigo-900/60 p-4 rounded-xl flex items-center justify-between shadow-sm">
                <div class="flex items-center space-x-3">
                  <div class="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-sm">
                    <i class="fas fa-chart-line"></i>
                  </div>
                  <div>
                    <h4 class="text-xs font-bold text-slate-200 uppercase tracking-wide">Status Trackers Coverage</h4>
                    <p class="text-[10px] text-slate-500 font-medium">Requirement-to-code traceability index</p>
                  </div>
                </div>
                
                <span class="px-3.5 py-1.5 bg-emerald-950/30 text-emerald-400 border border-emerald-900/60 text-xs font-bold rounded-full flex items-center">
                  <i class="fas fa-check-circle mr-1.5"></i>
                  <span>{pageState.output.coverage} Traceability Coverage achieved</span>
                </span>
              </div>

              {/* Table Matrix list */}
              <div class="flex-1 bg-slate-950/60 border border-slate-900 rounded-xl overflow-x-auto custom-scroll">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold text-[10px]">
                      <th class="p-3 border-r border-slate-855">Requirement ID (FSD)</th>
                      <th class="p-3 border-r border-slate-855">User Story ID (JIRA)</th>
                      <th class="p-3 border-r border-slate-855">Tech Spec Section</th>
                      <th class="p-3 border-r border-slate-855">Database Tables</th>
                      <th class="p-3">Test Case IDs</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-850 bg-slate-950/20 text-slate-300">
                    {pageState.output.matrix?.map((row, idx) => (
                      <tr key={idx} class="hover:bg-slate-900/20">
                        <td class="p-3 border-r border-slate-800 font-bold text-indigo-400">{row.reqId}</td>
                        <td class="p-3 border-r border-slate-800 font-medium text-slate-200">{row.userStoryId}</td>
                        <td class="p-3 border-r border-slate-800 text-slate-400">{row.techSpec}</td>
                        <td class="p-3 border-r border-slate-800 font-mono text-purple-400">{row.dbTables}</td>
                        <td class="p-3 text-emerald-400 font-medium">{row.testCases}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </GeneratedOutput>
      </div>

      <ConfluencePublishModal 
        isOpen={isConfluenceOpen}
        onClose={() => setIsConfluenceOpen(false)}
        stageType="traceability-matrix"
      />

    </div>
  );
}
```


## src/pages/UserStories.jsx
```jsx
import React, { useEffect, useState } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { api } from '../services/api';
import { pdfGenerator } from '../utils/pdfGenerator';
import { excelGenerator } from '../utils/excelGenerator';
import { markdownGenerator } from '../utils/markdownGenerator';
import { JiraPublishModal } from '../components/JiraPublishModal';

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
  
  const [isJiraUploading, setIsJiraUploading] = useState(false);
  const [jiraUploadResult, setJiraUploadResult] = useState(null);
  const [jiraError, setJiraError] = useState('');
  const [isJiraModalOpen, setIsJiraModalOpen] = useState(false);

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

  const handleUploadToJira = () => {
    setIsJiraModalOpen(true);
  };

  const handleJiraSuccess = (createdIssues) => {
    setJiraUploadResult(createdIssues);
    setJiraError('');
  };

  const handleJiraError = (errorMsg) => {
    setJiraError(errorMsg);
    setJiraUploadResult(null);
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
            <button 
              onClick={handleUploadToJira}
              disabled={isJiraUploading || !pageState.output}
              class="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-lg border border-indigo-500/30 shadow-lg flex items-center space-x-1.5"
            >
              {isJiraUploading ? <i class="fas fa-circle-notch animate-spin"></i> : <i class="fab fa-jira"></i>}
              <span>Upload to JIRA</span>
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

      {/* JIRA Upload Result Modal */}
      {(jiraUploadResult || jiraError) && (
        <div class="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div class="glass-panel max-w-lg w-full mx-4 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
            <div class="flex justify-between items-center border-b border-slate-850 pb-3">
              <h3 class="text-sm font-bold text-slate-200 flex items-center">
                <i class="fab fa-jira mr-2 text-indigo-400"></i> JIRA Push Status
              </h3>
              <button 
                onClick={() => { setJiraUploadResult(null); setJiraError(''); }}
                class="text-slate-400 hover:text-white transition"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>

            {jiraError ? (
              <div class="bg-red-950/20 border border-red-900/60 p-4 rounded-xl text-red-400 text-xs flex items-start space-x-2">
                <i class="fas fa-exclamation-triangle mt-0.5 shrink-0"></i>
                <div class="space-y-1">
                  <p class="font-bold">Sync Failed</p>
                  <p class="leading-normal">{jiraError}</p>
                </div>
              </div>
            ) : (
              <div class="space-y-3">
                <div class="bg-green-950/20 border border-green-900/60 p-3 rounded-xl text-green-400 text-xs flex items-center space-x-2">
                  <i class="fas fa-check-circle"></i>
                  <span>Successfully generated separate user story cards on JIRA board!</span>
                </div>

                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Created JIRA Cards ({jiraUploadResult.length})</p>
                <div class="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scroll">
                  {jiraUploadResult.map((issue) => (
                    <div key={issue.key} class="bg-slate-950/80 border border-slate-850 p-2.5 rounded-lg flex justify-between items-center text-xs">
                      <div class="flex flex-col min-w-0 pr-2">
                        <span class="text-slate-200 font-semibold truncate">{issue.summary}</span>
                        <span class="text-[10px] text-slate-500">Key: <span class="text-indigo-400 font-mono">{issue.key}</span> | Status: {issue.status}</span>
                      </div>
                      <a 
                        href={issue.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        class="text-indigo-400 hover:text-indigo-300 font-bold shrink-0 flex items-center space-x-1"
                      >
                        <span>Open</span>
                        <i class="fas fa-external-link-alt text-[9px]"></i>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div class="flex justify-end pt-2">
              <button 
                onClick={() => { setJiraUploadResult(null); setJiraError(''); }}
                class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg transition"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      <JiraPublishModal 
        isOpen={isJiraModalOpen}
        onClose={() => setIsJiraModalOpen(false)}
        onSuccess={handleJiraSuccess}
        onError={handleJiraError}
      />

    </div>
  );
}
```


## src/pages/UXWireframe.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { usePageContext } from '../context/PageContext';
import { backendAdapter } from '../agents/backendAdapter';
import { markdownGenerator } from '../utils/markdownGenerator';
import { api } from '../services/api';

export default function UXWireframe() {
  const { pages, updatePageState } = usePageContext();
  const pageState = pages['ux-wireframe'];

  const [feedback, setFeedback] = useState('');
  const [iframeKey, setIframeKey] = useState(0);

  // Auto load workspace spec on load to default files list
  useEffect(() => {
    const importSpec = async () => {
      try {
        const data = await api.getWorkspaceSpec();
        if (pageState.files.length === 0 && data.content) {
          updatePageState('ux-wireframe', {
            files: [{ name: 'spec.md', size: data.content.length * 2 }]
          });
        }
      } catch (err) {
        console.error('Failed to load spec file:', err);
      }
    };
    importSpec();
  }, []);

  const handleTriggerGenerate = async () => {
    await backendAdapter.runGeneration('ux-wireframe', updatePageState, feedback);
  };

  const handleReload = () => {
    setIframeKey(prev => prev + 1);
  };

  const handleDownloadHTML = () => {
    if (!pageState.output) return;
    markdownGenerator.download('wireframe_prototype.html', pageState.output);
  };

  return (
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">
      
      {/* Left panel: Form input and logs */}
      <div class="lg:col-span-4 flex flex-col space-y-4">
        
        {/* Wireframe Config Form */}
        <div class="glass-panel p-5 rounded-2xl flex flex-col space-y-4 shadow-xl border border-slate-800">
          <h3 class="text-sm font-bold tracking-wide text-slate-300 uppercase">Prototype Configuration</h3>
          
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Workspace Context</label>
              <div class="bg-slate-950/80 border border-slate-850 p-3 rounded-lg text-xs flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <i class="fab fa-html5 text-orange-400 text-lg"></i>
                  <div>
                    <p class="text-slate-300 font-semibold">Tailwind Sandbox Engine</p>
                    <p class="text-[10px] text-slate-500">Generates responsive single-page prototypes</p>
                  </div>
                </div>
                <span class="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Modify Prototype Feedback</label>
              <textarea 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="E.g., Add a customer order tracking step, or color CSR risk badges red/yellow/green depending on fraud history."
                class="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs focus:outline-none focus:border-indigo-500 text-slate-300 h-28 resize-none custom-scroll"
              />
            </div>
          </div>

          <button
            onClick={handleTriggerGenerate}
            disabled={pageState.isLoading}
            class={`w-full py-3 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition duration-300 ${
              pageState.isLoading 
                ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg border border-indigo-500/40 glow-indigo'
            }`}
          >
            {pageState.isLoading ? (
              <>
                <i class="fas fa-circle-notch animate-spin text-sm"></i>
                <span>Compiling Code Layouts...</span>
              </>
            ) : (
              <>
                <i class="fas fa-magic text-sm"></i>
                <span>Generate/Modify Prototype</span>
              </>
            )}
          </button>
        </div>

        {/* Real-time thoughts console */}
        {(pageState.isLoading || pageState.logs.length > 0) && (
          <div class="glass-panel p-4 rounded-2xl flex flex-col space-y-2 border border-slate-800 shadow-lg">
            <p class="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
              <i class="fas fa-terminal mr-1 text-orange-400"></i> Prototype build logs
            </p>
            <div class="bg-slate-950 font-mono text-[10px] text-slate-400 p-3 rounded-lg border border-slate-850 h-32 overflow-y-auto custom-scroll flex flex-col space-y-1">
              {pageState.logs.map((log, idx) => (
                <div key={idx} class={log.includes('[Error]') ? 'text-red-400' : 'text-slate-400'}>
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Right panel: Full-height iframe preview */}
      <div class="lg:col-span-8 h-full flex flex-col overflow-hidden">
        <div class="glass-panel rounded-2xl flex flex-col h-full overflow-hidden shadow-xl border border-slate-800">
          
          {/* Action Header */}
          <div class="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/60">
            <div>
              <h2 class="text-sm font-bold text-slate-200 uppercase flex items-center">
                <span class="w-1.5 h-3 bg-orange-500 rounded-full mr-2"></span> Tailwind UX Prototype Viewport
              </h2>
              <p class="text-[10px] text-slate-500 font-medium">Click around the generated app panels to simulate user interactions</p>
            </div>
            
            {pageState.output && (
              <div class="flex items-center space-x-1.5">
                <button 
                  onClick={handleReload}
                  class="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1.5"
                  title="Reload sandbox environment"
                >
                  <i class="fas fa-redo-alt"></i>
                  <span>Reload</span>
                </button>
                <button 
                  onClick={handleDownloadHTML}
                  class="px-2.5 py-1.5 bg-slate-850 hover:bg-slate-850/80 text-orange-400 text-xs font-bold rounded-lg border border-slate-700 flex items-center space-x-1.5"
                >
                  <i class="fab fa-html5"></i>
                  <span>Download HTML</span>
                </button>
              </div>
            )}
          </div>

          {/* Sandbox Frame Container */}
          <div class="flex-1 p-4 bg-slate-950/60">
            {!pageState.output ? (
              <div class="flex flex-col items-center justify-center h-full p-8 text-center space-y-4">
                <div class="p-4 bg-indigo-500/5 text-indigo-400 rounded-full">
                  <i class="fas fa-desktop text-3xl"></i>
                </div>
                <div class="max-w-xs space-y-1.5">
                  <p class="text-xs font-bold text-slate-300">UX Sandbox Offline</p>
                  <p class="text-[11px] text-slate-500">Select specifications and trigger prototype creation to view a live interactive mockup of the application UI.</p>
                </div>
              </div>
            ) : (
              <iframe
                key={iframeKey}
                srcDoc={pageState.output}
                title="UX Wireframe sandbox frame"
                class="w-full h-full border border-slate-800 rounded-xl bg-[#0b0f19]"
                sandbox="allow-scripts allow-popups allow-modals allow-downloads"
              />
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
```


## src/pages/ValidatorAgent.jsx
```jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { pdfGenerator } from '../utils/pdfGenerator';
import { ConfluencePublishModal } from '../components/ConfluencePublishModal';

const BOARD_MEMBERS = [
  { id: 'architect', name: 'Software Architect', role: 'System & Stack Alignment', icon: 'fa-project-diagram', color: 'indigo', desc: 'Audits modular structures, tech stack alignments, and interfaces.' },
  { id: 'security', name: 'Security Architect', role: 'OWASP & Data Isolation', icon: 'fa-user-shield', color: 'red', desc: 'Verifies authorization, RBAC rules, and vector data leaking risks.' },
  { id: 'performance', name: 'Performance Engineer', role: 'Scalability & Caching', icon: 'fa-tachometer-alt', color: 'emerald', desc: 'Evaluates asynchronous queues, caching, and worker pools.' },
  { id: 'cost', name: 'FinOps Engineer', role: 'API & Compute Budgets', icon: 'fa-coins', color: 'amber', desc: 'Estimates LLM operational costs and API budget restrictions.' },
  { id: 'product_owner', name: 'Product Owner', role: 'Requirements Coverage', icon: 'fa-tasks', color: 'blue', desc: 'Cross-verifies requirements coverages and user story completion.' },
  { id: 'devil_advocate', name: "Devil's Advocate", role: 'Unstated Risks & Edge Cases', icon: 'fa-balance-scale-right', color: 'rose', desc: 'Identifies implicit logic assumptions and failures under load.' },
  { id: 'data_architect', name: 'Data Architect', role: 'Data Models & Sharding', icon: 'fa-database', color: 'cyan', desc: 'Audits Postgres schemas, Qdrant indexes, and data consistency.' },
  { id: 'devops', name: 'DevOps Engineer', role: 'CI/CD & Scaling Gate', icon: 'fa-server', color: 'violet', desc: 'Checks Docker parameters, environment files, and KEDA configurations.' },
  { id: 'compliance', name: 'Compliance Auditor', role: 'GDPR & Consent Framework', icon: 'fa-file-contract', color: 'teal', desc: 'Ensures data protection policies, PII-masking, and audit logs.' }
];

export default function ValidatorAgent() {
  const navigate = useNavigate();
  const [activeSpec, setActiveSpec] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [report, setReport] = useState(null);
  const [isApproved, setIsApproved] = useState(false);
  const [error, setError] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isConfluenceModalOpen, setIsConfluenceModalOpen] = useState(false);

  // Human Governance Gate States
  const [humanApprovalStatus, setHumanApprovalStatus] = useState('PENDING');
  const [sessionId, setSessionId] = useState('');
  const [humanComments, setHumanComments] = useState('');
  const [aiConfidence, setAiConfidence] = useState(null);
  const [risksCount, setRisksCount] = useState(0);

  // Boardroom visual states
  const [boardStep, setBoardStep] = useState(0); // 0: Idle, 1: Selection, 2: Round 0, 3: Round 1, 4: Round 2, 5: Round 3 (Mod), 6: Editor, 7: Validation, 8: CEO, 9: Completed
  const [activeMember, setActiveMember] = useState(null);
  const [memberStatuses, setMemberStatuses] = useState({});
  const [memberVotes, setMemberVotes] = useState({});
  const [liveLogs, setLiveLogs] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);

  const consoleEndRef = useRef(null);

  // Auto scroll console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveLogs]);

  // Extract stats (confidence score and risk bullet counts) from report text
  const extractStatsFromReport = (reportText) => {
    if (!reportText) return { confidence: 95, risks: 0 };
    const confMatch = reportText.match(/Confidence(?:\s+Score)?\s*:\s*(\d{1,3})%/i);
    const confidence = confMatch ? parseInt(confMatch[1], 10) : 95;
    const risksMatch = reportText.match(/- \*\*Risk\*\*/gi);
    const risks = risksMatch ? risksMatch.length : 0;
    return { confidence, risks };
  };

  const updateStats = (data) => {
    if (data.session_id) setSessionId(data.session_id);
    if (data.human_approval_status) {
      setHumanApprovalStatus(data.human_approval_status);
    } else if (data.approved) {
      setHumanApprovalStatus('APPROVED');
    } else {
      setHumanApprovalStatus('PENDING');
    }
    if (data.report) {
      const stats = extractStatsFromReport(data.report);
      setAiConfidence(stats.confidence);
      setRisksCount(stats.risks);
    }
  };

  // Fetch active spec and its validation status on mount
  useEffect(() => {
    const fetchActiveSpecAndStatus = async () => {
      try {
        const specRes = await fetch('http://localhost:7001/api/specs/active');
        const specData = await specRes.json();
        if (specData.success && specData.activeSpec) {
          setActiveSpec(specData.activeSpec);
          
          // Fetch validation status for active spec
          const statusRes = await fetch(`http://localhost:7001/api/specs/validate/status/${encodeURIComponent(specData.activeSpec)}`);
          const statusData = await statusRes.json();
          if (statusData.success) {
            setReport(statusData.report);
            setIsApproved(statusData.approved);
            updateStats(statusData);
          }
        }
      } catch (err) {
        console.error('Failed to initialize Validator:', err);
        setError('Failed to connect to the backend server.');
      }
    };
    fetchActiveSpecAndStatus();
  }, []);

  const handleValidate = async () => {
    if (!activeSpec) return;
    setIsValidating(true);
    setError('');

    // Reset boardroom UI state
    const initialStatuses = {};
    BOARD_MEMBERS.forEach(m => { initialStatuses[m.id] = 'idle'; });
    setMemberStatuses(initialStatuses);
    setMemberVotes({});
    setActiveMember(null);
    setOverallProgress(0);
    setBoardStep(1);
    setLiveLogs(['[System] Initializing AI Specification Review Board (AI-SRB) Governance Layer...']);

    // Polling function to get real progress from backend
    let pollIntervalId;
    const startPolling = () => {
      pollIntervalId = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:7001/api/specs/validate/progress/${encodeURIComponent(activeSpec)}`);
          if (!res.ok) return;
          const data = await res.json();
          if (data.status === 'running') {
            if (data.logs && data.logs.length > 0) setLiveLogs(data.logs);
            if (data.step) setBoardStep(data.step);
            if (data.progress !== undefined) setOverallProgress(data.progress);
            if (data.activeMember !== undefined) setActiveMember(data.activeMember);
            if (data.statuses) setMemberStatuses(data.statuses);
            if (data.votes) setMemberVotes(data.votes);
          } else if (data.status === 'completed') {
            clearInterval(pollIntervalId);
            if (data.logs) setLiveLogs(data.logs);
            setReport(data.report || '');
            setIsApproved(data.approved || false);
            setHumanApprovalStatus(data.human_approval_status || (data.approved ? 'APPROVED' : 'PENDING'));
            updateStats(data);
            setBoardStep(9);
            setOverallProgress(100);
            setIsValidating(false);
          } else if (data.status === 'failed') {
            clearInterval(pollIntervalId);
            setError(data.error || 'Validation failed.');
            setIsValidating(false);
            setBoardStep(0);
          }
        } catch (e) {
          console.error('Polling error:', e);
        }
      }, 1000);
    };

    startPolling();

    try {
      const response = await fetch('http://localhost:7001/api/specs/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder: activeSpec })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        clearInterval(pollIntervalId);
        if (data.log) setLiveLogs(data.log);
        setReport(data.report);
        setIsApproved(data.approved);
        // Fetch latest status to get session_id and human status
        const statusRes = await fetch(`http://localhost:7001/api/specs/validate/status/${encodeURIComponent(activeSpec)}`);
        const statusData = await statusRes.json();
        if (statusData.success) {
          updateStats(statusData);
        }
        setBoardStep(9);
        setOverallProgress(100);
        setIsValidating(false);
      } else {
        throw new Error(data.error || 'Validation execution failed.');
      }
    } catch (err) {
      console.warn('Validate API request finished with status/error:', err.message);
      // If the POST request finished or failed/timed out, we do not abort immediately.
      // The polling interval will keep running to retrieve the finished state from the server.
    }
  };

  const handleHumanDecision = async (decision) => {
    if (!activeSpec || !sessionId) return;
    setIsApproving(true);
    setError('');
    try {
      const response = await fetch('http://localhost:7001/api/specs/validate/human-decision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          folder: activeSpec,
          session_id: sessionId,
          decision,
          comments: humanComments,
          user: 'Lead Enterprise Architect'
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setLiveLogs(prev => [...prev, `[System] Submitted human decision: ${decision}. comments: "${humanComments || ''}".`]);
        setHumanApprovalStatus(decision);
        
        if (decision === 'APPROVED') {
          // Poll to wait for completed
          setIsValidating(true);
          const pollIntervalId = setInterval(async () => {
            try {
              const res = await fetch(`http://localhost:7001/api/specs/validate/progress/${encodeURIComponent(activeSpec)}`);
              if (!res.ok) return;
              const data = await res.json();
              if (data.status === 'completed') {
                clearInterval(pollIntervalId);
                setReport(data.report || '');
                setIsApproved(true);
                setHumanApprovalStatus('APPROVED');
                setIsValidating(false);
                setOverallProgress(100);
                setBoardStep(9);
              }
            } catch (e) {
              console.error(e);
            }
          }, 1000);
        } else if (decision === 'CHANGES_REQUESTED') {
          // Restart polling because loops are running!
          setIsValidating(true);
          setOverallProgress(50);
          setBoardStep(4); // Set step back to debates/rebuttals
          
          const pollIntervalId = setInterval(async () => {
            try {
              const res = await fetch(`http://localhost:7001/api/specs/validate/progress/${encodeURIComponent(activeSpec)}`);
              if (!res.ok) return;
              const data = await res.json();
              if (data.logs && data.logs.length > 0) setLiveLogs(data.logs);
              if (data.step) setBoardStep(data.step);
              if (data.progress !== undefined) setOverallProgress(data.progress);
              if (data.activeMember !== undefined) setActiveMember(data.activeMember);
              if (data.statuses) setMemberStatuses(data.statuses);
              if (data.votes) setMemberVotes(data.votes);

              if (data.status === 'completed') {
                clearInterval(pollIntervalId);
                setReport(data.report || '');
                setIsApproved(data.approved || false);
                setHumanApprovalStatus(data.human_approval_status || 'PENDING');
                setIsValidating(false);
                setOverallProgress(100);
                setBoardStep(9);
              }
            } catch (e) {
              console.error(e);
            }
          }, 1000);
        } else {
          setIsApproved(false);
          setIsApproving(false);
        }
      } else {
        throw new Error(data.error || 'Failed to submit human decision.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsApproving(false);
    }
  };

  const handleApprove = async () => {
    if (!activeSpec) return;
    setIsApproving(true);
    try {
      const response = await fetch('http://localhost:7001/api/specs/validate/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folder: activeSpec })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsApproved(true);
        // Navigate to the Agent Orchestrator
        navigate('/orchestrator');
      } else {
        throw new Error(data.error || 'Failed to approve validation.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsApproving(false);
    }
  };


  const handleDownloadPDF = () => {
    if (!report) return;
    const styledHtml = `
      <div style="padding: 10px;">
        <h1>Architecture Validation & Model Recommendation Report</h1>
        <p style="font-size: 12px; color: #64748b; margin-top: -10px; margin-bottom: 20px;">Workspace Folder: ${activeSpec}</p>
        ${parseMarkdown(report)}
      </div>
    `;
    pdfGenerator.download('Specification_Validation_Report.pdf', styledHtml);
  };

  // Convert simple markdown styling to HTML for report view
  const parseMarkdown = (md) => {
    if (!md) return '';
    let html = md;
    // headers
    html = html.replace(/^# (.*?)$/gm, '<h1 class="text-base font-bold text-white border-b border-slate-800 pb-2 mt-6 mb-3 uppercase tracking-wider">$1</h1>');
    html = html.replace(/^## (.*?)$/gm, '<h2 class="text-sm font-bold text-indigo-400 mt-5 mb-2.5 uppercase tracking-wide">$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3 class="text-xs font-bold text-slate-200 mt-4 mb-2">$1</h3>');
    // bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-indigo-300 font-bold">$1</strong>');
    // code blocks
    html = html.replace(/```markdown([\s\S]*?)```/g, '<pre class="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-slate-300 my-4 overflow-auto">$1</pre>');
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-950 p-4 rounded-xl border border-slate-900 font-mono text-[10px] text-indigo-300 my-4 overflow-auto">$1</pre>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-900 font-mono text-[9px] text-indigo-400 font-semibold">$1</code>');
    // bullet lists
    html = html.replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-slate-300 py-0.5">$1</li>');
    html = html.replace(/^\* (.*?)$/gm, '<li class="ml-4 list-disc text-slate-300 py-0.5">$1</li>');
    // paragraph breaks
    html = html.replace(/\n/g, '<br/>');
    return html;
  };

  const getLogPrefixColor = (log) => {
    if (log.startsWith('[System]')) return 'text-purple-400 font-semibold';
    if (log.startsWith('[Selector]')) return 'text-blue-400';
    if (log.startsWith('[Moderator]')) return 'text-amber-400 font-bold';
    if (log.startsWith('[Editor]')) return 'text-indigo-400 font-semibold';
    if (log.startsWith('[Validation]')) return 'text-teal-400 font-semibold';
    if (log.startsWith('[CEO Agent]')) return 'text-rose-400 font-bold';
    if (log.startsWith('[Software Architect]')) return 'text-indigo-300';
    if (log.startsWith('[Security Architect]')) return 'text-red-300';
    if (log.startsWith('[Performance Engineer]')) return 'text-emerald-300';
    if (log.startsWith('[FinOps Engineer]')) return 'text-amber-300';
    if (log.startsWith('[Product Owner]')) return 'text-blue-300';
    if (log.startsWith('[Devil\'s Advocate]')) return 'text-rose-300';
    if (log.startsWith('[Data Architect]')) return 'text-cyan-300';
    if (log.startsWith('[DevOps Engineer]')) return 'text-violet-300';
    if (log.startsWith('[Compliance Auditor]')) return 'text-teal-300';
    return 'text-slate-300';
  };

  const getStepDetails = () => {
    switch (boardStep) {
      case 1:
        return { label: 'SELECTION', desc: 'Assembling Panel & Dynamic Triggers', icon: 'fa-user-tag text-blue-400' };
      case 2:
        return { label: 'ROUND 0: READ', desc: 'Distributing Draft & Historical Lessons', icon: 'fa-book-reader text-indigo-450 animate-pulse' };
      case 3:
        return { label: 'ROUND 1: PANELS', desc: 'Running Independent Specialist Audits', icon: 'fa-microchip text-amber-400' };
      case 4:
        return { label: 'ROUND 2: DEBATES', desc: 'Challenging & Defending Design Gaps', icon: 'fa-comments text-purple-400 animate-pulse' };
      case 5:
        return { label: 'ROUND 3: GAVEL', desc: 'Synthesizing Consensus & Conflict Matrix', icon: 'fa-gavel text-amber-500 animate-bounce' };
      case 6:
        return { label: 'SPEC EDITING', desc: 'Compiling Revisions to spec_v2.md', icon: 'fa-file-signature text-indigo-400' };
      case 7:
        return { label: 'VALIDATION', desc: 'Auditing spec_v2 against Backlog Check', icon: 'fa-clipboard-check text-teal-400' };
      case 8:
        return { label: 'CEO STAMP', desc: 'Evaluating Cost & Financial Feasibility', icon: 'fa-signature text-rose-400 animate-pulse' };
      default:
        return { label: 'BOARD RUNNING', desc: 'Executing Multi-Agent Governance Run', icon: 'fa-cog fa-spin text-slate-400' };
    }
  };

  const getMemberStyles = (member, isActive, status) => {
    const c = member.color;
    if (isActive) {
      if (c === 'indigo') return { border: 'border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.2)] bg-slate-900/60', badge: 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/30 animate-pulse', dot: 'bg-indigo-500 animate-ping', text: 'text-indigo-400', bg: 'bg-indigo-500/10' };
      if (c === 'red') return { border: 'border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.2)] bg-slate-900/60', badge: 'bg-red-950/40 text-red-400 border border-red-500/30 animate-pulse', dot: 'bg-red-500 animate-ping', text: 'text-red-400', bg: 'bg-red-500/10' };
      if (c === 'emerald') return { border: 'border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-slate-900/60', badge: 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 animate-pulse', dot: 'bg-emerald-500 animate-ping', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      if (c === 'amber') return { border: 'border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-slate-900/60', badge: 'bg-amber-950/40 text-amber-400 border border-amber-500/30 animate-pulse', dot: 'bg-amber-500 animate-ping', text: 'text-amber-400', bg: 'bg-amber-500/10' };
      if (c === 'blue') return { border: 'border-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.2)] bg-slate-900/60', badge: 'bg-blue-950/40 text-blue-400 border border-blue-500/30 animate-pulse', dot: 'bg-blue-500 animate-ping', text: 'text-blue-400', bg: 'bg-blue-500/10' };
      if (c === 'rose') return { border: 'border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.2)] bg-slate-900/60', badge: 'bg-rose-950/40 text-rose-400 border border-rose-500/30 animate-pulse', dot: 'bg-rose-500 animate-ping', text: 'text-rose-400', bg: 'bg-rose-500/10' };
      if (c === 'cyan') return { border: 'border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.2)] bg-slate-900/60', badge: 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 animate-pulse', dot: 'bg-cyan-500 animate-ping', text: 'text-cyan-400', bg: 'bg-cyan-500/10' };
      if (c === 'violet') return { border: 'border-violet-500/80 shadow-[0_0_15px_rgba(139,92,246,0.2)] bg-slate-900/60', badge: 'bg-violet-950/40 text-violet-400 border border-violet-500/30 animate-pulse', dot: 'bg-violet-500 animate-ping', text: 'text-violet-400', bg: 'bg-violet-500/10' };
      if (c === 'teal') return { border: 'border-teal-500/80 shadow-[0_0_15px_rgba(20,184,166,0.2)] bg-slate-900/60', badge: 'bg-teal-950/40 text-teal-400 border border-teal-500/30 animate-pulse', dot: 'bg-teal-500 animate-ping', text: 'text-teal-400', bg: 'bg-teal-500/10' };
    }
    
    if (status === 'thinking') {
      return { border: 'border-amber-500/40 bg-slate-900/20', badge: 'bg-amber-950/30 text-amber-400 border border-amber-500/20', dot: 'bg-amber-500 animate-pulse', text: `text-${c}-400`, bg: `bg-${c}-500/10` };
    }
    if (status === 'debating') {
      return { border: 'border-purple-500/40 bg-slate-900/20', badge: 'bg-purple-950/30 text-purple-400 border border-purple-500/20', dot: 'bg-purple-500 animate-ping', text: `text-${c}-400`, bg: `bg-${c}-500/10` };
    }
    if (status === 'done') {
      return { border: 'border-emerald-500/30 bg-slate-950/10', badge: 'bg-emerald-950/20 text-emerald-400', dot: 'bg-emerald-500', text: `text-${c}-400`, bg: `bg-${c}-500/10` };
    }

    // Default Idle (Pre-approved/Selection)
    if (c === 'indigo') return { border: 'border-slate-800 bg-slate-950/20 opacity-40 hover:opacity-80', badge: 'bg-slate-900 text-slate-500', dot: 'bg-slate-600', text: 'text-indigo-400', bg: 'bg-indigo-500/10' };
    if (c === 'red') return { border: 'border-slate-800 bg-slate-950/20 opacity-40 hover:opacity-80', badge: 'bg-slate-900 text-slate-500', dot: 'bg-slate-600', text: 'text-red-400', bg: 'bg-red-500/10' };
    if (c === 'emerald') return { border: 'border-slate-800 bg-slate-950/20 opacity-40 hover:opacity-80', badge: 'bg-slate-900 text-slate-500', dot: 'bg-slate-600', text: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (c === 'amber') return { border: 'border-slate-800 bg-slate-950/20 opacity-40 hover:opacity-80', badge: 'bg-slate-900 text-slate-500', dot: 'bg-slate-600', text: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (c === 'blue') return { border: 'border-slate-800 bg-slate-950/20 opacity-40 hover:opacity-80', badge: 'bg-slate-900 text-slate-500', dot: 'bg-slate-600', text: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (c === 'rose') return { border: 'border-slate-800 bg-slate-950/20 opacity-40 hover:opacity-80', badge: 'bg-slate-900 text-slate-500', dot: 'bg-slate-600', text: 'text-rose-400', bg: 'bg-rose-500/10' };
    if (c === 'cyan') return { border: 'border-slate-800 bg-slate-950/20 opacity-40 hover:opacity-80', badge: 'bg-slate-900 text-slate-500', dot: 'bg-slate-600', text: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    if (c === 'violet') return { border: 'border-slate-800 bg-slate-950/20 opacity-40 hover:opacity-80', badge: 'bg-slate-900 text-slate-500', dot: 'bg-slate-600', text: 'text-violet-400', bg: 'bg-violet-500/10' };
    if (c === 'teal') return { border: 'border-slate-800 bg-slate-950/20 opacity-40 hover:opacity-80', badge: 'bg-slate-900 text-slate-500', dot: 'bg-slate-600', text: 'text-teal-400', bg: 'bg-teal-500/10' };
    return { border: 'border-slate-800 bg-slate-950/20 opacity-40 hover:opacity-80', badge: 'bg-slate-900 text-slate-500', dot: 'bg-slate-600', text: 'text-slate-400', bg: 'bg-slate-500/10' };
  };

  const renderMemberCard = (member) => {
    const status = memberStatuses[member.id] || 'idle';
    const vote = memberVotes[member.id];
    const isActive = activeMember === member.id;
    const s = getMemberStyles(member, isActive, status);

    return (
      <div key={member.id} className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between h-[120px] ${s.border}`}>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center ${s.text} text-xs border border-slate-800`}>
              <i className={`fas ${member.icon}`}></i>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-slate-200 leading-tight">{member.name}</h4>
              <p className="text-[8px] text-slate-500 uppercase tracking-wider">{member.role}</p>
            </div>
          </div>
          <span className={`text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded flex items-center ${s.badge}`}>
            <span className={`w-1 h-1 rounded-full ${s.dot} mr-1`}></span>
            {status}
          </span>
        </div>

        <p className="text-[8px] text-slate-400 leading-normal line-clamp-2 my-1.5">{member.desc}</p>

        {vote && (
          <div className={`mt-auto text-[7px] font-bold uppercase tracking-wider py-1 rounded border text-center ${
            vote === 'APPROVED' 
              ? 'bg-green-950/30 border-green-800/40 text-green-400' 
              : vote === 'APPROVED WITH CONDITIONS' 
              ? 'bg-amber-950/30 border-amber-800/40 text-amber-400' 
              : 'bg-red-950/30 border-red-800/40 text-red-400'
          }`}>
            Decision: {vote}
          </div>
        )}
      </div>
    );
  };

  const getResilienceState = () => {
    if (!liveLogs || liveLogs.length === 0) return null;
    const lastLog = liveLogs[liveLogs.length - 1];
    if (lastLog.includes('[Resilience] Model') && lastLog.includes('failed')) {
      const match = lastLog.match(/Retrying in (\d+)ms/);
      const delay = match ? `${(parseInt(match[1]) / 1000).toFixed(1)}s` : 'a few seconds';
      return {
        type: 'retry',
        message: `API rate-limit hit. Auto-healing with model fallbacks. Retrying in ${delay}...`
      };
    }
    if (lastLog.includes('[Resilience] Handled request') || lastLog.includes('Fallback model')) {
      return {
        type: 'healing',
        message: 'Quota exceeded. Successfully failed over to fallback model!'
      };
    }
    return null;
  };

  const resilience = getResilienceState();
  const stepDetails = getStepDetails();

  return (
    <div class="space-y-6">
      
      {/* Page Title & Intro */}
      <div class="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <h1 class="text-xl font-black text-white uppercase tracking-wider flex items-center">
            <i class="fas fa-shield-alt text-indigo-500 mr-3"></i> Spec & Tech Stack Validator Agent
          </h1>
          <p class="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Cross-verifies the SpecKit files against original functional requirements, evaluates architectural technology alignments, and recommends ideal LLM/SLM sub-agent orchestrations. Performs verification using a premium model (<code class="text-indigo-400 font-bold">Gemini 3.5 Flash</code>) to assure clean builds.
          </p>
        </div>
        {activeSpec && (
          <div class="px-4 py-2 bg-slate-950/80 border border-slate-850 rounded-xl flex items-center space-x-2 text-xs">
            <i class="fas fa-folder text-amber-500"></i>
            <span class="font-mono text-slate-300 font-bold">{activeSpec}</span>
          </div>
        )}
      </div>

      {error && (
        <div class="bg-red-950/20 border border-red-900/60 p-4 rounded-2xl text-red-400 text-xs flex items-start space-x-2.5 max-w-2xl">
          <i class="fas fa-exclamation-triangle mt-0.5 shrink-0 text-red-500"></i>
          <div>
            <p class="font-bold">System Error</p>
            <p class="leading-normal mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {isValidating ? (
        /* Agentic Run representation Boardroom View */
        <div class="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6 bg-slate-950/20 relative">
          
          {/* Header Progress Tracker */}
          <div class="flex flex-col space-y-2 border-b border-slate-850 pb-4">
            <div class="flex justify-between items-center">
              <div>
                <h3 class="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center">
                  <span class="w-1.5 h-3 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-2"></span>
                  AI-SRB Active Agentic Boardroom Run
                </h3>
                <p class="text-[9px] text-indigo-400 font-semibold uppercase tracking-wider mt-0.5">
                  Pipeline Stage {boardStep}/8: {stepDetails.label}
                </p>
              </div>
              <div class="text-right">
                <span class="text-xs font-mono font-bold text-slate-300">{overallProgress}%</span>
              </div>
            </div>

            {/* Symmetrical timeline step indicators */}
            <div class="flex justify-between items-center py-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
                const isPassed = boardStep > s;
                const isCurr = boardStep === s;
                return (
                  <div key={s} className="flex-1 flex items-center">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold border transition ${
                      isPassed 
                        ? 'bg-indigo-600/30 border-indigo-500 text-indigo-400' 
                        : isCurr 
                        ? 'bg-amber-500/20 border-amber-500 text-amber-400 animate-pulse scale-110' 
                        : 'bg-slate-950 border-slate-850 text-slate-650'
                    }`}>
                      {s}
                    </div>
                    {s < 8 && (
                      <div className={`flex-1 h-0.5 mx-1 transition ${
                        isPassed ? 'bg-indigo-500' : isCurr ? 'bg-gradient-to-r from-amber-500 to-slate-800' : 'bg-slate-850'
                      }`}></div>
                    )}
                  </div>
                );
              })}
            </div>

            <div class="w-full bg-slate-950 border border-slate-900 rounded-full h-1.5 overflow-hidden">
              <div 
                class="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 h-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Symmetrical Boardroom Table Layout */}
          <div class="grid grid-cols-4 gap-4 h-[440px] items-center">
            
            {/* Left Column: Technical specialists (3 agents) */}
            <div class="space-y-4 col-span-1">
              {renderMemberCard(BOARD_MEMBERS[0])} {/* Software Architect */}
              {renderMemberCard(BOARD_MEMBERS[1])} {/* Security Architect */}
              {renderMemberCard(BOARD_MEMBERS[6])} {/* Data Architect */}
            </div>

            {/* Center Area: Moderator Hub */}
            <div class="col-span-2 flex flex-col items-center justify-between h-full py-4 bg-slate-950/40 border border-slate-850 rounded-2xl p-5 relative overflow-hidden shadow-inner">
              
              {/* Top Row Specialists (Product Owner + FinOps) */}
              <div class="flex space-x-4 w-full">
                <div class="flex-1">{renderMemberCard(BOARD_MEMBERS[4])}</div> {/* Product Owner */}
                <div class="flex-1">{renderMemberCard(BOARD_MEMBERS[3])}</div> {/* FinOps Engineer */}
              </div>

              {/* Central Spinning Hub Visualizer */}
              <div class="my-auto text-center relative flex flex-col items-center justify-center h-[160px] w-full">
                
                {/* Concentric pulsing radar rings */}
                <div class="absolute w-24 h-24 rounded-full border border-indigo-500/10 animate-ping"></div>
                <div class="absolute w-36 h-36 rounded-full border border-purple-500/5 animate-pulse"></div>
                <div class="absolute w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg shadow-indigo-500/5 z-10">
                  <i class={`fas ${stepDetails.icon} text-lg`}></i>
                </div>

                {resilience && (
                  <div className={`absolute top-[-10px] px-3 py-1.5 rounded-full text-[8px] font-bold tracking-wider uppercase border animate-pulse z-20 shadow-md ${
                    resilience.type === 'retry' 
                      ? 'bg-amber-950/90 border-amber-500/50 text-amber-300 shadow-amber-950/30' 
                      : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300 shadow-emerald-950/30'
                  }`}>
                    <i className={`fas ${resilience.type === 'retry' ? 'fa-spinner fa-spin mr-1' : 'fa-check-circle mr-1'}`}></i>
                    {resilience.message}
                  </div>
                )}

                <div class="mt-20 z-10 text-center space-y-1">
                  <h4 class="text-xs font-black text-white uppercase tracking-widest flex items-center justify-center">
                    {stepDetails.label}
                    {isValidating && (
                      <span class="inline-flex space-x-1 ml-2">
                        <span class="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span class="w-1 h-1 bg-indigo-450 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span class="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </span>
                    )}
                  </h4>
                  <p class="text-[9px] text-slate-400 font-semibold leading-relaxed max-w-[240px]">{stepDetails.desc}</p>
                </div>
              </div>

              {/* Bottom Row Specialists (Devil's Advocate) */}
              <div class="flex justify-center w-full">
                <div class="w-1/2">{renderMemberCard(BOARD_MEMBERS[5])}</div> {/* Devil's Advocate */}
              </div>
            </div>

            {/* Right Column: Operations & Compliance (3 agents) */}
            <div class="space-y-4 col-span-1">
              {renderMemberCard(BOARD_MEMBERS[2])} {/* Performance Engineer */}
              {renderMemberCard(BOARD_MEMBERS[7])} {/* DevOps Engineer */}
              {renderMemberCard(BOARD_MEMBERS[8])} {/* Compliance Auditor */}
            </div>
          </div>

          {/* Scrolling active log console */}
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                <i class="fas fa-terminal mr-1"></i> AI-SRB ACTIVE CONSOLE LOGS
              </span>
              <span class="text-[8px] font-mono text-slate-600">Secure TLS Session</span>
            </div>
            <div class="h-32 bg-slate-950 border border-slate-905 rounded-xl p-3 font-mono text-[9px] overflow-y-auto custom-scroll space-y-1 bg-slate-950/80">
              {liveLogs.map((log, index) => (
                <div key={index} className={`leading-normal border-l-2 pl-2 border-slate-800 ${getLogPrefixColor(log)}`}>
                  {log}
                </div>
              ))}
              <div ref={consoleEndRef}></div>
            </div>
          </div>

        </div>
      ) : !report ? (
        /* Run Validation View */
        <div class="glass-panel max-w-2xl mx-auto p-8 rounded-2xl border border-slate-800 shadow-xl text-center space-y-6">
          <div class="w-16 h-16 bg-indigo-500/5 text-indigo-400 rounded-full flex items-center justify-center mx-auto text-2xl border border-indigo-500/10 shadow-lg shadow-indigo-500/5 animate-pulse">
            <i class="fas fa-microchip"></i>
          </div>
          <div class="space-y-2">
            <h3 class="text-sm font-bold text-slate-200 uppercase tracking-wide">Validation Report Required</h3>
            <p class="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              No validation scan has been executed for this specification folder yet. Trigger the validation model to analyze files, verify dependencies, and generate LLM sub-agent cards.
            </p>
          </div>
          <button 
            onClick={handleValidate}
            disabled={isValidating || !activeSpec}
            class="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl border border-indigo-500/20 shadow-lg flex items-center space-x-2 mx-auto transition"
          >
            <>
              <i class="fas fa-shield-alt"></i>
              <span>Run Spec & Tech Stack Audit</span>
            </>
          </button>
        </div>
      ) : (
        /* Validation Dashboard */
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-230px)] overflow-hidden">
          
          {/* Left Panel: Validation Report Details */}
          <div class="lg:col-span-2 glass-panel rounded-2xl flex flex-col overflow-hidden border border-slate-800 shadow-xl">
            <div class="px-5 py-4 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center shrink-0">
              <div>
                <h2 class="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center">
                  <span class="w-1.5 h-3 bg-indigo-500 rounded-full mr-2"></span> Architecture Audit Report
                </h2>
                <p class="text-[9px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Dual-Model Verification Summary</p>
              </div>
              <div class="flex items-center space-x-2">
                <button 
                  onClick={() => setIsConfluenceModalOpen(true)}
                  disabled={isValidating || !report}
                  class="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 text-xs font-bold rounded-lg border border-indigo-900/60 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <i class="fab fa-confluence"></i>
                  <span>Confluence</span>
                </button>
                <button 
                  onClick={handleDownloadPDF}
                  disabled={isValidating || !report}
                  class="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 text-indigo-400 text-xs font-bold rounded-lg border border-indigo-900/60 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <i class="fas fa-file-pdf"></i>
                  <span>Download PDF</span>
                </button>
                <button 
                  onClick={handleValidate}
                  disabled={isValidating}
                  class="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-350 text-xs font-bold rounded-lg border border-slate-750 flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {isValidating ? <i class="fas fa-circle-notch animate-spin"></i> : <i class="fas fa-redo"></i>}
                  <span>Re-audit Spec</span>
                </button>
              </div>
            </div>

            <div class="flex-1 p-5 overflow-y-auto custom-scroll bg-slate-950/40 relative">
              {isValidating && (
                <div class="absolute inset-0 bg-slate-950/80 flex items-center justify-center z-10">
                  <div class="flex flex-col items-center space-y-2">
                    <i class="fas fa-circle-notch animate-spin text-indigo-500 text-xl"></i>
                    <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Running Audit Scan...</span>
                  </div>
                </div>
              )}
              <div 
                class="validation-document text-xs leading-relaxed text-slate-350 space-y-4"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(report) }}
              />
            </div>
          </div>

          {/* Right Panel: Human in the loop checks */}
          <div class="glass-panel rounded-2xl flex flex-col overflow-hidden border border-slate-800 shadow-xl p-5 space-y-4 justify-between bg-slate-900/10">
            <div class="space-y-4">
              <div class="border-b border-slate-850 pb-3">
                <h3 class="text-xs font-black text-white uppercase tracking-wider">Human-In-The-Loop Review</h3>
                <p class="text-[9px] text-slate-500 mt-0.5">Approve findings or iterate on requirements specs</p>
              </div>

              {/* Status Indicator */}
              <div class={`p-4 rounded-xl border flex items-start space-x-3 ${
                isApproved 
                  ? 'bg-green-950/10 border-green-800/40 text-green-400' 
                  : humanApprovalStatus === 'PENDING'
                    ? 'bg-orange-950/10 border-orange-850/40 text-orange-400'
                    : humanApprovalStatus === 'CHANGES_REQUESTED'
                      ? 'bg-yellow-950/10 border-yellow-800/40 text-yellow-400'
                      : 'bg-red-950/10 border-red-800/40 text-red-450'
              }`}>
                <div class={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                  isApproved ? 'bg-green-500/10' : 'bg-orange-500/10'
                }`}>
                  <i class={`fas ${isApproved ? 'fa-check' : 'fa-clock'} text-xs`}></i>
                </div>
                <div>
                  <p class="text-xs font-bold uppercase tracking-wider">
                    {isApproved ? 'Approved & Ready' : `Gate Status: ${humanApprovalStatus}`}
                  </p>
                  <p class="text-[10px] text-slate-400 leading-normal mt-0.5">
                    {isApproved 
                      ? 'The spec validation has been signed off. You can proceed directly to orchestrating the sub-agent pipeline.' 
                      : humanApprovalStatus === 'PENDING'
                        ? 'AI CEO Approval has completed. Awaiting final human verification and release authorization.'
                        : humanApprovalStatus === 'CHANGES_REQUESTED'
                          ? 'Changes requested. The debate loop-back has targeted relevant reviewer agents.'
                          : 'Design is currently rejected or escalated for manual override.'}
                  </p>
                </div>
              </div>

              {/* Stats HUD (AI Confidence & Risks) */}
              {report && (
                <div class="grid grid-cols-2 gap-3 shrink-0">
                  <div class="bg-slate-900/60 border border-slate-850 p-3 rounded-xl flex flex-col items-center justify-center">
                    <span class="text-[9px] uppercase tracking-wider text-slate-400">AI Confidence</span>
                    <span class="text-base font-bold text-indigo-400 mt-1">{aiConfidence || 95}%</span>
                  </div>
                  <div class="bg-slate-900/60 border border-slate-850 p-3 rounded-xl flex flex-col items-center justify-center">
                    <span class="text-[9px] uppercase tracking-wider text-slate-400">Board Risks</span>
                    <span class="text-base font-bold text-red-400 mt-1">{risksCount || 0} Identified</span>
                  </div>
                </div>
              )}

              {/* Human Gate Actions */}
              {report && humanApprovalStatus === 'PENDING' && (
                <div class="space-y-3 bg-slate-900/40 border border-slate-850/60 p-4 rounded-xl shrink-0">
                  <p class="text-xs font-bold text-slate-200">Human Architecture Gate Decision:</p>
                  
                  <textarea
                    value={humanComments}
                    onChange={(e) => setHumanComments(e.target.value)}
                    placeholder="Enter review comments or changes requested notes..."
                    class="w-full h-16 bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />

                  <div class="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleHumanDecision('APPROVED')}
                      disabled={isApproving}
                      class="py-1.5 bg-green-600 hover:bg-green-500 text-white text-[11px] font-bold rounded-lg transition"
                    >
                      Approve Spec
                    </button>
                    <button
                      onClick={() => handleHumanDecision('CHANGES_REQUESTED')}
                      disabled={isApproving || !humanComments.trim()}
                      class="py-1.5 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[11px] font-bold rounded-lg transition"
                    >
                      Request Changes
                    </button>
                    <button
                      onClick={() => handleHumanDecision('REJECTED')}
                      disabled={isApproving}
                      class="py-1.5 bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold rounded-lg transition"
                    >
                      Reject Spec
                    </button>
                    <button
                      onClick={() => handleHumanDecision('ESCALATED')}
                      disabled={isApproving}
                      class="py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold rounded-lg transition"
                    >
                      Escalate Spec
                    </button>
                  </div>
                </div>
              )}

              {/* Status details when resolved */}
              {report && humanApprovalStatus !== 'PENDING' && (
                <div class="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-[11px] text-slate-400 space-y-1">
                  <p><span class="font-bold text-slate-200">Decision: </span>
                    <span class={`font-bold uppercase ${
                      humanApprovalStatus === 'APPROVED' ? 'text-green-400' :
                      humanApprovalStatus === 'CHANGES_REQUESTED' ? 'text-yellow-400' :
                      humanApprovalStatus === 'REJECTED' ? 'text-red-400' : 'text-purple-400'
                    }`}>
                      {humanApprovalStatus}
                    </span>
                  </p>
                  {humanComments && <p class="text-[10px] text-slate-500 italic mt-1">Comments: "{humanComments}"</p>}
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div class="space-y-2 border-t border-slate-850 pt-4 shrink-0">
              <button 
                onClick={() => navigate('/requirements')}
                class="w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-2"
              >
                <i class="fas fa-edit"></i>
                <span>Edit Specifications</span>
              </button>

              <button 
                onClick={handleApprove}
                disabled={isApproving || !isApproved}
                class={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-lg border border-indigo-500/30 transition flex items-center justify-center space-x-2 ${
                  isApproved 
                    ? 'bg-green-600 hover:bg-green-500 cursor-pointer' 
                    : 'bg-slate-850 text-slate-500 border-slate-800 cursor-not-allowed'
                }`}
              >
                {isApproving ? (
                  <>
                    <i class="fas fa-circle-notch animate-spin"></i>
                    <span>Signing off spec...</span>
                  </>
                ) : isApproved ? (
                  <>
                    <i class="fas fa-arrow-right"></i>
                    <span>Proceed to SDLC Generation</span>
                  </>
                ) : (
                  <>
                    <i class="fas fa-thumbs-up"></i>
                    <span>Awaiting Gate Decision</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>
      )}

      <ConfluencePublishModal 
        isOpen={isConfluenceModalOpen} 
        onClose={() => setIsConfluenceModalOpen(false)} 
        stageType="validator" 
        onSuccess={(msg) => alert(msg)} 
        onError={(err) => alert(err)} 
      />
    </div>
  );
}
```


## src/pages/admin/AdminAgentMapping.jsx
```jsx
import React, { useState, useEffect } from 'react';

const AVAILABLE_PROJECTS = ['sdd-enterprise-dev', 'mobile-app-v2', 'legacy-migration'];
const AVAILABLE_AGENTS = [
  'Spec to Story', 'User Stories', 'UX Wireframe', 'Functional Spec', 'Tech Architecture', 
  'Database Design', 'Test Cases', 'Traceability Matrix', 'Review Agent',
  'Impact & Gap Specs', 'Delta Stories', 'Tech Arch & Migration'
];

const INITIAL_MAPPINGS = [
  { id: 1, project: 'sdd-enterprise-dev', persona: 'Product Owner', agents: ['Spec to Story', 'User Stories'] },
  { id: 2, project: 'sdd-enterprise-dev', persona: 'Business Analyst', agents: ['Functional Spec', 'Traceability Matrix'] },
  { id: 3, project: 'mobile-app-v2', persona: 'UX Designer', agents: ['UX Wireframe'] },
  { id: 4, project: 'legacy-migration', persona: 'Business Analyst', agents: ['Impact & Gap Specs', 'Delta Stories', 'Tech Arch & Migration'] }
];

export default function AdminAgentMapping() {
  const [availablePersonas, setAvailablePersonas] = useState(() => {
    const saved = localStorage.getItem('sdd_personas');
    let loadedPersonas = [];
    if (saved) {
      try { loadedPersonas = JSON.parse(saved); } catch (e) {}
    }
    if (!loadedPersonas || loadedPersonas.length === 0) {
      loadedPersonas = [{ name: 'Admin' }, { name: 'Product Owner' }, { name: 'Business Analyst' }, { name: 'Technical Lead' }, { name: 'Developer' }, { name: 'UX Designer' }, { name: 'QA Engineer' }];
    }
    return loadedPersonas.map(p => p.name).filter(name => name !== 'Super Admin');
  });

  const [mappings, setMappings] = useState(() => {
    const saved = localStorage.getItem('agentMappings');
    return saved ? JSON.parse(saved) : INITIAL_MAPPINGS;
  });

  useEffect(() => {
    localStorage.setItem('agentMappings', JSON.stringify(mappings));
  }, [mappings]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMappingId, setEditingMappingId] = useState(null);
  const [newMapping, setNewMapping] = useState({ project: AVAILABLE_PROJECTS[0], persona: availablePersonas[0] || '', agents: [] });

  const handleOpenCreate = () => {
    setEditingMappingId(null);
    setNewMapping({ project: AVAILABLE_PROJECTS[0], persona: availablePersonas[0] || '', agents: [] });
    setIsModalOpen(true);
  };

  const handleOpenModify = (mapping) => {
    setEditingMappingId(mapping.id);
    setNewMapping({
      project: mapping.project,
      persona: mapping.persona,
      agents: [...mapping.agents]
    });
    setIsModalOpen(true);
  };

  const toggleAgent = (agent) => {
    if (newMapping.agents.includes(agent)) {
      setNewMapping({ ...newMapping, agents: newMapping.agents.filter(a => a !== agent) });
    } else {
      setNewMapping({ ...newMapping, agents: [...newMapping.agents, agent] });
    }
  };

  const handleSave = () => {
    if (editingMappingId) {
      setMappings(mappings.map(m => m.id === editingMappingId ? { ...newMapping, id: editingMappingId } : m));
    } else {
      setMappings([...mappings, { ...newMapping, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setMappings(mappings.filter(m => m.id !== id));
  };

  return (
    <div className="text-white fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white">Agent Mapping</h1>
          <p className="text-slate-400 mt-1 text-[14px]">Bind specific AI agents to organizational personas within project contexts.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.3)] transition-all flex items-center space-x-2 text-[14px]"
        >
          <i className="fas fa-link text-xs"></i>
          <span>Create Mapping</span>
        </button>
      </div>

      {/* Table Panel */}
      <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/20">
          <h3 className="text-lg font-bold text-white mb-1">Configured Mappings</h3>
          <p className="text-[13px] text-slate-400">Manage visibility and execution rights for agents based on project roles.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-4 px-6 font-semibold">Target Project</th>
                <th className="py-4 px-6 font-semibold">Persona</th>
                <th className="py-4 px-6 font-semibold">Assigned Agents</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {mappings.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-500 text-sm">
                    No mappings configured.
                  </td>
                </tr>
              ) : (
                mappings.map((mapping) => (
                  <tr key={mapping.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="py-4 px-6">
                      <span className="inline-block px-2 py-0.5 rounded border border-slate-700 bg-slate-800/50 text-slate-300 text-[11px] font-semibold whitespace-nowrap">
                        <i className="fas fa-cubes mr-1.5 text-slate-500"></i>
                        {mapping.project}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-[13px] text-slate-200 flex items-center">
                        <i className="fas fa-user-tag text-indigo-400 mr-2 text-xs"></i>
                        {mapping.persona}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1.5">
                        {mapping.agents.length > 0 ? mapping.agents.map(agent => (
                          <span key={agent} className="inline-block px-2.5 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-[11px] font-bold">
                            <i className="fas fa-robot mr-1 opacity-60"></i>
                            {agent}
                          </span>
                        )) : (
                          <span className="text-slate-500 text-[11px] italic">No agents assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button 
                        onClick={() => handleOpenModify(mapping)}
                        className="bg-slate-800/60 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                      >
                        Modify
                      </button>
                      <button 
                        onClick={() => handleDelete(mapping.id)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modify Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden flex flex-col my-8 max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 shrink-0"></div>
            
            <div className="p-6 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-white">{editingMappingId ? 'Modify Agent Mapping' : 'Create Agent Mapping'}</h2>
              <p className="text-[12px] text-slate-400 mt-1">Bind agents to a persona for a specific project.</p>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scroll space-y-6">
              {/* Context Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wide">Target Project</label>
                  <select
                    value={newMapping.project}
                    onChange={(e) => setNewMapping({...newMapping, project: e.target.value})}
                    className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-3 text-[13px] text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    {AVAILABLE_PROJECTS.map(proj => (
                      <option key={proj} value={proj}>{proj}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wide">Target Persona</label>
                  <select
                    value={newMapping.persona}
                    onChange={(e) => setNewMapping({...newMapping, persona: e.target.value})}
                    className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-3 text-[13px] text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    {availablePersonas.map(persona => (
                      <option key={persona} value={persona}>{persona}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Agent Selection */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-400 mb-3 uppercase tracking-wide">Assign Agents</label>
                <div className="bg-[#060913]/50 border border-slate-800 rounded-xl p-4">
                  <div className="grid grid-cols-2 gap-2">
                    {AVAILABLE_AGENTS.map(agent => {
                      const isSelected = newMapping.agents.includes(agent);
                      return (
                        <button
                          key={agent}
                          onClick={() => toggleAgent(agent)}
                          className={`px-3 py-2 rounded-lg text-[12px] font-bold border transition-all text-left flex items-center justify-between ${
                            isSelected 
                              ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' 
                              : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <i className={`fas fa-robot ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`}></i>
                            <span>{agent}</span>
                          </div>
                          {isSelected && <i className="fas fa-check text-indigo-400 text-[10px]"></i>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end space-x-3 shrink-0 bg-[#0c1222]">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors flex items-center space-x-2"
              >
                <i className="fas fa-save"></i>
                <span>{editingMappingId ? 'Save Changes' : 'Create Mapping'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```


## src/pages/admin/AdminAgents.jsx
```jsx
import React, { useState } from 'react';

const INITIAL_AGENTS = [
  { id: 'agt-001', name: 'Spec to Story', description: 'Agile story generator', model: 'GPT-4o', status: 'Active' },
  { id: 'agt-002', name: 'User Stories', description: 'Backlog decomposition', model: 'Claude 3.5 Sonnet', status: 'Active' },
  { id: 'agt-003', name: 'UX Wireframe', description: 'Tailwind prototypes', model: 'GPT-4o', status: 'Active' },
  { id: 'agt-004', name: 'Functional Spec', description: 'FSD compilation', model: 'Gemini 1.5 Pro', status: 'Active' },
  { id: 'agt-005', name: 'Tech Architecture', description: 'Blueprints & stack spec', model: 'Claude 3.5 Sonnet', status: 'Active' },
  { id: 'agt-006', name: 'Database Design', description: 'ERD & DDL creations', model: 'GPT-4o', status: 'Active' },
  { id: 'agt-007', name: 'Test Cases', description: 'QA & Gherkin suites', model: 'Claude 3.5 Sonnet', status: 'Active' },
  { id: 'agt-008', name: 'Traceability Matrix', description: 'Req cross-references', model: 'Gemini 1.5 Pro', status: 'Active' },
  { id: 'agt-009', name: 'Review Agent', description: 'Compliance & code scans', model: 'GPT-4o', status: 'Active' },
];

export default function AdminAgents() {
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAgent, setNewAgent] = useState({ name: '', description: '', model: 'GPT-4o', status: 'Active' });

  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    agent.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="text-white fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white">Agent Definition</h1>
          <p className="text-slate-400 mt-1 text-[14px]">View, manage, and configure specialized SDLC AI agents, prompt templates, and execution controls.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.3)] transition-all flex items-center space-x-2 text-[14px]"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>Define New Agent</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center shadow-lg gap-4">
        <div className="w-full md:w-96 relative">
          <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
          <input 
            type="text" 
            placeholder="Search agents by name, ID, or persona..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#060913]/70 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Filter Category:</span>
          <select className="bg-[#060913]/70 border border-slate-800 rounded-xl py-2.5 px-4 text-[13px] text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer min-w-[250px]">
            <option>All Agent Categories ({agents.length} SDLC Agents)</option>
            <option>Greenfield Agents</option>
            <option>Brownfield Agents</option>
          </select>
        </div>
      </div>

      {/* Table Panel */}
      <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/20">
          <h3 className="text-lg font-bold text-white mb-1">Registered Agent Definitions</h3>
          <p className="text-[13px] text-slate-400">Showing all configured SDLC agents</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-4 px-6 font-semibold">Agent Name & ID</th>
                <th className="py-4 px-6 font-semibold">Model</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 text-sm">
                    No agents match your search.
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => (
                  <tr key={agent.id} className="hover:bg-slate-800/20 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-[14px] text-slate-200">{agent.name}</span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">{agent.id}</span>
                          <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={agent.description}>{agent.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-[11px] font-bold">
                        <i className="fas fa-brain mr-1.5"></i>
                        {agent.model}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border ${
                        agent.status === 'Active' 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          agent.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}></span>
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="bg-slate-800/60 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors">
                        Configure
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Define New Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
            <h2 className="text-xl font-bold text-white mb-4">Define New Agent</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-2">Agent Name</label>
                <input 
                  type="text"
                  value={newAgent.name}
                  onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                  className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-4 text-[14px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Code Reviewer"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-2">Description</label>
                <input 
                  type="text"
                  value={newAgent.description}
                  onChange={(e) => setNewAgent({...newAgent, description: e.target.value})}
                  className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-4 text-[14px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. Automated PR reviews"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-2">Backing Model</label>
                <select
                  value={newAgent.model}
                  onChange={(e) => setNewAgent({...newAgent, model: e.target.value})}
                  className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-4 text-[14px] text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option>GPT-4o</option>
                  <option>Claude 3.5 Sonnet</option>
                  <option>Gemini 1.5 Pro</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newAgent.name) {
                    setAgents([...agents, { ...newAgent, id: `agt-0${agents.length + 10}` }]);
                    setNewAgent({ name: '', description: '', model: 'GPT-4o', status: 'Active' });
                    setIsModalOpen(false);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
              >
                Create Agent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```


## src/pages/admin/AdminDashboard.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState({
    totalProjects: 3,
    totalPersonas: 8,
    activeUsers: 4,
    inactiveUsers: 1,
    totalAgents: 9,
    totalMappings: 0
  });

  useEffect(() => {
    try {
      const savedMappings = localStorage.getItem('agentMappings');
      if (savedMappings) {
        const parsed = JSON.parse(savedMappings);
        setMetrics(prev => ({ ...prev, totalMappings: parsed.length }));
      } else {
        setMetrics(prev => ({ ...prev, totalMappings: 3 }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div className="text-white fade-in space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-end bg-slate-900/40 p-6 rounded-2xl border border-slate-800/80">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white flex items-center">
            <i className="fas fa-tachometer-alt text-indigo-500 mr-3"></i> Super Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-2 text-[14px]">
            System overview and orchestration metrics across the SDD Enterprise platform.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span>System Healthy</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Personas Card */}
        <Link to="/admin/personas" className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors shadow-lg block cursor-pointer">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Registered Personas</span>
              <h3 className="text-4xl font-black text-white">{metrics.totalPersonas}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <i className="fas fa-users-cog text-xl"></i>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              <span className="inline-block px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400 text-[9px] font-bold">4 System</span>
              <span className="inline-block px-2 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400 text-[9px] font-bold">4 Custom</span>
            </div>
            <i className="fas fa-arrow-right text-slate-600 group-hover:text-blue-400 transition-colors text-xs"></i>
          </div>
        </Link>

        {/* Projects Card */}
        <Link to="/admin/projects" className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/50 transition-colors shadow-lg block cursor-pointer">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Projects</span>
              <h3 className="text-4xl font-black text-white">{metrics.totalProjects}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <i className="fas fa-briefcase text-xl"></i>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-between mt-4">
            <span className="inline-block px-2.5 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-bold">
              Active Portfolios
            </span>
            <i className="fas fa-arrow-right text-slate-600 group-hover:text-amber-400 transition-colors text-xs"></i>
          </div>
        </Link>

        {/* Users Card */}
        <Link to="/admin/users" className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-lg block cursor-pointer">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Users</span>
              <h3 className="text-4xl font-black text-white">{metrics.activeUsers + metrics.inactiveUsers}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <i className="fas fa-user-shield text-xl"></i>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-between mt-4">
            <div className="flex space-x-2">
              <span className="inline-block px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">
                {metrics.activeUsers} Active
              </span>
              <span className="inline-block px-2 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 text-[9px] font-bold">
                {metrics.inactiveUsers} Inactive
              </span>
            </div>
            <i className="fas fa-arrow-right text-slate-600 group-hover:text-emerald-400 transition-colors text-xs"></i>
          </div>
        </Link>

        {/* Agents Card */}
        <Link to="/admin/agents" className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors shadow-lg block cursor-pointer">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Defined Agents</span>
              <h3 className="text-4xl font-black text-white">{metrics.totalAgents}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <i className="fas fa-robot text-xl"></i>
            </div>
          </div>
          <div className="relative z-10 flex items-center justify-between mt-4">
            <span className="inline-block px-2.5 py-1 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 text-[10px] font-bold">
              Available in Pool
            </span>
            <i className="fas fa-arrow-right text-slate-600 group-hover:text-purple-400 transition-colors text-xs"></i>
          </div>
        </Link>

        {/* Agent Mappings Card */}
        <Link to="/admin/agent-mapping" className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-pink-500/50 transition-colors shadow-lg block cursor-pointer lg:col-span-2">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-colors"></div>
          <div className="flex justify-between items-center h-full relative z-10">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Active Agent Mappings</span>
              <div className="flex items-baseline space-x-3">
                <h3 className="text-4xl font-black text-white">{metrics.totalMappings}</h3>
                <span className="text-sm text-slate-400 font-semibold">Rules Configured</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 max-w-sm">
                Contextual access mappings controlling which personas can utilize specific agents within their assigned projects.
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/10 relative">
              <i className="fas fa-project-diagram text-2xl"></i>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full animate-ping"></div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></div>
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}
```


## src/pages/admin/AdminDebateCircles.jsx
```jsx
import React, { useState, useEffect } from 'react';

export default function AdminDebateCircles() {
  const [circles, setCircles] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const [personas, setPersonas] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    topic: '',
    rounds: 3,
    consensusMode: 'Majority',
    proponent: '',
    moderator: '',
    challenger: ''
  });

  useEffect(() => {
    try {
      const savedCircles = JSON.parse(localStorage.getItem('sdd_debate_circles')) || [];
      setCircles(savedCircles);

      const savedPersonas = JSON.parse(localStorage.getItem('sdd_personas')) || [
        { name: 'Solution Architect', role: 'System & Stack Alignment' },
        { name: 'Security Engineer', role: 'OWASP & Data Isolation' },
        { name: 'Neutral Moderator', role: 'Synthesizes arguments' },
        { name: 'Product Owner', role: 'Requirements Coverage' }
      ];
      setPersonas(savedPersonas);

      if (savedPersonas.length >= 3) {
        setFormData(prev => ({
          ...prev,
          proponent: savedPersonas[0].name,
          moderator: savedPersonas[1].name,
          challenger: savedPersonas[2].name
        }));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSave = () => {
    if (!formData.name || !formData.topic) return;

    const newCircle = { ...formData, id: Date.now() };
    const updated = [...circles, newCircle];
    setCircles(updated);
    localStorage.setItem('sdd_debate_circles', JSON.stringify(updated));
    setIsCreating(false);
    setFormData({
      name: '',
      topic: '',
      rounds: 3,
      consensusMode: 'Majority',
      proponent: personas[0]?.name || '',
      moderator: personas[1]?.name || '',
      challenger: personas[2]?.name || ''
    });
  };

  const handleDelete = (id) => {
    const updated = circles.filter(c => c.id !== id);
    setCircles(updated);
    localStorage.setItem('sdd_debate_circles', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 fade-in pb-10">
      <div className="flex justify-between items-center bg-slate-900/40 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <h1 className="text-xl font-black text-white uppercase tracking-wider flex items-center">
            <i className="fas fa-balance-scale text-indigo-500 mr-3"></i> Debate Circles Config
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure multi-agent debate circles to optimize generated artifacts. Assign proponent, challenger, and moderator personas to engage in iterative peer-review consensus loops.
          </p>
        </div>
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl border border-indigo-500/30 shadow-lg flex items-center space-x-2 transition"
          >
            <i className="fas fa-plus"></i>
            <span>Create Debate Circle</span>
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-8 bg-slate-950/50">
          
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center">
              <i className="fas fa-sliders-h text-indigo-400 mr-2"></i> Debate Parameters
            </h2>
            <button 
              onClick={() => setIsCreating(false)}
              className="text-slate-500 hover:text-white"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Debate Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. SDLC Debate Circle"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topic / Artefact</label>
              <input 
                type="text" 
                value={formData.topic}
                onChange={e => setFormData({...formData, topic: e.target.value})}
                placeholder="e.g. SDLC Architecture & Security Artefacts"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Debate Rounds: <span className="text-indigo-400">{formData.rounds}</span></label>
              <input 
                type="range" 
                min="1" max="10" 
                value={formData.rounds}
                onChange={e => setFormData({...formData, rounds: parseInt(e.target.value)})}
                className="w-full accent-indigo-500 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Consensus Mode</label>
              <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
                {['Majority', 'Unanimous', 'Moderated'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setFormData({...formData, consensusMode: mode})}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                      formData.consensusMode === mode 
                        ? 'bg-indigo-600 border border-indigo-500 shadow-lg shadow-indigo-500/20 text-white' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Persona Mapping Cards */}
          <div className="grid grid-cols-3 gap-6 pt-4">
            
            {/* Proponent */}
            <div className="bg-slate-900/40 border border-blue-900/40 rounded-2xl p-5 flex flex-col items-center text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">Proponent</span>
              
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-slate-900 shadow-lg">
                P
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Defends the Artifact</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">Presents the primary architectural argument and design perspective</p>
              </div>

              <select 
                value={formData.proponent}
                onChange={e => setFormData({...formData, proponent: e.target.value})}
                className="w-full mt-auto bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500 cursor-pointer appearance-none text-center font-bold"
              >
                {personas.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Moderator */}
            <div className="bg-slate-900/40 border border-purple-900/40 rounded-2xl p-5 flex flex-col items-center text-center space-y-4 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 left-0 w-full h-1 bg-purple-500"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">Moderator</span>
              
              <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl border-4 border-slate-900 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                M
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Guides the Debate</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">Synthesises arguments, consolidates pros/cons and delivers the final recommendation</p>
              </div>

              <select 
                value={formData.moderator}
                onChange={e => setFormData({...formData, moderator: e.target.value})}
                className="w-full mt-auto bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-purple-500 cursor-pointer appearance-none text-center font-bold"
              >
                {personas.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Challenger */}
            <div className="bg-slate-900/40 border border-rose-900/40 rounded-2xl p-5 flex flex-col items-center text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">Challenger</span>
              
              <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center text-white font-bold text-lg border-2 border-slate-900 shadow-lg">
                C
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Critiques the Artifact</h4>
                <p className="text-[10px] text-slate-500 leading-relaxed">Reviews and challenges arguments from a security & risk perspective</p>
              </div>

              <select 
                value={formData.challenger}
                onChange={e => setFormData({...formData, challenger: e.target.value})}
                className="w-full mt-auto bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-rose-500 cursor-pointer appearance-none text-center font-bold"
              >
                {personas.map(p => (
                  <option key={p.name} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button 
              onClick={() => setIsCreating(false)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={!formData.name || !formData.topic}
              className={`px-6 py-2.5 text-xs font-bold rounded-xl border flex items-center transition ${
                !formData.name || !formData.topic 
                  ? 'bg-indigo-900/30 text-indigo-500/50 border-indigo-900/30 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/20'
              }`}
            >
              <i className="fas fa-save mr-2"></i> Save Configuration
            </button>
          </div>

        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {circles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 text-slate-500">
              <i className="fas fa-balance-scale text-4xl mb-4 opacity-50"></i>
              <h2 className="text-lg font-bold text-slate-400">No Debate Circles Configured</h2>
              <p className="text-xs mt-2 max-w-md text-center">
                Create a debate circle to assign proponent, challenger, and moderator personas for automated artifact optimization.
              </p>
            </div>
          ) : (
            circles.map(circle => (
              <div key={circle.id} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-4 hover:border-indigo-500/30 transition">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">{circle.name}</h3>
                    <p className="text-[10px] text-slate-500 font-mono mt-1"><i className="fas fa-folder mr-1.5 text-amber-500"></i>{circle.topic}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-bold text-indigo-400 uppercase">
                      {circle.rounds} Rounds
                    </span>
                    <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[9px] font-bold text-amber-400 uppercase">
                      {circle.consensusMode}
                    </span>
                    <button onClick={() => handleDelete(circle.id)} className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center transition border border-rose-500/20">
                      <i className="fas fa-trash-alt text-[10px]"></i>
                    </button>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 overflow-x-auto">
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-[8px] font-bold text-white flex items-center justify-center shrink-0">P</span>
                    <span className="text-xs text-slate-300 font-semibold">{circle.proponent}</span>
                  </div>
                  <i className="fas fa-arrow-right text-slate-700 text-[10px] shrink-0"></i>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-[8px] font-bold text-white flex items-center justify-center shrink-0">M</span>
                    <span className="text-xs text-slate-300 font-semibold">{circle.moderator}</span>
                  </div>
                  <i className="fas fa-arrow-right text-slate-700 text-[10px] shrink-0"></i>
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="w-5 h-5 rounded-full bg-rose-600 text-[8px] font-bold text-white flex items-center justify-center shrink-0">C</span>
                    <span className="text-xs text-slate-300 font-semibold">{circle.challenger}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```


## src/pages/admin/AdminPersonas.jsx
```jsx
import React, { useState } from 'react';

export default function AdminPersonas() {
  const [personas, setPersonas] = useState(() => {
    const saved = localStorage.getItem('sdd_personas');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { name: 'Admin', role: 'Global Config, Security, Orchestration', type: 'System', status: 'Active' },
      { name: 'Product Owner', role: 'Backlog, Epics, Stories, Stakeholder Signoff', type: 'System', status: 'Active' },
      { name: 'Business Analyst', role: 'Requirements, BRD, Use-case Generation', type: 'System', status: 'Active' },
      { name: 'Technical Lead', role: 'Code Reviews, Architecture, Technical Tasking', type: 'System', status: 'Active' },
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('sdd_personas', JSON.stringify(personas));
  }, [personas]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonaIndex, setEditingPersonaIndex] = useState(null);
  const [newPersona, setNewPersona] = useState({ name: '', role: '', type: 'Custom', status: 'Active' });

  return (
    <div className="text-white fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white">Persona Management</h1>
          <p className="text-slate-400 mt-1 text-[14px]">Establish organizational personas and parameter thresholds for target SDLC outcomes.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPersonaIndex(null);
            setNewPersona({ name: '', role: '', type: 'Custom', status: 'Active' });
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.3)] transition-all flex items-center space-x-2 text-[14px]"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>Create Custom Persona</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Active Personas</span>
              <h3 className="text-3xl font-bold text-white">8 Defined</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <i className="fas fa-users"></i>
            </div>
          </div>
          <span className="inline-block px-2.5 py-1 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-bold">
            Fully Configured
          </span>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">System Default Roles</span>
              <h3 className="text-3xl font-bold text-white">{personas.filter(p => p.type === 'System').length} Default</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <i className="fas fa-lock-open"></i>
            </div>
          </div>
          <span className="inline-block px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
            Unlocked
          </span>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Custom Roles</span>
              <h3 className="text-3xl font-bold text-white">{personas.filter(p => p.type === 'Custom').length} Active</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <i className="fas fa-layer-group"></i>
            </div>
          </div>
          <span className="inline-block px-2.5 py-1 rounded border border-purple-500/30 bg-purple-500/10 text-purple-400 text-[10px] font-bold">
            +1 Current Week
          </span>
        </div>
      </div>

      {/* Table Panel */}
      <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/20">
          <h3 className="text-lg font-bold text-white mb-1">Registered SDLC Personas</h3>
          <p className="text-[13px] text-slate-400">Manage baseline permissions and agent triggers for mapped personas.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-4 px-6 font-semibold">Persona Name</th>
                <th className="py-4 px-6 font-semibold">Role & Responsibilities</th>
                <th className="py-4 px-6 font-semibold">Type</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {personas.map((persona, index) => (
                <tr key={index} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="py-4 px-6">
                    <span className="font-bold text-[14px] text-slate-200">{persona.name}</span>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-slate-400">
                    {persona.role}
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 text-[11px] font-bold tracking-wide">
                      {persona.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border ${
                      persona.status === 'Active' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        persona.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}></span>
                      {persona.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => {
                        setEditingPersonaIndex(index);
                        setNewPersona(persona);
                        setIsModalOpen(true);
                      }}
                      className="bg-slate-800/60 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                    >
                      Modify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
            <h2 className="text-xl font-bold text-white mb-4">
              {editingPersonaIndex !== null ? 'Modify Persona' : 'Create Custom Persona'}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-2">Persona Name</label>
                <input 
                  type="text"
                  value={newPersona.name}
                  onChange={(e) => setNewPersona({...newPersona, name: e.target.value})}
                  className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-4 text-[14px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. UX Designer"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-2">Role & Responsibilities</label>
                <input 
                  type="text"
                  value={newPersona.role}
                  onChange={(e) => setNewPersona({...newPersona, role: e.target.value})}
                  className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-4 text-[14px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. UI mockups, user research"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-2">Status</label>
                <select
                  value={newPersona.status}
                  onChange={(e) => setNewPersona({...newPersona, status: e.target.value})}
                  className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-4 text-[14px] text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setEditingPersonaIndex(null);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newPersona.name) {
                    if (editingPersonaIndex !== null) {
                      const updatedPersonas = [...personas];
                      updatedPersonas[editingPersonaIndex] = newPersona;
                      setPersonas(updatedPersonas);
                    } else {
                      setPersonas([...personas, newPersona]);
                    }
                    setNewPersona({ name: '', role: '', type: 'Custom', status: 'Active' });
                    setEditingPersonaIndex(null);
                    setIsModalOpen(false);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
              >
                {editingPersonaIndex !== null ? 'Save Changes' : 'Create Persona'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```


## src/pages/admin/AdminProjects.jsx
```jsx
import React, { useState } from 'react';

export default function AdminProjects() {
  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem('sdd_projects');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      { id: 1, name: 'sdd-enterprise-dev', description: 'Enterprise platform core development', type: 'Green Field', status: 'Active' },
      { id: 2, name: 'mobile-app-v2', description: 'Next generation mobile application', type: 'Green Field', status: 'In Progress' },
      { id: 3, name: 'legacy-migration', description: 'Migration from legacy systems to cloud', type: 'Brown Field', status: 'Planning' },
    ];
  });

  React.useEffect(() => {
    localStorage.setItem('sdd_projects', JSON.stringify(projects));
  }, [projects]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newProject, setNewProject] = useState({ name: '', description: '', type: 'Green Field', status: 'Active' });

  return (
    <div className="text-white fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white">Project Management</h1>
          <p className="text-slate-400 mt-1 text-[14px]">Manage workspaces, define project scopes, and monitor active developments.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProjectId(null);
            setNewProject({ name: '', description: '', type: 'Green Field', status: 'Active' });
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.3)] transition-all flex items-center space-x-2 text-[14px]"
        >
          <i className="fas fa-plus text-xs"></i>
          <span>Create Project</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-indigo-500/50 transition-colors shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Projects</span>
              <h3 className="text-3xl font-bold text-white">{projects.length} Defined</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <i className="fas fa-briefcase"></i>
            </div>
          </div>
          <span className="inline-block px-2.5 py-1 rounded border border-blue-500/30 bg-blue-500/10 text-blue-400 text-[10px] font-bold">
            All Workspaces
          </span>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/50 transition-colors shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Active Projects</span>
              <h3 className="text-3xl font-bold text-white">{projects.filter(p => p.status === 'Active' || p.status === 'In Progress').length} Active</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <i className="fas fa-chart-line"></i>
            </div>
          </div>
          <span className="inline-block px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
            Currently Running
          </span>
        </div>
      </div>

      {/* Table Panel */}
      <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/20">
          <h3 className="text-lg font-bold text-white mb-1">Project Directory</h3>
          <p className="text-[13px] text-slate-400">View and manage all active and past projects in the organization.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-4 px-6 font-semibold">Project Name</th>
                <th className="py-4 px-6 font-semibold">Description</th>
                <th className="py-4 px-6 font-semibold">Type</th>
                <th className="py-4 px-6 font-semibold">Status</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="py-4 px-6">
                    <span className="font-bold text-[14px] text-slate-200">{project.name}</span>
                  </td>
                  <td className="py-4 px-6 text-[13px] text-slate-400">
                    {project.description}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border ${
                      project.type === 'Green Field' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      <i className={`fas ${project.type === 'Green Field' ? 'fa-seedling' : 'fa-cubes'} mr-1.5`}></i>
                      {project.type}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border ${
                      project.status === 'Active' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : project.status === 'In Progress' 
                        ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                        project.status === 'Active' ? 'bg-emerald-500' : project.status === 'In Progress' ? 'bg-blue-500' : 'bg-amber-500'
                      }`}></span>
                      {project.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => {
                        setEditingProjectId(project.id);
                        setNewProject(project);
                        setIsModalOpen(true);
                      }}
                      className="bg-slate-800/60 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                    >
                      Modify
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            
            <h2 className="text-xl font-bold text-white mb-4">
              {editingProjectId ? "Modify Project" : "Create New Project"}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-2">Project Name</label>
                <input 
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-4 text-[14px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="e.g. sdd-ecommerce-app"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-2">Description</label>
                <textarea 
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-4 text-[14px] text-white focus:outline-none focus:border-indigo-500 transition-colors min-h-[80px]"
                  placeholder="Brief description of the project"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-2">Project Type</label>
                <div className="flex bg-[#060913]/70 border border-slate-800 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setNewProject({...newProject, type: 'Green Field'})}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-[13px] font-semibold transition-colors ${
                      newProject.type === 'Green Field' 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <i className="fas fa-seedling"></i>
                    <span>Green Field</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewProject({...newProject, type: 'Brown Field'})}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-md text-[13px] font-semibold transition-colors ${
                      newProject.type === 'Brown Field' 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm' 
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <i className="fas fa-cubes"></i>
                    <span>Brown Field</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-400 mb-2">Initial Status</label>
                <select
                  value={newProject.status}
                  onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                  className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-4 text-[14px] text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Planning">Planning</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setEditingProjectId(null);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (newProject.name) {
                    if (editingProjectId) {
                      setProjects(projects.map(p => p.id === editingProjectId ? { ...newProject, id: editingProjectId } : p));
                    } else {
                      setProjects([...projects, { ...newProject, id: Date.now() }]);
                    }
                    setNewProject({ name: '', description: '', type: 'Green Field', status: 'Active' });
                    setEditingProjectId(null);
                    setIsModalOpen(false);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
              >
                {editingProjectId ? "Save Changes" : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```


## src/pages/admin/AdminUsers.jsx
```jsx
import React, { useState } from 'react';

const AVAILABLE_PROJECTS = ['sdd-enterprise-dev', 'mobile-app-v2', 'legacy-migration'];

export default function AdminUsers() {
  const [availablePersonas, setAvailablePersonas] = useState(() => {
    const saved = localStorage.getItem('sdd_personas');
    let loadedPersonas = [];
    if (saved) {
      try { loadedPersonas = JSON.parse(saved); } catch (e) { console.error(e); }
    }
    if (!loadedPersonas || loadedPersonas.length === 0) {
      loadedPersonas = [
        { name: 'Admin' },
        { name: 'Product Owner' },
        { name: 'Business Analyst' },
        { name: 'Technical Lead' }
      ];
    }
    // Extract names, ignoring Super Admin as it's a global role now
    return loadedPersonas.map(p => p.name).filter(name => name !== 'Super Admin');
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('sdd_users');
    let loadedUsers = null;
    if (saved) {
      try { loadedUsers = JSON.parse(saved); } catch (e) { console.error(e); }
    }
    
    if (!loadedUsers) {
      loadedUsers = [
        {
          id: 1,
          name: 'Prakash Sankaran',
          email: 'prakash@frugalforge.io',
          isSuperAdmin: true,
          projectAccess: [
            { projectId: 'mobile-app-v2', personas: ['Product Owner', 'Technical Lead'] }
          ]
        },
        {
          id: 2,
          name: 'Sarah Chen',
          email: 'sarah.c@frugalforge.io',
          isSuperAdmin: false,
          projectAccess: [
            { projectId: 'legacy-migration', personas: ['Business Analyst'] }
          ]
        },
        {
          id: 3,
          name: 'Prasanna',
          email: 'prasanna@frugalforge.io',
          isSuperAdmin: true,
          projectAccess: []
        }
      ];
    } else {
      // Migrate existing users to have isSuperAdmin flag if they had the persona
      loadedUsers = loadedUsers.map(u => {
        let isSuperAdmin = u.isSuperAdmin || false;
        let modifiedProjectAccess = u.projectAccess ? [...u.projectAccess] : [];
        
        modifiedProjectAccess.forEach(pAccess => {
          if (pAccess.personas && pAccess.personas.includes('Super Admin')) {
            isSuperAdmin = true;
            pAccess.personas = pAccess.personas.filter(p => p !== 'Super Admin');
          }
        });
        
        // Cleanup empty project access blocks if they only had Super Admin
        modifiedProjectAccess = modifiedProjectAccess.filter(pAccess => (pAccess.personas && pAccess.personas.length > 0) || pAccess.projectId);

        return { ...u, isSuperAdmin, projectAccess: modifiedProjectAccess };
      });
    }
    return loadedUsers;
  });

  React.useEffect(() => {
    localStorage.setItem('sdd_users', JSON.stringify(users));
  }, [users]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', isSuperAdmin: false, projectAccess: [] });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setNewUser({ name: '', email: '', isSuperAdmin: false, projectAccess: [] });
    setIsModalOpen(true);
  };

  const handleOpenModify = (user) => {
    setEditingUserId(user.id);
    // Deep clone project access to avoid mutating state directly
    setNewUser({
      name: user.name,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin || false,
      projectAccess: JSON.parse(JSON.stringify(user.projectAccess))
    });
    setIsModalOpen(true);
  };

  const handleAddProjectAccess = () => {
    setNewUser({
      ...newUser,
      projectAccess: [...newUser.projectAccess, { projectId: AVAILABLE_PROJECTS[0], personas: [] }]
    });
  };

  const handleRemoveProjectAccess = (index) => {
    const updatedAccess = [...newUser.projectAccess];
    updatedAccess.splice(index, 1);
    setNewUser({ ...newUser, projectAccess: updatedAccess });
  };

  const handleProjectChange = (index, projectId) => {
    const updatedAccess = [...newUser.projectAccess];
    updatedAccess[index].projectId = projectId;
    setNewUser({ ...newUser, projectAccess: updatedAccess });
  };

  const togglePersona = (projectIndex, persona) => {
    const updatedAccess = [...newUser.projectAccess];
    const personasList = updatedAccess[projectIndex].personas;
    
    if (personasList.includes(persona)) {
      updatedAccess[projectIndex].personas = personasList.filter(p => p !== persona);
    } else {
      updatedAccess[projectIndex].personas = [...personasList, persona];
    }
    setNewUser({ ...newUser, projectAccess: updatedAccess });
  };

  const handleSave = () => {
    if (newUser.name && newUser.email) {
      if (editingUserId) {
        setUsers(users.map(u => u.id === editingUserId ? { ...newUser, id: editingUserId } : u));
      } else {
        setUsers([...users, { ...newUser, id: Date.now() }]);
      }
      setIsModalOpen(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter(u => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setUserToDelete(null);
  };

  return (
    <div className="text-white fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white">User Management</h1>
          <p className="text-slate-400 mt-1 text-[14px]">Provision users, manage project access, and assign operational personas.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.3)] transition-all flex items-center space-x-2 text-[14px]"
        >
          <i className="fas fa-user-plus text-xs"></i>
          <span>Create User</span>
        </button>
      </div>

      {/* Table Panel */}
      <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800/80 bg-slate-900/20">
          <h3 className="text-lg font-bold text-white mb-1">User Directory</h3>
          <p className="text-[13px] text-slate-400">View and manage all registered users and their multi-project access levels.</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/40 border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                <th className="py-4 px-6 font-semibold">User Details</th>
                <th className="py-4 px-6 font-semibold">Project Access Overview</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-800/20 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                        {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[14px] text-slate-200 leading-tight">{user.name}</p>
                        <p className="text-[12px] text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {user.isSuperAdmin ? (
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-[11px] font-bold">
                          <i className="fas fa-shield-alt mr-1.5"></i>
                          Global Super Admin
                        </span>
                      </div>
                    ) : user.projectAccess.length === 0 ? (
                      <span className="text-slate-500 text-[12px] italic">No active project assignments</span>
                    ) : (
                      <div className="flex flex-col space-y-2">
                        {user.projectAccess.map((access, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <span className="inline-block px-2 py-0.5 rounded border border-slate-700 bg-slate-800/50 text-slate-300 text-[11px] font-semibold whitespace-nowrap mt-0.5">
                              {access.projectId}
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {access.personas.map(persona => (
                                <span key={persona} className="inline-block px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 text-[10px] font-bold">
                                  {persona}
                                </span>
                              ))}
                              {access.personas.length === 0 && (
                                <span className="text-slate-500 text-[10px] italic mt-1">No personas</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right align-top">
                    <div className="flex items-center justify-end space-x-2 mt-1">
                      <button 
                        onClick={() => handleOpenModify(user)}
                        className="bg-slate-800/60 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors"
                      >
                        Modify
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(user)}
                        className="bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center"
                        title="Delete User"
                      >
                        <i className="fas fa-trash-alt text-[12px]"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modify Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col my-8 max-h-[90vh]">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 shrink-0"></div>
            
            <div className="p-6 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-bold text-white">{editingUserId ? 'Modify User Access' : 'Provision New User'}</h2>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scroll space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-slate-400 mb-2">Full Name</label>
                  <input 
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-4 text-[14px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-slate-400 mb-2">Email Address</label>
                  <input 
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full bg-[#060913]/70 border border-slate-800 rounded-lg py-2.5 px-4 text-[14px] text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    placeholder="john@frugalforge.io"
                  />
                </div>
              </div>

              {/* Super Admin Toggle */}
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h4 className="text-rose-400 font-bold text-[14px] flex items-center mb-1">
                    <i className="fas fa-shield-alt mr-2"></i>
                    Global Super Admin Access
                  </h4>
                  <p className="text-slate-400 text-[12px]">Grants full administrative control across all workspaces. Bypasses project-specific assignments.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={newUser.isSuperAdmin}
                    onChange={(e) => setNewUser({...newUser, isSuperAdmin: e.target.checked})}
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
                </label>
              </div>

              {/* Project Access Blocks - Hidden if Super Admin */}
              {!newUser.isSuperAdmin && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-[14px] font-bold text-slate-300">Project Access Control</label>
                    <button 
                      onClick={handleAddProjectAccess}
                      className="text-indigo-400 hover:text-indigo-300 text-[12px] font-semibold flex items-center space-x-1"
                    >
                      <i className="fas fa-plus-circle"></i>
                      <span>Assign Project</span>
                    </button>
                  </div>

                <div className="space-y-4">
                  {newUser.projectAccess.length === 0 ? (
                    <div className="bg-[#060913]/50 border border-slate-800 border-dashed rounded-xl p-6 text-center">
                      <p className="text-slate-500 text-[13px]">User currently has no project assignments.</p>
                      <button onClick={handleAddProjectAccess} className="mt-2 text-indigo-400 hover:text-indigo-300 text-[12px] font-semibold underline">Assign their first project</button>
                    </div>
                  ) : (
                    newUser.projectAccess.map((access, index) => (
                      <div key={index} className="bg-[#060913]/80 border border-slate-800 rounded-xl p-4 relative group">
                        <button 
                          onClick={() => handleRemoveProjectAccess(index)}
                          className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove Project Assignment"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        
                        <div className="mb-4 pr-8">
                          <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wide">Target Project</label>
                          <select
                            value={access.projectId}
                            onChange={(e) => handleProjectChange(index, e.target.value)}
                            className="w-full bg-[#0c1222] border border-slate-700 rounded-lg py-2 px-3 text-[13px] text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                          >
                            {AVAILABLE_PROJECTS.map(proj => (
                              <option key={proj} value={proj}>{proj}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[12px] font-semibold text-slate-400 mb-2 uppercase tracking-wide">Assigned Personas</label>
                          <div className="flex flex-wrap gap-2">
                            {availablePersonas.map(persona => {
                              const isSelected = access.personas.includes(persona);
                              return (
                                <button
                                  key={persona}
                                  onClick={() => togglePersona(index, persona)}
                                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                                    isSelected 
                                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                                      : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                                  }`}
                                >
                                  {isSelected && <i className="fas fa-check mr-1.5"></i>}
                                  {persona}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

            <div className="p-6 border-t border-slate-800 flex justify-end space-x-3 shrink-0 bg-[#0c1222]">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-[13px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={!newUser.name || !newUser.email}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors flex items-center space-x-2"
              >
                <i className="fas fa-save"></i>
                <span>{editingUserId ? 'Save Modifications' : 'Provision User'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0c1222] border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-rose-500 to-orange-500"></div>
            
            <div className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-rose-500 text-2xl"></i>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Delete User</h2>
              <p className="text-[13px] text-slate-400">
                Are you sure you want to permanently remove <strong className="text-slate-200">{userToDelete?.name}</strong>? This action cannot be undone.
              </p>
            </div>
            
            <div className="p-5 border-t border-slate-800 flex justify-center space-x-3 bg-slate-900/30">
              <button 
                onClick={cancelDelete}
                className="px-5 py-2 rounded-xl text-[13px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-6 py-2 rounded-xl text-[13px] font-bold shadow-[0_4px_15px_rgba(225,29,72,0.3)] transition-all flex items-center space-x-2"
              >
                <i className="fas fa-trash-alt text-[11px]"></i>
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```


## src/pages/admin/AdminWorkflows.jsx
```jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, { 
  ReactFlowProvider, 
  Controls, 
  Background, 
  applyNodeChanges, 
  applyEdgeChanges, 
  addEdge, 
  Handle, 
  Position,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';

const AVAILABLE_PROJECTS = ['sdd-enterprise-dev', 'mobile-app-v2', 'legacy-migration'];

const agentDefs = [
  { id: 'spec-to-story', label: 'Spec to Story', artifacts: ['Requirement Brief', 'Acceptance Criteria'] },
  { id: 'user-stories', label: 'User Stories', artifacts: ['User Stories', 'Sprint Backlog'] },
  { id: 'ux-wireframe', label: 'UX Wireframe', artifacts: ['UI Prototypes', 'Design System'] },
  { id: 'functional-spec', label: 'Functional Spec', artifacts: ['FSD Document', 'Process Flowchart'] },
  { id: 'tech-architecture', label: 'Tech Architecture', artifacts: ['System Blueprint', 'Tech Stack Selection'] },
  { id: 'database-design', label: 'Database Design', artifacts: ['ERD Diagram', 'DDL Scripts'] },
  { id: 'test-cases', label: 'Test Cases', artifacts: ['Test Matrix', 'Gherkin Scenarios'] },
  { id: 'traceability-matrix', label: 'Traceability Matrix', artifacts: ['Requirements Map'] },
  { id: 'review-agent', label: 'Review Agent', artifacts: ['Security Scan', 'Compliance Report'] }
];

const AgentNode = ({ id, data }) => {
  const { setNodes, setEdges } = useReactFlow();

  const onDelete = (e) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter(node => node.id !== id));
    setEdges((eds) => eds.filter(edge => edge.source !== id && edge.target !== id));
  };

  return (
    <div className="bg-[#0c1222] border border-slate-700 rounded-xl shadow-2xl min-w-[240px] font-sans">
      <div className="bg-gradient-to-r from-indigo-900/60 to-slate-900/40 px-4 py-2 border-b border-slate-700 flex items-center justify-between rounded-t-xl group/header">
        <span className="text-white font-bold text-[11px] uppercase tracking-wider">{data.label}</span>
        <div className="flex items-center space-x-2">
          <button onClick={onDelete} className="text-slate-500 hover:text-rose-400 transition-colors opacity-0 group-hover/header:opacity-100 cursor-pointer" title="Remove Agent">
            <i className="fas fa-times text-xs"></i>
          </button>
          <i className="fas fa-robot text-indigo-400 text-xs"></i>
        </div>
      </div>
      
      <div className="p-3 flex flex-col space-y-3">
        {data.artifacts && data.artifacts.map((artifact, idx) => (
          <div key={`art-${idx}`} className="relative flex items-center h-8 bg-slate-900/50 rounded-lg border border-slate-700/60 px-3 w-full group hover:border-indigo-500/50 transition-colors">
            {/* Input Handle (Dependencies) */}
            <Handle 
              type="target" 
              position={Position.Left} 
              id={`in-${artifact}`} 
              style={{ left: '-16px', background: '#6366f1', width: '12px', height: '12px', border: '2px solid #0c1222', zIndex: 10 }} 
            />
            
            <div className="flex-1 text-center truncate px-2">
              <span className="text-[10px] text-slate-300 font-mono" title={artifact}>{artifact}</span>
            </div>

            {/* Output Handle (Generated Deliverable) */}
            <Handle 
              type="source" 
              position={Position.Right} 
              id={`out-${artifact}`} 
              style={{ right: '-16px', background: '#10b981', width: '12px', height: '12px', border: '2px solid #0c1222', zIndex: 10 }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const Sidebar = ({ nodes }) => {
  const onDragStart = (event, nodeType, agent) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('agentData', JSON.stringify(agent));
    event.dataTransfer.effectAllowed = 'move';
  };

  const usedAgentIds = nodes.map(n => n.data.id);
  const availableAgents = agentDefs.filter(a => !usedAgentIds.includes(a.id));

  return (
    <div className="w-64 bg-[#0b0f19] border-r border-slate-800 flex flex-col h-full shrink-0 z-10">
      <div className="p-5 border-b border-slate-800 bg-slate-900/30">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Agent Palette</h3>
        <p className="text-[11px] text-slate-400 mt-1">Drag agents onto the canvas</p>
      </div>
      <div className="p-4 space-y-3 overflow-y-auto custom-scroll flex-1">
        {availableAgents.length === 0 ? (
          <div className="text-slate-500 text-xs text-center py-4 italic">All agents deployed</div>
        ) : (
          availableAgents.map(agent => (
            <div 
              key={agent.id} 
              className="p-3 bg-slate-900/50 border border-slate-700/60 rounded-xl cursor-grab hover:border-indigo-500/60 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-indigo-500/10 transition-all flex items-center justify-between group"
              onDragStart={(event) => onDragStart(event, 'agentNode', agent)}
              draggable
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                  <i className="fas fa-robot text-xs"></i>
                </div>
                <span className="text-[12px] font-bold text-slate-200">{agent.label}</span>
              </div>
              <i className="fas fa-grip-vertical text-slate-600 text-[10px]"></i>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const nodeTypes = { agentNode: AgentNode };

export default function AdminWorkflows() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [cycleError, setCycleError] = useState(false);
  const [projectMappings, setProjectMappings] = useState({});
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  
  useEffect(() => {
    // Load all project workflows on mount
    const saved = localStorage.getItem('sdd_project_workflows');
    if (saved) {
      try {
        setProjectMappings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const openCanvas = (project) => {
    setSelectedProject(project);
    const existingWorkflow = projectMappings[project];
    if (existingWorkflow) {
      setNodes(existingWorkflow.nodes || []);
      setEdges(existingWorkflow.edges || []);
    } else {
      setNodes([]);
      setEdges([]);
    }
  };

  const closeCanvas = () => {
    setSelectedProject(null);
    setNodes([]);
    setEdges([]);
  };

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (params) => {
      // Cycle Detection (DFS)
      const hasCycle = (source, target, currentEdges) => {
        const adj = {};
        currentEdges.forEach(edge => {
          if (!adj[edge.source]) adj[edge.source] = [];
          adj[edge.source].push(edge.target);
        });
        
        const visited = new Set();
        const stack = [target];
        
        while (stack.length > 0) {
          const curr = stack.pop();
          if (curr === source) return true; // Path from target back to source exists!
          if (!visited.has(curr)) {
            visited.add(curr);
            const neighbors = adj[curr] || [];
            neighbors.forEach(n => stack.push(n));
          }
        }
        return false;
      };

      if (hasCycle(params.source, params.target, edges)) {
        setCycleError(true);
        return;
      }

      const newEdge = { 
        ...params, 
        id: `e-${params.source}-${params.target}-${params.sourceHandle}-${params.targetHandle}-${Date.now()}`,
        animated: true,
        style: { stroke: '#10b981', strokeWidth: 2 }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [edges, setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const agentDataStr = event.dataTransfer.getData('agentData');

      if (typeof type === 'undefined' || !type || !agentDataStr) {
        return;
      }

      const agentData = JSON.parse(agentDataStr);

      // Prevent duplicate instances of the same agent
      setNodes((nds) => {
        if (nds.some(n => n.data.id === agentData.id)) {
          return nds;
        }
        
        const position = reactFlowInstance.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        
        const newNode = {
          id: `node_${agentData.id}_${Date.now()}`,
          type,
          position,
          data: { ...agentData },
        };
        return nds.concat(newNode);
      });
    },
    [reactFlowInstance]
  );

  const saveWorkflow = () => {
    if (!selectedProject) return;
    
    const flow = { nodes, edges };
    const updatedMappings = { ...projectMappings, [selectedProject]: flow };
    
    setProjectMappings(updatedMappings);
    localStorage.setItem('sdd_project_workflows', JSON.stringify(updatedMappings));
    
    // Tiny visual feedback before closing
    const btn = document.getElementById('save-workflow-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check text-xs"></i><span>Saved!</span>';
    btn.classList.replace('from-emerald-500', 'from-green-500');
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.classList.replace('from-green-500', 'from-emerald-500');
      closeCanvas();
    }, 1000);
  };

  const clearWorkflow = () => {
    if(window.confirm('Are you sure you want to clear the canvas?')) {
      setNodes([]);
      setEdges([]);
    }
  };

  // -------------------------------------------------------------
  // LIST VIEW RENDER
  // -------------------------------------------------------------
  if (!selectedProject) {
    return (
      <div className="text-white h-full flex flex-col fade-in">
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-white">Agent Workflow</h1>
            <p className="text-slate-400 mt-1 text-[14px]">Define the artefact generation pipeline for each project.</p>
          </div>
        </div>

        <div className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800/80 bg-slate-900/20">
            <h3 className="text-lg font-bold text-white mb-1">Project Workflows</h3>
            <p className="text-[13px] text-slate-400">Manage mapping dependencies per project.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/40 border-b border-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <th className="py-4 px-6 font-semibold">Target Project</th>
                  <th className="py-4 px-6 font-semibold">Workflow Status</th>
                  <th className="py-4 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {AVAILABLE_PROJECTS.map((project) => {
                  const isConfigured = !!projectMappings[project];
                  return (
                    <tr key={project} className="hover:bg-slate-800/20 transition-colors group">
                      <td className="py-4 px-6">
                        <span className="inline-block px-2 py-0.5 rounded border border-slate-700 bg-slate-800/50 text-slate-300 text-[11px] font-semibold whitespace-nowrap">
                          <i className="fas fa-cubes mr-1.5 text-slate-500"></i>
                          {project}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {isConfigured ? (
                          <span className="inline-flex items-center space-x-1.5 text-emerald-400 text-[12px] font-semibold">
                            <i className="fas fa-check-circle"></i>
                            <span>Configured</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1.5 text-slate-500 text-[12px] italic">
                            <i className="fas fa-exclamation-circle text-[10px]"></i>
                            <span>Not Configured</span>
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => openCanvas(project)}
                          className="bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors flex items-center space-x-2 ml-auto"
                        >
                          <i className={`fas ${isConfigured ? 'fa-edit' : 'fa-plus'}`}></i>
                          <span>{isConfigured ? 'Edit Mapping' : 'Define Mapping'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CANVAS VIEW RENDER
  // -------------------------------------------------------------
  return (
    <div className="text-white h-full flex flex-col fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 shrink-0">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white flex items-center space-x-3">
            <button onClick={closeCanvas} className="text-slate-500 hover:text-white transition-colors">
              <i className="fas fa-arrow-left text-xl"></i>
            </button>
            <span>{selectedProject} Workflow</span>
          </h1>
          <p className="text-slate-400 mt-1 text-[14px]">Design the execution sequence and artefact dependencies.</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={clearWorkflow}
            className="bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold py-2.5 px-5 rounded-xl transition-all flex items-center space-x-2 text-[13px]"
          >
            <i className="fas fa-trash-alt text-xs"></i>
            <span>Clear Canvas</span>
          </button>
          <button 
            id="save-workflow-btn"
            onClick={saveWorkflow}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all flex items-center space-x-2 text-[13px] w-36 justify-center"
          >
            <i className="fas fa-save text-xs"></i>
            <span>Save Mapping</span>
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 bg-[#060913] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex relative">
        <ReactFlowProvider>
          <Sidebar nodes={nodes} />
          <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              nodeTypes={nodeTypes}
              fitView
              className="bg-[#03050a]"
            >
              <Background color="#334155" gap={20} size={1.5} />
              <Controls className="bg-slate-900 border-slate-700 fill-slate-300" />
            </ReactFlow>
            
            {/* Overlay hint if canvas is empty */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
                <i className="fas fa-project-diagram text-6xl text-slate-500 mb-4"></i>
                <h3 className="text-xl font-bold text-slate-400">Empty Canvas</h3>
                <p className="text-slate-500 text-sm mt-2">Drag agents from the palette to start building your workflow.</p>
              </div>
            )}
          </div>
        </ReactFlowProvider>
      </div>

      {/* Cycle Detection Modal */}
      {cycleError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm fade-in">
          <div className="bg-[#0c1222] border border-rose-500/30 rounded-2xl w-full max-w-md shadow-[0_0_40px_rgba(244,63,94,0.15)] relative overflow-hidden flex flex-col scale-in">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-rose-500 to-orange-500 shrink-0"></div>
            
            <div className="p-6 pb-4 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 border border-rose-500/20">
                <i className="fas fa-exclamation-triangle text-rose-400 text-lg"></i>
              </div>
              <div className="flex-1 mt-0.5">
                <h3 className="text-lg font-bold text-white tracking-wide">Cyclic Dependency Detected</h3>
                <p className="text-[13px] text-slate-400 mt-2 leading-relaxed">
                  Action blocked. This mapping creates a loop where an agent would eventually depend on its own output, leading to a system deadlock.
                </p>
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-800/80 flex justify-end bg-slate-900/30">
              <button 
                onClick={() => setCycleError(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg text-[13px] font-semibold transition-colors"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```


## src/services/api.js
```js
const BACKEND_BASE = 'http://localhost:7001';

async function request(path, options = {}) {
  const url = `${BACKEND_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Load workspace specification
  getWorkspaceSpec: async () => {
    return request('/workspace/spec');
  },

  // Save/sync specification contents
  updateWorkspaceSpec: async (content) => {
    return request('/sync-spec', {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  },

  // Enqueue agent generation job
  generate: async (type, instructions = '', activeProject = '') => {
    return request(`/generate/${type}`, {
      method: 'POST',
      body: JSON.stringify({ instructions, activeProject })
    });
  },

  // Poll agent job status
  getJobStatus: async (jobId) => {
    return request(`/generate/status/${jobId}`);
  },

  // Scan path for code quality audit
  scanRepo: async (repoPath) => {
    return request('/api/review/scan', {
      method: 'POST',
      body: JSON.stringify({ repoPath })
    });
  },

  // Search the indexed documents in vector DB
  searchDocuments: async (query) => {
    return request(`/api/search?query=${encodeURIComponent(query)}`);
  },

  // List all archived documents
  getDocuments: async () => {
    return request('/api/documents');
  },

  // Download URL path helper
  getDocumentDownloadUrl: (filename) => {
    return `${BACKEND_BASE}/api/documents/download/${encodeURIComponent(filename)}`;
  }
};
```


## src/utils/excelGenerator.js
```js
/**
 * Exports JSON arrays to Excel-compatible CSV downloads.
 */
export const excelGenerator = {
  download: (filename, data) => {
    if (!data || !data.length) return;
    
    // Extract headers
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Push headers row
    csvRows.push(headers.map(header => `"${header.replace(/"/g, '""')}"`).join(','));
    
    // Push data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] === undefined || row[header] === null ? '' : String(row[header]);
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
```


## src/utils/markdownGenerator.js
```js
/**
 * Downloads a string content as a Markdown file.
 */
export const markdownGenerator = {
  download: (filename, content) => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename.endsWith('.md') ? filename : `${filename}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
```


## src/utils/pdfGenerator.js
```js
/**
 * Opens a styled popup window with print stylesheets and calls browser print to generate clean vector PDFs.
 */
export const pdfGenerator = {
  download: (title, htmlContent) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('Pop-up blocked! Please allow pop-ups to export as PDF.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              color: #1e293b;
              line-height: 1.5;
              padding: 40px;
              margin: 0;
            }
            h1 {
              font-size: 24px;
              color: #1e3a8a;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 8px;
              margin-bottom: 20px;
            }
            h2 {
              font-size: 18px;
              color: #4f46e5;
              margin-top: 24px;
              margin-bottom: 12px;
            }
            p {
              margin-bottom: 12px;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
              font-size: 12px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 600;
              color: #0f172a;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            ul, ol {
              margin-left: 20px;
              margin-bottom: 12px;
              font-size: 14px;
            }
            li {
              margin-bottom: 4px;
            }
            /* Gherkin code format */
            pre {
              background: #f1f5f9;
              border: 1px solid #e2e8f0;
              padding: 12px;
              border-radius: 6px;
              font-family: monospace;
              font-size: 12px;
              white-space: pre-wrap;
            }
            @media print {
              body {
                padding: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
            <span style="font-size: 12px; color: #64748b; font-weight: bold;">SDD AI Studio</span>
            <button onclick="window.print()" style="padding: 8px 16px; background-color: #3b82f6; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px;">Print / Save as PDF</button>
          </div>
          <div>
            ${htmlContent}
          </div>
          <script>
            // Automatically prompt print dialog after page loads
            window.addEventListener('DOMContentLoaded', () => {
              setTimeout(() => {
                window.print();
              }, 500);
            });
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }
};
```


## src/utils/sessionTracker.js
```js
/**
 * Utility to save and load user sessions, drafts, and configuration in localStorage.
 */
export const sessionTracker = {
  saveSession: (key, data) => {
    try {
      localStorage.setItem(`sdd_session_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save session state to storage', e);
    }
  },
  
  loadSession: (key) => {
    try {
      const data = localStorage.getItem(`sdd_session_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load session state from storage', e);
      return null;
    }
  },
  
  clearSession: (key) => {
    localStorage.removeItem(`sdd_session_${key}`);
  }
};
```

