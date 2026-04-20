"use client";

import React, { useState, useEffect } from "react";
import { Tokens } from "../theme";

interface ScoreBarProps {
  tokens: Tokens;
  value: number;
  max?: number;
  color?: string;
  delay?: number;
}

export function ScoreBar({
  tokens,
  value,
  max = 10,
  color,
  delay = 0,
}: ScoreBarProps) {
  const [w, setW] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setW((value / max) * 100), 100 + delay);
    return () => clearTimeout(t);
  }, [value, max, delay]);

  return (
    <div
      style={{
        height: 6,
        background: tokens.line,
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${w}%`,
          background: color || tokens.primaryColor,
          borderRadius: 999,
          transition: "width 1.1s cubic-bezier(.2,.7,.2,1)",
        }}
      />
    </div>
  );
}
