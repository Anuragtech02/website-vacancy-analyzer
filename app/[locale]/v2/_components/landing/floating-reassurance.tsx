"use client";

// floating-reassurance.tsx — bobbing chip badges shown when the textarea is empty.
// Ported from landing.jsx (React-in-HTML prototype).

import type { Tokens } from "../theme";
import { useMotion } from "../motion/use-motion";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile } from "../use-breakpoint";

interface FloatingReassuranceProps {
  tokens: Tokens;
  visible: boolean;
}

export function FloatingReassurance({ tokens, visible }: FloatingReassuranceProps) {
  const m = useMotion(tokens);
  const t = useV2T();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

  // On mobile the chips would overlap the header title — hide them entirely
  // (the reassurance is ornamental, not load-bearing).
  if (mobile) return null;

  const items = [
    { label: t.floatingReassurance.noSpam,  delay: 0.05 },
    { label: t.floatingReassurance.private, delay: 0.15 },
    { label: t.floatingReassurance.aPlus,   delay: 0.25 },
  ];
  return (
    <div style={{
      position: "absolute", top: 14, right: 14,
      display: "flex", gap: 6,
      pointerEvents: "none",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(-4px)",
      transition: "opacity .45s ease, transform .45s ease",
      zIndex: 2,
    }}>
      {items.map((it, i) => (
        <div key={i} style={{
          background: tokens.bgRaised, color: tokens.inkSoft,
          padding: "6px 10px", borderRadius: 999,
          border: `1px solid ${tokens.line}`,
          fontFamily: tokens.monoFont, fontSize: 10,
          letterSpacing: "0.12em", textTransform: "uppercase",
          boxShadow: "0 4px 14px -8px rgba(40,30,20,0.25)",
          display: "inline-flex", alignItems: "center", gap: 6,
          animation: m.on && visible ? `va-bob-${i} ${3.2 + i * 0.4}s ease-in-out ${it.delay}s infinite alternate` : "none",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: 999, background: tokens.primaryColor }} />
          {it.label}
        </div>
      ))}
      <style>{`
        @keyframes va-bob-0 { from { transform: translateY(0) } to { transform: translateY(-3px) } }
        @keyframes va-bob-1 { from { transform: translateY(0) } to { transform: translateY(3px) } }
        @keyframes va-bob-2 { from { transform: translateY(0) } to { transform: translateY(-2px) } }
      `}</style>
    </div>
  );
}
