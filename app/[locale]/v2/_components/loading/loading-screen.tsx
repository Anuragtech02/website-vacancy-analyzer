"use client";

import { useState, useEffect } from "react";
import { type Tokens } from "../theme";
import { Card, Button, Eyebrow } from "../primitives";
import { useMotion, AmbientBG, Shimmer, TypingText } from "../motion";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile } from "../use-breakpoint";
import type { V2Messages } from "../../_messages";

type StepKey = keyof V2Messages["loading"]["steps"];

export interface LoadingStep {
  key: StepKey;
}

// Step labels shown in the loader timeline. The loader is decorative — the
// actual transition to the report screen is driven by the /api/analyze fetch
// resolving in the parent page. The loader never force-completes on its own.
export const LOADING_STEPS: Array<{ key: StepKey }> = [
  { key: "parse" },
  { key: "bias" },
  { key: "tone" },
  { key: "structure" },
  { key: "benefits" },
  { key: "rewrite" },
];

interface LoadingProps {
  tokens: Tokens;
  onSkipToEmail: () => void;
  /**
   * Externally-driven step index (0-5) from the SSE progress events. When
   * omitted, the loader falls back to a client-side timer animation — used
   * during SSR and as a graceful degradation if the stream never sends a
   * progress event. Backend-driven values take precedence the moment they
   * arrive.
   */
  stageIdx?: number;
  /** Externally-driven progress % (0-100). Optional; derived from stageIdx if absent. */
  progressPct?: number;
}

