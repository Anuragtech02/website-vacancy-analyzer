"use client";

import { useState } from "react";
import { type Tokens } from "../theme";
import { Card } from "../primitives";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile } from "../use-breakpoint";

interface OriginalTextAccordionProps {
  tokens: Tokens;
  text: string;
}

export function OriginalTextAccordion({ tokens, text }: OriginalTextAccordionProps) {
  const [textOpen, setTextOpen] = useState(false);
  const t = useV2T();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

  const sectionPadding = mobile ? "16px" : "16px 48px 32px";
  const buttonPadding = mobile ? "16px" : "18px 22px";
  const bodyPaddingHorizontal = mobile ? 16 : 22;
  const buttonFontSize = mobile ? 14 : 15;
  const bodyFontSize = mobile ? 12 : 13;

  return (
    <section style={{ padding: sectionPadding, maxWidth: 1360, margin: "0 auto" }}>
      <Card tokens={tokens} pad={0}>
        <button
          onClick={() => setTextOpen(!textOpen)}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = tokens.bgMuted;
            const chevron = el.querySelector('[data-accordion-chevron]') as HTMLElement | null;
            if (chevron) chevron.style.color = tokens.ink;
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.background = "transparent";
            const chevron = el.querySelector('[data-accordion-chevron]') as HTMLElement | null;
            if (chevron) chevron.style.color = tokens.inkMute;
          }}
          style={{
            width: "100%", background: "transparent", border: "none",
            padding: buttonPadding, cursor: "pointer", textAlign: "left",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontFamily: tokens.bodyFont, fontSize: buttonFontSize, color: tokens.ink, fontWeight: 500,
            gap: 12,
            transition: "background .15s ease",
            borderRadius: "inherit",
          }}
        >
          <span>{t.report.accordion.show}</span>
          <span
            data-accordion-chevron
            style={{
              fontFamily: tokens.monoFont, fontSize: 11, color: tokens.inkMute, letterSpacing: "0.12em",
              transition: "color .15s ease",
            }}
          >
            {textOpen ? t.report.accordion.toggle.hide : t.report.accordion.toggle.show}
          </span>
        </button>
        {textOpen && (
          <div style={{
            padding: `0 ${bodyPaddingHorizontal}px ${bodyPaddingHorizontal}px`,
            fontFamily: tokens.monoFont, fontSize: bodyFontSize, lineHeight: 1.6,
            color: tokens.inkSoft, whiteSpace: "pre-wrap",
            borderTop: `1px dashed ${tokens.line}`, paddingTop: 18,
          }}>
            {text || "(no text submitted)"}
          </div>
        )}
      </Card>
    </section>
  );
}
