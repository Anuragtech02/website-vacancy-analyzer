"use client";

import { useState } from "react";
import { type Tokens } from "../theme";
import { Card } from "../primitives";
import { useV2T } from "../i18n-context";

interface OriginalTextAccordionProps {
  tokens: Tokens;
}

export function OriginalTextAccordion({ tokens }: OriginalTextAccordionProps) {
  const [textOpen, setTextOpen] = useState(false);
  const t = useV2T();

  return (
    <section style={{ padding: "16px 48px 32px", maxWidth: 1360, margin: "0 auto" }}>
      <Card tokens={tokens} pad={0}>
        <button
          onClick={() => setTextOpen(!textOpen)}
          style={{
            width: "100%", background: "none", border: "none",
            padding: "18px 22px", cursor: "pointer", textAlign: "left",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontFamily: tokens.bodyFont, fontSize: 15, color: tokens.ink, fontWeight: 500,
          }}
        >
          <span>{t.report.accordion.show}</span>
          <span style={{
            fontFamily: tokens.monoFont, fontSize: 11, color: tokens.inkMute, letterSpacing: "0.12em",
          }}>{textOpen ? t.report.accordion.toggle.hide : t.report.accordion.toggle.show}</span>
        </button>
        {textOpen && (
          <div style={{
            padding: "0 22px 22px",
            fontFamily: tokens.monoFont, fontSize: 13, lineHeight: 1.6,
            color: tokens.inkSoft, whiteSpace: "pre-wrap",
            borderTop: `1px dashed ${tokens.line}`, paddingTop: 18,
          }}>
            {`Senior Full-Stack Engineer (m/f/d)\n\nWe are a fast-growing SaaS company looking for a rockstar developer to join our dynamic team…`}
          </div>
        )}
      </Card>
    </section>
  );
}
