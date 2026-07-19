import React, { useRef } from 'react';

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
        disabled={isLoading || files.length === 0}
        class={`w-full py-3 font-semibold rounded-xl text-xs flex items-center justify-center space-x-2 transition duration-300 ${
          isLoading || files.length === 0
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
