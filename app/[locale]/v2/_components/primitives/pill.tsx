"use client";

import React from "react";
import { Tokens } from "../theme";

type PillTone = "default" | "primary" | "ok" | "warn" | "bad";

interface PillProps {
  tokens: Tokens;
  children?: React.ReactNode;
  tone?: PillTone;
  style?: React.CSSProperties;
}

export function Pill({ tokens, children, tone = "default", style }: PillProps) {
  const palettes: Record<PillTone, { bg: string; fg: string; border: string }> = {
    default: { bg: tokens.bgMuted,    fg: tokens.inkSoft,  border: tokens.line },
    primary: { bg: tokens.primarySoft, fg: tokens.primaryInk, border: "transparent" },
    ok:   {
      bg:     `color-mix(in oklch, ${tokens.ok} 16%, transparent)`,
      fg:     tokens.ok,
      border: "transparent",
    },
    warn: {
      bg:     `color-mix(in oklch, ${tokens.warn} 18%, transparent)`,
      fg:     `color-mix(in oklch, ${tokens.warn} 80%, black)`,
      border: "transparent",
    },
    bad: {
      bg:     `color-mix(in oklch, ${tokens.bad} 14%, transparent)`,
      fg:     tokens.bad,
      border: "transparent",
    },
  };

  const p = palettes[tone];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 999,
        background: p.bg,
        color: p.fg,
        border: `1px solid ${p.border}`,
        fontFamily: tokens.monoFont,
        fontSize: 11,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
