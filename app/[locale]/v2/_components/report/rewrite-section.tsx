"use client";

import { type Tokens } from "../theme";
import { Card, Button, Pill } from "../primitives";
import { REWRITTEN } from "./pillar-data";
import { useV2T } from "../i18n-context";

interface RewriteSectionProps {
  tokens: Tokens;
}

export function RewriteSection({ tokens }: RewriteSectionProps) {
  const t = useV2T();
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
              {t.report.rewrite.projected.prefix}<strong style={{ color: tokens.ink }}>{t.report.rewrite.projected.score}</strong>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button tokens={tokens} variant="ghost" style={{ padding: "8px 14px", fontSize: 13 }}>{t.report.rewrite.actions.copy}</Button>
            <Button tokens={tokens} variant="ghost" style={{ padding: "8px 14px", fontSize: 13 }}>{t.report.rewrite.actions.downloadDocx}</Button>
            <Button tokens={tokens} variant="primary" style={{ padding: "8px 14px", fontSize: 13 }}>{t.report.rewrite.actions.emailToMe}</Button>
          </div>
        </div>
        <div style={{
          padding: "32px 40px",
          fontFamily: tokens.bodyFont, fontSize: 15, lineHeight: 1.65,
          color: tokens.ink, whiteSpace: "pre-wrap",
          columnCount: 2, columnGap: 40,
        }}>
          {REWRITTEN}
        </div>
      </Card>
    </section>
  );
}
