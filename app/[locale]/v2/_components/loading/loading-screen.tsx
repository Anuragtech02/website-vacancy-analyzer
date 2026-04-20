"use client";

import { useState, useEffect } from "react";
import { type Tokens } from "../theme";
import { Card, Button, Eyebrow } from "../primitives";
import { useMotion, AmbientBG, Shimmer, TypingText } from "../motion";
import { useV2T } from "../i18n-context";

export interface LoadingStep {
  key: string;
  label: string;
  detail: string;
}

export const LOADING_STEPS: LoadingStep[] = [
  { key: "parse",    label: "Reading the posting",    detail: "Segmenting sections and role signals." },
  { key: "bias",     label: "Scanning for bias",      detail: "Checking coded language and exclusion patterns." },
  { key: "tone",     label: "Checking tone of voice", detail: "Balancing warmth against authority." },
  { key: "structure",label: "Grading clarity",        detail: "Responsibilities, requirements, CTA." },
  { key: "benefits", label: "Weighing benefits",      detail: "Comp, growth, flexibility, culture signals." },
  { key: "rewrite",  label: "Drafting the rewrite",   detail: "Assembling a publishable version." },
];

interface LoadingProps {
  tokens: Tokens;
  onComplete: () => void;
  onSkipToEmail: () => void;
}

export function Loading({ tokens, onComplete, onSkipToEmail }: LoadingProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const m = useMotion(tokens);
  const t = useV2T();

  useEffect(() => {
    const tick = setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    if (stepIdx >= LOADING_STEPS.length) {
      const t = setTimeout(onComplete, 500);
      return () => clearTimeout(t);
    }
    const durations = [900, 1100, 1000, 1200, 1100, 1300];
    const t = setTimeout(() => setStepIdx((i) => i + 1), durations[stepIdx]);
    return () => clearTimeout(t);
  }, [stepIdx, onComplete]);

  const pct = Math.min(100, (stepIdx / LOADING_STEPS.length) * 100);
  const current = LOADING_STEPS[Math.min(stepIdx, LOADING_STEPS.length - 1)];
  // Pull translated label/detail by the step's key
  type StepKey = keyof typeof t.loading.steps;
  const currentLabel  = t.loading.steps[current.key as StepKey].label;
  const currentDetail = t.loading.steps[current.key as StepKey].detail;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "48px 32px", position: "relative", overflow: "hidden",
    }}>
      <AmbientBG tokens={tokens} />
      <Card tokens={tokens} pad={0} style={{ width: "100%", maxWidth: 760, overflow: "hidden", position: "relative", zIndex: 1 }}>
        <Shimmer tokens={tokens} />
        {/* top strip */}
        <div style={{
          padding: "16px 24px",
          borderBottom: `1px solid ${tokens.line}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: tokens.bgMuted,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: 999,
              background: tokens.primaryColor,
              animation: "va-pulse 1.2s ease-in-out infinite",
            }} />
            <div style={{ fontFamily: tokens.monoFont, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: tokens.inkSoft }}>
              {t.loading.header.working}
            </div>
          </div>
          <div style={{ fontFamily: tokens.monoFont, fontSize: 11, color: tokens.inkMute }}>
            {t.loading.header.elapsed.replace('{seconds}', elapsed.toFixed(1))}
          </div>
        </div>

        {/* big status */}
        <div style={{ padding: "56px 40px 32px" }}>
          <Eyebrow tokens={tokens}>
            {t.loading.stepCounter
              .replace('{current}', String(Math.min(stepIdx + 1, LOADING_STEPS.length)))
              .replace('{total}', String(LOADING_STEPS.length))}
          </Eyebrow>
          <div style={{
            fontFamily: tokens.displayFont, fontSize: 48, lineHeight: 1.08,
            fontWeight: tokens.displayWeight, letterSpacing: "-0.03em",
            color: tokens.ink, marginTop: 14,
            minHeight: 64,
          }}>
            <TypingText tokens={tokens} text={currentLabel} />
            <span style={{ color: tokens.primaryColor }}>…</span>
          </div>
          <div style={{
            fontFamily: tokens.bodyFont, fontSize: 17, color: tokens.inkSoft,
            marginTop: 12, maxWidth: 540,
          }}>
            {currentDetail}
          </div>
        </div>

        {/* step timeline */}
        <div style={{ padding: "24px 40px 32px" }}>
          <div style={{
            height: 2, background: tokens.line, position: "relative",
            marginBottom: 18,
          }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${pct}%`, background: tokens.primaryColor,
              transition: "width .6s cubic-bezier(.2,.7,.2,1)",
            }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${LOADING_STEPS.length}, 1fr)`, gap: 8 }}>
            {LOADING_STEPS.map((s, i) => {
              const state = i < stepIdx ? "done" : i === stepIdx ? "active" : "pending";
              return (
                <div key={s.key} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: 999,
                    background: state === "done" ? tokens.primaryColor : state === "active" ? tokens.bgRaised : tokens.bgMuted,
                    border: `1.5px solid ${state === "pending" ? tokens.line : tokens.primaryColor}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {state === "done" && (
                      <svg width="9" height="9" viewBox="0 0 9 9">
                        <path d="M1 5 L3.5 7.5 L8 2" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {state === "active" && (
                      <div style={{ width: 6, height: 6, borderRadius: 999, background: tokens.primaryColor, animation: "va-pulse 1.2s ease infinite" }} />
                    )}
                  </div>
                  <div style={{
                    fontFamily: tokens.monoFont, fontSize: 10,
                    color: state === "pending" ? tokens.inkMute : tokens.inkSoft,
                    letterSpacing: "0.08em",
                    lineHeight: 1.3,
                  }}>
                    {t.loading.steps[s.key as StepKey].label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 15s+ friendly banner */}
        {elapsed > 15 && (
          <div style={{
            margin: "0 24px 24px",
            padding: "14px 18px",
            background: `color-mix(in oklch, ${tokens.warn} 14%, transparent)`,
            border: `1px solid color-mix(in oklch, ${tokens.warn} 40%, transparent)`,
            borderRadius: tokens.cardRadius,
            display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
          }}>
            <div style={{
              fontFamily: tokens.bodyFont, fontSize: 14, color: tokens.ink, lineHeight: 1.4,
            }}>
              {t.loading.slowBanner.text}
            </div>
            <Button tokens={tokens} variant="ghost" onClick={onSkipToEmail} style={{ padding: "8px 14px", fontSize: 13, flexShrink: 0 }}>
              {t.loading.slowBanner.cta}
            </Button>
          </div>
        )}
      </Card>
      <style>{`
        @keyframes va-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.4); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
