"use client";

import React from "react";
import { Tokens } from "../theme";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tokens: Tokens;
  pad?: number | string;
  tint?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Card({ tokens, children, style, pad = 28, tint, ...rest }: CardProps) {
  const shadow =
    tokens.cardShadow === "offset"
      ? `6px 6px 0 0 ${tokens.ink}`
      : tokens.cardShadow === "soft"
      ? "0 1px 2px rgba(40,30,20,0.04), 0 8px 24px -12px rgba(40,30,20,0.08)"
      : tokens.cardShadow === "pillow"
      ? "0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 4px rgba(40,30,20,0.05), 0 14px 36px -14px rgba(40,30,20,0.14)"
      : "none";
  const scaledPad = typeof pad === "number" ? pad * (tokens.pad || 1) : pad;
  return (
    <div
      style={{
        background: tint || tokens.bgRaised,
        border: `${tokens.cardBorder} ${tokens.line}`,
        borderRadius: tokens.cardRadius,
        boxShadow: shadow,
        padding: scaledPad,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
