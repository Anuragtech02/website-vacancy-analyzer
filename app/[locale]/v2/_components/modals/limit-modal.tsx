"use client";

import { type Tokens } from "../theme";
import { Button, Eyebrow, Highlight } from "../primitives";
import { ModalShell } from "./modal-shell";
import { useV2T } from "../i18n-context";

interface LimitModalProps {
  tokens: Tokens;
  onClose: () => void;
  onSeeDemo: () => void;
}

export function LimitModal({ tokens, onClose, onSeeDemo }: LimitModalProps) {
  const t = useV2T();
  return (
    <ModalShell tokens={tokens} onClose={onClose} maxWidth={560}>
      <div style={{ padding: "36px 36px 30px" }}>
        <Eyebrow tokens={tokens}>{t.modals.limit.eyebrow}</Eyebrow>
        <h3 style={{
          fontFamily: tokens.displayFont, fontSize: 34, lineHeight: 1.08,
          fontWeight: tokens.displayWeight, letterSpacing: "-0.025em",
          color: tokens.ink, marginTop: 12,
        }}>
          {t.modals.limit.title.part1}<Highlight tokens={tokens}>{t.modals.limit.title.highlight}</Highlight>{t.modals.limit.title.part2}
        </h3>
        <p style={{
          fontFamily: tokens.bodyFont, fontSize: 16, lineHeight: 1.55,
          color: tokens.inkSoft, marginTop: 12, maxWidth: 440,
        }}>
          {t.modals.limit.body}
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <Button tokens={tokens} variant="primary" onClick={onSeeDemo} style={{ flex: 1, padding: "14px" }}>
            {t.modals.limit.seeDemo}
          </Button>
          <Button tokens={tokens} variant="ghost" onClick={onClose} style={{ padding: "14px 18px" }}>
            {t.modals.limit.later}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
