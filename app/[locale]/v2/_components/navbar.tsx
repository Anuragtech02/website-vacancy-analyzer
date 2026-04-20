"use client";

// navbar.tsx — site-wide top navigation with logo, menu, and CTA.
// Ported from navbar.jsx (React-in-HTML prototype).

import { useState, useEffect } from "react";
import type { Tokens } from "./theme";
import { Button } from "./primitives";
import { useMotion } from "./motion";

// ---------------------------------------------------------------------------
// Wordmark (internal)
// ---------------------------------------------------------------------------

function Wordmark({ tokens }: { tokens: Tokens }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 30, height: 30,
        borderRadius: tokens.cardRadius > 6 ? 8 : 3,
        background: tokens.ink,
        display: "grid", placeItems: "center",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(circle at 30% 30%, ${tokens.primaryColor}, transparent 60%)`,
          opacity: 0.9,
        }} />
        <span style={{
          position: "relative",
          fontFamily: tokens.displayFont,
          fontWeight: 700,
          color: tokens.bgRaised,
          fontSize: 15,
          letterSpacing: "-0.02em",
        }}>V</span>
      </div>
      <span style={{
        fontFamily: tokens.displayFont,
        fontWeight: tokens.displayWeight,
        color: tokens.ink,
        fontSize: 18,
        letterSpacing: "-0.02em",
      }}>
        Vacancy<span style={{ color: tokens.primaryColor }}>.</span>Wizard
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NavItem (internal)
// ---------------------------------------------------------------------------

interface NavItemProps {
  tokens: Tokens;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function NavItem({ tokens, label, active, onClick }: NavItemProps) {
  const m = useMotion(tokens);
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: "none", border: "none", cursor: "pointer",
        padding: "9px 14px",
        fontFamily: tokens.bodyFont, fontSize: 14,
        color: active ? tokens.ink : tokens.inkSoft,
        fontWeight: active ? 600 : 500,
      }}
    >
      {label}
      <span style={{
        position: "absolute", left: 14, right: 14, bottom: 4,
        height: 2, borderRadius: 2,
        background: active ? tokens.primaryColor : tokens.ink,
        transform: active ? "scaleX(1)" : hover ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: active ? "left" : hover ? "left" : "right",
        transition: m.on ? "transform .28s cubic-bezier(.2,.7,.2,1)" : "none",
        opacity: active ? 1 : 0.7,
      }} />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Navbar
// ---------------------------------------------------------------------------

export interface NavbarProps {
  tokens: Tokens;
  onHome: () => void;
  usesLeft: number;
  screen: "landing" | "loading" | "report";
}

export function Navbar({ tokens, onHome, usesLeft, screen }: NavbarProps) {
  const m = useMotion(tokens);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items: Array<{ label: string; active: boolean; onClick?: () => void }> = [
    { label: "Analyzer",    active: true,  onClick: onHome },
    { label: "Methodology", active: false },
    { label: "Rewriter",    active: false },
    { label: "Pricing",     active: false },
    { label: "Blog",        active: false },
  ];

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 40,
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      background: scrolled
        ? `color-mix(in oklab, ${tokens.bgBase} 82%, transparent)`
        : `color-mix(in oklab, ${tokens.bgBase} 60%, transparent)`,
      borderBottom: scrolled ? `1px solid ${tokens.line}` : `1px solid transparent`,
      transition: m.on ? "background .25s ease, border-color .25s ease" : "none",
    }}>
      <div style={{
        maxWidth: 1360, margin: "0 auto",
        padding: "14px 48px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        alignItems: "center",
        gap: 32,
      }}>
        {/* Logo */}
        <button
          onClick={onHome}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "none", border: "none", padding: 0, cursor: "pointer",
          }}
        >
          <Wordmark tokens={tokens} />
        </button>

        {/* Center nav */}
        <nav style={{
          display: "flex", alignItems: "center", gap: 4,
          justifyContent: "center",
        }}>
          {items.map((it) => (
            <NavItem key={it.label} tokens={tokens} {...it} />
          ))}
        </nav>

        {/* Right cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: screen === "report" ? "inline-flex" : "none",
            alignItems: "center", gap: 6,
            fontFamily: tokens.monoFont, fontSize: 11,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: tokens.inkMute,
            padding: "6px 10px",
            border: `1px solid ${tokens.line}`,
            borderRadius: 999,
            background: tokens.bgRaised,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: tokens.primaryColor }} />
            {usesLeft} free left
          </div>
          <button style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "9px 14px",
            fontFamily: tokens.bodyFont, fontSize: 14, color: tokens.ink,
            fontWeight: 500,
          }}>
            Sign in
          </button>
          <Button tokens={tokens} variant="primary" style={{ padding: "10px 16px", fontSize: 14 }}>
            Book a demo
          </Button>
        </div>
      </div>
    </header>
  );
}
