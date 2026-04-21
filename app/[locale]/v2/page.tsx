"use client";

// page.tsx — /v2 landing (localized: /en/v2 and /nl/v2).
// State machine is just landing → loading. When /api/analyze resolves we
// navigate to /v2/report/[id] instead of swapping screens in-place — every
// report is now a real, shareable URL (matches v1 behaviour).

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { buildTokens, DEFAULT_TWEAKS } from "./_components/theme";
import { PageShaderBackdrop } from "./_components/shader";
import { Navbar } from "./_components/navbar";
import { Landing } from "./_components/landing";
import { Loading } from "./_components/loading";
import { EmailModal, LimitModal, DemoModal, EmailWhenReadyModal } from "./_components/modals";
import { V2MessagesProvider } from "./_components/i18n-context";
import { BannerProvider, type BannerState } from "./_components/banner-context";
import { BannerOverlay } from "./_components/banner-overlay";
import { getV2Messages } from "./_messages";
import { fetchWithTimeout, getErrorMessage } from "@/lib/fetch-with-timeout";
import { generateFingerprint } from "@/lib/fingerprint";
import type { OptimizationResult } from "@/lib/gemini";

type Screen = "landing" | "loading";
type Modal = "email" | "limit" | "demo" | "emailWhenReady" | null;

export default function V2Page() {
  const tokens = useMemo(() => buildTokens(DEFAULT_TWEAKS), []);
  const locale = useLocale();
  const router = useRouter();
  const v2messages = useMemo(() => getV2Messages(locale), [locale]);

  const [screen, setScreen]                 = useState<Screen>("landing");
  const [usesLeft, setUsesLeft]             = useState<number>(2);
  const [modal, setModal]                   = useState<Modal>(null);
  const [banner, setBanner]                 = useState<BannerState | null>(null);
  const [fingerprint, setFingerprint]       = useState<string>("");

  // Remember the current analyze input while we're on the Loading screen so
  // the EmailWhenReadyModal can re-POST it to /api/analyze with an email
  // attached (which triggers the background-queue path on the server).
  const [pendingText, setPendingText]         = useState<string>("");
  const [pendingCategory, setPendingCategory] = useState<string>("General");

  // Backend-driven progress. Populated from SSE events. When stageIdx is
  // undefined the Loading screen falls back to its own timer animation
  // (happens during the initial "started" → first "progress" gap, or if
  // streaming fails outright).
  const [stageIdx, setStageIdx]         = useState<number | undefined>(undefined);
  const [progressPct, setProgressPct]   = useState<number | undefined>(undefined);

  // EmailModal on this page is only used from the async-queued branch
  // (reportId is null since we don't have one yet). If a user opens the
  // email modal here we treat it as "email me when done" — not the unlock
  // flow. The unlock flow lives on /v2/report/[id].
  const [pendingReportId, _setPendingReportId] = useState<string | null>(null);

  useEffect(() => { setFingerprint(generateFingerprint()); }, []);

  // Uses-count is the only thing we still persist on the landing page.
  // Report-specific state (analysis/optimization/unlocked) moved to
  // /v2/report/[id] and is keyed per-report there.
  useEffect(() => {
    const parsedUses = parseInt(localStorage.getItem("va2_uses") ?? "", 10);
    if (!isNaN(parsedUses)) setUsesLeft(Math.max(0, parsedUses));
  }, []);

  useEffect(() => {
    localStorage.setItem("va2_uses", String(usesLeft));
  }, [usesLeft]);

  // One-time cleanup of the old localStorage keys from before the route
  // split. Safe to delete this block after a couple of releases once no
  // browser still has these.
  useEffect(() => {
    ["va2_screen", "va2_analysis", "va2_report_id", "va2_optimization",
     "va2_unlocked", "va2_submitted_text"].forEach((k) => localStorage.removeItem(k));
  }, []);

  const startAnalyze = async (text: string, category: string) => {
    setPendingText(text);
    setPendingCategory(category);
    // NOTE: we briefly shipped a real SSE consumer (POST /api/analyze/stream)
    // that drove Loading from live Gemini token-stream progress. Works
    // locally, but on Coolify behind Traefik the SSE events got buffered
    // upstream and arrived in a single burst at end-of-stream — so the
    // loader would sit on step 1 for 30-40s and then rapid-fire 1→2→3→6
    // right before the report opened. Reverted to the sync JSON path and
    // Loading's internal timer animation. The streaming infra is still in
    // the repo (app/api/analyze/stream, analyzeVacancyStreaming) for when
    // we have bandwidth to tune proxy buffering or move to a different
    // transport.
    setStageIdx(undefined);
    setProgressPct(undefined);
    setScreen("loading");

    try {
      const response = await fetchWithTimeout("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancyText: text, category, locale }),
        // Match server maxDuration (5 min). 120s was aborting legitimate
        // long Gemini 3 Pro runs before the server finished.
        timeout: 300000,
        retries: 0,
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();

      if (data.async) {
        setBanner({ message: data.message ?? "Queued for email delivery.", variant: "info" });
        setScreen("landing");
        return;
      }

      if (data.reportId && data.analysis) {
        router.push(`/${locale}/v2/report/${data.reportId}`);
        return;
      }

      throw new Error("Unexpected analysis response");
    } catch (error) {
      console.error("Analyze error:", error);
      const msg = error instanceof Error
        ? getErrorMessage(error, locale)
        : v2messages.errors.analysisFailed;
      setBanner({ message: msg, variant: "error" });
      setScreen("landing");
    }
  };

  const goHome = () => setScreen("landing");

  // Unused on this page (we navigate away before ever opening the email
  // modal as an unlock step) — but kept wired so the Loading screen's
  // "email it to me" slow-banner CTA still does something sensible.
  const handleUnlockNoop = (_optim: OptimizationResult, _email: string) => {
    setModal(null);
  };

  return (
    <V2MessagesProvider messages={v2messages}>
      <BannerProvider setBanner={setBanner}>
        <div style={{
          minHeight: "100vh",
          background: tokens.bgBase,
          color: tokens.ink,
          fontFamily: tokens.bodyFont,
          position: "relative",
        }}>
          <PageShaderBackdrop tokens={tokens} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <Navbar
              tokens={tokens}
              onHome={goHome}
              usesLeft={usesLeft}
              screen={screen === "loading" ? "loading" : "landing"}
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
                onSkipToEmail={() => setModal("emailWhenReady")}
                stageIdx={stageIdx}
                progressPct={progressPct}
              />
            )}

            {modal === "emailWhenReady" && (
              <EmailWhenReadyModal
                tokens={tokens}
                vacancyText={pendingText}
                category={pendingCategory}
                locale={locale}
                onClose={() => setModal(null)}
                onQueued={(msg) => {
                  setBanner({ message: msg, variant: "success" });
                  setScreen("landing");
                }}
                onError={(msg) => setBanner({ message: msg, variant: "error" })}
              />
            )}

            {modal === "email" && (
              <EmailModal
                tokens={tokens}
                reportId={pendingReportId}
                fingerprint={fingerprint}
                locale={locale}
                onClose={() => setModal(null)}
                onUnlock={handleUnlockNoop}
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
