"use client";

import { type Tokens } from "../theme";
import { Card, Eyebrow, ScoreRing } from "../primitives";
import { useV2T } from "../i18n-context";

interface ScoreCardProps {
  tokens: Tokens;
  overall: number;
  verdictLabel: string;
  executiveSummary?: string;
  wordCount?: number;
}

export function ScoreCard({ tokens, overall, verdictLabel, executiveSummary, wordCount }: ScoreCardProps) {
  const t = useV2T();
  const wordsDisplay = wordCount != null ? String(wordCount) : "148";

  // Derive read time from word count (~200 WPM)
  const readTimeDisplay = wordCount != null
    ? (() => {
        const secs = Math.max(5, Math.round((wordCount / 200) * 60));
        return secs < 60 ? `${secs}s` : `${Math.round(secs / 60)}m`;
      })()
    : "—";

  return (
    <Card tokens={tokens} pad={36} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "240px 1fr", gap: 36,
        alignItems: "start", flex: 1,
      }}>
        {/* Left column: score ring + word/read-time stats directly beneath */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>
          <ScoreRing tokens={tokens} value={overall} size={220} label={t.report.scoreCard.scoreRingLabel} />
          <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
            {(
              [
                [t.report.scoreCard.stats.words,    wordsDisplay],
                [t.report.scoreCard.stats.readTime, readTimeDisplay],
              ] as const
            ).map(([k, v]) => (
              <div key={k} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: tokens.displayFont, fontSize: 24, fontWeight: tokens.displayWeight, color: tokens.ink, letterSpacing: "-0.02em" }}>{v}</div>
                <div style={{ fontFamily: tokens.monoFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: tokens.inkMute, marginTop: 2 }}>{k}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: verdict + executive summary, uncluttered */}
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
            {executiveSummary ?? t.report.scoreCard.summary}
          </p>
        </div>
      </div>
    </Card>
  );
}
