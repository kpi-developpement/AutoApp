"use client";

import { motion } from "framer-motion";
import { Pause, Play, Square } from "lucide-react";
import Button from "../ui/Button";

interface PlaybackOverlayProps {
  isPlaying: boolean;
  isPaused: boolean;
  templateName: string;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export default function PlaybackOverlay({ isPlaying, isPaused, templateName, onPause, onResume, onStop }: PlaybackOverlayProps) {
  if (!isPlaying) return null;

  return (
    <div className="playback-panel-container">
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="playback-panel">
        
        <div className="flex-row" style={{ gap: '15px' }}>
          <div className={`status-indicator ${isPaused ? 'status-paused' : 'status-active'}`}></div>
          <div>
            <p style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Executing</p>
            <p style={{ fontSize: '0.9rem', color: 'white', fontWeight: '600' }}>{templateName}</p>
          </div>
        </div>

        <div className="divider"></div>

        <div className="flex-row" style={{ gap: '10px' }}>
          {isPaused ? (
            <Button variant="success" size="sm" onClick={onResume}>
              <Play size={14} /> Resume
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={onPause}>
              <Pause size={14} /> Pause
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={onStop}>
            <Square size={14} /> Abort
          </Button>
        </div>

      </motion.div>
    </div>
  );
}