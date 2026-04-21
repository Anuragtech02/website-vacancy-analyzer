"use client";

// banner-overlay.tsx — fixed-position wrapper around InlineBanner with
// auto-dismiss. Shared between the /v2 landing page and the /v2/report/[id]
// page so both routes behave identically on error/success/info toasts.
//
// Key on the message string so a new banner resets the timer (otherwise a
// second error fired 7s later would inherit the first banner's already-
// expired timer).

import { useEffect } from "react";
import type { Tokens } from "./theme";
import { InlineBanner } from "./inline-banner";
import type { BannerState } from "./banner-context";

interface BannerOverlayProps {
  banner: BannerState;
  tokens: Tokens;
  onDismiss: () => void;
}

export function BannerOverlay({ banner, tokens, onDismiss }: BannerOverlayProps) {
  useEffect(() => {
    // Info toasts linger slightly longer (users may need to read a queued-job
    // confirmation). Errors clear quicker so they don't stack on retries.
    const ms = banner.variant === "error" ? 6000 : 8000;
    const timer = setTimeout(onDismiss, ms);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner.message, banner.variant]);

  return (
    <div style={{
      position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
      zIndex: 50, maxWidth: 520, width: "calc(100% - 32px)",
    }}>
      <InlineBanner
        tokens={tokens}
        message={banner.message}
        variant={banner.variant}
        onDismiss={onDismiss}
      />
    </div>
  );
}
