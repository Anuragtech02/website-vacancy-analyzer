"use client";

import { type Tokens } from "../theme";
import { Pill } from "../primitives";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile } from "../use-breakpoint";

interface ReportHeaderProps {
  tokens: Tokens;
  usesLeft: number;
  unlocked: boolean;
  jobTitle?: string | null;
}

export function ReportHeader({ tokens, usesLeft, unlocked: _unlocked, jobTitle }: ReportHeaderProps) {
  const t = useV2T();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

  // "Rapport · {job_title}" when we have one, otherwise fall back to the generic i18n title.
  const displayTitle = jobTitle && jobTitle.trim().length > 0
    ? `${t.report.header.titlePrefix} · ${jobTitle.trim()}`
    : t.report.header.title;

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 5,
      background: `color-mix(in oklch, ${tokens.bgBase} 88%, transparent)`,
      backdropFilter: "blur(8px)",
      borderBottom: `1px solid ${tokens.line}`,
    }}>
      <div style={{
        maxWidth: 1360, margin: "0 auto",
        padding: mobile ? "10px 16px" : "14px 48px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: mobile ? 8 : 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <div style={{
            width: 24, height: 24, borderRadius: tokens.cardRadius > 6 ? 6 : 2,
            background: tokens.primaryColor, color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: tokens.displayFont, fontWeight: 600, fontSize: 12,
            flexShrink: 0,
          }}>V</div>
          <div style={{
            fontFamily: tokens.bodyFont, fontSize: 14, fontWeight: 600, color: tokens.ink,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{displayTitle}</div>
          <Pill tokens={tokens}>{t.report.header.generatedNow}</Pill>
        </div>
        {/* "Rewrites left" count on the right — on mobile it's already in the
            navbar so we omit it here. Previous "Download PDF" button removed:
            the PDF is emailed on unlock and the button only opened an info
            toast reminding the user of that, so it wasn't doing anything. */}
        {!mobile && (
          <div style={{
            fontFamily: tokens.monoFont, fontSize: 11, letterSpacing: "0.12em",
            color: tokens.inkMute, textTransform: "uppercase",
          }}>
            {t.report.header.rewritesLeft.replace('{count}', String(usesLeft))}
          </div>
        )}
      </div>
    </div>
  );
}
