"use client";

// email-when-ready-modal.tsx — shown from the Loading screen's slow-banner
// "Email it to me" CTA. The user drops their email and we POST it to
// /api/analyze/attach-email with the in-flight jobId. The worker
// (scripts/worker.ts) re-reads the job row at completion and emails the
// user a link to /v2/report/[id]. If the job is already finished by the
// time the modal submits, the attach-email route sends the mail itself.
//
// Contrast to the previous design: we no longer re-POST the full
// analysis to /api/analyze — that would duplicate a Gemini call.
// Attaching an email to the existing job is a single cheap SQL UPDATE.

import { useState } from "react";
import { type Tokens } from "../theme";
import { Button, Eyebrow } from "../primitives";
import { ModalShell } from "./modal-shell";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile } from "../use-breakpoint";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

interface EmailWhenReadyModalProps {
  tokens: Tokens;
  jobId: string | null;
  onClose: () => void;
  onQueued: (message: string) => void;
  onError: (message: string) => void;
}

export function EmailWhenReadyModal({
  tokens,
  jobId,
  onClose,
  onQueued,
  onError,
}: EmailWhenReadyModalProps) {
  const t = useV2T();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);

  const [email, setEmail] = useState("");
  const [busy, setBusy]   = useState(false);

  const submit = async () => {
    if (busy) return;
    if (!email || !email.includes("@")) return;
    if (!jobId) {
      onError(t.loading.emailWhenReady.error);
      return;
    }
    setBusy(true);
    try {
      const response = await fetchWithTimeout("/api/analyze/attach-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, email: email.trim() }),
        timeout: 15000,
        retries: 0,
      });

      if (!response.ok) {
        onError(t.loading.emailWhenReady.error);
        setBusy(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        onQueued(t.loading.emailWhenReady.done);
        onClose();
        return;
      }

      onError(t.loading.emailWhenReady.error);
      setBusy(false);
    } catch {
      onError(t.loading.emailWhenReady.error);
      setBusy(false);
    }
  };

  return (
    <ModalShell tokens={tokens} onClose={busy ? () => {} : onClose}>
      <div style={{ padding: mobile ? "28px 20px 24px" : "36px 36px 30px" }}>
        <Eyebrow tokens={tokens}>{t.loading.emailWhenReady.eyebrow}</Eyebrow>
        <h3 style={{
          fontFamily: tokens.displayFont, fontSize: mobile ? 24 : 28, lineHeight: 1.15,
          fontWeight: tokens.displayWeight, letterSpacing: "-0.02em",
          color: tokens.ink, marginTop: 12,
        }}>
          {t.loading.emailWhenReady.title}
        </h3>
        <p style={{
          fontFamily: tokens.bodyFont, fontSize: 15, lineHeight: 1.55,
          color: tokens.inkSoft, marginTop: 10, maxWidth: 440,
        }}>
          {t.loading.emailWhenReady.body}
        </p>

        <div style={{ marginTop: 20 }}>
          <label style={{
            fontFamily: tokens.monoFont, fontSize: 11, letterSpacing: "0.12em",
            textTransform: "uppercase", color: tokens.inkMute,
          }}>
            {t.loading.emailWhenReady.fieldLabel}
          </label>
          <input
            type="email"
            placeholder={t.loading.emailWhenReady.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            disabled={busy}
            style={{
              width: "100%", marginTop: 8,
              background: tokens.bgMuted,
              border: `1px solid ${tokens.line}`,
              borderRadius: tokens.cardRadius,
              padding: "14px 16px",
              fontFamily: tokens.bodyFont, fontSize: 15, color: tokens.ink,
              outline: "none",
              boxSizing: "border-box",
              opacity: busy ? 0.6 : 1,
            }}
          />
        </div>
        <Button
          tokens={tokens}
          variant="primary"
          onClick={submit}
          style={{
            width: "100%", marginTop: 14, padding: "16px",
            opacity: busy ? 0.7 : 1,
            cursor: busy ? "not-allowed" : "pointer",
          }}
        >
          {busy ? t.loading.emailWhenReady.submitting : t.loading.emailWhenReady.submit}
        </Button>
      </div>
    </ModalShell>
  );
}
