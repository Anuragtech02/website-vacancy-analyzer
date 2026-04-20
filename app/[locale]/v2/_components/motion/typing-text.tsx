"use client";

import React, { useState, useEffect } from "react";
import { Tokens } from "../theme";
import { useMotion } from "./use-motion";

interface TypingTextProps {
  tokens: Tokens;
  text: string;
  style?: React.CSSProperties;
  speed?: number;
}

export function TypingText({ tokens, text, style, speed = 18 }: TypingTextProps) {
  const m = useMotion(tokens);
  const [n, setN] = useState(m.on ? 0 : text.length);

  useEffect(() => {
    if (!m.on) {
      setN(text.length);
      return;
    }
    setN(0);
    const interval = Math.max(6, speed / Math.max(0.5, m.mult));
    const id = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(id);
          return v;
        }
        return v + 1;
      });
    }, interval);
    return () => clearInterval(id);
  }, [text, m.on, m.mult, speed]);

  return (
    <span style={style}>
      {text.slice(0, n)}
      {m.on && n < text.length && (
        <span
          style={{
            display: "inline-block",
            width: "0.5ch",
            height: "1em",
            verticalAlign: "text-bottom",
            background: tokens.primaryColor,
            marginLeft: 1,
            animation: "va-caret 0.9s steps(2,start) infinite",
          }}
        />
      )}
      <style>{`@keyframes va-caret { 50% { opacity: 0 } }`}</style>
    </span>
  );
}
