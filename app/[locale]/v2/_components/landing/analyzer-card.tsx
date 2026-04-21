"use client";

// analyzer-card.tsx — right-column Card with header, step explainer, textarea, footer.
// Includes AnalyzerBackdrop and FloatingReassurance inside.
// State (text, focus) is internal.
// Ported from landing.jsx (React-in-HTML prototype).

import { useState, useRef, useEffect } from "react";
import React from "react";
import { useLocale } from "next-intl";
import type { Tokens } from "../theme";
import { Card, Button } from "../primitives";
import { Magnetic } from "../motion";
import { AnalyzerBackdrop } from "./analyzer-backdrop";
import { FloatingReassurance } from "./floating-reassurance";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile, isNarrow } from "../use-breakpoint";

interface AnalyzerCardProps {
  tokens: Tokens;
  onAnalyze: (text: string, category: string) => void;
}

// Hard upper bound: typed/pasted vacancies beyond this length are rejected
// client-side to keep LLM latency predictable and token cost bounded.
// Must stay in sync with MAX_VACANCY_CHARS in app/api/analyze/route.ts.
const MAX_CHARS = 4000;

// Matches the option values v1 uses (app/[locale]/page.tsx) and what
// lib/prompts.ts' getAnalyzerPrompt(category, ...) expects — changing a value
// here without mirroring to the prompt would silently fall back to General.
type CategoryKey =
  | "general"
  | "government"
  | "tech"
  | "healthcareEducation"
  | "legalCorporate"
  | "blueCollar";

const CATEGORY_VALUES: Record<CategoryKey, string> = {
  general:             "General",
  government:          "Government / Public Sector",
  tech:                "Technology / Startups",
  healthcareEducation: "Healthcare / Education",
  legalCorporate:      "Legal / Corporate",
  blueCollar:          "Blue Collar / Manual",
};

const CATEGORY_KEYS: CategoryKey[] = [
  "general", "government", "tech", "healthcareEducation", "legalCorporate", "blueCollar",
];

