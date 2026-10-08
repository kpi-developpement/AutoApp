"use client";

import { Play, Activity, Settings2, FolderOpen, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import { Template } from "../../types";

interface TemplateCardProps {
  template: Template;
  onPlay: (name: string) => void;
  onEdit: (template: Template) => void;
  onBatchPlay: (name: string) => void;
  onDelete: (id: number) => void; // <-- ZEDNA HADI
}

export default function TemplateCard({ template, onPlay, onEdit, onBatchPlay, onDelete }: TemplateCardProps) {
  const isMacro = template.name.startsWith("PROC_");

  return (
    <div className="card template-card">
      <div>
        <div className="flex-between" style={{ marginBottom: '15px' }}>
          <h3 style={{ color: isMacro ? '#34d399' : '#e2e8f0', fontSize: '1.1rem', fontWeight: 'bold' }}>
            {template.name}
          </h3>
          
          <div className="flex-row" style={{ gap: '5px' }}>
            {/* L'BOUTON DYAL DELETE */}
            <button onClick={() => template.id && onDelete(template.id)} className="icon-btn" title="Delete Sequence" style={{ padding: '4px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '6px' }}>
              <Trash2 size={16} />
            </button>
            <button onClick={() => onEdit(template)} className="icon-btn" title="Edit Configuration" style={{ padding: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
              <Settings2 size={16} />
            </button>
            <Activity size={16} color="#64748b" />
          </div>
        </div>
        
        <div className="badge-group">
          <span className="badge">{template.steps.length} Steps</span>
          <span className="badge">{isMacro ? "Macro" : "Sequence"}</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-2">
        <Button variant={isMacro ? "success" : "primary"} size="sm" className="btn-full" onClick={() => onPlay(template.name)}>
          <Play size={14} /> Initialize {isMacro ? "Macro" : "Sequence"}
        </Button>
        {!isMacro && (
          <Button variant="secondary" size="sm" className="btn-full" onClick={() => onBatchPlay(template.name)} style={{ borderColor: 'rgba(168, 85, 247, 0.3)', color: '#c084fc' }}>
            <FolderOpen size={14} /> Batch Run (Folder)
          </Button>
        )}
      </div>
    </div>
  );
}