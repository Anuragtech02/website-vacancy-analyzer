"use client";

import { type Tokens } from "../theme";
import { Card, Eyebrow } from "../primitives";
import { CRITICAL_POINTS } from "./pillar-data";

interface CriticalPointsProps {
  tokens: Tokens;
}

export function CriticalPoints({ tokens }: CriticalPointsProps) {
  return (
    <Card
      tokens={tokens}
      pad={28}
      tint={tokens.ink}
      style={{ color: tokens.bgRaised, borderColor: tokens.ink }}
    >
      <Eyebrow tokens={{ ...tokens, inkSoft: "rgba(255,255,255,0.6)", primaryColor: tokens.primaryColor }}>
        Critical points
      </Eyebrow>
      <div style={{
        fontFamily: tokens.displayFont, fontSize: 30, fontWeight: tokens.displayWeight,
        color: tokens.bgRaised, marginTop: 10, letterSpacing: "-0.02em",
      }}>
        Fix these first.
      </div>
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        {CRITICAL_POINTS.map((p, i) => (
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
