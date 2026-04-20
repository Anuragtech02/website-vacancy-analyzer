"use client";

import { type Tokens } from "./theme";
import { useV2T } from "./i18n-context";
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
  const palette = {
    error:   { bg: "color-mix(in oklch, " + tokens.bad + " 14%, transparent)", fg: tokens.bad,   border: "color-mix(in oklch, " + tokens.bad + " 40%, transparent)" },
    success: { bg: "color-mix(in oklch, " + tokens.ok  + " 14%, transparent)", fg: tokens.ok,    border: "color-mix(in oklch, " + tokens.ok  + " 40%, transparent)" },
    info:    { bg: tokens.primarySoft,                                          fg: tokens.primaryInk, border: "transparent" },
  }[variant];

  return (
    <div role={variant === "error" ? "alert" : "status"} style={{
      background: palette.bg,
      color: palette.fg,
      border: `1px solid ${palette.border}`,
      borderRadius: tokens.cardRadius,
      padding: "12px 16px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "start",
      gap: 12,
      fontFamily: tokens.bodyFont,
      fontSize: 14,
      boxShadow: "0 8px 24px -12px rgba(40,30,20,0.2)",
    }}>
      <div style={{ flex: 1, lineHeight: 1.5 }}>{message}</div>
      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          padding: "2px 4px",
          cursor: "pointer",
          color: palette.fg,
          fontFamily: tokens.monoFont,
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          textDecoration: "underline",
          textUnderlineOffset: 3,
        }}
        aria-label={t.common?.dismiss ?? "Dismiss"}
      >
        {t.common?.dismiss ?? "Dismiss"}
      </button>
    </div>
  );
}
