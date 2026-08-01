import React, { useState } from 'react';

const AVAILABLE_PROJECTS = ['sdd-enterprise-dev', 'mobile-app-v2', 'legacy-migration'];
const AVAILABLE_PERSONAS = ['Super Admin', 'Admin', 'Product Owner', 'Business Analyst', 'Technical Lead', 'Developer'];

export default function AdminUsers() {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Prakash Sankaran',
      email: 'prakash@frugalforge.io',
      projectAccess: [
        { projectId: 'sdd-enterprise-dev', personas: ['Super Admin'] },
        { projectId: 'mobile-app-v2', personas: ['Product Owner', 'Technical Lead'] }
      ]
    },
    {
      id: 2,
      name: 'Sarah Chen',
      email: 'sarah.c@frugalforge.io',
      projectAccess: [
        { projectId: 'legacy-migration', personas: ['Business Analyst'] }
      ]
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', email: '', projectAccess: [] });

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setNewUser({ name: '', email: '', projectAccess: [] });
    setIsModalOpen(true);
  };

  const handleOpenModify = (user) => {
    setEditingUserId(user.id);
    // Deep clone project access to avoid mutating state directly
    setNewUser({
      name: user.name,
      email: user.email,
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
                    {user.projectAccess.length === 0 ? (
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
                    <button 
                      onClick={() => handleOpenModify(user)}
                      className="bg-slate-800/60 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-colors mt-1"
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

              {/* Project Access Blocks */}
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
                            {AVAILABLE_PERSONAS.map(persona => {
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
    </div>
  );
}
