"use client";

// hero-illustration.tsx — abstract editorial illustration for the hero.
// A stylized "vacancy being marked up": floating document fragments, highlight blocks,
// a score ring, annotations. All in primary + neutrals, composed as one cohesive image.

import type { Tokens } from "./theme";
import { useMotion } from "./motion/use-motion";

export interface HeroIllustrationProps {
  tokens: Tokens;
  size?: number;  // default 360
}

function Line({ w, c }: { w: string; c: string }) {
  return <div style={{ height: 4, width: w, background: c, borderRadius: 2 }} />;
}

function HeroIllustration({ tokens, size = 360 }: HeroIllustrationProps) {
  const m = useMotion(tokens);
  const primary = tokens.primaryColor;
  const primarySoft = tokens.primarySoft || "rgba(217,119,87,0.12)";
  const ink = tokens.ink;
  const inkSoft = tokens.inkSoft;
  const line = tokens.line;
  const bg = tokens.bgRaised;

  return (
    <div style={{ position: "relative", width: size, aspectRatio: "1 / 1", flexShrink: 0 }}>
      <style>{`
        @keyframes va-illust-float-1 { 0%,100% { transform: translate(0,0) rotate(-4deg) } 50% { transform: translate(3px,-6px) rotate(-4deg) } }
        @keyframes va-illust-float-2 { 0%,100% { transform: translate(0,0) rotate(3deg) } 50% { transform: translate(-4px,4px) rotate(3deg) } }
        @keyframes va-illust-float-3 { 0%,100% { transform: translate(0,0) rotate(-1deg) } 50% { transform: translate(5px,-3px) rotate(-1deg) } }
        @keyframes va-illust-ring   { from { stroke-dashoffset: 200 } to { stroke-dashoffset: 60 } }
        @keyframes va-illust-pen    { 0% { transform: translate(0,0) } 50% { transform: translate(6px,4px) } 100% { transform: translate(0,0) } }
      `}</style>

      {/* document slab — tilted */}
      <div style={{
        position: "absolute", left: "8%", top: "18%", width: "58%", height: "68%",
        background: bg, border: `1px solid ${line}`,
        borderRadius: tokens.cardRadius,
        boxShadow: "0 18px 40px -18px rgba(40,30,20,0.25)",
        transform: "rotate(-4deg)",
        animation: m.on ? `va-illust-float-1 8s ease-in-out infinite` : "none",
        padding: "16px 18px",
        display: "flex", flexDirection: "column", gap: 8,
      }}>
        <div style={{
          fontFamily: tokens.monoFont, fontSize: 8, letterSpacing: "0.18em",
          color: inkSoft, textTransform: "uppercase",
        }}>Senior Full-Stack Engineer</div>
        <div style={{
          fontFamily: tokens.displayFont, fontSize: 12, fontWeight: tokens.displayWeight,
          color: ink, letterSpacing: "-0.01em", lineHeight: 1.15,
        }}>We&apos;re looking for a rockstar developer who thrives under pressure…</div>
        {/* fake text lines */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
          <Line w="100%" c={line} />
          <Line w="85%" c={line} />
          {/* highlighted phrase */}
          <div style={{
            display: "inline-block",
            background: primarySoft,
            borderBottom: `2px solid ${primary}`,
            height: 9, width: "60%", borderRadius: 2,
          }} />
          <Line w="78%" c={line} />
          <Line w="92%" c={line} />
          <Line w="40%" c={line} />
        </div>

        {/* pen annotation mark */}
        <svg viewBox="0 0 60 20" width="68%" height="20" style={{
          marginTop: "auto", color: primary,
          animation: m.on ? "va-illust-pen 6s ease-in-out infinite" : "none",
          transformOrigin: "left center",
        }}>
          <path d="M2 10 C 10 4, 20 16, 30 8 S 50 12, 58 6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </svg>
      </div>

      {/* Score ring — top right */}
      <div style={{
        position: "absolute", right: "6%", top: "6%",
        width: "42%", aspectRatio: "1 / 1",
        background: bg, border: `1px solid ${line}`,
        borderRadius: 999,
        boxShadow: "0 14px 30px -14px rgba(40,30,20,0.22)",
        animation: m.on ? `va-illust-float-2 7s ease-in-out infinite` : "none",
        display: "grid", placeItems: "center",
      }}>
        <svg viewBox="0 0 80 80" width="82%" height="82%">
          <circle cx="40" cy="40" r="30" fill="none" stroke={line} strokeWidth="5" />
          <circle
            cx="40" cy="40" r="30" fill="none"
            stroke={primary} strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="188.5"
            strokeDashoffset="80"
            transform="rotate(-90 40 40)"
            style={{ animation: m.on ? "va-illust-ring 3s ease-out 0.4s both" : "none" }}
          />
          <text x="40" y="45"
            fontFamily={tokens.displayFont}
            fontWeight={tokens.displayWeight}
            fontSize="22" textAnchor="middle"
            letterSpacing="-0.05em"
            fill={ink}>6.3</text>
          <text x="40" y="56"
            fontFamily={tokens.monoFont}
            fontSize="5" textAnchor="middle"
            letterSpacing="0.16em"
            fill={inkSoft}>/10</text>
        </svg>
      </div>

      {/* Floating chip — bottom right */}
      <div style={{
        position: "absolute", right: "2%", bottom: "20%",
        background: primary, color: bg,
        padding: "8px 12px", borderRadius: 999,
        fontFamily: tokens.monoFont, fontSize: 10,
        letterSpacing: "0.14em", textTransform: "uppercase",
        boxShadow: "0 10px 24px -10px rgba(217,119,87,0.5)",
        animation: m.on ? `va-illust-float-3 6.5s ease-in-out infinite` : "none",
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" fill="currentColor" />
        </svg>
        +2.4 pts
      </div>

      {/* sticky note — bottom left */}
      <div style={{
        position: "absolute", left: "2%", bottom: "4%",
        width: "36%",
        background: bg,
        border: `1px solid ${primary}`,
        borderLeft: `3px solid ${primary}`,
        borderRadius: tokens.cardRadius,
        padding: "10px 12px",
        transform: "rotate(-6deg)",
        animation: m.on ? `va-illust-float-3 9s ease-in-out infinite` : "none",
        boxShadow: "0 10px 24px -12px rgba(40,30,20,0.2)",
      }}>
        <div style={{
          fontFamily: tokens.monoFont, fontSize: 9, letterSpacing: "0.14em",
          color: primary, textTransform: "uppercase", fontWeight: 600,
        }}>Exclusive lang.</div>
        <div style={{
          fontFamily: tokens.bodyFont, fontSize: 11, color: ink, marginTop: 3, lineHeight: 1.3,
        }}>&quot;rockstar&quot; filters candidates</div>
      </div>
    </div>
  );
}

export { HeroIllustration };
