"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl ${className}`}>
      {children}
    </div>
  );
}