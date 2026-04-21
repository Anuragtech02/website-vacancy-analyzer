"use client";

import { type Tokens, pillarColor } from "../theme";
import { Card, Eyebrow, Pill, ScoreBar } from "../primitives";
import { useMotion, Reveal } from "../motion";
import { type PillarDatum } from "./pillar-data";
import { PillarIcon } from "./pillar-icon";
import { useV2T } from "../i18n-context";

interface PillarGridProps {
  tokens: Tokens;
  pillars?: PillarDatum[];
}

export function PillarGrid({ tokens, pillars }: PillarGridProps) {
  const m = useMotion(tokens);
  const t = useV2T();

  // Parent always passes a real pillar array derived from the analysis.
  // Empty means no analysis is available — render nothing rather than fake data.
  const data = pillars ?? [];
  if (data.length === 0) return null;

  return (
    <section style={{ padding: "16px 48px 32px", maxWidth: 1360, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 22 }}>
        <div>
          <Eyebrow tokens={tokens}>{t.report.pillars.eyebrow}</Eyebrow>
          <h2 style={{
            fontFamily: tokens.displayFont, fontSize: 34, lineHeight: 1.1,
            fontWeight: tokens.displayWeight, letterSpacing: "-0.02em",
            color: tokens.ink, marginTop: 10,
          }}>
            {t.report.pillars.title}
          </h2>
        </div>
        <div style={{
          fontFamily: tokens.monoFont, fontSize: 11, letterSpacing: "0.12em",
          textTransform: "uppercase", color: tokens.inkMute,
        }}>
          {t.report.pillars.sortedBy}
        </div>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gridAutoRows: "1fr",
        gap: 14,
        alignItems: "stretch",
      }}>
        {data
          .slice()
          .sort((a, b) => a.score - b.score)
          .map((p, i) => {
            const c = pillarColor(p.key);
            const toneColor = p.tone === "ok" ? tokens.ok : p.tone === "warn" ? tokens.warn : tokens.bad;
            const big = i === 0 || i === 1;
            return (
              <Reveal
                tokens={tokens}
                delay={i * 70}
                key={p.key}
                style={{
                  gridColumn: big ? "span 2" : "span 1",
                  display: "flex",
                  height: "100%",
                }}
              >
                <Card
                  tokens={tokens}
                  pad={22}
                  tint={tokens.bgRaised}
                  style={{
                    position: "relative", overflow: "hidden",
                    width: "100%", minHeight: 240,
                    display: "flex", flexDirection: "column",
                    transition: m.on ? "transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s ease" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (m.on) {
                      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 18px 40px -20px rgba(40,30,20,0.3)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (m.on) {
                      (e.currentTarget as HTMLDivElement).style.transform = "none";
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    }
                  }}
                >
                  {/* Top colour bar */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: c.fg,
                  }} />

                  {/* Tone pill — absolute top-right so it doesn't steal width from the title */}
                  <Pill
                    tokens={tokens}
                    tone={p.tone}
                    style={{
                      position: "absolute", top: 14, right: 16,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.report.pillars.labels[p.label]}
                  </Pill>

                  {/* Header: icon + P## + title (pill-free, title can use full width minus pill reserve) */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: 10,
                    marginBottom: 16,
                    paddingRight: 96, // reserve for absolute pill
                    minHeight: 44,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: tokens.cardRadius > 6 ? 10 : 2,
                      background: c.bg, border: `1px solid ${c.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <PillarIcon name={p.key} color={c.dark} />
                    </div>
                    <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                      <div style={{ fontFamily: tokens.monoFont, fontSize: 10, letterSpacing: "0.14em", color: tokens.inkMute, textTransform: "uppercase" }}>
                        P{String(data.findIndex((x) => x.key === p.key) + 1).padStart(2, "0")}
                      </div>
                      <div style={{
                        fontFamily: tokens.displayFont, fontSize: big ? 20 : 17, fontWeight: tokens.displayWeight,
                        color: tokens.ink, letterSpacing: "-0.01em", lineHeight: 1.2,
                      }}>
                        {t.methodology.pillars[p.key]}
                      </div>
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                    <div style={{
                      fontFamily: tokens.displayFont, fontSize: 44, fontWeight: tokens.displayWeight,
                      color: tokens.ink, letterSpacing: "-0.03em", lineHeight: 1,
                    }}>{p.score.toFixed(1)}</div>
                    <div style={{ fontFamily: tokens.monoFont, fontSize: 12, color: tokens.inkMute, letterSpacing: "0.1em" }}>/ 10</div>
                  </div>
                  <ScoreBar tokens={tokens} value={p.score} color={toneColor} delay={i * 80} />

                  {/* Verdict — flex: 1 so cards stretch uniformly */}
                  <div style={{
                    fontFamily: tokens.bodyFont, fontSize: 14, lineHeight: 1.5,
                    color: tokens.inkSoft, marginTop: 16,
                    flex: "1 1 auto",
                  }}>
                    {p.verdict}
                  </div>
                </Card>
              </Reveal>
            );
          })}
      </div>
    </section>
  );
}
