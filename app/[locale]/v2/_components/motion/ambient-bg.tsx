"use client";

import React from "react";
import { Tokens } from "../theme";
import { useMotion } from "./use-motion";

interface BlobDef {
  c: string;
  opacity: number;
  size: number;
  top: number;
  left?: number | string;
  right?: number;
  d: number;
}

interface AmbientBGProps {
  tokens: Tokens;
}

export function AmbientBG({ tokens }: AmbientBGProps) {
  const m = useMotion(tokens);
  const speed = m.mult;
  const animate = m.on;

  const blobs: BlobDef[] = [
    { c: tokens.primaryColor,          opacity: 0.28, size: 620, top: -200, left: -120,  d: 0 },
    { c: "oklch(0.80 0.12 320)",        opacity: 0.20, size: 480, top:  -80, right: -120, d: 1 },
    { c: "oklch(0.85 0.10 220)",        opacity: 0.22, size: 520, top:  280, left: "40%", d: 2 },
  ];

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {blobs.map((b, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: b.top,
            left: b.left as React.CSSProperties["left"],
            right: b.right,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle, ${b.c} 0%, transparent 62%)`,
            opacity: b.opacity,
            filter: "blur(8px)",
            animation: animate
              ? `va-drift-${i} ${Math.max(12, 22 / Math.max(0.5, speed))}s ease-in-out ${b.d}s infinite alternate`
              : "none",
          }}
        />
      ))}
      <style>{`
        @keyframes va-drift-0 { 0% { transform: translate(0,0) scale(1) } 100% { transform: translate(80px, 40px) scale(1.1) } }
        @keyframes va-drift-1 { 0% { transform: translate(0,0) scale(1) } 100% { transform: translate(-60px, 60px) scale(1.15) } }
        @keyframes va-drift-2 { 0% { transform: translate(0,0) scale(1) } 100% { transform: translate(40px, -50px) scale(1.05) } }
      `}</style>
    </div>
  );
}
