"use client";

// analyzer-card.tsx — right-column Card with header, step explainer, textarea, footer.
// Includes AnalyzerBackdrop and FloatingReassurance inside.
// State (text, focus) is internal.
// Ported from landing.jsx (React-in-HTML prototype).

import { useState, useRef, useEffect } from "react";
import React from "react";
import type { Tokens } from "../theme";
import { Card, Button, Pill } from "../primitives";
import { useMotion, Magnetic } from "../motion";
import { AnalyzerBackdrop } from "./analyzer-backdrop";
import { FloatingReassurance } from "./floating-reassurance";
import { SAMPLE_VACANCY } from "./sample-vacancy";

interface AnalyzerCardProps {
  tokens: Tokens;
  onAnalyze: (text: string) => void;
}

export function AnalyzerCard({ tokens, onAnalyze }: AnalyzerCardProps) {
  const [text, setText] = useState("");
  const [focus, setFocus] = useState(false);
  const chars = text.length;
  const minChars = 400;
  const canAnalyze = chars >= 40; // forgiving for the mock

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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: tokens.cardRadius > 6 ? 8 : 2,
            background: tokens.primaryColor,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontFamily: tokens.displayFont, fontWeight: 600, fontSize: 14,
          }}>V</div>
          <div style={{ fontFamily: tokens.bodyFont, fontSize: 14, fontWeight: 600, color: tokens.ink }}>
            Vacancy input
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Pill tokens={tokens}>EN</Pill>
          <Pill tokens={tokens}>NL</Pill>
        </div>
      </div>

      {/* step explainer strip */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 20px 1fr 20px 1fr",
        alignItems: "center", gap: 0,
        padding: "18px 22px",
        borderBottom: `1px solid ${tokens.line}`,
      }}>
        {([
          ["Paste", "Your existing posting"],
          ["Analyze", "8-point diagnostic"],
          ["Receive", "Score + rewritten version"],
        ] as [string, string][]).map(([t, s], i) => (
          <React.Fragment key={t}>
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
                <div style={{ fontFamily: tokens.bodyFont, fontSize: 13, fontWeight: 600, color: tokens.ink }}>{t}</div>
                <div style={{ fontFamily: tokens.bodyFont, fontSize: 12, color: tokens.inkMute }}>{s}</div>
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
          placeholder="Paste your vacancy here — plain text is fine. We'll preserve the structure."
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
            onClick={() => setText(SAMPLE_VACANCY)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: tokens.monoFont, fontSize: 11,
              color: tokens.inkSoft, letterSpacing: "0.1em",
              textTransform: "uppercase", padding: 0,
              textDecoration: "underline", textUnderlineOffset: 3,
            }}
          >Try with a sample posting</button>
          <div style={{
            fontFamily: tokens.monoFont, fontSize: 11,
            color: chars >= minChars ? tokens.ok : tokens.inkMute,
            letterSpacing: "0.08em",
          }}>
            {chars} / {minChars} chars {chars >= minChars && "✓"}
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
            Analyze vacancy
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
