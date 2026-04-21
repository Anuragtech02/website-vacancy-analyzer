"use client";

import { type Tokens } from "../theme";
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

  // Removed: the orange "V" avatar (the main navbar above already shows the
  // full Vacature Tovenaar wordmark, so a second brand mark was just noise)
  // and the "Generated just now" pill (static string pretending to be dynamic
  // — a shared report URL opened a week later would still say "just now").
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
        <div style={{
          fontFamily: tokens.bodyFont, fontSize: 14, fontWeight: 600, color: tokens.ink,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          minWidth: 0,
        }}>{displayTitle}</div>
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
