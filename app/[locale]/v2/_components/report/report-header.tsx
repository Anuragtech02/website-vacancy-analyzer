"use client";

import { type Tokens } from "../theme";
import { Button, Pill } from "../primitives";
import { useV2T } from "../i18n-context";

interface ReportHeaderProps {
  tokens: Tokens;
  usesLeft: number;
}

export function ReportHeader({ tokens, usesLeft }: ReportHeaderProps) {
  const t = useV2T();
  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 5,
      background: `color-mix(in oklch, ${tokens.bgBase} 88%, transparent)`,
      backdropFilter: "blur(8px)",
      borderBottom: `1px solid ${tokens.line}`,
      padding: "14px 48px",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 24, height: 24, borderRadius: tokens.cardRadius > 6 ? 6 : 2,
          background: tokens.primaryColor, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: tokens.displayFont, fontWeight: 600, fontSize: 12,
        }}>V</div>
        <div style={{
          fontFamily: tokens.bodyFont, fontSize: 14, fontWeight: 600, color: tokens.ink,
        }}>{t.report.header.title}</div>
        <Pill tokens={tokens}>{t.report.header.generatedNow}</Pill>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          fontFamily: tokens.monoFont, fontSize: 11, letterSpacing: "0.12em",
          color: tokens.inkMute, textTransform: "uppercase",
        }}>
          {t.report.header.rewritesLeft.replace('{count}', String(usesLeft))}
        </div>
        <Button tokens={tokens} variant="ghost" style={{ padding: "8px 14px", fontSize: 13 }}>
          {t.report.header.downloadPdf}
        </Button>
      </div>
    </div>
  );
}
