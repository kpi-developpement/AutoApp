"use client";

import { useEffect, useRef } from "react";

export default function InteractiveBackground() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      
      {/* 1. SOLID DEEP BLACK BACKGROUND (Hada li kay-ghetti l'PC) */}
      <div className="absolute inset-0 bg-cyber-base" />

      {/* 2. AMBIENT CENTER GLOW (Ddaow f l'wst) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vh] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '5s' }} />

      {/* 3. BASE GRID (L'khtouta r9a9 li dima kaynin) */}
      <div className="bg-cyber-grid" />

      {/* 4. GLOWING FLASHING GRID (L'khtouta l'mdowin li kay-flashiw) */}
      <div className="bg-cyber-glow-grid" />

      {/* 5. SCANLINE (L'khet dyal Radar li kay-hbet w kay-tle3) */}
      <div className="bg-scanline" />

      {/* 6. INTERACTIVE MOUSE GLOW (Ddaow li kay-tbe3 l'souris) */}
      <div 
        ref={glowRef}
        className="absolute top-0 left-0 w-[500px] h-[500px] -ml-[250px] -mt-[250px] rounded-full transition-transform duration-75 ease-out"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(168,85,247,0.05) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
    </div>
  );
}