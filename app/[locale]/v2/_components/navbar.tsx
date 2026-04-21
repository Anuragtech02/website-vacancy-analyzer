"use client";

// navbar.tsx — site-wide top navigation with logo, language toggle, and CTA.

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import type { Tokens } from "./theme";
import { Button } from "./primitives";
import { useMotion } from "./motion";
import { useV2T } from "./i18n-context";
import { useBreakpoint, isMobile, isNarrow } from "./use-breakpoint";

// ---------------------------------------------------------------------------
// Wordmark (internal)
// ---------------------------------------------------------------------------

function Wordmark({ tokens, onHome, compact }: { tokens: Tokens; onHome: () => void; compact?: boolean }) {
  return (
    <button
      onClick={onHome}
      style={{
        display: "flex", alignItems: "center", gap: compact ? 8 : 10,
        background: "none", border: "none", padding: 0, cursor: "pointer",
      }}
    >
      <Image src="/logo-icon.png" alt="Vacature Tovenaar logo" width={compact ? 28 : 32} height={compact ? 28 : 32} />
      <span style={{
        fontFamily: tokens.displayFont,
        fontWeight: tokens.displayWeight,
        color: tokens.ink,
        fontSize: compact ? 16 : 18,
        letterSpacing: "-0.02em",
      }}>
        Vacature Tovenaar
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// LanguageToggle (internal)
// ---------------------------------------------------------------------------

function LanguageToggle({ tokens }: { tokens: Tokens }) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchTo = (target: string) => {
    if (target === locale) return;
    const newPath = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${target}`);
    router.push(newPath);
  };

  return (
    <div style={{
      display: "inline-flex", alignItems: "center",
      border: `1px solid ${tokens.line}`,
      background: tokens.bgRaised,
      borderRadius: 999,
      overflow: "hidden",
      padding: 3,
      gap: 2,
    }}>
      {(["en", "nl"] as const).map((lang) => {
        const active = locale === lang;
        return (
          <button
            key={lang}
            onClick={() => switchTo(lang)}
            style={{
              background: active ? tokens.ink : "transparent",
              color: active ? tokens.bgRaised : tokens.inkSoft,
              border: "none",
              cursor: active ? "default" : "pointer",
              borderRadius: 999,
              padding: "4px 9px",
              fontFamily: tokens.monoFont,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              transition: "background .15s ease, color .15s ease",
            }}
          >
            {lang}
          </button>
        );
      })}
    </div>
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
  const t = useV2T();
  const bp = useBreakpoint();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleScrollToAnalyzer = () => {
    window.dispatchEvent(new CustomEvent("va2:scroll-to-analyzer"));
  };

  const mobile = isMobile(bp);
  const narrow = isNarrow(bp);
  // Hide the "Analyze vacancy" CTA on mobile/narrow viewports; keep on report screen suppressed (unchanged).
  const showAnalyzeCTA = screen !== "report" && !narrow;

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
        padding: mobile ? "12px 16px" : narrow ? "12px 24px" : "14px 48px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Logo */}
        <Wordmark tokens={tokens} onHome={onHome} compact={mobile} />

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Right cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: mobile ? 8 : 10 }}>
          {/* Uses left pill — only on report screen */}
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
            {t.nav.freeLeft.replace('{count}', String(usesLeft))}
          </div>

          {/* Language toggle */}
          <LanguageToggle tokens={tokens} />

          {/* Analyze vacancy CTA — hidden on report screen and on narrow viewports */}
          {showAnalyzeCTA && (
            <Button
              tokens={tokens}
              variant="primary"
              onClick={handleScrollToAnalyzer}
              style={{ padding: "10px 16px", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              {t.nav.analyzeVacancy}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
