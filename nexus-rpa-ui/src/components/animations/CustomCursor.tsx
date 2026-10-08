"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";

export default function CustomCursor() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const controls = useAnimation();

  useEffect(() => {
    const updateMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => {
      controls.start({ scale: 0.5, backgroundColor: "rgba(59, 130, 246, 1)" });
    };

    const handleMouseUp = () => {
      controls.start({ scale: 1, backgroundColor: "rgba(59, 130, 246, 0)" });
    };

    window.addEventListener("mousemove", updateMouse);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", updateMouse);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [controls]);

  return (
    <>
      {/* L'Point sghir li f l'wst (Instant) */}
      <motion.div
        className="cursor-dot"
        animate={{ x: mousePos.x - 4, y: mousePos.y - 4 }}
        transition={{ type: "tween", ease: "backOut", duration: 0.05 }}
      />

      {/* L'Glow Ring li kay-tbe3 b retard (Trailing Effect) */}
      <motion.div
        className="cursor-ring"
        animate={controls}
        initial={{ scale: 1 }}
        style={{
          x: mousePos.x - 20,
          y: mousePos.y - 20,
        }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 15,
          mass: 0.8,
        }}
      />
    </>
  );
}