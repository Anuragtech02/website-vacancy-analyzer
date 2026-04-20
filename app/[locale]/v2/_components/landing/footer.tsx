"use client";

// footer.tsx — dark footer with wordmark, tagline, and links.
// Ported from landing.jsx (React-in-HTML prototype).

import type { Tokens } from "../theme";
import { useV2T } from "../i18n-context";

interface FooterProps {
  tokens: Tokens;
}

export function Footer({ tokens }: FooterProps) {
  const t = useV2T();
  return (
    <footer style={{
      marginTop: 40,
      background: tokens.ink, color: tokens.bgRaised,
      padding: "48px 64px 36px",
    }}>
      <div style={{
        maxWidth: 1360, margin: "0 auto",
        display: "flex", justifyContent: "space-between", alignItems: "end",
        flexWrap: "wrap", gap: 32,
      }}>
        <div>
          <div style={{
            fontFamily: tokens.displayFont, fontSize: 34, fontWeight: tokens.displayWeight,
            letterSpacing: "-0.02em",
          }}>
            {t.footer.brand}
          </div>
          <div style={{
            fontFamily: tokens.bodyFont, fontSize: 14, color: "rgba(255,255,255,0.55)",
            marginTop: 8, maxWidth: 380,
          }}>
            {t.footer.tagline}
          </div>
        </div>
        <div style={{
          display: "flex", gap: 36,
          fontFamily: tokens.monoFont, fontSize: 11, letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(255,255,255,0.55)",
        }}>
          <span>{t.footer.privacy}</span>
          <span>{t.footer.terms}</span>
          <span>{t.footer.contact}</span>
          <span style={{ color: tokens.primaryColor }}>{t.footer.bookDemo}</span>
        </div>
      </div>
    </footer>
  );
}
