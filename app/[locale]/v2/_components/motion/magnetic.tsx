"use client";

import React, { useRef } from "react";
import { Tokens } from "../theme";
import { useMotion } from "./use-motion";

interface MagneticProps extends React.HTMLAttributes<HTMLDivElement> {
  tokens: Tokens;
  children?: React.ReactNode;
  strength?: number;
  style?: React.CSSProperties;
}

export function Magnetic({
  tokens,
  children,
  strength = 10,
  style,
  ...rest
}: MagneticProps) {
  const m = useMotion(tokens);
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!m.on || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    const s = strength * m.mult;
    ref.current.style.transform = `translate(${dx * s}px, ${dy * s}px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0,0)";
  };

  return (
    <div
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ display: "inline-block", ...style }}
      {...rest}
    >
      <div
        ref={ref}
        style={{
          transition: m.on ? "transform .25s cubic-bezier(.2,.7,.2,1)" : "none",
        }}
      >
        {children}
      </div>
    </div>
  );
}
