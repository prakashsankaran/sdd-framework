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
  { id: 'workspace-context', label: 'Workspace Context', artifacts: ['Requirement Brief', 'Legacy Code', 'Business Rules'] },
  { id: 'spec-to-story', label: 'Spec to Story', artifacts: ['User Stories', 'Acceptance Criteria'] },
  { id: 'functional-spec', label: 'Functional Spec', artifacts: ['FSD Document', 'Process Flowchart'] },
  { id: 'tech-arch', label: 'Tech Architecture', artifacts: ['System Blueprint', 'Tech Stack Selection'] },
  { id: 'db-design', label: 'Database Design', artifacts: ['ERD Diagram', 'DDL Scripts'] },
  { id: 'test-cases', label: 'Test Cases', artifacts: ['Test Matrix', 'Gherkin Scenarios'] },
  { id: 'traceability', label: 'Traceability Matrix', artifacts: ['Requirements Map'] },
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
