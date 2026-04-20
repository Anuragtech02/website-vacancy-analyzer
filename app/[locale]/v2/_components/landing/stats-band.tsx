"use client";

// stats-band.tsx — stats section with 3 CountUp cards.
// Ported from landing.jsx (React-in-HTML prototype).

import type { Tokens } from "../theme";
import { useMotion, Reveal, CountUp } from "../motion";

interface StatsBandProps {
  tokens: Tokens;
}

export function StatsBand({ tokens }: StatsBandProps) {
  const m = useMotion(tokens);

  const stats: Array<[string, string, string, number, string, number]> = [
    ["+20%", "candidate quality",   "Measured across 1,240 rewritten postings.", 20,  "%", 0],
    ["+25%", "recruiter time saved","Average, per posting, in the first month.",  25,  "%", 0],
    ["−14%", "campaign costs",      "Lower spend from better-targeted applicants.", -14, "%", 0],
  ];

  return (
    <section style={{
      padding: "48px 64px", maxWidth: 1360, margin: "40px auto 0",
    }}>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0,
        border: `1px solid ${tokens.line}`,
        borderRadius: tokens.cardRadius,
        overflow: "hidden",
        background: tokens.bgRaised,
      }}>
        {stats.map(([big, mid, sub, num, suf, dec], i) => (
          <Reveal tokens={tokens} delay={i * 120} key={big}>
            <div
              style={{
                padding: "44px 36px",
                borderLeft: i > 0 ? `1px solid ${tokens.line}` : "none",
                transition: m.on ? "background .3s ease" : "none",
                cursor: "default",
              }}
              onMouseEnter={(e) => m.on && ((e.currentTarget as HTMLDivElement).style.background = tokens.primarySoft)}
              onMouseLeave={(e) => m.on && ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
            >
              <div style={{
                fontFamily: tokens.displayFont, fontSize: 72, lineHeight: 1,
                fontWeight: tokens.displayWeight, letterSpacing: "-0.04em",
                color: tokens.primaryInk,
              }}>
                <CountUp tokens={tokens} to={num} prefix={num > 0 ? "+" : ""} suffix={suf} decimals={dec} />
              </div>
              <div style={{
                fontFamily: tokens.bodyFont, fontSize: 17, color: tokens.ink,
                marginTop: 10, fontWeight: 500,
              }}>{mid}</div>
              <div style={{
                fontFamily: tokens.bodyFont, fontSize: 14, color: tokens.inkMute,
                marginTop: 4, lineHeight: 1.4,
              }}>{sub}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
