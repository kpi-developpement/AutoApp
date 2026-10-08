"use client";

import { PlayCircle, TerminalSquare, Layers } from "lucide-react";
import Button from "../ui/Button";

interface HeroSectionProps {
  isRecording: boolean;
  hasRecordedSteps: boolean;
  onStartSequence: () => void;
  onStartMacro: () => void;
}

export default function HeroSection({ isRecording, hasRecordedSteps, onStartSequence, onStartMacro }: HeroSectionProps) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="logo-box">
          <TerminalSquare size={30} />
        </div>
        <div>
          <h1 className="title">NEXUS<span>.RPA</span></h1>
          <p className="subtitle">Enterprise Automation Core</p>
        </div>
      </div>
      
      {!isRecording && !hasRecordedSteps && (
        <div className="header-right">
          <Button variant="secondary" onClick={onStartMacro} style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399' }}>
            <Layers size={18} /> RECORD MACRO
          </Button>
          <Button variant="primary" onClick={onStartSequence}>
            <PlayCircle size={18} /> NEW SEQUENCE
          </Button>
        </div>
      )}
    </header>
  );
}