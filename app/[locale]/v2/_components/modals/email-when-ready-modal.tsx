"use client";

// email-when-ready-modal.tsx — shown from the Loading screen's slow-banner
// "Email it to me" CTA. The user drops their email, we POST /api/analyze
// with the email (and the already-submitted vacancy text + category + locale),
// and the backend spawns a detached in-process analyze promise (Next.js on
// Coolify stays alive long enough to finish), then emails the user a link
// to the report when it's done. User can close the tab.
//
// No Bull queue, no Redis, no separate worker — the analyze call runs in
// the same Node process that served the HTTP response and finishes after
// the response returns.

import { useState } from "react";
import { type Tokens } from "../theme";
import { Button, Eyebrow } from "../primitives";
import { ModalShell } from "./modal-shell";
import { useV2T } from "../i18n-context";
import { useBreakpoint, isMobile } from "../use-breakpoint";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";

interface EmailWhenReadyModalProps {
  tokens: Tokens;
  vacancyText: string;
  category: string;
  locale: string;
  onClose: () => void;
  onQueued: (message: string) => void;
  onError: (message: string) => void;
}

export function EmailWhenReadyModal({
  tokens,
  vacancyText,
  category,
  locale,
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
    setBusy(true);
    try {
      const response = await fetchWithTimeout("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancyText, category, locale, email }),
        timeout: 30000, // fast-path: the server should return async:true almost immediately
        retries: 0,
      });

      if (!response.ok) {
        onError(t.loading.emailWhenReady.error);
        setBusy(false);
        return;
      }

      const data = await response.json();

      if (data.async) {
        // Backend kicked off the detached in-process job. User is done here.
        onQueued(data.message ?? t.loading.emailWhenReady.done);
        onClose();
        return;
      }

      // The backend always returns async:true when an email is provided
      // now; this branch means the server didn't recognize the email for
      // some reason. Fall back to the generic error copy.
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
