"use client";

import React from "react";
import { Tokens } from "../theme";

interface EyebrowProps {
  tokens: Tokens;
  children?: React.ReactNode;
  dotColor?: string;
}

export function Eyebrow({ tokens, children, dotColor }: EyebrowProps) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        fontFamily: tokens.monoFont,
        fontSize: 11,
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        color: tokens.inkSoft,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: dotColor || tokens.primaryColor,
        }}
      />
      {children}
    </div>
  );
}
