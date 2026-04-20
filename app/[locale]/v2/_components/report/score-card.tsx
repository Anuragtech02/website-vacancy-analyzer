"use client";

import { type Tokens } from "../theme";
import { Card, Eyebrow, ScoreRing } from "../primitives";

interface ScoreCardProps {
  tokens: Tokens;
  overall: number;
  verdictLabel: string;
}

export function ScoreCard({ tokens, overall, verdictLabel }: ScoreCardProps) {
  return (
    <Card tokens={tokens} pad={36}>
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 36, alignItems: "center" }}>
        <ScoreRing tokens={tokens} value={overall} size={220} label="Overall score" />
        <div>
          <Eyebrow tokens={tokens}>Verdict</Eyebrow>
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
            A capable posting that&apos;s being held back by two critical weaknesses:
            accidentally exclusive language and a benefits section that reads like an
            afterthought. The tone and culture signals are genuinely strong — don&apos;t
            lose those in the rewrite.
          </p>
          <div style={{ display: "flex", gap: 20, marginTop: 22, flexWrap: "wrap" }}>
            {(
              [
                ["Words",           "148"],
                ["Read time",       "52s"],
                ["Est. applicants", "+38%"],
                ["Quality lift",    "+2.4 pts"],
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
