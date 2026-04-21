"use client";

// hero-section.tsx — left column of the hero: h1, subtitle, numbered bullet list, trust strip.
// Ported from landing.jsx (React-in-HTML prototype).

import { useState } from "react";
import type { Tokens } from "../theme";
import { Highlight } from "../primitives";
import { useMotion, Reveal } from "../motion";
import { Icon } from "../icons";
import type { IconName } from "../icons";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile, isNarrow } from "../use-breakpoint";

interface HeroSectionProps {
  tokens: Tokens;
}

export function HeroSection({ tokens }: HeroSectionProps) {
  const m = useMotion(tokens);
  const t = useV2T();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const narrow = isNarrow(bp);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const ICON_NAMES: IconName[] = ["target", "document", "publish"];

  return (
    <div>
      <Reveal tokens={tokens} delay={80}>
        <h1 style={{
          fontFamily: tokens.displayFont,
          fontSize: mobile
            ? "clamp(32px, 9vw, 40px)"
            : narrow
              ? "clamp(40px, 6vw, 56px)"
              : "clamp(48px, 5.2vw, 76px)",
          lineHeight: 1.02,
          fontWeight: tokens.displayWeight,
          letterSpacing: "-0.035em",
          color: tokens.ink,
          margin: mobile ? "4px 0 0" : "18px 0 0",
          textWrap: "balance",
        } as React.CSSProperties}>
          {t.hero.title.part1}
          <Highlight tokens={tokens}>{t.hero.title.highlight}</Highlight>
          {t.hero.title.part2}
        </h1>
      </Reveal>
      <Reveal tokens={tokens} delay={220}>
        <p style={{
          fontFamily: tokens.bodyFont,
          fontSize: mobile ? 16 : 19,
          lineHeight: 1.5,
          color: tokens.inkSoft,
          marginTop: mobile ? 18 : 28,
          maxWidth: 520,
        }}>
          {t.hero.subtitle}
        </p>
      </Reveal>
      <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 10 : 14, marginTop: mobile ? 22 : 32 }}>
        {t.hero.bullets.map((bullet, idx) => (
          <Reveal tokens={tokens} delay={340 + idx * 100} key={idx}>
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
                <Icon name={ICON_NAMES[idx]} tokens={tokens} size={18} />
              </div>
              <div>
                <div style={{ fontFamily: tokens.bodyFont, fontSize: mobile ? 15 : 16, fontWeight: 600, color: tokens.ink }}>{bullet.title}</div>
                <div style={{ fontFamily: tokens.bodyFont, fontSize: mobile ? 14 : 15, color: tokens.inkSoft, lineHeight: 1.45 }}>{bullet.desc}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

    </div>
  );
}
