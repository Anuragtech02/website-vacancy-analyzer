"use client";

import { useState, useEffect } from "react";
import { type Tokens } from "../theme";
import { Button, Eyebrow, Highlight } from "../primitives";
import { ModalShell } from "./modal-shell";

interface EmailModalProps {
  tokens: Tokens;
  onClose: () => void;
  onUnlock: () => void;
}

const MESSAGES = [
  "Optimizing phrasing for inclusivity…",
  "Rebalancing benefits vs. requirements…",
  "Tightening the call to action…",
  "Polishing tone of voice…",
];

export function EmailModal({ tokens, onClose, onUnlock }: EmailModalProps) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (!busy) return;
    const t = setInterval(() => setMsgIdx((i) => (i + 1) % MESSAGES.length), 900);
    return () => clearInterval(t);
  }, [busy]);

  const submit = () => {
    if (!email || !email.includes("@")) return;
    setBusy(true);
    setTimeout(onUnlock, 3400);
  };

  return (
    <ModalShell tokens={tokens} onClose={busy ? () => {} : onClose}>
      <div style={{ padding: "36px 36px 30px" }}>
        <Eyebrow tokens={tokens}>Unlock rewrite · Step 2 of 2</Eyebrow>
        <h3 style={{
          fontFamily: tokens.displayFont, fontSize: 30, lineHeight: 1.1,
          fontWeight: tokens.displayWeight, letterSpacing: "-0.02em",
          color: tokens.ink, marginTop: 12,
        }}>
          Where should we <Highlight tokens={tokens}>send</Highlight> it?
        </h3>
        <p style={{
          fontFamily: tokens.bodyFont, fontSize: 15, lineHeight: 1.55,
          color: tokens.inkSoft, marginTop: 10, maxWidth: 440,
        }}>
          We&apos;ll drop the rewritten posting straight in your inbox and show it on this page too.
          One-click unsubscribe, always.
        </p>

        {!busy ? (
          <>
            <div style={{ marginTop: 22 }}>
              <label style={{ fontFamily: tokens.monoFont, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: tokens.inkMute }}>
                Work email
              </label>
              <input
                type="email"
                placeholder="name@company.example"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%", marginTop: 8,
                  background: tokens.bgMuted,
                  border: `1px solid ${tokens.line}`,
                  borderRadius: tokens.cardRadius,
                  padding: "14px 16px",
                  fontFamily: tokens.bodyFont, fontSize: 15, color: tokens.ink,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <Button tokens={tokens} variant="primary" onClick={submit} style={{ width: "100%", marginTop: 16, padding: "16px" }}>
              Send me the rewrite
            </Button>
            <div style={{
              display: "flex", justifyContent: "center", gap: 16, marginTop: 14,
              fontFamily: tokens.monoFont, fontSize: 10, letterSpacing: "0.12em",
              textTransform: "uppercase", color: tokens.inkMute,
            }}>
              <span>Free to use</span><span>·</span><span>No credit card</span><span>·</span><span>GDPR</span>
            </div>
          </>
        ) : (
          <div style={{ marginTop: 24, padding: "28px 24px", background: tokens.bgMuted, borderRadius: tokens.cardRadius }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: tokens.primaryColor, animation: "va-pulse 1.2s ease infinite" }} />
              <div style={{
                fontFamily: tokens.bodyFont, fontSize: 15, color: tokens.ink, fontWeight: 500,
                minHeight: 22,
              }}>{MESSAGES[msgIdx]}</div>
            </div>
            <div style={{
              marginTop: 14, fontFamily: tokens.monoFont, fontSize: 11,
              color: tokens.inkMute, letterSpacing: "0.08em",
            }}>
              Takes about 3 seconds — hang tight.
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes va-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50%      { transform: scale(1.4); opacity: 0.6; }
        }
      `}</style>
    </ModalShell>
  );
}
