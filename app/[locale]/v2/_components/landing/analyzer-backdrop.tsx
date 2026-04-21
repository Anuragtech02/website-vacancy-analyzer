"use client";

// analyzer-backdrop.tsx — animated dotted grid that pulses from a moving origin.
// Uses CSS custom properties --va-x, --va-y with @property for smooth animation.
// Ported from landing.jsx (React-in-HTML prototype).

import type { Tokens } from "../theme";
import { useMotion } from "../motion/use-motion";

interface AnalyzerBackdropProps {
  tokens: Tokens;
}

export function AnalyzerBackdrop({ tokens }: AnalyzerBackdropProps) {
  const m = useMotion(tokens);
  return (
    <div aria-hidden style={{
      position: "absolute", inset: 0, pointerEvents: "none",
      overflow: "hidden", borderRadius: "inherit",
      opacity: 0.7,
    }}>
      <div style={{
        position: "absolute", inset: -20,
        backgroundImage: `radial-gradient(circle, ${tokens.line} 1px, transparent 1.2px)`,
        backgroundSize: "18px 18px",
        maskImage: m.on
          ? `radial-gradient(circle at var(--va-x, 30%) var(--va-y, 40%), rgba(0,0,0,.45) 0%, rgba(0,0,0,.18) 40%, transparent 70%)`
          : `radial-gradient(circle at 30% 40%, rgba(0,0,0,.35) 0%, rgba(0,0,0,.15) 40%, transparent 70%)`,
        WebkitMaskImage: m.on
          ? `radial-gradient(circle at var(--va-x, 30%) var(--va-y, 40%), rgba(0,0,0,.45) 0%, rgba(0,0,0,.18) 40%, transparent 70%)`
          : `radial-gradient(circle at 30% 40%, rgba(0,0,0,.35) 0%, rgba(0,0,0,.15) 40%, transparent 70%)`,
        animation: m.on ? `va-spot-move ${Math.round(14 / Math.max(0.5, tokens.motionMult ?? 1))}s ease-in-out infinite alternate` : "none",
      }} />
      <style>{`
        @keyframes va-spot-move {
          0%   { --va-x: 20%; --va-y: 30%; }
          50%  { --va-x: 75%; --va-y: 55%; }
          100% { --va-x: 40%; --va-y: 80%; }
        }
        @property --va-x { syntax: '<percentage>'; initial-value: 30%; inherits: false; }
        @property --va-y { syntax: '<percentage>'; initial-value: 40%; inherits: false; }
      `}</style>
    </div>
  );
}
