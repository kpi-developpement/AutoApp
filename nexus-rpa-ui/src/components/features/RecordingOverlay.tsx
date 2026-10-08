"use client";

import { motion } from "framer-motion";
import { Square } from "lucide-react";
import Button from "../ui/Button";

interface RecordingOverlayProps {
  countdown: number;
  isRecording: boolean;
  onStop: () => void;
}

export default function RecordingOverlay({ countdown, isRecording, onStop }: RecordingOverlayProps) {
  if (countdown === 0 && !isRecording) return null;

  return (
    <div className="overlay">
      <div>
        {countdown > 0 ? (
          <motion.div
            key={countdown}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.5, opacity: 0 }}
            className="countdown"
          >
            {countdown}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="recording-box">
            <div className="pulse-ring">
              <div className="pulse-core"></div>
            </div>
            
            <h2 style={{ fontSize: '2.5rem', letterSpacing: '2px', color: 'white' }}>RECORDING IN PROGRESS</h2>
            <p style={{ color: '#64748b', fontSize: '1.2rem' }}>Perform your clicks in Citrix. The engine is tracking...</p>

            <Button variant="danger" size="lg" onClick={onStop} style={{ marginTop: '20px' }}>
              <Square size={20} fill="currentColor" /> STOP RECORDING
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}