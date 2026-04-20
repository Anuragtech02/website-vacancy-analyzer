"use client";

import React from "react";
import { Tokens } from "../theme";
import { useMotion } from "./use-motion";

interface MarqueeProps {
  tokens: Tokens;
  items: string[];
  speed?: number;
}

export function Marquee({ tokens, items, speed = 40 }: MarqueeProps) {
  const m = useMotion(tokens);
  const dur = Math.round(speed / Math.max(0.3, m.mult));
  const loop = [...items, ...items];

  return (
    <div style={{ overflow: "hidden", position: "relative" }}>
      <div
        style={{
          display: "flex",
          gap: 10,
          width: "max-content",
          animation: m.on ? `va-marquee ${dur}s linear infinite` : "none",
        }}
      >
        {loop.map((it, i) => (
          <div
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px",
              whiteSpace: "nowrap",
              border: `1px solid ${tokens.line}`,
              borderRadius: 999,
              background: tokens.bgRaised,
              fontFamily: tokens.monoFont,
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: tokens.inkSoft,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 999,
                background: tokens.primaryColor,
              }}
            />
            {it}
          </div>
        ))}
      </div>
      <style>{`@keyframes va-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