export function AnalyzerCard({ tokens, onAnalyze }: AnalyzerCardProps) {
  const t = useV2T();
  const locale = useLocale();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const narrow = isNarrow(bp);
  const [text, setText] = useState("");
  const [focus, setFocus] = useState(false);
  const [categoryKey, setCategoryKey] = useState<CategoryKey>("general");
  const chars = text.length;
  const overLimit = chars > MAX_CHARS;
  const canAnalyze = chars > 0 && !overLimit;

  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = () => {
      cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    window.addEventListener("va2:scroll-to-analyzer", handler);
    return () => window.removeEventListener("va2:scroll-to-analyzer", handler);
  }, []);

  return (
    <div ref={cardRef}>
    <Card tokens={tokens} pad={0} style={{ overflow: "hidden", position: "relative" }}>
      <AnalyzerBackdrop tokens={tokens} />
      <div style={{
        padding: mobile ? "14px 16px" : "16px 22px",
        borderBottom: `1px solid ${tokens.line}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: tokens.bgMuted,
      }}>
        <div style={{ fontFamily: tokens.bodyFont, fontSize: 14, fontWeight: 600, color: tokens.ink }}>
          {t.analyzerCard.header.title}
        </div>
      </div>

      {/* step explainer strip — hidden on mobile (ornamental) */}
      {!mobile && (
        <div style={{
          display: "grid",
          gridTemplateColumns: narrow
            ? "1fr 16px 1fr 16px 1fr"
            : "1fr 20px 1fr 20px 1fr",
          // Top-align cells so every step's icon sits at the same y. Each
          // icon + arrow gets an explicit marginTop so its geometric centre
          // lands on the top line of text (the step title), regardless of
          // whether the desc wraps to one or two lines. Previous approach
          // used alignItems: center which anchored the arrow to the middle
          // of the tallest cell — visually drifted off the icon.
          alignItems: "start", gap: 0,
          padding: narrow ? "14px 16px" : "18px 22px",
          borderBottom: `1px solid ${tokens.line}`,
        }}>
          {t.analyzerCard.steps.map((step, i) => (
            <React.Fragment key={i}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 999,
                  background: i === 0 ? tokens.primaryColor : tokens.bgMuted,
                  color: i === 0 ? "#fff" : tokens.inkSoft,
                  border: `1px solid ${i === 0 ? tokens.primaryColor : tokens.line}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: tokens.monoFont, fontSize: 11, fontWeight: 600,
                  flexShrink: 0,
                  // Nudge the icon down ~2px so its geometric centre lands on
                  // the step title's cap-height, not its line-box top edge.
                  marginTop: 2,
                }}>{i + 1}</span>
                <div>
                  <div style={{ fontFamily: tokens.bodyFont, fontSize: 13, fontWeight: 600, color: tokens.ink, lineHeight: 1.3 }}>{step.title}</div>
                  <div style={{ fontFamily: tokens.bodyFont, fontSize: 12, color: tokens.inkMute, lineHeight: 1.3 }}>{step.desc}</div>
                </div>
              </div>
              {i < 2 && (
                <svg
                  width="20" height="10" viewBox="0 0 20 10"
                  style={{
                    color: tokens.lineStrong,
                    display: "block",
                    // Icon centre sits at y ≈ 2 (marginTop) + 11 (icon radius)
                    // = 13 from the top of the cell. Arrow midline is at arrow
                    // top + 5, so marginTop 8 puts its midline at y=13 too.
                    marginTop: 8,
                  }}
                >
                  <path d="M0 5 L18 5 M14 1 L18 5 L14 9" stroke="currentColor" strokeWidth="1" fill="none" />
                </svg>
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* textarea */}
      <div style={{ position: "relative", padding: mobile ? 16 : 22 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={t.analyzerCard.placeholder}
          style={{
            width: "100%",
            height: mobile ? 200 : 280,
            resize: "vertical",
            background: "transparent", border: "none", outline: "none",
            fontFamily: tokens.bodyFont, fontSize: 15, lineHeight: 1.55,
            color: tokens.ink,
            padding: 0,
          }}
        />
        <div style={{
          display: "flex",
          flexDirection: mobile ? "column-reverse" : "row",
          justifyContent: "space-between",
          alignItems: mobile ? "flex-start" : "center",
          gap: mobile ? 8 : 0,
          marginTop: 10, paddingTop: 14,
          borderTop: `1px dashed ${tokens.line}`,
        }}>
          <button
            onClick={() => setText(t.analyzerCard.sampleVacancy)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: tokens.monoFont, fontSize: 11,
              color: tokens.inkSoft, letterSpacing: "0.1em",
              textTransform: "uppercase", padding: 0,
              textDecoration: "underline", textUnderlineOffset: 3,
            }}
          >{t.analyzerCard.trySample}</button>
          <div style={{
            fontFamily: tokens.monoFont, fontSize: 11,
            color: overLimit ? tokens.bad : canAnalyze ? tokens.ok : tokens.inkMute,
            letterSpacing: "0.08em",
          }}>
            {t.analyzerCard.charsCount
              .replace('{count}', chars.toLocaleString(locale))
              .replace('{max}', MAX_CHARS.toLocaleString(locale))}
            {canAnalyze && " ✓"}
            {overLimit && ` — ${t.analyzerCard.overLimit}`}
          </div>
        </div>
        {/* Category selector + Analyze button share one row on >= tablet.
            The select value is self-describing ("General (Default)", "Tech /
            Startups", etc.) so a separate "JOB CATEGORY" label isn't pulling
            its weight — aria-label on the <select> covers a11y. */}
        <div style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          alignItems: "stretch",
          gap: mobile ? 10 : 12,
          marginTop: 16,
        }}>
          <div style={{ position: "relative", flex: mobile ? undefined : "0 1 260px" }}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none"
              aria-hidden
              style={{
                position: "absolute", left: 12, top: "50%",
                transform: "translateY(-50%)",
                color: tokens.inkMute, pointerEvents: "none",
              }}
            >
              <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h.01M9 12h.01M9 15h.01M9 18h.01M15 9h.01M15 12h.01M15 15h.01M15 18h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <select
              id="va2-category"
              aria-label={t.analyzerCard.category.label}
              value={categoryKey}
              onChange={(e) => setCategoryKey(e.target.value as CategoryKey)}
              style={{
                width: "100%",
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                background: tokens.bgRaised,
                border: `1px solid ${tokens.line}`,
                borderRadius: tokens.cardRadius,
                padding: mobile ? "14px 36px 14px 38px" : "16px 36px 16px 38px",
                fontFamily: tokens.bodyFont,
                fontSize: 14,
                fontWeight: 600,
                color: tokens.ink,
                cursor: "pointer",
                outline: "none",
              }}
            >
              {CATEGORY_KEYS.map((k) => (
                <option key={k} value={k}>{t.analyzerCard.category[k]}</option>
              ))}
            </select>
            <svg
              width="12" height="12" viewBox="0 0 20 20"
              aria-hidden
              style={{
                position: "absolute", right: 14, top: "50%",
                transform: "translateY(-50%)",
                color: tokens.inkMute, pointerEvents: "none",
              }}
            >
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" fill="currentColor"/>
            </svg>
          </div>

          <Magnetic
            tokens={tokens}
            strength={6}
            style={{ flex: mobile ? undefined : 1, display: mobile ? "block" : "inline-block" }}
          >
            <Button
              tokens={tokens}
              variant="primary"
              onClick={() => canAnalyze && onAnalyze(text, CATEGORY_VALUES[categoryKey])}
              style={{
                width: "100%",
                padding: mobile ? "16px 18px" : "16px 22px",
                fontSize: 16,
                opacity: canAnalyze ? 1 : 0.5,
                cursor: canAnalyze ? "pointer" : "not-allowed",
              }}
            >
              {t.analyzerCard.submit}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          </Magnetic>
        </div>
      </div>

      {/* floating reassurance — fades out when text has content */}
      <FloatingReassurance tokens={tokens} visible={!text && !focus} />
    </Card>
    </div>
  );
}
