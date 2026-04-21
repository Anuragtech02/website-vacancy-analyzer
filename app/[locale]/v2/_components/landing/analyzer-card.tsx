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

interface AnalyzerCardProps {
  tokens: Tokens;
  onAnalyze: (text: string) => void;
}

// Hard upper bound: typed/pasted vacancies beyond this length are rejected
// client-side to keep LLM latency predictable and token cost bounded.
const MAX_CHARS = 2000;

export function AnalyzerCard({ tokens, onAnalyze }: AnalyzerCardProps) {
  const t = useV2T();
  const locale = useLocale();
  const [text, setText] = useState("");
  const [focus, setFocus] = useState(false);
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
        padding: "16px 22px",
        borderBottom: `1px solid ${tokens.line}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: tokens.bgMuted,
      }}>
        <div style={{ fontFamily: tokens.bodyFont, fontSize: 14, fontWeight: 600, color: tokens.ink }}>
          {t.analyzerCard.header.title}
        </div>
      </div>

      {/* step explainer strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 20px 1fr 20px 1fr",
        alignItems: "center", gap: 0,
        padding: "18px 22px",
        borderBottom: `1px solid ${tokens.line}`,
      }}>
        {t.analyzerCard.steps.map((step, i) => (
          <React.Fragment key={i}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                width: 22, height: 22, borderRadius: 999,
                background: i === 0 ? tokens.primaryColor : tokens.bgMuted,
                color: i === 0 ? "#fff" : tokens.inkSoft,
                border: `1px solid ${i === 0 ? tokens.primaryColor : tokens.line}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: tokens.monoFont, fontSize: 11, fontWeight: 600,
              }}>{i + 1}</span>
              <div>
                <div style={{ fontFamily: tokens.bodyFont, fontSize: 13, fontWeight: 600, color: tokens.ink }}>{step.title}</div>
                <div style={{ fontFamily: tokens.bodyFont, fontSize: 12, color: tokens.inkMute }}>{step.desc}</div>
              </div>
            </div>
            {i < 2 && (
              <svg width="20" height="10" viewBox="0 0 20 10" style={{ color: tokens.lineStrong }}>
                <path d="M0 5 L18 5 M14 1 L18 5 L14 9" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* textarea */}
      <div style={{ position: "relative", padding: 22 }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          placeholder={t.analyzerCard.placeholder}
          style={{
            width: "100%", height: 280, resize: "vertical",
            background: "transparent", border: "none", outline: "none",
            fontFamily: tokens.bodyFont, fontSize: 15, lineHeight: 1.55,
            color: tokens.ink,
            padding: 0,
          }}
        />
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
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
        <Magnetic tokens={tokens} strength={6}>
          <Button
            tokens={tokens}
            variant="primary"
            onClick={() => canAnalyze && onAnalyze(text)}
            style={{
              width: "100%", marginTop: 18, padding: "18px 22px", fontSize: 16,
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

      {/* floating reassurance — fades out when text has content */}
      <FloatingReassurance tokens={tokens} visible={!text && !focus} />
    </Card>
    </div>
  );
}
