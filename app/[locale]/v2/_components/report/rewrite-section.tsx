"use client";

import { useState } from "react";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph } from "docx";
import { type Tokens } from "../theme";
import { Card, Button, Pill } from "../primitives";
import { useV2T } from "../i18n-context";
import { useBanner } from "../banner-context";

interface RewriteSectionProps {
  tokens: Tokens;
  rewrittenText?: string;
  projectedScore?: number;
}

function stripBasicMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // **bold** → bold
    .replace(/__([^_]+)__/g, '$1')       // __bold__ → bold
    .replace(/\*([^*]+)\*/g, '$1')       // *italic* → italic
    .replace(/^#{1,6}\s+/gm, '')         // # heading → heading
    .replace(/^\s*[-*]\s+/gm, '• ');     // - bullet / * bullet → • bullet
}

export function RewriteSection({ tokens, rewrittenText, projectedScore }: RewriteSectionProps) {
  const t = useV2T();
  const setBanner = useBanner();

  const [copied, setCopied] = useState(false);
  const [downloadingDocx, setDownloadingDocx] = useState(false);

  // If we somehow render without real rewritten text, render nothing — better
  // than showing the hardcoded sample.
  if (!rewrittenText || rewrittenText.trim().length === 0) return null;

  const bodyText = stripBasicMarkdown(rewrittenText);
  const scoreDisplay = projectedScore != null ? `${projectedScore.toFixed(1)} / 10` : t.report.rewrite.projected.score;

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

  return (
    <section style={{ padding: "32px 48px", maxWidth: 1360, margin: "0 auto" }}>
      <Card tokens={tokens} pad={0} style={{ overflow: "hidden" }}>
        <div style={{
          padding: "22px 28px", borderBottom: `1px solid ${tokens.line}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: tokens.bgMuted,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Pill tokens={tokens} tone="ok">{t.report.rewrite.badge}</Pill>
            <div style={{ fontFamily: tokens.bodyFont, fontSize: 14, color: tokens.inkSoft }}>
              {t.report.rewrite.projected.prefix}<strong style={{ color: tokens.ink }}>{scoreDisplay}</strong>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              tokens={tokens}
              variant="ghost"
              onClick={handleCopy}
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              {copied ? t.report.rewrite.actions.copied : t.report.rewrite.actions.copy}
            </Button>
            <Button
              tokens={tokens}
              variant="ghost"
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              style={{
                padding: "8px 14px",
                fontSize: 13,
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
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              {t.report.rewrite.actions.emailToMe}
            </Button>
          </div>
        </div>
        <div style={{
          padding: "32px 40px",
          fontFamily: tokens.bodyFont, fontSize: 15, lineHeight: 1.65,
          color: tokens.ink, whiteSpace: "pre-wrap",
          columnCount: 2, columnGap: 40,
        }}>
          {bodyText}
        </div>
      </Card>
    </section>
  );
}
