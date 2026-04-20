"use client";

// hero-section.tsx — left column of the hero: h1, subtitle, numbered bullet list, trust strip.
// Ported from landing.jsx (React-in-HTML prototype).

import { useState } from "react";
import type { Tokens } from "../theme";
import { Highlight } from "../primitives";
import { useMotion, Reveal } from "../motion";
import { Icon } from "../icons";
import type { IconName } from "../icons";

interface HeroSectionProps {
  tokens: Tokens;
}

export function HeroSection({ tokens }: HeroSectionProps) {
  const m = useMotion(tokens);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  return (
    <div>
      <Reveal tokens={tokens} delay={80}>
        <h1 style={{
          fontFamily: tokens.displayFont,
          fontSize: "clamp(48px, 5.2vw, 76px)",
          lineHeight: 1.02,
          fontWeight: tokens.displayWeight,
          letterSpacing: "-0.035em",
          color: tokens.ink,
          margin: "18px 0 0",
          textWrap: "balance",
        } as React.CSSProperties}>
          Find out why the{" "}
          <Highlight tokens={tokens}>right</Highlight>
          {" "}people aren&apos;t applying.
        </h1>
      </Reveal>
      <Reveal tokens={tokens} delay={220}>
        <p style={{
          fontFamily: tokens.bodyFont, fontSize: 19, lineHeight: 1.5,
          color: tokens.inkSoft, marginTop: 28, maxWidth: 520,
        }}>
          Paste your job posting. In under a minute, our model grades it across eight
          dimensions and tells you exactly what to fix — with a rewritten version ready
          to publish.
        </p>
      </Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 32 }}>
        {([
          ["01", "Eight-point diagnostic", "Clarity, inclusion, tone, benefits, role, growth, culture, CTA.", "target"],
          ["02", "Plain-English explanations", "Every score comes with the exact sentence that caused it.", "document"],
          ["03", "A ready-to-publish rewrite", "Not a suggestion — a finished draft you can ship.", "publish"],
        ] as [string, string, string, IconName][]).map(([n, h, s, iconName], idx) => (
          <Reveal tokens={tokens} delay={340 + idx * 100} key={n}>
            <div
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                display: "grid", gridTemplateColumns: "40px 1fr", gap: 14, alignItems: "start",
                padding: "6px 8px", marginLeft: -8,
                borderRadius: tokens.cardRadius,
                background: hoverIdx === idx ? tokens.primarySoft : "transparent",
                transition: m.on ? "background .3s ease, transform .3s ease" : "none",
                transform: hoverIdx === idx && m.on ? "translateX(4px)" : "none",
              }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: tokens.monoFont, fontSize: 11,
                color: tokens.primaryInk, letterSpacing: "0.12em",
                paddingTop: 4,
              }}>
                <Icon name={iconName} tokens={tokens} size={18} />
              </div>
              <div>
                <div style={{ fontFamily: tokens.bodyFont, fontSize: 16, fontWeight: 600, color: tokens.ink }}>{h}</div>
                <div style={{ fontFamily: tokens.bodyFont, fontSize: 15, color: tokens.inkSoft, lineHeight: 1.45 }}>{s}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* trust strip */}
      <div style={{
        display: "flex", gap: 22, marginTop: 36, flexWrap: "wrap",
        alignItems: "center",
        fontFamily: tokens.monoFont, fontSize: 11, letterSpacing: "0.14em",
        textTransform: "uppercase", color: tokens.inkMute,
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="spark" tokens={tokens} size={14} tint={tokens.primaryColor} /> Free · No login
        </span>
        <span>·</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="shield" tokens={tokens} size={14} tint={tokens.primaryColor} /> GDPR safe
        </span>
        <span>·</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="clock" tokens={tokens} size={14} tint={tokens.primaryColor} /> Results in ~50s
        </span>
      </div>
    </div>
  );
}
