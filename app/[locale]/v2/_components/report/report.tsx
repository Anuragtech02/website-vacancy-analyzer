"use client";

import { useMemo } from "react";
import { type Tokens } from "../theme";
import { PILLAR_DATA } from "./pillar-data";
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
  onOpenEmail: () => void;
  onOpenLimit: () => void;
  onOpenDemo: () => void;
}

export function Report({ tokens, unlocked, usesLeft, onOpenEmail, onOpenLimit: _onOpenLimit, onOpenDemo: _onOpenDemo }: ReportProps) {
  const overall = useMemo(() => {
    const avg = PILLAR_DATA.reduce((s, p) => s + p.score, 0) / PILLAR_DATA.length;
    return Math.round(avg * 10) / 10;
  }, []);

  const verdict =
    overall >= 8    ? { label: "Excellent",         tone: "ok" } :
    overall >= 6.5  ? { label: "Good",               tone: "primary" } :
    overall >= 5    ? { label: "Needs improvement",  tone: "warn" } :
                      { label: "Weak",               tone: "bad" };

  return (
    <div style={{ width: "100%" }}>
      <ReportHeader tokens={tokens} usesLeft={usesLeft} />

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

      <OriginalTextAccordion tokens={tokens} />

      {/* Disclaimer */}
      <section style={{ padding: "16px 48px 48px", maxWidth: 1360, margin: "0 auto" }}>
        <div style={{
          fontFamily: tokens.bodyFont, fontSize: 13, color: tokens.inkMute,
          maxWidth: 720, lineHeight: 1.5,
        }}>
          Scores are produced by a large language model tuned on 14,000 anonymized postings and
          applicant outcomes. Treat them as a second opinion, not a verdict. Your domain knowledge
          wins every tie.
        </div>
      </section>

      {!unlocked && <StickyUnlockBanner tokens={tokens} onOpenEmail={onOpenEmail} />}
    </div>
  );
}
