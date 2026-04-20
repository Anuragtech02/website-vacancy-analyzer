"use client";

import React from "react";
import { Tokens } from "../theme";
import { useMotion } from "../motion";

interface ScoreRingProps {
  tokens: Tokens;
  value?: number;
  max?: number;
  size?: number;
  stroke?: number;
  label?: string;
}

export function ScoreRing({
  tokens,
  value = 6.4,
  max = 10,
  size = 220,
  stroke = 14,
  label,
}: ScoreRingProps) {
  const m = useMotion(tokens);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(1, Math.max(0, value / max));
  const color =
    value >= 8
      ? tokens.ok
      : value >= 6
      ? tokens.primaryColor
      : value >= 4
      ? tokens.warn
      : tokens.bad;

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tokens.line}
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          style={{ transition: m.on ? 'stroke-dasharray .9s cubic-bezier(.2,.7,.2,1)' : 'none' }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontFamily: tokens.displayFont,
            fontSize: size * 0.35,
            lineHeight: 1,
            fontWeight: tokens.displayWeight,
            color: tokens.ink,
            letterSpacing: "-0.03em",
          }}
        >
          {value.toFixed(1)}
        </div>
        <div
          style={{
            fontFamily: tokens.monoFont,
            fontSize: 11,
            color: tokens.inkMute,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            marginTop: 6,
          }}
        >
          {label || `out of ${max}`}
        </div>
      </div>
    </div>
  );
}
