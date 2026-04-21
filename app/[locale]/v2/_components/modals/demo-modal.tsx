"use client";

import { type Tokens } from "../theme";
import { Button, Eyebrow } from "../primitives";
import { ModalShell } from "./modal-shell";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile } from "../use-breakpoint";
import { openDemoCalendar } from "../demo-link";

interface DemoModalProps {
  tokens: Tokens;
  onClose: () => void;
}

export function DemoModal({ tokens, onClose }: DemoModalProps) {
  const t = useV2T();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

  return (
    <ModalShell tokens={tokens} onClose={onClose} maxWidth={720}>
      <div style={{ padding: mobile ? "28px 20px 24px" : "36px 36px 30px" }}>
        <Eyebrow tokens={tokens}>{t.modals.demo.eyebrow}</Eyebrow>
        <h3 style={{
          fontFamily: tokens.displayFont, fontSize: mobile ? 24 : 32, lineHeight: 1.08,
          fontWeight: tokens.displayWeight, letterSpacing: "-0.025em",
          color: tokens.ink, marginTop: 12,
        }}>
          {t.modals.demo.title}
        </h3>
        <p style={{
          fontFamily: tokens.bodyFont, fontSize: 15, lineHeight: 1.55,
          color: tokens.inkSoft, marginTop: 10, maxWidth: 520,
        }}>
          {t.modals.demo.body}
        </p>
        <div style={{
          display: "grid",
          gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
          gap: 14,
          marginTop: 22,
        }}>
          {t.modals.demo.features.map((f, i) => (
            <div key={i} style={{
              padding: mobile ? 14 : 18,
              background: tokens.bgMuted,
              border: `1px solid ${tokens.line}`,
              borderRadius: tokens.cardRadius,
            }}>
              <div style={{ fontFamily: tokens.bodyFont, fontSize: 15, fontWeight: 600, color: tokens.ink }}>{f.title}</div>
              <div style={{ fontFamily: tokens.bodyFont, fontSize: 13, color: tokens.inkSoft, marginTop: 6, lineHeight: 1.45 }}>{f.desc}</div>
            </div>
          ))}
        </div>
        <div style={{
          display: "flex",
          flexDirection: mobile ? "column" : "row",
          gap: 10,
          marginTop: 22,
          alignItems: mobile ? "stretch" : "center",
        }}>
          <Button
            tokens={tokens}
            variant="primary"
            style={{ padding: "14px 22px", width: mobile ? "100%" : undefined }}
            onClick={() => {
              openDemoCalendar();
              onClose();
            }}
          >
            {t.modals.demo.cta}
          </Button>
          <div style={{
            fontFamily: tokens.bodyFont,
            fontSize: 13,
            color: tokens.inkMute,
            textAlign: mobile ? "center" : "left",
          }}>
            {t.modals.demo.note}
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
