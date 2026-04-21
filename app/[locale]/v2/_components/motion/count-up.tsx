"use client";

import React, { useState, useEffect } from "react";
import { Tokens } from "../theme";
import { useMotion } from "./use-motion";

interface CountUpProps {
  tokens: Tokens;
  to: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  style?: React.CSSProperties;
}

export function CountUp({
  tokens,
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1400,
  style,
}: CountUpProps) {
  const m = useMotion(tokens);
  const [val, setVal] = useState(m.on ? 0 : to);

  useEffect(() => {
    if (!m.on) {
      setVal(to);
      return;
    }
    const d = Math.round(duration / Math.max(0.5, m.mult));
    const start = performance.now();
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / d);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, m.on, m.mult, duration]);

  return (
    <span style={style}>
      {prefix}
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}
