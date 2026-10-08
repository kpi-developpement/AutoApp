"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check, Cpu, Zap, Layers } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
  type: "custom" | "builtin" | "basic";
}

export interface OptionGroup {
  groupLabel: string;
  options: SelectOption[];
}

interface ModernSelectProps {
  value: string;
  onChange: (value: string) => void;
  groups: OptionGroup[];
}

export default function ModernSelect({ value, onChange, groups }: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  let selectedOption: SelectOption = groups[0]?.options[0];
  for (const group of groups) {
    const found = group.options.find(opt => opt.value === value);
    if (found) {
      selectedOption = found;
      break;
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    if (type === "custom") return <Layers size={14} color="#34d399" style={{ flexShrink: 0 }} />;
    if (type === "builtin") return <Cpu size={14} color="#fb923c" style={{ flexShrink: 0 }} />;
    return <Zap size={14} color="#c084fc" style={{ flexShrink: 0 }} />;
  };

  const getTriggerStyle = (type: string) => {
    if (type === "custom") return { color: "#34d399", borderColor: "rgba(16, 185, 129, 0.4)", background: "rgba(16, 185, 129, 0.05)" };
    if (type === "builtin") return { color: "#fb923c", borderColor: "rgba(249, 115, 22, 0.4)", background: "rgba(249, 115, 22, 0.05)" };
    return { color: "#c084fc", borderColor: "rgba(168, 85, 247, 0.4)", background: "rgba(168, 85, 247, 0.05)" };
  };

  return (
    <div style={{ position: 'relative', width: '320px' }} ref={dropdownRef}>
      
      {/* TRIGGER */}
      <div 
        style={{ 
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
          border: '1px solid', padding: '10px 16px', borderRadius: '8px', 
          transition: 'all 0.3s', fontFamily: "'Fira Code', monospace", fontSize: '13px', 
          cursor: 'none', ...getTriggerStyle(selectedOption.type) 
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.3)'}
        onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
          {getIcon(selectedOption.type)}
          <span style={{ fontWeight: 600, letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {selectedOption.label}
          </span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} color="#64748b" style={{ flexShrink: 0, marginLeft: '8px' }} />
        </motion.div>
      </div>

      {/* DROPDOWN LIST */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            style={{ 
              position: 'absolute', top: '100%', left: 0, width: '100%', marginTop: '8px', 
              background: '#050508', border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '12px', boxShadow: '0 15px 50px rgba(0,0,0,0.9)', zIndex: 999, overflow: 'hidden' 
            }}
          >
            <div className="custom-scrollbar" style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px 0' }}>
              {groups.map((group, groupIdx) => (
                <div key={groupIdx} style={{ marginBottom: '8px' }}>
                  
                  <div style={{ 
                    padding: '8px 16px', fontSize: '10px', fontWeight: 900, color: '#64748b', 
                    textTransform: 'uppercase', letterSpacing: '2px', background: 'rgba(255,255,255,0.02)', 
                    borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', 
                    marginBottom: '4px' 
                  }}>
                    {group.groupLabel}
                  </div>
                  
                  {group.options.map((option) => {
                    const isSelected = value === option.value;
                    return (
                      <div
                        key={option.value}
                        style={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                          padding: '10px 16px', fontSize: '12px', fontFamily: "'Fira Code', monospace", 
                          transition: 'all 0.2s', borderLeft: '2px solid transparent', cursor: 'none',
                          background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          borderLeftColor: isSelected ? '#3b82f6' : 'transparent',
                          color: isSelected ? 'white' : '#cbd5e1',
                          fontWeight: isSelected ? 'bold' : 'normal'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.borderLeftColor = '#64748b';
                            e.currentTarget.style.transform = 'translateX(4px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.borderLeftColor = 'transparent';
                            e.currentTarget.style.transform = 'translateX(0)';
                          }
                        }}
                        onClick={() => {
                          onChange(option.value);
                          setIsOpen(false);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                          {getIcon(option.type)}
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {option.label}
                          </span>
                        </div>
                        {isSelected && <Check size={14} color="#3b82f6" style={{ flexShrink: 0, marginLeft: '8px' }} />}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}