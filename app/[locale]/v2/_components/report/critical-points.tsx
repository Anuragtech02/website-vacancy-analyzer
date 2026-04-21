"use client";

import { type Tokens } from "../theme";
import { Card, Eyebrow } from "../primitives";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile } from "../use-breakpoint";

interface CriticalPointsProps {
  tokens: Tokens;
  issues?: Array<{ problem: string; why_it_matters: string; how_to_improve: string }>;
}

export function CriticalPoints({ tokens, issues }: CriticalPointsProps) {
  const t = useV2T();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

  // Only render real issues from the analysis. Empty → render nothing rather
  // than show fake points.
  const items = issues && issues.length > 0
    ? issues.slice(0, 5).map((i) => ({ title: i.problem, detail: i.why_it_matters }))
    : [];

  if (items.length === 0) return null;

  const cardPad = mobile ? 20 : 28;
  const titleFontSize = mobile ? 24 : 30;

  return (
    <Card
      tokens={tokens}
      pad={cardPad}
      tint={tokens.ink}
      style={{
        color: tokens.bgRaised, borderColor: tokens.ink,
        height: "100%", display: "flex", flexDirection: "column",
      }}
    >
      <Eyebrow tokens={{ ...tokens, inkSoft: "rgba(255,255,255,0.6)", primaryColor: tokens.primaryColor }}>
        {t.report.critical.eyebrow}
      </Eyebrow>
      <div style={{
        fontFamily: tokens.displayFont, fontSize: titleFontSize, fontWeight: tokens.displayWeight,
        color: tokens.bgRaised, marginTop: 10, letterSpacing: "-0.02em",
      }}>
        {t.report.critical.title}
      </div>
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {items.map((p, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "22px 1fr", gap: 12, alignItems: "start" }}>
            <div style={{
              width: 22, height: 22, borderRadius: 999,
              background: tokens.primaryColor, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: tokens.monoFont, fontSize: 11, fontWeight: 600,
              flexShrink: 0, marginTop: 1,
            }}>{i + 1}</div>
            <div>
              <div style={{ fontFamily: tokens.bodyFont, fontSize: 14, fontWeight: 600, color: tokens.bgRaised }}>{p.title}</div>
              <div style={{ fontFamily: tokens.bodyFont, fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 2, lineHeight: 1.4 }}>{p.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
