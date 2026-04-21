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
// BannerOverlay — fixed-position wrapper with auto-dismiss. Key on the message
// string so a new banner resets the timer (otherwise a second error fired
// 7s later would inherit the first banner's already-expired timer).
// ---------------------------------------------------------------------------

interface BannerOverlayProps {
  banner: BannerState;
  tokens: ReturnType<typeof buildTokens>;
  onDismiss: () => void;
}

function BannerOverlay({ banner, tokens, onDismiss }: BannerOverlayProps) {
  useEffect(() => {
    // Info toasts linger slightly longer (users may need to read a queued-job
    // confirmation). Errors clear quicker so they don't stack on retries.
    const ms = banner.variant === "error" ? 6000 : 8000;
    const timer = setTimeout(onDismiss, ms);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banner.message, banner.variant]);

  return (
    <div style={{
      position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)",
      zIndex: 50, maxWidth: 520, width: "calc(100% - 32px)",
    }}>
      <InlineBanner
        tokens={tokens}
        message={banner.message}
        variant={banner.variant}
        onDismiss={onDismiss}
      />
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
  // Single pass so we can cross-validate: never restore "report" without a
  // valid analysis payload — otherwise the Report component's PILLAR_DATA
  // fallback would paint the mock view on return visits.
  useEffect(() => {
    // Parse analysis first — determines whether "report" is even legal.
    let parsedAnalysis: AnalysisResult | null = null;
    try {
      const rawAnalysis = localStorage.getItem("va2_analysis");
      if (rawAnalysis) {
        const candidate = JSON.parse(rawAnalysis) as AnalysisResult;
        // Minimal shape check — prevents old/incompatible payloads from
        // crashing mapAnalysisToPillarData.
        if (candidate?.pillars && candidate?.metadata && candidate?.summary) {
          parsedAnalysis = candidate;
        } else {
          localStorage.removeItem("va2_analysis");
        }
      }
    } catch {
      localStorage.removeItem("va2_analysis");
    }

    const savedScreen = localStorage.getItem("va2_screen");
    if (savedScreen === "report" && parsedAnalysis) {
      setScreen("report");
      setAnalysis(parsedAnalysis);
    } else if (savedScreen === "landing") {
      setScreen("landing");
    } else if (savedScreen === "report" && !parsedAnalysis) {
      // Stale "report" state with no analysis — force back to landing so the
      // user doesn't see mock PILLAR_DATA.
      setScreen("landing");
      localStorage.setItem("va2_screen", "landing");
    }
    // "loading" is filtered by omission — in-flight analysis is gone after reload.

    if (localStorage.getItem("va2_unlocked") === "true") setUnlocked(true);

    const parsedUses = parseInt(localStorage.getItem("va2_uses") ?? "", 10);
    if (!isNaN(parsedUses)) setUsesLeft(Math.max(0, parsedUses));

    const savedText = localStorage.getItem("va2_submitted_text");
    if (savedText) setSubmittedText(savedText);

    const savedReportId = localStorage.getItem("va2_report_id");
    if (savedReportId) setReportId(savedReportId);

    try {
      const savedOpt = localStorage.getItem("va2_optimization");
      if (savedOpt) setOptimization(JSON.parse(savedOpt) as OptimizationResult);
    } catch {
      localStorage.removeItem("va2_optimization");
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

  // NOTE: there's no analyzeDone timer anymore — the loader never force-ends.
  // Screen transition to "report" happens exclusively in startAnalyze when
  // /api/analyze resolves, so we can't land on the report with analysis=null.

  const handleUnlock = (optim: OptimizationResult, _email: string) => {
    setOptimization(optim);
    setUnlocked(true);
    setUsesLeft((n) => Math.max(0, n - 1));
    setModal(null);
    // Clear any stale error/info banner from a prior failed attempt — otherwise
    // the user sees a successful unlock and a leftover "couldn't generate" toast
    // at the same time.
    setBanner(null);
  };

  // Opens email modal if uses remain (or already unlocked), limit modal otherwise.
  const openEmailOrLimit = () => {
    if (usesLeft <= 0 && !unlocked) {
      setModal("limit");
    } else {
      setModal("email");
    }
  };

  // Navbar "home" handler — resets to landing screen.
  const goHome = () => setScreen("landing");

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
            onHome={goHome}
            usesLeft={usesLeft}
            screen={screen}
          />

          {banner && (
            <BannerOverlay
              banner={banner}
              tokens={tokens}
              onDismiss={() => setBanner(null)}
            />
          )}

          {screen === "landing" && (
            <Landing tokens={tokens} onAnalyze={startAnalyze} />
          )}

          {screen === "loading" && (
            <Loading
              tokens={tokens}
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
      </div>
      </BannerProvider>
    </V2MessagesProvider>
  );
}
