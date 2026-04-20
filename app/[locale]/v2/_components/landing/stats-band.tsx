"use client";

// stats-band.tsx — stats section with 3 CountUp cards.
// Ported from landing.jsx (React-in-HTML prototype).

import type { Tokens } from "../theme";
import { useMotion, Reveal, CountUp } from "../motion";
import { Icon } from "../icons";
import type { IconName } from "../icons";
import { useV2T } from "../i18n-context";

interface StatsBandProps {
  tokens: Tokens;
}

export function StatsBand({ tokens }: StatsBandProps) {
  const m = useMotion(tokens);
  const t = useV2T();

  const ICON_NAMES: IconName[] = ["chart", "timer", "coin"];
  const COUNT_NUMS = [20, 25, -14];

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
        {t.statsBand.map((stat, i) => (
          <Reveal tokens={tokens} delay={i * 120} key={i}>
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
              <Icon name={ICON_NAMES[i]} tokens={tokens} size={28} tint={tokens.primaryColor} />
              <div style={{
                fontFamily: tokens.displayFont, fontSize: 72, lineHeight: 1,
                fontWeight: tokens.displayWeight, letterSpacing: "-0.04em",
                color: tokens.primaryInk, marginTop: 12,
              }}>
                <CountUp tokens={tokens} to={COUNT_NUMS[i]} prefix={COUNT_NUMS[i] > 0 ? "+" : ""} suffix="%" decimals={0} />
              </div>
              <div style={{
                fontFamily: tokens.bodyFont, fontSize: 17, color: tokens.ink,
                marginTop: 10, fontWeight: 500,
              }}>{stat.mid}</div>
              <div style={{
                fontFamily: tokens.bodyFont, fontSize: 14, color: tokens.inkMute,
                marginTop: 4, lineHeight: 1.4,
              }}>{stat.sub}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
