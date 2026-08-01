import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function AdminLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { path: '/admin/personas', label: 'Persona Management', icon: 'fas fa-users-cog', desc: 'Manage Roles' },
    { path: '/admin/projects', label: 'Project Management', icon: 'fas fa-briefcase', desc: 'Manage Projects' },
    { path: '/admin/users', label: 'User Management', icon: 'fas fa-user-shield', desc: 'Provision Users' },
    { path: '/admin/agents', label: 'Agent Pool', icon: 'fas fa-robot', desc: 'Configure Agents' },
    { path: '/admin/workflows', label: 'Workflows', icon: 'fas fa-project-diagram', desc: 'Pipeline Setup' },
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
              Admin Dashboard
            </h2>

            <div className="h-5 w-px bg-slate-800 mx-3 hidden lg:block"></div>
            
            {/* Project Chip */}
            <button className="hidden lg:flex items-center space-x-2 bg-slate-800/30 border border-slate-800 hover:bg-slate-800/60 rounded-lg px-3 py-1.5 text-xs text-slate-300 transition-colors">
              <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              <span>sdd-enterprise-dev</span>
              <svg className="w-3 h-3 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
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
