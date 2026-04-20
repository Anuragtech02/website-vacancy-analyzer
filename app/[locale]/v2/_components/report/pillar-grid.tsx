"use client";

import { type Tokens, PILLAR_COLORS, pillarColor } from "../theme";
import { Card, Eyebrow, Pill, ScoreBar } from "../primitives";
import { useMotion, Reveal } from "../motion";
import { type PillarDatum, PILLAR_DATA } from "./pillar-data";
import { PillarIcon } from "./pillar-icon";
import { useV2T } from "../i18n-context";

interface PillarGridProps {
  tokens: Tokens;
  pillars?: PillarDatum[];
}

// Map PILLAR_DATA's English label strings to translation keys
const PILLAR_LABEL_KEY_MAP: Record<string, "excellent" | "good" | "fair" | "needsWork" | "critical"> = {
  "Strong":     "excellent",
  "Good":       "good",
  "Fair":       "fair",
  "Needs work": "needsWork",
  "Critical":   "critical",
};

export function PillarGrid({ tokens, pillars }: PillarGridProps) {
  const m = useMotion(tokens);
  const t = useV2T();

  const data = pillars ?? PILLAR_DATA;

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
        gridAutoRows: "minmax(220px, auto)",
        gap: 14,
      }}>
        {data
          .slice()
          .sort((a, b) => a.score - b.score)
          .map((p, i) => {
            const c = pillarColor(p.key);
            const toneColor = p.tone === "ok" ? tokens.ok : p.tone === "warn" ? tokens.warn : tokens.bad;
            const big = i === 0 || i === 1;
            return (
              <Reveal tokens={tokens} delay={i * 70} key={p.key}>
                <Card
                  tokens={tokens}
                  pad={22}
                  tint={tokens.bgRaised}
                  style={{
                    gridColumn: big ? "span 2" : "span 1",
                    position: "relative", overflow: "hidden",
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
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: c.fg,
                  }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: tokens.cardRadius > 6 ? 10 : 2,
                        background: c.bg, border: `1px solid ${c.border}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <PillarIcon name={p.key} color={c.dark} />
                      </div>
                      <div>
                        <div style={{ fontFamily: tokens.monoFont, fontSize: 10, letterSpacing: "0.14em", color: tokens.inkMute, textTransform: "uppercase" }}>
                          P{String(data.findIndex((x) => x.key === p.key) + 1).padStart(2, "0")}
                        </div>
                        <div style={{ fontFamily: tokens.displayFont, fontSize: 20, fontWeight: tokens.displayWeight, color: tokens.ink, letterSpacing: "-0.01em" }}>
                          {t.methodology.pillars[p.key]}
                        </div>
                      </div>
                    </div>
                    <Pill tokens={tokens} tone={p.tone}>
                      {t.report.pillars.labels[PILLAR_LABEL_KEY_MAP[p.label] ?? "good"]}
                    </Pill>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
                    <div style={{
                      fontFamily: tokens.displayFont, fontSize: 44, fontWeight: tokens.displayWeight,
                      color: tokens.ink, letterSpacing: "-0.03em", lineHeight: 1,
                    }}>{p.score.toFixed(1)}</div>
                    <div style={{ fontFamily: tokens.monoFont, fontSize: 12, color: tokens.inkMute, letterSpacing: "0.1em" }}>/ 10</div>
                  </div>
                  <ScoreBar tokens={tokens} value={p.score} color={toneColor} delay={i * 80} />
                  <div style={{
                    fontFamily: tokens.bodyFont, fontSize: 14, lineHeight: 1.5,
                    color: tokens.inkSoft, marginTop: 16,
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
