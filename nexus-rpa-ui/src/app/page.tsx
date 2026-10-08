"use client";

import { useState, useEffect } from "react";
import { rpaApi } from "../services/api";
import { Template, Step } from "../types";
import { Minus, X, Maximize2, Play, Pause, Square, Cpu, GripHorizontal, Target, Radio, Layers, PlayCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/ui/Button";
import FadeIn from "../components/animations/FadeIn";
import InteractiveBackground from "../components/animations/InteractiveBackground";
import CustomCursor from "../components/animations/CustomCursor";
import TemplateCard from "../components/features/TemplateCard";
import RecordingOverlay from "../components/features/RecordingOverlay";
import PlaybackOverlay from "../components/features/PlaybackOverlay";
import StepEditor from "../components/features/StepEditor";
import HeroSection from "../components/features/HeroSection";
import EditorHeader from "../components/features/EditorHeader";
import BatchModal from "../components/features/BatchModal";

export default function Dashboard() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [recordedSteps, setRecordedSteps] = useState<Step[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [recordingType, setRecordingType] = useState<"sequence" | "macro">("sequence");
  
  const [playingTemplate, setPlayingTemplate] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const [isWidgetMode, setIsWidgetMode] = useState(false);
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);

  const [isSniperMode, setIsSniperMode] = useState(false);
  const [sniperCountdown, setSniperCountdown] = useState(0);

  const [batchTemplateTarget, setBatchTemplateTarget] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"sequences" | "macros">("sequences");

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    try {
      const data = await rpaApi.getTemplates();
      setTemplates(data);
    } catch (error) { console.error(error); }
  };

  const handleDeleteTemplate = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this automation?")) {
      try {
        await rpaApi.deleteTemplate(id);
        loadTemplates(); 
      } catch (error) {
        console.error("Failed to delete template:", error);
      }
    }
  };

  useEffect(() => {
    if (!isWidgetMode) return;
    const resizeWidget = async () => {
      try {
        const { getCurrentWindow } = await import('@tauri-apps/api/window');
        const { LogicalSize } = await import('@tauri-apps/api/dpi');
        const appWindow = getCurrentWindow();
        
        if (isSniperMode) {
          await appWindow.setSize(new LogicalSize(250, 80));
          await appWindow.center();
        } else if (showWidgetMenu) {
          await appWindow.setSize(new LogicalSize(320, 500));
        } else {
          await appWindow.setSize(new LogicalSize(85, 110));
        }
      } catch (e) {}
    };
    resizeWidget();
  }, [showWidgetMenu, isWidgetMode, isSniperMode]);

  const minimizeToWidget = async () => {
    setIsWidgetMode(true); setShowWidgetMenu(false);
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const { LogicalSize, LogicalPosition } = await import('@tauri-apps/api/dpi');
      const appWindow = getCurrentWindow();
      await appWindow.setSize(new LogicalSize(85, 110));
      await appWindow.setPosition(new LogicalPosition(50, 50));
      await appWindow.setAlwaysOnTop(true);
    } catch (e) {}
  };

  const maximizeApp = async () => {
    setIsWidgetMode(false); setShowWidgetMenu(false); setIsSniperMode(false);
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      const { LogicalSize } = await import('@tauri-apps/api/dpi');
      const appWindow = getCurrentWindow();
      await appWindow.setSize(new LogicalSize(1200, 800));
      await appWindow.setAlwaysOnTop(false);
      setTimeout(async () => { await appWindow.center(); await appWindow.setFocus(); }, 100);
    } catch (e) {}
  };

  const closeApp = async () => {
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().close();
    } catch (e) {}
  };

  const handleSniperMode = async (stepIndex: number) => {
    setIsSniperMode(true);
    await minimizeToWidget();
    
    setSniperCountdown(3);
    let count = 3;
    
    const timer = setInterval(async () => {
      count -= 1;
      setSniperCountdown(count);
      
      if (count <= 0) {
        clearInterval(timer);
        try {
          const coords = await rpaApi.captureSingleClick();
          const newSteps = [...recordedSteps];
          newSteps[stepIndex].xCoordinate = coords.x;
          newSteps[stepIndex].yCoordinate = coords.y;
          setRecordedSteps(newSteps);
        } catch (error) {
          console.error("Sniper capture failed", error);
        } finally {
          await maximizeApp();
        }
      }
    }, 1000);
  };

  const handleStartRecording = (type: "sequence" | "macro") => {
    setRecordingType(type);
    setRecordedSteps([]);
    setCountdown(5);
    const timer = setInterval(async () => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          rpaApi.startRecording().catch(console.error);
          setIsRecording(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleWidgetStartRecording = async () => {
    await maximizeApp();
    setTimeout(() => { handleStartRecording("sequence"); }, 400);
  };

  const handleStopRecording = async () => {
    try {
      const steps = await rpaApi.stopRecording();
      setRecordedSteps(steps);
    } catch (error) { console.error(error); } 
    finally { setIsRecording(false); }
  };

  const handleSaveTemplate = async () => {
    let finalName = templateName.trim();
    if (!finalName) return alert("Enter a name.");
    
    if (recordingType === "macro" && !finalName.startsWith("PROC_")) {
      finalName = "PROC_" + finalName;
    }

    try {
      await rpaApi.saveTemplate({ name: finalName, steps: recordedSteps });
      setRecordedSteps([]); setTemplateName(""); loadTemplates(); 
    } catch (error) { console.error(error); }
  };

  const handleEditTemplate = (template: Template) => {
    setTemplateName(template.name);
    setRecordingType(template.name.startsWith("PROC_") ? "macro" : "sequence");
    
    // HADA HOWA L'FIX DYAL L'CRASH: Kan-t2kdou bli steps machi null 9bel man-dirou map
    const safeSteps = template.steps || [];
    setRecordedSteps(safeSteps.map(step => ({ ...step })));
  };

  const handlePlayTemplate = async (name: string) => {
    try { setPlayingTemplate(name); setIsPaused(false); await rpaApi.playTemplate(name); } 
    catch (error) { setPlayingTemplate(null); }
  };

  const handleStartBatch = async (filePaths: string[]) => {
    if (!batchTemplateTarget) return;
    try {
      setPlayingTemplate(`BATCH: ${batchTemplateTarget}`);
      setIsPaused(false);
      setBatchTemplateTarget(null); 
      await rpaApi.playBatchTemplate(batchTemplateTarget, filePaths);
    } catch (error) {
      setPlayingTemplate(null);
    }
  };

  const handlePause = async () => { await rpaApi.pausePlayback(); setIsPaused(true); };
  const handleResume = async () => { await rpaApi.resumePlayback(); setIsPaused(false); };
  const handleStop = async () => { await rpaApi.stopPlayback(); setPlayingTemplate(null); setIsPaused(false); };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    const newSteps = [...recordedSteps];
    if (direction === "up" && index > 0) {
      const temp = newSteps[index];
      newSteps[index] = newSteps[index - 1];
      newSteps[index - 1] = temp;
    } else if (direction === "down" && index < newSteps.length - 1) {
      const temp = newSteps[index];
      newSteps[index] = newSteps[index + 1];
      newSteps[index + 1] = temp;
    }
    newSteps.forEach((step, i) => (step.orderIndex = i));
    setRecordedSteps(newSteps);
  };

  const sequences = templates.filter(t => !t.name.startsWith("PROC_"));
  const macros = templates.filter(t => t.name.startsWith("PROC_"));

  if (isWidgetMode) {
    return (
      <div className="widget-container" style={{ alignItems: isSniperMode ? 'center' : 'flex-start', justifyContent: isSniperMode ? 'center' : 'flex-start' }}>
        <CustomCursor /> 
        {isSniperMode ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', background: 'rgba(0,0,0,0.9)', border: '1px solid rgba(59,130,246,0.5)', borderRadius: '50px', padding: '10px 20px', boxShadow: '0 0 30px rgba(59,130,246,0.5)' }}
          >
            <Target size={24} color="#60a5fa" className="animate-pulse" />
            {sniperCountdown > 0 ? (
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#f97316', fontFamily: "'Fira Code', monospace" }}>TARGET IN {sniperCountdown}...</span>
            ) : (
              <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#34d399', fontFamily: "'Fira Code', monospace" }}>CLICK NOW!</span>
            )}
          </motion.div>
        ) : (
          <>
            <div className="widget-drag-handle" data-tauri-drag-region>
              <GripHorizontal size={14} data-tauri-drag-region />
            </div>
            <div className="widget-bubble" onClick={() => setShowWidgetMenu(!showWidgetMenu)}>
              <Cpu size={30} />
            </div>
            <AnimatePresence>
              {showWidgetMenu && (
                <motion.div 
                  initial={{ opacity: 0, x: -20, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }} className="widget-menu"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '900', color: '#60a5fa', letterSpacing: '2px' }}>NEXUS<span style={{color: 'white'}}>.CORE</span></span>
                    <button onClick={maximizeApp} style={{ background: 'none', border: 'none', color: '#64748b' }}><Maximize2 size={16} /></button>
                  </div>
                  <Button variant="danger" size="sm" className="btn-full" onClick={handleWidgetStartRecording} style={{ justifyContent: 'flex-start', padding: '12px 15px', marginBottom: '5px', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', marginRight: '8px', boxShadow: '0 0 10px red' }}></div>
                    <span style={{ letterSpacing: '1px', fontWeight: 'bold' }}>INIT RECORDING</span>
                  </Button>
                  <div style={{ height: '1px', width: '100%', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', margin: '5px 0' }}></div>
                  {playingTemplate ? (
                    <div style={{ textAlign: 'center', padding: '15px 0' }}>
                      <div className="pulse-ring" style={{ width: '40px', height: '40px', margin: '0 auto 15px auto' }}><div className="pulse-core" style={{ width: '20px', height: '20px', background: '#34d399', boxShadow: '0 0 20px #34d399' }}></div></div>
                      <p style={{ color: '#34d399', fontSize: '0.85rem', marginBottom: '15px', fontWeight: 'bold' }}>Executing: {playingTemplate}</p>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {isPaused ? <Button variant="success" size="sm" onClick={handleResume}><Play size={16}/></Button> : <Button variant="secondary" size="sm" onClick={handlePause}><Pause size={16}/></Button>}
                        <Button variant="danger" size="sm" onClick={handleStop}><Square size={16}/></Button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold', margin: '5px 0' }}>Deployed Sequences</span>
                      {templates.map(t => (
                        <Button key={t.id} variant="secondary" size="sm" onClick={() => handlePlayTemplate(t.name)} style={{ width: '100%', justifyContent: 'flex-start', padding: '10px' }}>
                          <Play size={14} color="#60a5fa" style={{ marginRight: '8px' }} /> {t.name}
                        </Button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    );
  }

  return (
    // HNA RDDINA L'APP-CONTAINER TRANSPARENT BACH YBAN L'PC
    <div className="app-container" style={{ backgroundColor: 'transparent' }}>
      <CustomCursor />
      <InteractiveBackground />
      
      <div className="titlebar" data-tauri-drag-region>
        <button className="titlebar-btn" onClick={minimizeToWidget}><Minus size={18} /></button>
        <button className="titlebar-btn titlebar-close" onClick={closeApp}><X size={18} /></button>
      </div>
      
      <div className="container">
        <RecordingOverlay countdown={countdown} isRecording={isRecording} onStop={handleStopRecording} />
        <PlaybackOverlay isPlaying={playingTemplate !== null} isPaused={isPaused} templateName={playingTemplate || ""} onPause={handlePause} onResume={handleResume} onStop={handleStop} />

        {batchTemplateTarget && (
          <BatchModal templateName={batchTemplateTarget} onClose={() => setBatchTemplateTarget(null)} onStartBatch={handleStartBatch} />
        )}

        <FadeIn>
          <HeroSection 
            isRecording={isRecording} 
            hasRecordedSteps={recordedSteps.length > 0} 
            onStartSequence={() => handleStartRecording("sequence")}
            onStartMacro={() => handleStartRecording("macro")}
          />
        </FadeIn>

        {recordedSteps.length === 0 && !isRecording && (
          <FadeIn delay={0.2}>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
              <button 
                onClick={() => setActiveTab("sequences")}
                style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1.2rem', fontWeight: 'bold', color: activeTab === "sequences" ? '#3b82f6' : '#64748b', borderBottom: activeTab === "sequences" ? '3px solid #3b82f6' : '3px solid transparent', transition: 'all 0.3s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <PlayCircle size={20} /> Sequences
                </div>
              </button>
              <button 
                onClick={() => setActiveTab("macros")}
                style={{ background: 'none', border: 'none', padding: '10px 20px', fontSize: '1.2rem', fontWeight: 'bold', color: activeTab === "macros" ? '#34d399' : '#64748b', borderBottom: activeTab === "macros" ? '3px solid #34d399' : '3px solid transparent', transition: 'all 0.3s' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Layers size={20} /> Sub-Routines
                </div>
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "sequences" && (
                <motion.div key="seq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="grid-container">
                    {sequences.map((template) => (
                      <TemplateCard key={template.id} template={template} onPlay={handlePlayTemplate} onEdit={handleEditTemplate} onBatchPlay={(name) => setBatchTemplateTarget(name)} onDelete={handleDeleteTemplate} />
                    ))}
                    {sequences.length === 0 && <p style={{ color: '#64748b' }}>No sequences found.</p>}
                  </div>
                </motion.div>
              )}

              {activeTab === "macros" && (
                <motion.div key="mac" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="grid-container">
                    {macros.map((template) => (
                      <TemplateCard key={template.id} template={template} onPlay={handlePlayTemplate} onEdit={handleEditTemplate} onBatchPlay={(name) => setBatchTemplateTarget(name)} onDelete={handleDeleteTemplate} />
                    ))}
                    {macros.length === 0 && <p style={{ color: '#64748b' }}>No macros found.</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </FadeIn>
        )}

        {recordedSteps.length > 0 && !isRecording && (
          <FadeIn>
            <EditorHeader templateName={templateName} setTemplateName={setTemplateName} recordingType={recordingType} onSave={handleSaveTemplate} onDiscard={() => setRecordedSteps([])} />
            <StepEditor
              steps={recordedSteps} templates={templates}
              onUpdateStep={(index, field, value) => {
                const newSteps = [...recordedSteps]; newSteps[index] = { ...newSteps[index], [field]: value }; setRecordedSteps(newSteps);
              }}
              onAddAction={(type) => {
                const newIndex = recordedSteps.length > 0 ? Math.max(...recordedSteps.map(s => s.orderIndex)) + 1 : 0;
                const newStep: Step = type === "CLICK" 
                  ? { orderIndex: newIndex, type: "CLICK", delay: 2.0, xCoordinate: 0, yCoordinate: 0 }
                  : { orderIndex: newIndex, type: "ACTION", actionName: "CTRL_A", delay: 2.0 };
                setRecordedSteps([...recordedSteps, newStep]);
              }}
              onRemoveStep={(index) => {
                const newSteps = recordedSteps.filter((_, i) => i !== index); 
                newSteps.forEach((step, i) => (step.orderIndex = i)); 
                setRecordedSteps(newSteps);
              }}
              onSniperMode={handleSniperMode}
              onMoveStep={handleMoveStep} 
            />
          </FadeIn>
        )}
      </div>
    </div>
  );
}