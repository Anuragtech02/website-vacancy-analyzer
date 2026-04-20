"use client";

import { type Tokens } from "../theme";
import { Card, Eyebrow, ScoreRing } from "../primitives";
import { useV2T } from "../i18n-context";

interface ScoreCardProps {
  tokens: Tokens;
  overall: number;
  verdictLabel: string;
}

export function ScoreCard({ tokens, overall, verdictLabel }: ScoreCardProps) {
  const t = useV2T();
  return (
    <Card tokens={tokens} pad={36}>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 36, alignItems: "center" }}>
        <ScoreRing tokens={tokens} value={overall} size={220} label={t.report.scoreCard.scoreRingLabel} />
        <div>
          <Eyebrow tokens={tokens}>{t.report.scoreCard.eyebrow}</Eyebrow>
          <div style={{
            fontFamily: tokens.displayFont, fontSize: 48, lineHeight: 1.05,
            fontWeight: tokens.displayWeight, letterSpacing: "-0.03em",
            color: tokens.ink, marginTop: 14,
          }}>
            {verdictLabel}
          </div>
          <p style={{
            fontFamily: tokens.bodyFont, fontSize: 16, lineHeight: 1.55,
            color: tokens.inkSoft, marginTop: 14,
          }}>
            {t.report.scoreCard.summary}
          </p>
          <div style={{ display: "flex", gap: 20, marginTop: 22, flexWrap: "wrap" }}>
            {(
              [
                [t.report.scoreCard.stats.words,       "148"],
                [t.report.scoreCard.stats.readTime,     "52s"],
                [t.report.scoreCard.stats.applicants,   "+38%"],
                [t.report.scoreCard.stats.qualityLift,  "+2.4 pts"],
              ] as const
            ).map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: tokens.displayFont, fontSize: 24, fontWeight: tokens.displayWeight, color: tokens.ink, letterSpacing: "-0.02em" }}>{v}</div>
                <div style={{ fontFamily: tokens.monoFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: tokens.inkMute, marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
