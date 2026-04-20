"use client";

import { useMemo } from "react";
import { type Tokens } from "../theme";
import { PILLAR_DATA } from "./pillar-data";
import { useV2T } from "../i18n-context";
import { ReportHeader } from "./report-header";
import { ScoreCard } from "./score-card";
import { GateCard } from "./gate-card";
import { CriticalPoints } from "./critical-points";
import { PillarGrid } from "./pillar-grid";
import { RewriteSection } from "./rewrite-section";
import { OriginalTextAccordion } from "./original-text-accordion";
import { StickyUnlockBanner } from "./sticky-unlock-banner";

export interface ReportProps {
  tokens: Tokens;
  unlocked: boolean;
  usesLeft: number;
  submittedText: string;
  onOpenEmail: () => void;
  onOpenLimit: () => void;
  onOpenDemo: () => void;
}

export function Report({ tokens, unlocked, usesLeft, submittedText, onOpenEmail, onOpenLimit: _onOpenLimit, onOpenDemo: _onOpenDemo }: ReportProps) {
  const t = useV2T();

  const overall = useMemo(() => {
    const avg = PILLAR_DATA.reduce((s, p) => s + p.score, 0) / PILLAR_DATA.length;
    return Math.round(avg * 10) / 10;
  }, []);

  const verdict =
    overall >= 8    ? { label: t.report.scoreCard.verdict.excellent,        tone: "ok" } :
    overall >= 6.5  ? { label: t.report.scoreCard.verdict.good,             tone: "primary" } :
    overall >= 5    ? { label: t.report.scoreCard.verdict.needsImprovement, tone: "warn" } :
                      { label: t.report.scoreCard.verdict.weak,             tone: "bad" };

  return (
    <div style={{ width: "100%" }}>
      <ReportHeader tokens={tokens} usesLeft={usesLeft} unlocked={unlocked} />

      {/* TOP: score + gate/critical */}
      <section style={{
        padding: "48px 48px 32px", maxWidth: 1360, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 32, alignItems: "start",
      }}>
        <ScoreCard tokens={tokens} overall={overall} verdictLabel={verdict.label} />

        {!unlocked ? (
          <GateCard tokens={tokens} currentScore={overall} onUnlock={onOpenEmail} />
        ) : (
          <CriticalPoints tokens={tokens} />
        )}
      </section>

      <PillarGrid tokens={tokens} />

      {unlocked && <RewriteSection tokens={tokens} />}

      <OriginalTextAccordion tokens={tokens} text={submittedText} />

      {/* Disclaimer */}
      <section style={{ padding: "16px 48px 48px", maxWidth: 1360, margin: "0 auto" }}>
        <div style={{
          fontFamily: tokens.bodyFont, fontSize: 13, color: tokens.inkMute,
          maxWidth: 720, lineHeight: 1.5,
        }}>
          {t.report.disclaimer}
        </div>
      </section>

      {!unlocked && <StickyUnlockBanner tokens={tokens} onOpenEmail={onOpenEmail} />}
    </div>
  );
}
