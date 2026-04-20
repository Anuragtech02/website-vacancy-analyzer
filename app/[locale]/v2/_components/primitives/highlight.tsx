"use client";

import React from "react";
import { Tokens } from "../theme";

interface HighlightProps {
  tokens: Tokens;
  children?: React.ReactNode;
}

export function Highlight({ tokens, children }: HighlightProps) {
  const style = tokens.highlightStyle;

  if (style === "serif-italic") {
    return (
      <span style={{ position: "relative", display: "inline-block" }}>
        <span
          style={{
            position: "absolute",
            inset: "18% -4% 12% -4%",
            background: tokens.primarySoft,
            transform: "skew(-6deg)",
            zIndex: 0,
          }}
        />
        <span
          style={{
            position: "relative",
            fontStyle: "italic",
            fontWeight: 500,
            fontFamily: "'Instrument Serif', 'Fraunces', serif",
            color: tokens.primaryInk,
            padding: "0 0.08em",
          }}
        >
          {children}
        </span>
      </span>
    );
  }

  if (style === "block") {
    return (
      <span
        style={{
          background: tokens.primaryColor,
          color: "#fff",
          padding: "0 0.18em",
          display: "inline-block",
        }}
      >
        {children}
      </span>
    );
  }

  if (style === "pill") {
    return (
      <span
        style={{
          background: tokens.primarySoft,
          color: tokens.primaryInk,
          padding: "0.02em 0.35em",
          borderRadius: 999,
          display: "inline-block",
        }}
      >
        {children}
      </span>
    );
  }

  // underline (default)
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(to top, ${tokens.primarySoft} 0, ${tokens.primarySoft} 40%, transparent 40%)`,
        padding: "0 0.05em",
      }}
    >
      {children}
    </span>
  );
}
