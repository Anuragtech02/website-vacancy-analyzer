"use client";

import { useMemo } from "react";
import { type Tokens, type PillarKey } from "../theme";
import { type PillarDatum, type PillarLabelKey } from "./pillar-data";
import { useV2T } from "../i18n-context";
import { ReportHeader } from "./report-header";
import { ScoreCard } from "./score-card";
import { GateCard } from "./gate-card";
import { CriticalPoints } from "./critical-points";
import { PillarGrid } from "./pillar-grid";
import { RewriteSection } from "./rewrite-section";
import { OriginalTextAccordion } from "./original-text-accordion";
import { StickyUnlockBanner } from "./sticky-unlock-banner";
import type { AnalysisResult, OptimizationResult } from "@/lib/gemini";

export interface ReportProps {
  tokens: Tokens;
  unlocked: boolean;
  usesLeft: number;
  submittedText: string;
  analysis: AnalysisResult | null;
  optimization: OptimizationResult | null;
  onOpenEmail: () => void;
  onOpenLimit: () => void;
  onOpenDemo: () => void;
}

function mapAnalysisToPillarData(analysis: AnalysisResult): PillarDatum[] {
  const keys: PillarKey[] = [
    "structure_layout",
    "inclusion_bias",
    "tone_of_voice",
    "evp_brand",
    "persona_fit",
    "mobile_experience",
    "seo_findability",
    "neuromarketing",
  ];

  return keys.map((key) => {
    const p = analysis.pillars[key];
    const tone: "ok" | "warn" | "bad" =
      p.score >= 7.5 ? "ok" : p.score >= 5 ? "warn" : "bad";
    const label: PillarLabelKey =
      p.score >= 8   ? "excellent" :
      p.score >= 7   ? "good" :
      p.score >= 6   ? "fair" :
      p.score >= 4.5 ? "needsWork" :
                       "critical";
    return { key, score: p.score, label, verdict: p.diagnosis, tone };
  });
}

export function Report({
  tokens,
  unlocked,
  usesLeft,
  submittedText,
  analysis,
  optimization,
  onOpenEmail,
  onOpenLimit: _onOpenLimit,
  onOpenDemo: _onOpenDemo,
}: ReportProps) {
  const t = useV2T();

  // Pillar data always comes from the real analysis. When it's missing (stale
  // hydration, bug) we render an empty array — the page hydration guard should
  // already have bounced users back to landing before they see this state.
  const pillarData = useMemo(
    () => (analysis ? mapAnalysisToPillarData(analysis) : []),
    [analysis],
  );

  const overall = useMemo(() => {
    if (pillarData.length === 0) return 0;
    const avg = pillarData.reduce((s, p) => s + p.score, 0) / pillarData.length;
    return Math.round(avg * 10) / 10;
  }, [pillarData]);

  const verdict =
    overall >= 8   ? { label: t.report.scoreCard.verdict.excellent,        tone: "ok" } :
    overall >= 6.5 ? { label: t.report.scoreCard.verdict.good,             tone: "primary" } :
    overall >= 5   ? { label: t.report.scoreCard.verdict.needsImprovement, tone: "warn" } :
                     { label: t.report.scoreCard.verdict.weak,             tone: "bad" };

  const potentialScore = optimization?.estimated_scores?.total_score ?? undefined;

  return (
    <div style={{ width: "100%" }}>
      <ReportHeader tokens={tokens} usesLeft={usesLeft} unlocked={unlocked} jobTitle={analysis?.metadata.job_title} />

      {/* TOP: score + gate/critical — stretch so both cards share the row height */}
      <section style={{
        padding: "48px 48px 32px", maxWidth: 1360, margin: "0 auto",
        display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 32, alignItems: "stretch",
      }}>
        <ScoreCard
          tokens={tokens}
          overall={overall}
          verdictLabel={verdict.label}
          executiveSummary={analysis?.summary.executive_summary}
          wordCount={analysis?.metadata.word_count}
        />

        {!unlocked ? (
          <GateCard
            tokens={tokens}
            currentScore={overall}
            potentialScore={potentialScore}
            onUnlock={onOpenEmail}
          />
        ) : (
          <CriticalPoints
            tokens={tokens}
            issues={analysis?.summary.key_issues}
          />
        )}
      </section>

      <PillarGrid tokens={tokens} pillars={pillarData} />

      {unlocked && (
        <RewriteSection
          tokens={tokens}
          rewrittenText={optimization?.full_text_plain}
          projectedScore={potentialScore}
        />
      )}

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

      {!unlocked && (
        <StickyUnlockBanner
          tokens={tokens}
          onOpenEmail={onOpenEmail}
          currentScore={overall}
          potentialScore={potentialScore}
        />
      )}
    </div>
  );
}
