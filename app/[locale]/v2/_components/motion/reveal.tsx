"use client";

import React, { useState, useEffect, ElementType } from "react";
import { Tokens } from "../theme";
import { useMotion } from "./use-motion";

interface RevealProps {
  tokens: Tokens;
  children?: React.ReactNode;
  delay?: number;
  y?: number;
  as?: ElementType;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

export function Reveal({
  tokens,
  children,
  delay = 0,
  y = 10,
  as: Tag = "div",
  style,
  ...rest
}: RevealProps) {
  const m = useMotion(tokens);
  const [shown, setShown] = useState(!m.on);

  useEffect(() => {
    if (!m.on) {
      setShown(true);
      return;
    }
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [m.on, delay]);

  return (
    <Tag
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        transition: m.on
          ? "opacity 600ms cubic-bezier(.2,.7,.2,1), transform 700ms cubic-bezier(.2,.7,.2,1)"
          : "none",
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
