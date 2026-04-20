"use client";

// page.tsx — /v2 entry page (localized: /en/v2 and /nl/v2).
// Manages the full screen state machine: landing → loading → report.

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
import { BannerProvider, type BannerState } from "./_components/banner-context";
import { InlineBanner } from "./_components/inline-banner";
import { getV2Messages } from "./_messages";
import { fetchWithTimeout, getErrorMessage } from "@/lib/fetch-with-timeout";
import { generateFingerprint } from "@/lib/fingerprint";
import type { AnalysisResult, OptimizationResult } from "@/lib/gemini";

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
  const [screen, setScreen]       = useState<Screen>("landing");
  const [unlocked, setUnlocked]   = useState<boolean>(false);
  const [usesLeft, setUsesLeft]   = useState<number>(2);
  const [modal, setModal]         = useState<Modal>(null);
  const [submittedText, setSubmittedText] = useState<string>("");
  const [banner, setBanner]       = useState<BannerState | null>(null);

  // Real API data
  const [analysis, setAnalysis]         = useState<AnalysisResult | null>(null);
  const [reportId, setReportId]         = useState<string | null>(null);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [fingerprint, setFingerprint]   = useState<string>("");

  // ---- Fingerprint on mount ----
  useEffect(() => {
    setFingerprint(generateFingerprint());
  }, []);

  // ---- localStorage hydration (SSR-safe: only inside useEffect) ----
  useEffect(() => {
    const saved = localStorage.getItem("va2_screen");
    // Never rehydrate "loading" — if the user closed the tab mid-fetch,
    // the in-flight analysis is gone. Restart from landing.
    if (saved === "landing" || saved === "report") {
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

  useEffect(() => {
    const saved = localStorage.getItem("va2_submitted_text");
    if (saved) setSubmittedText(saved);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("va2_analysis");
      if (saved) setAnalysis(JSON.parse(saved) as AnalysisResult);
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("va2_report_id");
    if (saved) setReportId(saved);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("va2_optimization");
      if (saved) setOptimization(JSON.parse(saved) as OptimizationResult);
    } catch {
      // ignore parse errors
    }
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

  useEffect(() => {
    localStorage.setItem("va2_submitted_text", submittedText);
  }, [submittedText]);

  useEffect(() => {
    if (analysis) {
      localStorage.setItem("va2_analysis", JSON.stringify(analysis));
    }
  }, [analysis]);

  useEffect(() => {
    if (reportId) {
      localStorage.setItem("va2_report_id", reportId);
    }
  }, [reportId]);

  useEffect(() => {
    if (optimization) {
      localStorage.setItem("va2_optimization", JSON.stringify(optimization));
    }
  }, [optimization]);

  // ---- Handlers ----

  // Called from Landing's AnalyzerCard submit.
  // Starts the loading animation and fires POST /api/analyze.
  // When the fetch resolves (faster or slower than the animation),
  // the screen flips to "report".
  const startAnalyze = async (text: string) => {
    setSubmittedText(text);
    setAnalysis(null);
    setOptimization(null);
    setReportId(null);
    setUnlocked(false);
    setScreen("loading");

    try {
      const response = await fetchWithTimeout("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancyText: text,
          category: "General",
          locale,
        }),
        timeout: 120000,
        retries: 1,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();

      if (data.async) {
        setBanner({ message: data.message ?? "Queued for email delivery.", variant: "info" });
        setScreen("landing");
        return;
      }

      if (data.reportId && data.analysis) {
        setReportId(data.reportId);
        setAnalysis(data.analysis as AnalysisResult);
        setScreen("report");
      } else {
        throw new Error("Unexpected analysis response");
      }
    } catch (error) {
      console.error("Analyze error:", error);
      const msg = error instanceof Error
        ? getErrorMessage(error, locale)
        : v2messages.errors.analysisFailed;
      setBanner({ message: msg, variant: "error" });
      setScreen("landing");
    }
  };

  // Fallback: called from Loading's onComplete timer if fetch already resolved
  // and screen was set to "report" — no-op in that case.
  const analyzeDone = () => {
    // Only flip if still loading (fetch hasn't resolved yet / no-op if already on report)
    setScreen((s) => (s === "loading" ? "report" : s));
  };

  const handleUnlock = (optim: OptimizationResult, _email: string) => {
    setOptimization(optim);
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
      <BannerProvider setBanner={setBanner}>
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

          {banner && (
            <div style={{
              position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
              zIndex: 50, maxWidth: 520, width: "calc(100% - 32px)",
            }}>
              <InlineBanner
                tokens={tokens}
                message={banner.message}
                variant={banner.variant}
                onDismiss={() => setBanner(null)}
              />
            </div>
          )}

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
              submittedText={submittedText}
              analysis={analysis}
              optimization={optimization}
              onOpenEmail={openEmailOrLimit}
              onOpenLimit={() => setModal("limit")}
              onOpenDemo={() => setModal("demo")}
            />
          )}

          {modal === "email" && (
            <EmailModal
              tokens={tokens}
              reportId={reportId}
              fingerprint={fingerprint}
              locale={locale}
              onClose={() => setModal(null)}
              onUnlock={handleUnlock}
              onLimit={() => setModal("limit")}
              onError={(msg) => setBanner({ message: msg, variant: "error" })}
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

        {process.env.NODE_ENV === 'development' && (
          <ReviewChip screen={screen} unlocked={unlocked} onJump={jumpTo} />
        )}
      </div>
      </BannerProvider>
    </V2MessagesProvider>
  );
}
