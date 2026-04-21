"use client";

import { type Tokens } from "./theme";
import { useV2T } from "./i18n-context";
import { useBreakpoint, isMobile } from "./use-breakpoint";
import { type ReactNode } from "react";

export type BannerVariant = "error" | "success" | "info";

interface InlineBannerProps {
  tokens: Tokens;
  message: ReactNode;
  variant?: BannerVariant;
  onDismiss: () => void;
}

export function InlineBanner({ tokens, message, variant = "error", onDismiss }: InlineBannerProps) {
  const t = useV2T();
  const bp = useBreakpoint();
  const mobile = isMobile(bp);
  // Opaque palettes — solid card background + a coloured accent stripe + strong
  // shadow. Previous design used color-mix(...14%, transparent) which let the
  // sticky report header bleed through and made the banner look like a wash.
  const palette = {
    error:   { accent: tokens.bad,          fg: tokens.ink, icon: "!" },
    success: { accent: tokens.ok,           fg: tokens.ink, icon: "✓" },
    info:    { accent: tokens.primaryColor, fg: tokens.ink, icon: "i" },
  }[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      style={{
        background: tokens.bgRaised,
        color: palette.fg,
        border: `1px solid ${tokens.line}`,
        borderLeft: `4px solid ${palette.accent}`,
        borderRadius: tokens.cardRadius,
        padding: mobile ? "10px 10px 10px 12px" : "12px 14px 12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: mobile ? 8 : 12,
        fontFamily: tokens.bodyFont,
        fontSize: mobile ? 13 : 14,
        // Strong, multi-layer shadow lifts the banner off the page.
        boxShadow: "0 2px 4px rgba(40,30,20,0.08), 0 12px 32px -8px rgba(40,30,20,0.22)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 12, flex: 1, minWidth: 0 }}>
        <span
          aria-hidden
          style={{
            width: 22, height: 22, borderRadius: 999,
            background: palette.accent, color: "#fff",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontFamily: tokens.displayFont, fontSize: 13, fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {palette.icon}
        </span>
        <div style={{
          flex: 1,
          minWidth: 0,
          lineHeight: 1.45,
          color: palette.fg,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}>
          {message}
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          padding: mobile ? "4px 4px" : "4px 8px",
          cursor: "pointer",
          color: tokens.inkMute,
          fontFamily: tokens.monoFont,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "underline",
          textUnderlineOffset: 3,
          flexShrink: 0,
        }}
        aria-label={t.common?.dismiss ?? "Dismiss"}
      >
        {t.common?.dismiss ?? "Dismiss"}
      </button>
    </div>
  );
}
