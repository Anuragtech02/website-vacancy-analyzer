"use client";

import { type Tokens } from "../theme";
import { Card, Button, Eyebrow } from "../primitives";
import { useV2T } from "../i18n-context";
import { estimatePotentialScore } from "./estimate-potential";
import { useBreakpoint, isMobile, isTablet } from "../use-breakpoint";

interface GateCardProps {
  tokens: Tokens;
  currentScore: number;
  potentialScore?: number;
  onUnlock: () => void;
}

export function GateCard({ tokens, currentScore, potentialScore, onUnlock }: GateCardProps) {
  // Real optimization score when available, otherwise an estimate keyed off the
  // user's actual current score (never the fixed "8.2" that reads as mock).
  const displayPotential = potentialScore ?? estimatePotentialScore(currentScore);
  const t = useV2T();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const tablet = isTablet(bp);

  const headlineFontSize = mobile ? 22 : tablet ? 26 : 30;
  const headerPad = mobile ? "22px 18px 16px" : "28px 28px 20px";
  const middleMargin = mobile ? "0 18px" : "0 28px";
  const footerPad = mobile ? "16px 18px 22px" : "20px 28px 28px";
  const scoreFontSize = mobile ? 34 : 44;
  const trustGap = mobile ? 8 : 16;

  return (
    <Card
      tokens={tokens}
      pad={0}
      tint={tokens.ink}
      style={{
        color: tokens.bgRaised, borderColor: tokens.ink,
        overflow: "hidden", position: "relative",
        height: "100%", display: "flex", flexDirection: "column",
      }}
    >
      {/* soft orange glow */}
      <div style={{
        position: "absolute", inset: -40, pointerEvents: "none",
        background: `radial-gradient(circle at 80% 0%, ${tokens.primaryColor}55, transparent 55%)`,
      }} />
      <div style={{ padding: headerPad, position: "relative" }}>
        <Eyebrow tokens={{ ...tokens, inkSoft: "rgba(255,255,255,0.6)", primaryColor: tokens.primaryColor }}>
          {t.report.gate.eyebrow}
        </Eyebrow>
        <div style={{
          fontFamily: tokens.displayFont, fontSize: headlineFontSize, lineHeight: 1.1,
          fontWeight: tokens.displayWeight, letterSpacing: "-0.02em",
          marginTop: 10, color: tokens.bgRaised,
        }}>
          {t.report.gate.headline.prefix}
          <span style={{ color: tokens.primaryColor }}>{currentScore.toFixed(1)}</span>
          {t.report.gate.headline.to}
          <span style={{ color: tokens.ok }}>{displayPotential.toFixed(1)}</span>
          {t.report.gate.headline.suffix}
        </div>
      </div>

      {/* before / after reveal — flex-grows to absorb any extra height when the
          card stretches to match the ScoreCard, so the Unlock button stays
          anchored to the bottom. */}
      <div style={{
        margin: middleMargin,
        padding: "18px", position: "relative",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: tokens.cardRadius,
        flex: "1 0 auto",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <div>
            <div style={{ fontFamily: tokens.monoFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>{t.report.gate.currentLabel}</div>
            <div style={{ fontFamily: tokens.displayFont, fontSize: scoreFontSize, fontWeight: tokens.displayWeight, color: tokens.bgRaised, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 4 }}>
              {currentScore.toFixed(1)}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <div style={{ fontFamily: tokens.monoFont, fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>{t.report.gate.potentialLabel}</div>
            <div style={{
              fontFamily: tokens.displayFont, fontSize: scoreFontSize, fontWeight: tokens.displayWeight,
              color: tokens.ok, letterSpacing: "-0.03em", lineHeight: 1, marginTop: 4,
              filter: "blur(6px)",
              userSelect: "none",
            }}>{displayPotential.toFixed(1)}</div>
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

      <div style={{ padding: footerPad, position: "relative" }}>
        <Button tokens={tokens} variant="primary" onClick={onUnlock} style={{ width: "100%", padding: "16px" }}>
          {t.report.gate.unlockButton}
        </Button>
        <div style={{
          display: "flex", flexWrap: "wrap", justifyContent: "center", gap: trustGap, marginTop: 14,
          fontFamily: tokens.monoFont, fontSize: 10, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.55)",
        }}>
          <span>{t.report.gate.trust.noSpam}</span><span>·</span><span>{t.report.gate.trust.gdpr}</span><span>·</span><span>{t.report.gate.trust.unsubscribe}</span>
        </div>
      </div>
    </Card>
  );
}
