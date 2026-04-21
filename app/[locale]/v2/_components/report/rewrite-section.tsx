"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph } from "docx";
import { type Tokens } from "../theme";
import { Card, Button, Pill } from "../primitives";
import { useV2T } from "../i18n-context";
import { useBanner } from "../banner-context";
import { useBreakpoint, isMobile, isNarrow } from "../use-breakpoint";

interface RewriteSectionProps {
  tokens: Tokens;
  rewrittenText?: string;
  projectedScore?: number;
  currentScore?: number;
}

function stripBasicMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** → bold
    .replace(/__([^_]+)__/g, '$1')       // __bold__ → bold
    .replace(/\*([^*]+)\*/g, '$1')       // *italic* → italic
    .replace(/^#{1,6}\s+/gm, '')         // # heading → heading
    .replace(/^\s*[-*]\s+/gm, '• ');     // - bullet / * bullet → • bullet
}

export function RewriteSection({ tokens, rewrittenText, projectedScore, currentScore }: RewriteSectionProps) {
  const t = useV2T();
  const locale = useLocale();
  const setBanner = useBanner();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  const narrow = isNarrow(bp);

  const [copied, setCopied] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  // If we somehow render without real rewritten text, render nothing — better
  // than showing the hardcoded sample.
  if (!rewrittenText || rewrittenText.trim().length === 0) return null;

  const bodyText = stripBasicMarkdown(rewrittenText);
  const scoreDisplay = projectedScore != null ? `${projectedScore.toFixed(1)} / 10` : t.report.rewrite.projected.score;

  // Real delta instead of the i18n's hardcoded "+2.4 pts" — compute from the
  // actual current + projected scores. Locale-aware decimal separator so NL
  // renders "+4,7 pt" and EN renders "+4.7 pts". Badge falls back to just
  // "Rewritten" when we can't compute a positive delta.
  const badgeLabel = (projectedScore != null && currentScore != null && projectedScore > currentScore)
    ? `${t.report.rewrite.badgePrefix} · +${(projectedScore - currentScore).toLocaleString(locale, { maximumFractionDigits: 1, minimumFractionDigits: 1 })} ${t.report.rewrite.badgeUnit}`
    : t.report.rewrite.badgePrefix;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(bodyText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setBanner({ message: t.report.rewrite.actions.copy + " failed.", variant: "error" });
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      const paragraphs = bodyText.split(/\n{2,}/).map(
        (p) => new Paragraph({ text: p, spacing: { after: 200 } })
      );
      const doc = new Document({ sections: [{ children: paragraphs }] });
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "vacancy-rewrite.docx");
    } catch {
      setBanner({ message: "Could not generate .docx. Please try again.", variant: "error" });
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleEmailToMe = () => {
    setBanner({ message: t.report.rewrite.alreadySent, variant: "info" });
  };

  const sectionPadding = mobile ? "20px 16px" : "32px 48px";
  const headerRowPadding = mobile ? "16px 18px" : "22px 28px";
  const bodyPadding = mobile ? "20px 16px" : "32px 40px";
  const columnCount = narrow ? 1 : 2;

  const buttonBaseStyle: React.CSSProperties = mobile
    ? { padding: "10px 14px", fontSize: 13, width: "100%" }
    : { padding: "8px 14px", fontSize: 13 };

  return (
    <section style={{ padding: sectionPadding, maxWidth: 1360, margin: "0 auto" }}>
      <Card tokens={tokens} pad={0} style={{ overflow: "hidden" }}>
        <div style={{
          padding: headerRowPadding, borderBottom: `1px solid ${tokens.line}`,
          display: "flex", justifyContent: "space-between",
          alignItems: mobile ? "stretch" : "center",
          flexDirection: mobile ? "column" : "row",
          gap: mobile ? 14 : 0,
          background: tokens.bgMuted,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <Pill tokens={tokens} tone="ok">{badgeLabel}</Pill>
            <div style={{ fontFamily: tokens.bodyFont, fontSize: 14, color: tokens.inkSoft }}>
              {t.report.rewrite.projected.prefix}<strong style={{ color: tokens.ink }}>{scoreDisplay}</strong>
            </div>
          </div>
          <div style={{
            display: "flex", gap: 8,
            flexWrap: "wrap",
            flexDirection: mobile ? "column" : "row",
            width: mobile ? "100%" : "auto",
          }}>
            <Button
              tokens={tokens}
              variant="ghost"
              onClick={handleCopy}
              style={buttonBaseStyle}
            >
              {copied ? t.report.rewrite.actions.copied : t.report.rewrite.actions.copy}
            </Button>
            <Button
              tokens={tokens}
              variant="ghost"
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              style={{
                ...buttonBaseStyle,
                opacity: downloadingDocx ? 0.55 : 1,
                cursor: downloadingDocx ? "not-allowed" : "pointer",
              }}
            >
              {t.report.rewrite.actions.downloadDocx}
            </Button>
            <Button
              tokens={tokens}
              variant="primary"
              onClick={handleEmailToMe}
              style={buttonBaseStyle}
            >
              {t.report.rewrite.actions.emailToMe}
            </Button>
          </div>
        </div>
        <div style={{
          padding: bodyPadding,
          fontFamily: tokens.bodyFont, fontSize: 15, lineHeight: 1.65,
          color: tokens.ink, whiteSpace: "pre-wrap",
          columnCount, columnGap: 40,
        }}>
          {bodyText}
        </div>
      </Card>
    </section>
  );
}
