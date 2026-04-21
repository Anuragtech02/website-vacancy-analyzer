"use client";

import React from "react";
import { Tokens } from "../theme";

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
  ...rest
}: ButtonProps) {
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
    cursor: "pointer",
    transition: "transform .15s ease, box-shadow .15s ease",
    letterSpacing: "-0.01em",
  };

  const variants: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      background: tokens.primaryColor,
      color: "#fff",
      borderColor: tokens.primaryColor,
      boxShadow:
        tokens.cardShadow === "offset" ? `4px 4px 0 0 ${tokens.ink}` : "none",
    },
    ghost: {
      background: "transparent",
      color: tokens.ink,
      borderColor: tokens.line,
    },
    dark: {
      background: tokens.ink,
      color: tokens.bgRaised,
      borderColor: tokens.ink,
      boxShadow:
        tokens.cardShadow === "offset"
          ? `4px 4px 0 0 ${tokens.primaryColor}`
          : "none",
    },
    subtle: {
      background: tokens.primarySoft,
      color: tokens.primaryInk,
      borderColor: "transparent",
    },
  };

  return (
    <button
      style={{ ...base, ...variants[variant], ...style }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform =
          "translateY(1px)";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "none";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "none";
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
