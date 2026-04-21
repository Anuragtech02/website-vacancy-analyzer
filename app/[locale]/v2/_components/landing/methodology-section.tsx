"use client";

// methodology-section.tsx — 8 pillars grid section.
// Ported from landing.jsx (React-in-HTML prototype).

import type { Tokens } from "../theme";
import { PILLAR_COLORS, pillarColor } from "../theme";
import type { PillarKey } from "../theme";
import { Card, Eyebrow } from "../primitives";
import { useMotion, Reveal } from "../motion";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile, isTablet } from "../use-breakpoint";

interface MethodologySectionProps {
  tokens: Tokens;
}

export function MethodologySection({ tokens }: MethodologySectionProps) {
  const m = useMotion(tokens);
  const t = useV2T();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const tablet = isTablet(bp);

  const gridColumns = mobile
    ? "1fr"
    : tablet
      ? "repeat(2, 1fr)"
      : "repeat(4, 1fr)";

  return (
    <section style={{
      padding: mobile ? "48px 16px" : tablet ? "60px 24px" : "80px 64px",
      maxWidth: 1360, margin: "0 auto",
      borderTop: `1px solid ${tokens.line}`,
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: mobile ? "start" : "end",
        gap: mobile ? 20 : 40,
        flexWrap: "wrap",
        flexDirection: mobile ? "column" : "row",
      }}>
        <div>
          <Eyebrow tokens={tokens}>{t.methodology.eyebrow}</Eyebrow>
          <h2 style={{
            fontFamily: tokens.displayFont,
            fontSize: mobile ? 30 : tablet ? 38 : 48,
            lineHeight: 1.05,
            fontWeight: tokens.displayWeight, letterSpacing: "-0.03em",
            color: tokens.ink, marginTop: 16, maxWidth: 720,
          }}>
            {t.methodology.title}
          </h2>
        </div>
        <div style={{
          fontFamily: tokens.bodyFont, fontSize: 14, color: tokens.inkSoft, maxWidth: 360,
        }}>
          {t.methodology.sidebar}
        </div>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: gridColumns,
        gridAutoRows: "1fr",
        alignItems: "stretch",
        gap: mobile ? 12 : 16,
        marginTop: mobile ? 28 : 44,
      }}>
        {(Object.keys(PILLAR_COLORS) as PillarKey[]).map((key, i) => {
          const c = pillarColor(key);
          return (
            <Reveal tokens={tokens} delay={i * 70} key={key} style={{ display: "flex", height: "100%" }}>
              <Card
                tokens={tokens}
                pad={20}
                tint={tokens.bgRaised}
                style={{
                  width: "100%",
                  position: "relative", overflow: "hidden",
                  display: "flex", flexDirection: "column",
                  transition: m.on ? "transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s ease" : "none",
                }}
                onMouseEnter={(e) => { if (m.on) {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 14px 32px -18px rgba(40,30,20,0.22)";
                }}}
                onMouseLeave={(e) => { if (m.on) {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "none";
                }}}
              >
                {/* Thin colored top stripe — the one place colour shows up
                    so the grid reads as a family without flooding each card
                    with a different pastel. Matches the report pillar grid. */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: 3,
                  background: c.fg,
                }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginTop: 6 }}>
                  <div style={{
                    fontFamily: tokens.monoFont, fontSize: 11,
                    color: tokens.inkMute, letterSpacing: "0.14em",
                    textTransform: "uppercase", fontWeight: 500,
                  }}>P{String(i + 1).padStart(2, "0")}</div>
                  {/* Small tinted badge — keeps each card identifiable
                      without screaming colour. */}
                  <div style={{
                    width: 28, height: 28,
                    borderRadius: tokens.cardRadius > 6 ? 8 : 2,
                    background: c.bg, border: `1px solid ${c.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: c.fg }} />
                  </div>
                </div>
                <div style={{
                  fontFamily: tokens.displayFont, fontSize: 20,
                  fontWeight: tokens.displayWeight, color: tokens.ink,
                  marginTop: 20, letterSpacing: "-0.01em", lineHeight: 1.2,
                }}>{t.methodology.pillars[key]}</div>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
