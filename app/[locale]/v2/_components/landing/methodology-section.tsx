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
        gap: mobile ? 12 : 16,
        marginTop: mobile ? 28 : 44,
      }}>
        {(Object.keys(PILLAR_COLORS) as PillarKey[]).map((key, i) => {
          const c = pillarColor(key);
          return (
            <Reveal tokens={tokens} delay={i * 70} key={key}>
              <Card tokens={tokens} pad={20} tint={c.bg}
                style={{
                  borderColor: c.border,
                  transition: m.on ? "transform .3s cubic-bezier(.2,.7,.2,1)" : "none",
                }}
                onMouseEnter={(e) => { if (m.on) { e.currentTarget.style.transform = "translateY(-3px) rotate(-0.4deg)"; }}}
                onMouseLeave={(e) => { if (m.on) { e.currentTarget.style.transform = "none"; }}}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{
                    fontFamily: tokens.monoFont, fontSize: 11,
                    color: c.dark, letterSpacing: "0.12em", fontWeight: 500,
                  }}>P{String(i + 1).padStart(2, "0")}</div>
                  <div style={{
                    width: 10, height: 10, borderRadius: 2, background: c.fg,
                  }} />
                </div>
                <div style={{
                  fontFamily: tokens.displayFont, fontSize: 22,
                  fontWeight: tokens.displayWeight, color: tokens.ink,
                  marginTop: 22, letterSpacing: "-0.01em", lineHeight: 1.15,
                }}>{t.methodology.pillars[key]}</div>
              </Card>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
