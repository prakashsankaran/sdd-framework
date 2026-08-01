import React, { useState } from 'react';

export default function AdminPersonas() {
  const [personas, setPersonas] = useState([
    { name: 'Admin', role: 'Global Config, Security, Orchestration', status: 'System' },
    { name: 'Product Owner', role: 'Backlog, Epics, Stories, Stakeholder Signoff', status: 'System' },
    { name: 'Business Analyst', role: 'Requirements, BRD, Use-case Generation', status: 'System' },
    { name: 'Technical Lead', role: 'Code Reviews, Architecture, Technical Tasking', status: 'System' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPersona, setNewPersona] = useState({ name: '', role: '', status: 'Custom' });

  return (
    <div className="text-white fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-white">Persona Management</h1>
          <p className="text-slate-400 mt-1 text-[14px]">Establish organizational personas and parameter thresholds for target SDLC outcomes.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
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
              <h3 className="text-3xl font-bold text-white">6 Default</h3>
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
              <h3 className="text-3xl font-bold text-white">2 Active</h3>
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
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                      {persona.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button className="bg-slate-800/60 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors">
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
            
            <h2 className="text-xl font-bold text-white mb-4">Create Custom Persona</h2>
            
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
                  if (newPersona.name) {
                    setPersonas([...personas, newPersona]);
                    setNewPersona({ name: '', role: '', status: 'Custom' });
                    setIsModalOpen(false);
                  }
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors"
              >
                Create Persona
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
