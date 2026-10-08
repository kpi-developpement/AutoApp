"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, X, FileText, Play, Check } from "lucide-react";
import Button from "../ui/Button";

interface BatchModalProps {
  templateName: string;
  onClose: () => void;
  onStartBatch: (files: string[]) => void;
}

export default function BatchModal({ templateName, onClose, onStartBatch }: BatchModalProps) {
  const [files, setFiles] = useState<{ path: string; name: string; selected: boolean }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBrowseFolder = async () => {
    try {
      setIsLoading(true);
      const { open } = await import('@tauri-apps/plugin-dialog');
      const { readDir } = await import('@tauri-apps/plugin-fs');

      const selectedFolder = await open({
        directory: true,
        multiple: false,
      });

      if (selectedFolder && typeof selectedFolder === 'string') {
        const entries = await readDir(selectedFolder);
        
        const fileEntries = entries
          .filter(entry => entry.isFile)
          .map(entry => ({
            path: `${selectedFolder}\\${entry.name}`,
            name: entry.name || "Unknown File",
            selected: true 
          }));

        setFiles(fileEntries);
      }
    } catch (error) {
      console.error("Failed to read folder:", error);
      alert("Error reading folder. Make sure you are running in Tauri.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFile = (index: number) => {
    const newFiles = [...files];
    newFiles[index].selected = !newFiles[index].selected;
    setFiles(newFiles);
  };

  const handleStart = () => {
    const selectedPaths = files.filter(f => f.selected).map(f => f.path);
    if (selectedPaths.length === 0) {
      alert("Please select at least one file.");
      return;
    }
    onStartBatch(selectedPaths);
  };

  return (
    <div className="modal-overlay">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="modal-content"
      >
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#c084fc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FolderOpen size={22} /> Batch Execution
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '5px' }}>
              Target: {templateName}
            </p>
          </div>
          <button onClick={onClose} className="icon-btn">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <Button variant="secondary" onClick={handleBrowseFolder} style={{ width: '100%', padding: '15px', borderStyle: 'dashed', borderColor: '#64748b' }}>
            <FolderOpen size={20} color="#c084fc" /> 
            {isLoading ? "Reading Folder..." : "BROWSE FOLDER TO INJECT"}
          </Button>

          {files.length > 0 && (
            <div className="file-list-container custom-scrollbar">
              <div className="flex-between" style={{ padding: '0 10px 10px 10px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Found {files.length} files</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#c084fc', textTransform: 'uppercase' }}>{files.filter(f => f.selected).length} Selected</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {files.map((file, idx) => (
                  <div 
                    key={idx} 
                    className={`file-item ${file.selected ? 'selected' : 'unselected'}`}
                    onClick={() => toggleFile(idx)}
                  >
                    <div className={`checkbox-custom ${file.selected ? 'checked' : ''}`}>
                      {file.selected && <Check size={12} color="white" />}
                    </div>
                    <FileText size={16} color={file.selected ? "#c084fc" : "#64748b"} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '500', fontFamily: "'Fira Code', monospace", color: file.selected ? 'white' : '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {file.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="success" onClick={handleStart} disabled={files.length === 0 || files.filter(f => f.selected).length === 0}>
            <Play size={18} /> START BATCH LOOP
          </Button>
        </div>
      </motion.div>
    </div>
  );
}