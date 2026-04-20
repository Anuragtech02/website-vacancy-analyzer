"use client";

import { type Tokens } from "../theme";
import { Button, Eyebrow, Highlight } from "../primitives";
import { ModalShell } from "./modal-shell";

interface LimitModalProps {
  tokens: Tokens;
  onClose: () => void;
  onSeeDemo: () => void;
}

export function LimitModal({ tokens, onClose, onSeeDemo }: LimitModalProps) {
  return (
    <ModalShell tokens={tokens} onClose={onClose} maxWidth={560}>
      <div style={{ padding: "36px 36px 30px" }}>
        <Eyebrow tokens={tokens}>Free tier limit</Eyebrow>
        <h3 style={{
          fontFamily: tokens.displayFont, fontSize: 34, lineHeight: 1.08,
          fontWeight: tokens.displayWeight, letterSpacing: "-0.025em",
          color: tokens.ink, marginTop: 12,
        }}>
          Got a <Highlight tokens={tokens}>taste</Highlight> for it?
        </h3>
        <p style={{
          fontFamily: tokens.bodyFont, fontSize: 16, lineHeight: 1.55,
          color: tokens.inkSoft, marginTop: 12, maxWidth: 440,
        }}>
          You&apos;ve used both free rewrites. Teams that like the tool usually want unlimited
          rewrites, saved postings, and the ATS sync — that&apos;s what the paid plan is.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <Button tokens={tokens} variant="primary" onClick={onSeeDemo} style={{ flex: 1, padding: "14px" }}>
            See what you&apos;d get
          </Button>
          <Button tokens={tokens} variant="ghost" onClick={onClose} style={{ padding: "14px 18px" }}>
            Maybe later
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}
