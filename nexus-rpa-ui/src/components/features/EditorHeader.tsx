"use client";

import { Save, Terminal } from "lucide-react";
import Button from "../ui/Button";

interface EditorHeaderProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  recordingType: "sequence" | "macro";
  onSave: () => void;
  onDiscard: () => void;
}

export default function EditorHeader({ templateName, setTemplateName, recordingType, onSave, onDiscard }: EditorHeaderProps) {
  const isMacro = recordingType === "macro";
  const labelColor = isMacro ? "#34d399" : "#3b82f6";
  const glowColor = isMacro ? "rgba(16, 185, 129, 0.2)" : "rgba(59, 130, 246, 0.2)";
  const placeholder = isMacro ? "e.g., PROC_LOGIN_SYSTEM" : "e.g., DATA_EXTRACTION_PROTOCOL";

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      background: 'linear-gradient(90deg, rgba(10,10,15,0.9), rgba(5,5,10,0.95))', 
      border: `1px solid ${labelColor}`, 
      borderRadius: '16px', 
      padding: '20px 30px', 
      marginBottom: '30px', 
      boxShadow: `0 10px 30px rgba(0,0,0,0.8), inset 0 0 20px ${glowColor}`,
      backdropFilter: 'blur(15px)',
      maxWidth: '1000px',
      margin: '0 auto 30px auto'
    }}>
      
      {/* LEFT SIDE: TERMINAL INPUT */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginRight: '40px' }}>
        <label style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={14} color={labelColor} />
          {isMacro ? "Macro Identifier" : "Sequence Identifier"}
        </label>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: `2px solid ${labelColor}`, paddingBottom: '5px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: labelColor }}>{'>'}</span>
          <input
            type="text"
            placeholder={placeholder}
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'white', 
              fontSize: '1.5rem', 
              fontWeight: 700, 
              width: '100%', 
              fontFamily: "'Fira Code', monospace", 
              cursor: 'none',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* RIGHT SIDE: BUTTONS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Button variant="ghost" size="lg" onClick={onDiscard} style={{ color: '#ef4444' }}>
          DISCARD
        </Button>
        <Button variant="success" size="lg" onClick={onSave} style={{ boxShadow: `0 0 20px rgba(16,185,129,0.3)` }}>
          <Save size={18} /> COMMIT {isMacro ? "MACRO" : "SEQUENCE"}
        </Button>
      </div>

    </div>
  );
}