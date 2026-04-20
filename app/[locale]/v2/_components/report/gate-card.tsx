"use client";

import { type Tokens } from "../theme";
import { Card, Button, Eyebrow } from "../primitives";

interface GateCardProps {
  tokens: Tokens;
  currentScore: number;
  onUnlock: () => void;
}

export function GateCard({ tokens, currentScore, onUnlock }: GateCardProps) {
  return (
    <Card
      tokens={tokens}
      pad={0}
      tint={tokens.ink}
      style={{ color: tokens.bgRaised, borderColor: tokens.ink, overflow: "hidden", position: "relative" }}
    >
      {/* soft orange glow */}
      <div style={{
        position: "absolute", inset: -40, pointerEvents: "none",
        background: `radial-gradient(circle at 80% 0%, ${tokens.primaryColor}55, transparent 55%)`,
      }} />
      <div style={{ padding: "28px 28px 20px", position: "relative" }}>
        <Eyebrow tokens={{ ...tokens, inkSoft: "rgba(255,255,255,0.6)", primaryColor: tokens.primaryColor }}>
          Unlock the rewrite
        </Eyebrow>
        <div style={{
          fontFamily: tokens.displayFont, fontSize: 30, lineHeight: 1.1,
          fontWeight: tokens.displayWeight, letterSpacing: "-0.02em",
          marginTop: 10, color: tokens.bgRaised,
        }}>
          Your posting can go from{" "}
          <span style={{ color: tokens.primaryColor }}>{currentScore.toFixed(1)}</span>
          {" "}to{" "}
          <span style={{ color: tokens.ok }}>8.2</span>.
        </div>
      </div>

      {/* before / after reveal */}
      <div style={{
        margin: "0 28px",
        padding: "18px", position: "relative",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: tokens.cardRadius,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <div style={{ fontFamily: tokens.monoFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Current</div>
            <div style={{ fontFamily: tokens.displayFont, fontSize: 44, fontWeight: tokens.displayWeight, color: tokens.bgRaised, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 4 }}>
              {currentScore.toFixed(1)}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: tokens.monoFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Potential</div>
            <div style={{
              fontFamily: tokens.displayFont, fontSize: 44, fontWeight: tokens.displayWeight,
              color: tokens.ok, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 4,
              filter: "blur(6px)",
              userSelect: "none",
            }}>8.2</div>
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ color: tokens.primaryColor }}>
                <path d="M5 10 V7 a6 6 0 0 1 12 0 v3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <rect x="3" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="11" cy="15" r="1.4" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>
        {/* preview lines */}
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 6, filter: "blur(4px)", pointerEvents: "none", userSelect: "none" }}>
          {[92, 78, 84, 66].map((w, i) => (
            <div key={i} style={{ height: 8, width: `${w}%`, background: "rgba(255,255,255,0.18)", borderRadius: 4 }} />
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 28px 28px", position: "relative" }}>
        <Button tokens={tokens} variant="primary" onClick={onUnlock} style={{ width: "100%", padding: "16px" }}>
          Unlock improved version
        </Button>
        <div style={{
          display: "flex", justifyContent: "center", gap: 16, marginTop: 14,
          fontFamily: tokens.monoFont, fontSize: 10, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.55)",
        }}>
          <span>No spam</span><span>·</span><span>GDPR safe</span><span>·</span><span>Unsubscribe any time</span>
        </div>
      </div>
    </Card>
  );
}
