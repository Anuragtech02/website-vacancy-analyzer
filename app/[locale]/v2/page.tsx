"use client";

// page.tsx — /v2 entry page (localized: /en/v2 and /nl/v2).
// Manages the full screen state machine: landing → loading → report.
// Analysis is stubbed — real /api/analyze wiring is a follow-up pass.

import { useState, useEffect, useMemo } from "react";
import { useLocale } from "next-intl";
import { buildTokens, DEFAULT_TWEAKS } from "./_components/theme";
import { PageShaderBackdrop } from "./_components/shader";
import { Navbar } from "./_components/navbar";
import { Landing } from "./_components/landing";
import { Loading } from "./_components/loading";
import { Report } from "./_components/report";
import { EmailModal, LimitModal, DemoModal } from "./_components/modals";
import { V2MessagesProvider } from "./_components/i18n-context";
import { getV2Messages } from "./_messages";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Screen = "landing" | "loading" | "report";
type Modal = "email" | "limit" | "demo" | null;

// ---------------------------------------------------------------------------
// ReviewChip — bottom-left navigator for internal UX stakeholders.
// Allows jumping between screen states without going through the full flow.
// ---------------------------------------------------------------------------

interface ReviewChipProps {
  screen: Screen;
  unlocked: boolean;
  onJump: (key: "landing" | "loading" | "report" | "unlocked") => void;
}

function ReviewChip({ screen, unlocked, onJump }: ReviewChipProps) {
  const pills: Array<{
    key: "landing" | "loading" | "report" | "unlocked";
    label: string;
    active: boolean;
  }> = [
    { key: "landing",  label: "Landing",  active: screen === "landing" },
    { key: "loading",  label: "Loading",  active: screen === "loading" },
    { key: "report",   label: "Report",   active: screen === "report" && !unlocked },
    { key: "unlocked", label: "Unlocked", active: screen === "report" && unlocked },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: 20,
        zIndex: 9000,
        display: "flex",
        gap: 6,
        padding: "6px 8px",
        background: "oklch(0.18 0.02 240 / 0.85)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderRadius: 999,
        border: "1px solid oklch(0.35 0.02 240 / 0.5)",
        boxShadow: "0 4px 16px oklch(0 0 0 / 0.35)",
      }}
    >
      {pills.map((p) => (
        <button
          key={p.key}
          onClick={() => onJump(p.key)}
          style={{
            padding: "5px 12px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.04em",
            background: p.active
              ? "oklch(0.70 0.17 42)"
              : "oklch(0.28 0.02 240 / 0.7)",
            color: p.active ? "#fff" : "oklch(0.75 0.02 240)",
            transition: "background 0.15s ease, color 0.15s ease",
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// V2Page
// ---------------------------------------------------------------------------

export default function V2Page() {
  // Tokens are fixed to the default aesthetic — no Tweaks panel in production.
  const tokens = useMemo(() => buildTokens(DEFAULT_TWEAKS), []);

  // i18n — resolve messages based on URL locale
  const locale = useLocale();
  const v2messages = useMemo(() => getV2Messages(locale), [locale]);

  // ---- State (hydrated from localStorage via effects below) ----
  const [screen, setScreen]   = useState<Screen>("landing");
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [usesLeft, setUsesLeft] = useState<number>(2);
  const [modal, setModal]     = useState<Modal>(null);

  // ---- localStorage hydration (SSR-safe: only inside useEffect) ----
  useEffect(() => {
    const saved = localStorage.getItem("va2_screen");
    if (saved === "landing" || saved === "loading" || saved === "report") {
      setScreen(saved);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("va2_unlocked");
    if (saved === "true") setUnlocked(true);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("va2_uses");
    const parsed = parseInt(saved ?? "", 10);
    if (!isNaN(parsed)) setUsesLeft(Math.max(0, parsed));
  }, []);

  // ---- Persist changes back to localStorage ----
  useEffect(() => {
    localStorage.setItem("va2_screen", screen);
  }, [screen]);

  useEffect(() => {
    localStorage.setItem("va2_unlocked", String(unlocked));
  }, [unlocked]);

  useEffect(() => {
    localStorage.setItem("va2_uses", String(usesLeft));
  }, [usesLeft]);

  // ---- Handlers ----

  // Called from Landing's AnalyzerCard submit.
  // TODO: wire to /api/analyze in a later pass — for now just start the loading animation.
  const startAnalyze = (_text?: string) => {
    setUnlocked(false);
    setScreen("loading");
  };

  const analyzeDone = () => {
    setScreen("report");
  };

  const handleUnlock = () => {
    setUnlocked(true);
    setUsesLeft((n) => Math.max(0, n - 1));
    setModal(null);
  };

  // Opens email modal if uses remain (or already unlocked), limit modal otherwise.
  const openEmailOrLimit = () => {
    if (usesLeft <= 0 && !unlocked) {
      setModal("limit");
    } else {
      setModal("email");
    }
  };

  // ReviewChip jump handler.
  const jumpTo = (key: "landing" | "loading" | "report" | "unlocked") => {
    if (key === "unlocked") {
      setScreen("report");
      setUnlocked(true);
    } else {
      setScreen(key as Screen);
    }
  };

  // ---- Render ----
  return (
    <V2MessagesProvider messages={v2messages}>
      <div
        style={{
          minHeight: "100vh",
          background: tokens.bgBase,
          color: tokens.ink,
          fontFamily: tokens.bodyFont,
          position: "relative",
        }}
      >
        <PageShaderBackdrop tokens={tokens} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Navbar
            tokens={tokens}
            onHome={() => jumpTo("landing")}
            usesLeft={usesLeft}
            screen={screen}
          />

          {screen === "landing" && (
            <Landing tokens={tokens} onAnalyze={startAnalyze} />
          )}

          {screen === "loading" && (
            <Loading
              tokens={tokens}
              onComplete={analyzeDone}
              onSkipToEmail={() => setModal("email")}
            />
          )}

          {screen === "report" && (
            <Report
              tokens={tokens}
              unlocked={unlocked}
              usesLeft={usesLeft}
              onOpenEmail={openEmailOrLimit}
              onOpenLimit={() => setModal("limit")}
              onOpenDemo={() => setModal("demo")}
            />
          )}

          {modal === "email" && (
            <EmailModal
              tokens={tokens}
              onClose={() => setModal(null)}
              onUnlock={handleUnlock}
            />
          )}

          {modal === "limit" && (
            <LimitModal
              tokens={tokens}
              onClose={() => setModal(null)}
              onSeeDemo={() => setModal("demo")}
            />
          )}

          {modal === "demo" && (
            <DemoModal
              tokens={tokens}
              onClose={() => setModal(null)}
            />
          )}
        </div>

        <ReviewChip screen={screen} unlocked={unlocked} onJump={jumpTo} />
      </div>
    </V2MessagesProvider>
  );
}
