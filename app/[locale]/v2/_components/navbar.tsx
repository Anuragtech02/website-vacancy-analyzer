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
import { openDemoCalendar } from "./demo-link";

// ---------------------------------------------------------------------------
// Wordmark (internal)
// ---------------------------------------------------------------------------

function Wordmark({ tokens: _tokens, onHome, compact }: { tokens: Tokens; onHome: () => void; compact?: boolean }) {
  // Brand mark is the vt-dark.svg asset as-is — it already contains the
  // icon AND the "Vacature Tovenaar" wordmark stacked in the layout the
  // brand team shipped. Don't pair it with a separate text node; that was
  // the "wordmark shows up inline instead of stacked" bug.
  // Native aspect ratio: 1172×441 (~2.66:1).
  const height = compact ? 36 : 44;
  const width = Math.round(height * (1172 / 441));
  return (
    <button
      onClick={onHome}
      aria-label="Vacature Tovenaar — home"
      onMouseEnter={(e) => {
        const img = (e.currentTarget as HTMLButtonElement).firstElementChild as HTMLElement | null;
        if (img) img.style.transform = "scale(1.03)";
      }}
      onMouseLeave={(e) => {
        const img = (e.currentTarget as HTMLButtonElement).firstElementChild as HTMLElement | null;
        if (img) img.style.transform = "scale(1)";
      }}
      style={{
        display: "flex", alignItems: "center",
        background: "none", border: "none", padding: 0, cursor: "pointer",
      }}
    >
      <Image
        src="/vt-dark.svg"
        alt="Vacature Tovenaar"
        width={width}
        height={height}
        style={{
          display: "block", height, width: "auto",
          transformOrigin: "left center",
          transition: "transform .18s cubic-bezier(.2,.7,.2,1)",
        }}
        priority
      />
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
            onMouseEnter={(e) => {
              // Hover feedback only on the inactive pill — active already
              // looks pressed; doubling up would read as a bug.
              if (active) return;
              (e.currentTarget as HTMLButtonElement).style.background = tokens.bgMuted;
              (e.currentTarget as HTMLButtonElement).style.color = tokens.ink;
            }}
            onMouseLeave={(e) => {
              if (active) return;
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.color = tokens.inkSoft;
            }}
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

  const router = useRouter();
  const locale = useLocale();

  // Clicking "Analyze vacancy" on the landing scrolls to the analyzer card;
  // on the report page there is no analyzer card to scroll to, so route
  // back to /v2 instead. Gives report-page users a one-click path to start
  // a new vacancy analysis (previous behaviour hid the button entirely,
  // which meant the only way back to landing was the logo).
  const handleAnalyzeClick = () => {
    if (screen === "report") {
      router.push(`/${locale}/v2`);
    } else {
      window.dispatchEvent(new CustomEvent("va2:scroll-to-analyzer"));
    }
  };

  const mobile = isMobile(bp);
  const narrow = isNarrow(bp);
  // Hide the "Analyze vacancy" CTA only on narrow viewports (mobile +
  // tablet) to keep that header uncluttered. On desktop it's present on
  // every screen so a user who's on the report page can jump back to
  // analyze a new vacancy in one click.
  const showAnalyzeCTA = !narrow;
  // Book-demo link is present on every screen but hides on mobile to keep the
  // narrow-viewport header clean (the footer still has it there).
  const showBookDemo = !mobile;

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

          {/* Book a demo — ghost button, opens the HubSpot calendar in a new
              tab. Same target as the DemoModal CTA and the footer link, so
              there's one way to "talk to sales" regardless of where you click. */}
          {showBookDemo && (
            <Button
              tokens={tokens}
              variant="ghost"
              onClick={openDemoCalendar}
              style={{ padding: "8px 14px", fontSize: 13 }}
            >
              {t.nav.bookDemo}
            </Button>
          )}

          {/* Analyze vacancy CTA — hidden only on narrow viewports. On
              the report page the button routes to /v2 landing so the user
              can start a new analysis; on landing it scrolls to the
              analyzer card. */}
          {showAnalyzeCTA && (
            <Button
              tokens={tokens}
              variant="primary"
              onClick={handleAnalyzeClick}
              style={{ padding: "10px 16px", fontSize: 14, display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              {screen === "report" ? t.nav.newAnalysis : t.nav.analyzeVacancy}
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
