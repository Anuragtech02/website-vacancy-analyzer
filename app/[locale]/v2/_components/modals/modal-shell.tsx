"use client";

import React from "react";
import { type Tokens } from "../theme";
import { useBreakpoint, isMobile } from "../use-breakpoint";

export interface ModalShellProps {
  tokens: Tokens;
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: number;
}

export function ModalShell({ tokens, children, onClose, maxWidth = 520 }: ModalShellProps) {
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(24,18,14,0.45)",
        backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: mobile ? 16 : 24,
        animation: "va-fade .2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: tokens.bgRaised,
          border: `${tokens.cardBorder} ${tokens.line}`,
          borderRadius: tokens.cardRadius,
          boxShadow: tokens.cardShadow === "offset"
            ? `10px 10px 0 0 ${tokens.ink}`
            : "0 40px 100px -24px rgba(0,0,0,0.35)",
          width: "100%",
          maxWidth: mobile ? "100%" : maxWidth,
          maxHeight: mobile ? "calc(100vh - 32px)" : "calc(100vh - 48px)",
          overflowY: "auto",
          position: "relative",
          animation: "va-pop .28s cubic-bezier(.2,.9,.3,1.1)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 14, right: 14,
            width: 32, height: 32, borderRadius: 999,
            border: `1px solid ${tokens.line}`, background: tokens.bgRaised, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: tokens.inkSoft,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        {children}
      </div>
      <style>{`
        @keyframes va-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes va-pop  { from { opacity: 0; transform: translateY(8px) scale(.98) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  );
}
