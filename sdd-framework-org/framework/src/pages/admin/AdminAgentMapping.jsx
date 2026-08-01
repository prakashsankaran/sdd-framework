import React, { useState, useEffect } from 'react';

const AVAILABLE_PROJECTS = ['sdd-enterprise-dev', 'mobile-app-v2', 'legacy-migration'];
const AVAILABLE_PERSONAS = ['Super Admin', 'Admin', 'Product Owner', 'Business Analyst', 'Technical Lead', 'Developer', 'UX Designer', 'QA Engineer'];
const AVAILABLE_AGENTS = [
  'Spec to Story', 'User Stories', 'UX Wireframe', 'Functional Spec', 'Tech Architecture', 
  'Database Design', 'Test Cases', 'Traceability Matrix', 'Review Agent'
];

const INITIAL_MAPPINGS = [
  { id: 1, project: 'sdd-enterprise-dev', persona: 'Product Owner', agents: ['Spec to Story', 'User Stories'] },
  { id: 2, project: 'sdd-enterprise-dev', persona: 'Business Analyst', agents: ['Functional Spec', 'Traceability Matrix'] },
  { id: 3, project: 'mobile-app-v2', persona: 'UX Designer', agents: ['UX Wireframe'] }
];

export default function AdminAgentMapping() {
  const [mappings, setMappings] = useState(() => {
    const saved = localStorage.getItem('agentMappings');
    return saved ? JSON.parse(saved) : INITIAL_MAPPINGS;
  });

  useEffect(() => {
    localStorage.setItem('agentMappings', JSON.stringify(mappings));
  }, [mappings]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMappingId, setEditingMappingId] = useState(null);
  const [newMapping, setNewMapping] = useState({ project: AVAILABLE_PROJECTS[0], persona: AVAILABLE_PERSONAS[2], agents: [] });

  const handleOpenCreate = () => {
    setEditingMappingId(null);
    setNewMapping({ project: AVAILABLE_PROJECTS[0], persona: AVAILABLE_PERSONAS[2], agents: [] });
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
                    {AVAILABLE_PERSONAS.map(persona => (
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
