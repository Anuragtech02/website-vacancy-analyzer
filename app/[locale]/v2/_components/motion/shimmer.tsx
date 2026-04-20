"use client";

import React from "react";
import { Tokens } from "../theme";
import { useMotion } from "./use-motion";

interface ShimmerProps {
  tokens: Tokens;
  style?: React.CSSProperties;
}

export function Shimmer({ tokens, style }: ShimmerProps) {
  const m = useMotion(tokens);
  if (!m.on) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        borderRadius: "inherit",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: "40%",
          background: `linear-gradient(100deg, transparent, ${tokens.primarySoft}, transparent)`,
          animation: `va-shimmer ${Math.round(3200 / Math.max(0.5, m.mult))}ms linear infinite`,
        }}
      />
      <style>{`@keyframes va-shimmer { 0% { left: -40% } 100% { left: 140% } }`}</style>
    </div>
  );
}
