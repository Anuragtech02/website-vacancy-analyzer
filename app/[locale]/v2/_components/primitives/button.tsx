"use client";

// button.tsx — shared Button primitive.
//
// Micro-interactions (applied uniformly to every caller, since almost every
// CTA in the app routes through this component):
//   - hover: subtle lift (translateY(-1px)) + stronger shadow + border/bg tint
//   - active / press: sinks 1px, shadow reduces — tactile feedback
//   - focus-visible: orange ring, a11y essential
//   - reduced-motion: transforms are skipped entirely (tokens.motionMult=0)
//
// Variants:
//   primary  — solid orange CTA. Strong shadow, grows on hover.
//   dark     — solid ink. Used for secondary emphasis CTAs.
//   ghost    — transparent with line border. Becomes a soft primary tint on hover.
//   subtle   — primarySoft chip-like background. Darkens slightly on hover.

import React, { useState } from "react";
import { Tokens } from "../theme";
import { useMotion } from "../motion/use-motion";

type ButtonVariant = "primary" | "ghost" | "dark" | "subtle";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tokens: Tokens;
  variant?: ButtonVariant;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export function Button({
  tokens,
  variant = "primary",
  children,
  style,
  disabled,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onFocus,
  onBlur,
  ...rest
}: ButtonProps) {
  const m = useMotion(tokens);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState(false);

  const interactive = !disabled;
  const animate = interactive && m.on;
  const isOffsetShadow = tokens.cardShadow === "offset";

  // ─── Base style (common to all variants) ────────────────────────────────
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 22px",
    fontFamily: tokens.bodyFont,
    fontSize: 15,
    fontWeight: 500,
    border: "1.5px solid transparent",
    borderRadius: tokens.buttonRadius,
    cursor: disabled ? "not-allowed" : "pointer",
    letterSpacing: "-0.01em",
    willChange: animate ? "transform, box-shadow" : undefined,
    transition: m.on
      ? "transform .18s cubic-bezier(.2,.7,.2,1), box-shadow .18s ease, background-color .15s ease, border-color .15s ease, color .15s ease"
      : "none",
    // Accessible focus ring — only shows on keyboard focus because React's
    // synthetic focus fires for both mouse and keyboard. We live with that
    // and rely on the visible orange ring to be obviously tasteful either way.
    outline: focused ? `2px solid ${tokens.primaryColor}` : "none",
    outlineOffset: focused ? 3 : 0,
  };

  // ─── Per-variant style, including hover overrides ───────────────────────
  let variantStyle: React.CSSProperties;
  switch (variant) {
    case "primary": {
      const restShadow = isOffsetShadow
        ? `4px 4px 0 0 ${tokens.ink}`
        : `0 6px 16px -6px color-mix(in oklab, ${tokens.primaryColor} 55%, transparent)`;
      const hoverShadow = isOffsetShadow
        ? `6px 6px 0 0 ${tokens.ink}`
        : `0 12px 26px -10px color-mix(in oklab, ${tokens.primaryColor} 70%, transparent)`;
      variantStyle = {
        background: tokens.primaryColor,
        color: "#fff",
        borderColor: tokens.primaryColor,
        boxShadow: hovered && animate ? hoverShadow : restShadow,
      };
      break;
    }
    case "dark": {
      const restShadow = isOffsetShadow
        ? `4px 4px 0 0 ${tokens.primaryColor}`
        : `0 6px 16px -6px color-mix(in oklab, ${tokens.ink} 55%, transparent)`;
      const hoverShadow = isOffsetShadow
        ? `6px 6px 0 0 ${tokens.primaryColor}`
        : `0 12px 26px -10px color-mix(in oklab, ${tokens.ink} 70%, transparent)`;
      variantStyle = {
        background: tokens.ink,
        color: tokens.bgRaised,
        borderColor: tokens.ink,
        boxShadow: hovered && animate ? hoverShadow : restShadow,
      };
      break;
    }
    case "ghost": {
      variantStyle = {
        background: hovered && animate ? tokens.primarySoft : "transparent",
        color: hovered && animate ? tokens.primaryInk : tokens.ink,
        borderColor: hovered && animate ? tokens.primaryColor : tokens.line,
      };
      break;
    }
    case "subtle": {
      variantStyle = {
        background: hovered && animate
          ? `color-mix(in oklab, ${tokens.primarySoft} 88%, ${tokens.primaryColor})`
          : tokens.primarySoft,
        color: tokens.primaryInk,
        borderColor: "transparent",
      };
      break;
    }
  }

  // ─── Transform cascade: pressed > hover > rest ──────────────────────────
  let transform = "translateY(0)";
  if (animate) {
    if (pressed) transform = "translateY(1px)";
    else if (hovered) transform = "translateY(-1px)";
  }

  return (
    <button
      style={{
        ...base,
        ...variantStyle,
        transform,
        ...style,
        // disabled wins over any caller-supplied opacity so gates look gated
        ...(disabled ? { opacity: 0.55 } : null),
      }}
      disabled={disabled}
      onMouseEnter={(e) => { setHovered(true); onMouseEnter?.(e); }}
      onMouseLeave={(e) => { setHovered(false); setPressed(false); onMouseLeave?.(e); }}
      onMouseDown={(e) => { setPressed(true); onMouseDown?.(e); }}
      onMouseUp={(e) => { setPressed(false); onMouseUp?.(e); }}
      onFocus={(e) => { setFocused(true); onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); onBlur?.(e); }}
      {...rest}
    >
      {children}
    </button>
  );
}
