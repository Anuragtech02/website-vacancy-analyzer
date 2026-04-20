"use client";

import { type Tokens } from "../theme";
import { Button } from "../primitives";

interface StickyUnlockBannerProps {
  tokens: Tokens;
  onOpenEmail: () => void;
}

export function StickyUnlockBanner({ tokens, onOpenEmail }: StickyUnlockBannerProps) {
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
          The rewrite is ready — projected 8.2 / 10
        </div>
        <div style={{ fontFamily: tokens.bodyFont, fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>
          Enter your email to unlock. No marketing spam, unsubscribe any time.
        </div>
      </div>
      <Button tokens={tokens} variant="primary" onClick={onOpenEmail} style={{ padding: "10px 16px", fontSize: 13 }}>
        Unlock rewrite →
      </Button>
    </div>
  );
}
