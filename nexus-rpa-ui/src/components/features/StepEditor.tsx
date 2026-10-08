"use client";

import { MousePointer2, Zap, Trash2, Plus, Cpu, Layers, FolderOpen, Check, FileText, Target, ChevronUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Step, Template } from "../../types";
import Button from "../ui/Button";
import ModernSelect, { OptionGroup } from "../ui/ModernSelect";

interface StepEditorProps {
  steps: Step[];
  templates: Template[];
  onUpdateStep: (index: number, field: keyof Step, value: any) => void;
  onAddAction: (type: "CLICK" | "ACTION") => void;
  onRemoveStep: (index: number) => void;
  onSniperMode: (index: number) => void;
  onMoveStep: (index: number, direction: "up" | "down") => void;
}

export default function StepEditor({ steps, templates, onUpdateStep, onAddAction, onRemoveStep, onSniperMode, onMoveStep }: StepEditorProps) {
  
  const optionGroups: OptionGroup[] = [
    {
      groupLabel: "Custom Macros",
      options: templates.filter(t => t.name.startsWith("PROC_")).map(t => ({ value: `CUSTOM_PROC_${t.name}`, label: `RUN: ${t.name}`, type: "custom" }))
    },
    {
      groupLabel: "System Procedures",
      options: [
        { value: "OPEN_CHROME", label: "SYS: Open Google Chrome", type: "builtin" }, // <-- ZEDNA HADI HNA
        { value: "BROWSE_AND_INJECT_FILES", label: "SYS: Browse Folder & Loop", type: "builtin" },
        { value: "SAVE_CLIPBOARD_TO_CSV", label: "SYS: Save Clipboard to Local PC", type: "builtin" },
      ]
    },
    {
      groupLabel: "Basic Actions",
      options: [
        { value: "TYPE_TEXT", label: "Type Custom Text (Paste)", type: "basic" },
        { value: "TYPE_LAST_SAVED_FILE", label: "Type Last Saved File Path (Memory)", type: "basic" }, 
        { value: "TYPE_CURRENT_FILE", label: "Type Current File Path (Batch Loop)", type: "basic" },
        { value: "CTRL_A", label: "Select All (Ctrl+A)", type: "basic" },
        { value: "CTRL_C", label: "Copy (Ctrl+C)", type: "basic" },
        { value: "CTRL_V", label: "Paste (Ctrl+V)", type: "basic" },
        { value: "CTRL_L", label: "Focus Address Bar (Ctrl+L)", type: "basic" },
        { value: "CTRL_HOME", label: "Go to Top (Ctrl+Home)", type: "basic" },
        { value: "TAB", label: "Press Tab", type: "basic" }, 
        { value: "ENTER", label: "Press Enter", type: "basic" },
        { value: "ESC", label: "Press Escape", type: "basic" },
        { value: "WIN_UP", label: "Maximize (Win+Up)", type: "basic" },
        { value: "MAXIMIZE_WINDOW", label: "Force Maximize (Alt+Space, X)", type: "basic" },
        { value: "ALT_F4", label: "Close Window (Alt+F4)", type: "basic" },
        { value: "TYPE_N", label: "Press 'N' (No Save)", type: "basic" },
        { value: "DOUBLE_CLICK", label: "Double Click", type: "basic" },
      ]
    }
  ];

  const handleBrowseFolder = async (index: number) => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const { readDir } = await import('@tauri-apps/plugin-fs');

      const selectedFolder = await open({ directory: true, multiple: false });

      if (selectedFolder && typeof selectedFolder === 'string') {
        const entries = await readDir(selectedFolder);
        const fileEntries = entries
          .filter(entry => entry.isFile)
          .map(entry => ({
            path: `${selectedFolder}\\${entry.name}`,
            name: entry.name || "Unknown File",
            selected: true
          }));

        const newParam = JSON.stringify({ mode: 'LOOP', files: fileEntries });
        onUpdateStep(index, 'parameter', newParam);
      }
    } catch (error) {
      console.error("Failed to read folder:", error);
    }
  };

  const handleBrowseSaveFolder = async (index: number, currentParam: string) => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selectedFolder = await open({ directory: true, multiple: false });
      
      if (selectedFolder && typeof selectedFolder === 'string') {
        let data = { folder: selectedFolder, filename: "Extracted_Data.csv" };
        try {
          if (currentParam && currentParam.startsWith("{")) {
            data = { ...JSON.parse(currentParam), folder: selectedFolder };
          }
        } catch(e) {}
        onUpdateStep(index, 'parameter', JSON.stringify(data));
      }
    } catch (error) {
      console.error("Failed to pick folder:", error);
    }
  };

  const toggleFileSelection = (stepIndex: number, fileIndex: number, currentParam: string) => {
    const data = JSON.parse(currentParam);
    data.files[fileIndex].selected = !data.files[fileIndex].selected;
    onUpdateStep(stepIndex, 'parameter', JSON.stringify(data));
  };

  const toggleMode = (stepIndex: number, currentParam: string) => {
    const data = JSON.parse(currentParam);
    data.mode = data.mode === 'LOOP' ? 'ALL' : 'LOOP';
    onUpdateStep(stepIndex, 'parameter', JSON.stringify(data));
  };

  return (
    <div style={{ background: 'rgba(10,10,15,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '25px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
        <h2 style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.8rem', textShadow: '0 0 15px rgba(59,130,246,0.5)', margin: 0 }}>
          <Zap size={28} /> Sequence Editor
        </h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" size="sm" onClick={() => onAddAction("CLICK")} style={{ borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60a5fa' }}>
            <MousePointer2 size={16} /> Add Click
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onAddAction("ACTION")} style={{ borderColor: 'rgba(168, 85, 247, 0.3)', color: '#c084fc' }}>
            <Zap size={16} /> Add Action / Macro
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '50px' }}>
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => {
            const isCustomProc = step.type === "ACTION" && step.actionName?.startsWith("CUSTOM_PROC_");
            const isBuiltInProc = step.type === "ACTION" && step.actionName?.startsWith("PROC_") || step.actionName === "OPEN_CHROME";
            const isFolderLoop = step.type === "ACTION" && step.actionName === "BROWSE_AND_INJECT_FILES";
            const isTypeText = step.type === "ACTION" && step.actionName === "TYPE_TEXT";
            const isSaveLocal = step.type === "ACTION" && step.actionName === "SAVE_CLIPBOARD_TO_CSV";

            let borderColor = 'rgba(59, 130, 246, 0.2)';
            if (isCustomProc) borderColor = 'rgba(16, 185, 129, 0.3)';
            if (isBuiltInProc || isFolderLoop || isSaveLocal) borderColor = 'rgba(249, 115, 22, 0.3)';

            let folderData = { files: [], mode: 'LOOP' };
            if (isFolderLoop && step.parameter) {
              try { folderData = JSON.parse(step.parameter); } catch(e) {}
            }

            let saveData = { folder: "", filename: "" };
            if (isSaveLocal && step.parameter) {
              try { 
                if (step.parameter.startsWith("{")) saveData = JSON.parse(step.parameter); 
                else saveData.filename = step.parameter;
              } catch(e) {}
            }

            return (
              <motion.div 
                key={step.orderIndex} 
                layout
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 30, scale: 0.95, filter: "blur(4px)" }}
                transition={{ duration: 0.25, type: "spring", bounce: 0.3 }}
                style={{ 
                  display: 'flex', 
                  flexDirection: (isFolderLoop || isTypeText || isSaveLocal) ? 'column' : 'row', 
                  alignItems: (isFolderLoop || isTypeText || isSaveLocal) ? 'stretch' : 'center',
                  justifyContent: 'space-between', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: `1px solid ${borderColor}`, 
                  padding: '15px 20px', 
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ color: '#64748b', fontFamily: "'Fira Code', monospace", fontWeight: 900, fontSize: '1.1rem', width: '40px' }}>
                      [{String(index + 1).padStart(2, '0')}]
                    </span>

                    {step.type === "CLICK" ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', width: '100px', color: '#3b82f6' }}>
                          <MousePointer2 size={18} /> Click
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>X:</span>
                          <input type="number" value={step.xCoordinate || 0} onChange={(e) => onUpdateStep(index, "xCoordinate", Number(e.target.value))} style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#60a5fa', padding: '8px 12px', borderRadius: '6px', fontFamily: "'Fira Code', monospace", fontSize: '14px', textAlign: 'center', width: '70px', cursor: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' }}>Y:</span>
                          <input type="number" value={step.yCoordinate || 0} onChange={(e) => onUpdateStep(index, "yCoordinate", Number(e.target.value))} style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#60a5fa', padding: '8px 12px', borderRadius: '6px', fontFamily: "'Fira Code', monospace", fontSize: '14px', textAlign: 'center', width: '70px', cursor: 'none' }} />
                        </div>
                        
                        <button onClick={() => onSniperMode(index)} title="Sniper Mode: Pick Coordinate" style={{ background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3b82f6', padding: '5px', borderRadius: '6px', marginLeft: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none' }}>
                          <Target size={18} />
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', width: '100px', color: isCustomProc ? '#34d399' : ((isBuiltInProc || isFolderLoop || isSaveLocal) ? '#fb923c' : '#c084fc') }}>
                          {isCustomProc ? <Layers size={18} /> : ((isBuiltInProc || isFolderLoop || isSaveLocal) ? <Cpu size={18} /> : <Zap size={18} />)} 
                          {isCustomProc ? 'Macro' : ((isBuiltInProc || isFolderLoop || isSaveLocal) ? 'Sys' : 'Action')}
                        </div>
                        <ModernSelect value={step.actionName || "CTRL_A"} onChange={(val) => onUpdateStep(index, "actionName", val)} groups={optionGroups} />
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>Delay</span>
                      <input type="number" step="0.1" value={step.delay} onChange={(e) => onUpdateStep(index, "delay", Number(e.target.value))} style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#eab308', padding: '8px 12px', borderRadius: '6px', fontFamily: "'Fira Code', monospace", fontSize: '14px', textAlign: 'center', width: '60px', borderColor: 'rgba(234, 179, 8, 0.3)', cursor: 'none' }} />
                      <span style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'lowercase', fontWeight: 800, letterSpacing: '1px' }}>s</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', background: 'rgba(255,255,255,0.02)', padding: '2px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <button onClick={() => onMoveStep(index, "up")} disabled={index === 0} style={{ background: 'none', border: 'none', color: index === 0 ? '#334155' : '#94a3b8', padding: '2px', borderRadius: '4px', cursor: index === 0 ? 'default' : 'none' }}>
                        <ChevronUp size={16} />
                      </button>
                      <button onClick={() => onMoveStep(index, "down")} disabled={index === steps.length - 1} style={{ background: 'none', border: 'none', color: index === steps.length - 1 ? '#334155' : '#94a3b8', padding: '2px', borderRadius: '4px', cursor: index === steps.length - 1 ? 'default' : 'none' }}>
                        <ChevronDown size={16} />
                      </button>
                    </div>

                    <button onClick={() => onRemoveStep(index)} title="Remove Step" style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'none' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {isTypeText && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed rgba(192, 132, 252, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Text to Type:</span>
                      <input type="text" value={step.parameter || ""} onChange={(e) => onUpdateStep(index, "parameter", e.target.value)} style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(192, 132, 252, 0.3)', color: 'white', padding: '8px 12px', borderRadius: '6px', fontFamily: "'Fira Code', monospace", fontSize: '14px', flex: 1, cursor: 'none' }} placeholder="Enter text here..." />
                    </div>
                  </div>
                )}

                {isSaveLocal && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed rgba(249, 115, 22, 0.3)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleBrowseSaveFolder(index, step.parameter || "{}")} style={{ borderColor: 'rgba(249, 115, 22, 0.4)', color: '#fb923c' }}>
                          <FolderOpen size={14} /> Select Save Destination
                        </Button>
                        <span style={{ fontSize: '0.75rem', color: '#cbd5e1', fontFamily: "'Fira Code', monospace" }}>
                          {saveData.folder || "Default: C:\\Nexus_Data"}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '0.75rem', color: '#fb923c', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>File Name:</span>
                        <input 
                          type="text" 
                          value={saveData.filename || ""} 
                          onChange={(e) => {
                            const newData = { ...saveData, filename: e.target.value };
                            onUpdateStep(index, "parameter", JSON.stringify(newData));
                          }} 
                          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(249, 115, 22, 0.3)', color: 'white', padding: '8px 12px', borderRadius: '6px', fontFamily: "'Fira Code', monospace", fontSize: '14px', flex: 1, cursor: 'none' }} 
                          placeholder="e.g., My_Data.csv" 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {isFolderLoop && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed rgba(249, 115, 22, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <Button variant="secondary" size="sm" onClick={() => handleBrowseFolder(index)} style={{ borderColor: 'rgba(59, 130, 246, 0.4)', color: '#60a5fa' }}>
                        <FolderOpen size={14} /> Browse Folder
                      </Button>
                      
                      {folderData.files.length > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Execution Mode:</span>
                          <button 
                            onClick={() => toggleMode(index, step.parameter!)}
                            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', borderRadius: '6px', color: folderData.mode === 'LOOP' ? '#34d399' : '#c084fc', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'none' }}
                          >
                            {folderData.mode === 'LOOP' ? '🔄 Loop Subsequent Steps' : '⚡ Drop All At Once'}
                          </button>
                        </div>
                      )}
                    </div>

                    {folderData.files.length > 0 && (
                      <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '10px', maxHeight: '150px', overflowY: 'auto' }} className="custom-scrollbar">
                        {folderData.files.map((file: any, fIdx: number) => (
                          <div key={fIdx} onClick={() => toggleFileSelection(index, fIdx, step.parameter!)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', borderRadius: '6px', background: file.selected ? 'rgba(59,130,246,0.1)' : 'transparent', opacity: file.selected ? 1 : 0.5, marginBottom: '4px', cursor: 'none' }}>
                            <div style={{ width: '14px', height: '14px', border: `1px solid ${file.selected ? '#3b82f6' : '#64748b'}`, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: file.selected ? '#3b82f6' : 'transparent' }}>
                              {file.selected && <Check size={10} color="white" />}
                            </div>
                            <FileText size={14} color={file.selected ? "#60a5fa" : "#64748b"} />
                            <span style={{ fontSize: '0.75rem', fontFamily: "'Fira Code', monospace", color: file.selected ? 'white' : '#cbd5e1' }}>{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}