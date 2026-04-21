"use client";

import { useState, useEffect } from "react";
import { type Tokens } from "../theme";
import { Button, Eyebrow, Highlight } from "../primitives";
import { ModalShell } from "./modal-shell";
import { useV2T } from "../i18n-context";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import type { OptimizationResult } from "@/lib/gemini";

interface EmailModalProps {
  tokens: Tokens;
  reportId: string | null;
  fingerprint: string;
  locale: string;
  onClose: () => void;
  onUnlock: (optimization: OptimizationResult, email: string) => void;
  onLimit: () => void;
  onError: (message: string) => void;
}

export function EmailModal({ tokens, reportId, fingerprint, locale, onClose, onUnlock, onLimit, onError }: EmailModalProps) {
  const t = useV2T();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => setMsgIdx((i) => (i + 1) % t.modals.email.busy.length), 900);
    return () => clearInterval(timer);
  }, [busy, t.modals.email.busy.length]);

  const submit = async () => {
    // Double-click guard. React state is async, so a rapid second click can
    // enter submit() before the first call's setBusy(true) has rendered — two
    // parallel /api/optimize requests means one may 500 while the other
    // succeeds, showing an error banner next to an unlocked report.
    if (busy) return;
    if (!email || !email.includes("@")) return;
    if (!reportId) {
      onError(t.errors.reportNotAvailable);
      return;
    }
    setBusy(true);
    try {
      const response = await fetchWithTimeout("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reportId, fingerprint, locale }),
        timeout: 90000,
        retries: 1,
      });
      const data = await response.json();

      if (data.isLocked) {
        setBusy(false);
        onLimit();
        onClose();
        return;
      }

      if (!data.success || !data.optimization) {
        throw new Error(t.errors.optimizeFailed);
      }

      onUnlock(data.optimization as OptimizationResult, email);
      onClose();
    } catch (error) {
      setBusy(false);
      onError(error instanceof Error ? error.message : t.errors.optimizeFailed);
    }
  };

  return (
    <ModalShell tokens={tokens} onClose={busy ? () => {} : onClose}>
      <div style={{ padding: "36px 36px 30px" }}>
        <Eyebrow tokens={tokens}>{t.modals.email.eyebrow}</Eyebrow>
        <h3 style={{
          fontFamily: tokens.displayFont, fontSize: 30, lineHeight: 1.1,
          fontWeight: tokens.displayWeight, letterSpacing: "-0.02em",
          color: tokens.ink, marginTop: 12,
        }}>
          {t.modals.email.title.part1}<Highlight tokens={tokens}>{t.modals.email.title.highlight}</Highlight>{t.modals.email.title.part2}
        </h3>
        <p style={{
          fontFamily: tokens.bodyFont, fontSize: 15, lineHeight: 1.55,
          color: tokens.inkSoft, marginTop: 10, maxWidth: 440,
        }}>
          {t.modals.email.body}
        </p>

        {!busy ? (
          <>
            <div style={{ marginTop: 22 }}>
              <label style={{ fontFamily: tokens.monoFont, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: tokens.inkMute }}>
                {t.modals.email.fieldLabel}
              </label>
              <input
                type="email"
                placeholder={t.modals.email.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
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
              {t.modals.email.submit}
            </Button>
            <div style={{
              display: "flex", justifyContent: "center", gap: 16, marginTop: 14,
              fontFamily: tokens.monoFont, fontSize: 10, letterSpacing: "0.12em",
              textTransform: "uppercase", color: tokens.inkMute,
            }}>
              <span>{t.modals.email.trust.free}</span><span>·</span><span>{t.modals.email.trust.noCard}</span><span>·</span><span>{t.modals.email.trust.gdpr}</span>
            </div>
          </>
        ) : (
          <div style={{ marginTop: 24, padding: "28px 24px", background: tokens.bgMuted, borderRadius: tokens.cardRadius }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 10, height: 10, borderRadius: 999, background: tokens.primaryColor, animation: "va-pulse 1.2s ease infinite" }} />
              <div style={{
                fontFamily: tokens.bodyFont, fontSize: 15, color: tokens.ink, fontWeight: 500,
                minHeight: 22,
              }}>{t.modals.email.busy[msgIdx]}</div>
            </div>
            <div style={{
              marginTop: 14, fontFamily: tokens.monoFont, fontSize: 11,
              color: tokens.inkMute, letterSpacing: "0.08em",
            }}>
              {t.modals.email.busyHint}
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