export function Loading({ tokens, onSkipToEmail, stageIdx, progressPct }: LoadingProps) {
  const [internalStepIdx, setInternalStepIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const m = useMotion(tokens);
  const t = useV2T();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

  // If the parent is driving the loader via SSE, use that stage index.
  // Otherwise, fall back to the internal timer-based animation.
  const externallyDriven = stageIdx !== undefined;
  const stepIdx = externallyDriven ? Math.min(Math.max(0, stageIdx), LOADING_STEPS.length - 1) : internalStepIdx;

  useEffect(() => {
    const tick = setInterval(() => setElapsed((e) => e + 0.1), 100);
    return () => clearInterval(tick);
  }, []);

  // Internal timer advance — disabled when the parent is driving via SSE.
  useEffect(() => {
    if (externallyDriven) return;
    if (internalStepIdx >= LOADING_STEPS.length - 1) return;
    const durations = [900, 1100, 1000, 1200, 1100, 1300];
    const timer = setTimeout(() => setInternalStepIdx((i) => i + 1), durations[internalStepIdx] ?? 1000);
    return () => clearTimeout(timer);
  }, [internalStepIdx, externallyDriven]);

  // Progress bar:
  //   - External mode: use the progressPct the server sent (clamped to 97%).
  //   - Internal mode: derive from the step index + an easing tail so the
  //     bar keeps moving while holding on the last step.
  const internalBasePct = (internalStepIdx / LOADING_STEPS.length) * 100;
  const internalOnLastStep = internalStepIdx >= LOADING_STEPS.length - 1;
  const internalTailPct = internalOnLastStep
    ? Math.min(18, (elapsed - (0.9 + 1.1 + 1.0 + 1.2 + 1.1)) * 1.5)
    : 0;
  const internalPct = Math.min(97, Math.max(0, internalBasePct + Math.max(0, internalTailPct)));
  const pct = externallyDriven
    ? Math.min(97, Math.max(0, progressPct ?? (stepIdx / LOADING_STEPS.length) * 100))
    : internalPct;

  const current = LOADING_STEPS[Math.min(stepIdx, LOADING_STEPS.length - 1)];
  // Pull translated label/detail by the step's key — fully type-safe, no cast needed
  const currentLabel  = t.loading.steps[current.key].label;
  const currentDetail = t.loading.steps[current.key].detail;

  // Responsive sizing. Inline styles can't use media queries, so every
  // dimension that needs to shrink at narrow widths is derived from `bp`.
  const statusFontSize = mobile ? 32 : bp === "tablet" ? 40 : 48;
  const outerPadding = mobile ? "24px 16px" : "48px 32px";
  const cardBigStatusPadding = mobile ? "36px 20px 24px" : "56px 40px 32px";
  const cardTimelinePadding = mobile ? "20px 20px 24px" : "24px 40px 32px";
  const slowBannerMargin = mobile ? "0 16px 16px" : "0 24px 24px";

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: outerPadding, position: "relative", overflow: "hidden",
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
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            fontFamily: tokens.monoFont, fontSize: 11, color: tokens.inkMute,
          }}>
            {/* ETA is conservative phrasing — "usually about a minute" — to
                set expectation without promising an exact time. Hidden on
                mobile to keep the strip from wrapping. */}
            {!mobile && (
              <span>{t.loading.header.eta}</span>
            )}
            {!mobile && <span>·</span>}
            <span>{t.loading.header.elapsed.replace('{seconds}', elapsed.toFixed(1))}</span>
          </div>
        </div>

        {/* big status */}
        <div style={{ padding: cardBigStatusPadding }}>
          <Eyebrow tokens={tokens}>
            {t.loading.stepCounter
              .replace('{current}', String(Math.min(stepIdx + 1, LOADING_STEPS.length)))
              .replace('{total}', String(LOADING_STEPS.length))}
          </Eyebrow>
          <div style={{
            fontFamily: tokens.displayFont, fontSize: statusFontSize, lineHeight: 1.08,
            fontWeight: tokens.displayWeight, letterSpacing: "-0.03em",
            color: tokens.ink, marginTop: 14,
            minHeight: mobile ? 44 : 64,
          }}>
            <TypingText tokens={tokens} text={currentLabel} />
            <span style={{ color: tokens.primaryColor }}>…</span>
          </div>
          <div style={{
            fontFamily: tokens.bodyFont, fontSize: mobile ? 15 : 17, color: tokens.inkSoft,
            marginTop: 12, maxWidth: 540,
          }}>
            {currentDetail}
          </div>
        </div>

        {/* step timeline */}
        <div style={{ padding: cardTimelinePadding }}>
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
          {/*
            On mobile we can't afford 6 columns of labels — each cell is ~45px
            wide at 320vw and the mono labels collide. Instead we show only the
            active step's dot + label, inheriting the same visual language.
          */}
          {mobile ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 16, height: 16, borderRadius: 999,
                background: tokens.bgRaised,
                border: `1.5px solid ${tokens.primaryColor}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: 999, background: tokens.primaryColor, animation: "va-pulse 1.2s ease infinite" }} />
              </div>
              <div style={{
                fontFamily: tokens.monoFont, fontSize: 11,
                color: tokens.inkSoft,
                letterSpacing: "0.08em",
                lineHeight: 1.3,
              }}>
                {t.loading.steps[current.key].label}
              </div>
            </div>
          ) : (
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
                      {t.loading.steps[s.key].label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 15s+ friendly banner */}
        {elapsed > 15 && (
          <div style={{
            margin: slowBannerMargin,
            padding: mobile ? "12px 14px" : "14px 18px",
            background: `color-mix(in oklch, ${tokens.warn} 14%, transparent)`,
            border: `1px solid color-mix(in oklch, ${tokens.warn} 40%, transparent)`,
            borderRadius: tokens.cardRadius,
            display: "flex",
            flexDirection: mobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: mobile ? "stretch" : "center",
            gap: mobile ? 12 : 16,
          }}>
            <div style={{
              fontFamily: tokens.bodyFont, fontSize: 14, color: tokens.ink, lineHeight: 1.4,
            }}>
              {t.loading.slowBanner.text}
            </div>
            <Button
              tokens={tokens}
              variant="ghost"
              onClick={onSkipToEmail}
              style={{
                padding: "8px 14px",
                fontSize: 13,
                flexShrink: 0,
                width: mobile ? "100%" : undefined,
              }}
            >
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
