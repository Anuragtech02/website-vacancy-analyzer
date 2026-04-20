"use client";

import { type Tokens } from "../theme";
import { Button } from "../primitives";
import { useV2T } from "../i18n-context";

interface StickyUnlockBannerProps {
  tokens: Tokens;
  onOpenEmail: () => void;
}

export function StickyUnlockBanner({ tokens, onOpenEmail }: StickyUnlockBannerProps) {
  const t = useV2T();
  return (
    <div style={{
      position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
      background: tokens.ink, color: tokens.bgRaised,
      borderRadius: tokens.cardRadius,
      padding: "14px 18px 14px 22px",
      display: "flex", alignItems: "center", gap: 22,
      boxShadow: "0 20px 50px -16px rgba(0,0,0,0.35)",
      zIndex: 8,
      maxWidth: "calc(100vw - 40px)",
    }}>
      <div>
        <div style={{ fontFamily: tokens.bodyFont, fontSize: 14, fontWeight: 600 }}>
          {t.report.stickyBanner.title}
        </div>
        <div style={{ fontFamily: tokens.bodyFont, fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
          {t.report.stickyBanner.subtitle}
        </div>
      </div>
      <Button tokens={tokens} variant="primary" onClick={onOpenEmail} style={{ padding: "10px 16px", fontSize: 13 }}>
        {t.report.stickyBanner.cta}
      </Button>
    </div>
  );
}
