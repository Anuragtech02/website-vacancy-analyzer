"use client";

// problem-section.tsx — "Most postings are quietly broken" section.
// Ported from landing.jsx (React-in-HTML prototype).

import type { Tokens } from "../theme";
import { Card, Highlight, Eyebrow } from "../primitives";
import { useMotion, Reveal } from "../motion";
import { Icon } from "../icons";
import type { IconName } from "../icons";
import { HeroIllustration } from "../hero-illustration";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile, isNarrow } from "../use-breakpoint";

interface ProblemSectionProps {
  tokens: Tokens;
}

export function ProblemSection({ tokens }: ProblemSectionProps) {
  const m = useMotion(tokens);
  const t = useV2T();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const narrow = isNarrow(bp);

  const CARD_ICONS: IconName[] = ["vague", "exclude", "imbalance"];

  return (
    <section style={{
      padding: mobile ? "40px 16px" : narrow ? "48px 24px" : "64px 64px",
      maxWidth: 1360, margin: "0 auto",
    }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: narrow ? "1fr" : "0.9fr 1.6fr",
        gap: mobile ? 28 : narrow ? 40 : 80,
        alignItems: "start",
      }}>
        <div>
          {/* Hide decorative illustration on mobile — crowds the text */}
          {!mobile && (
            <Reveal tokens={tokens}>
              <div style={{ marginBottom: 24 }}>
                <HeroIllustration tokens={tokens} size={narrow ? 220 : 280} />
              </div>
            </Reveal>
          )}
          <Eyebrow tokens={tokens}>{t.problemSection.eyebrow}</Eyebrow>
          <h2 style={{
            fontFamily: tokens.displayFont,
            fontSize: mobile ? 30 : narrow ? 38 : 48,
            lineHeight: 1.05,
            fontWeight: tokens.displayWeight, letterSpacing: "-0.03em",
            color: tokens.ink, marginTop: 16,
          }}>
            {t.problemSection.title.part1}<Highlight tokens={tokens}>{t.problemSection.title.highlight}</Highlight>{t.problemSection.title.part2}
          </h2>
        </div>
        <div style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : narrow ? "1fr 1fr" : "1fr 1fr 1fr",
          gap: mobile ? 14 : 20,
        }}>
          {t.problemSection.cards.map((card, i) => (
            <Reveal tokens={tokens} delay={i * 120} key={i}>
              <Card
                tokens={tokens}
                pad={22}
                style={{
                  transition: m.on ? "transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s ease" : "none",
                }}
                onMouseEnter={(e) => { if (m.on) { e.currentTarget.style.transform = "translateY(-4px)"; } }}
                onMouseLeave={(e) => { if (m.on) { e.currentTarget.style.transform = "none"; } }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{
                    fontFamily: tokens.monoFont, fontSize: 11,
                    color: tokens.inkMute, letterSpacing: "0.14em",
                  }}>0{i + 1}</div>
                  <Icon name={CARD_ICONS[i]} tokens={tokens} size={28} tint={tokens.primaryColor} />
                </div>
                <div style={{
                  fontFamily: tokens.displayFont, fontSize: 22,
                  fontWeight: tokens.displayWeight, color: tokens.ink,
                  marginTop: 18, letterSpacing: "-0.01em",
                }}>{card.title}</div>
                <div style={{
                  fontFamily: tokens.bodyFont, fontSize: 14, lineHeight: 1.5,
                  color: tokens.inkSoft, marginTop: 10,
                }}>{card.desc}</div>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
