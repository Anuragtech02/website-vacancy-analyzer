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

  // Job id of the in-flight analyze request. Set when POST /api/analyze
  // returns; used by EmailWhenReadyModal to call attach-email and by the
  // poll loop to fetch status.
  const [pendingJobId, setPendingJobId]       = useState<string | null>(null);

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

  // Polling loop implementation:
  //
  // 1. POST /api/analyze → returns { jobId }
  // 2. Every 2 seconds: GET /api/analyze/status?id={jobId}
  // 3. As status updates come in, push { progress, stage } into the
  //    Loading component props so it animates from real backend values.
  // 4. When status === 'done' → router.push('/v2/report/<reportId>')
  // 5. When status === 'failed' → show error banner, back to landing.
  //
  // Why polling not SSE: Coolify's Traefik proxy buffers SSE streams,
  // causing events to arrive in a single burst at end-of-stream. Each
  // poll is a normal HTTP 200 with a tiny JSON body that Traefik passes
  // through instantly. We lose nothing — each poll is <200ms and the
  // status table is a single row read.
  //
  // Worker side (scripts/worker.ts) is a separate Node process that
  // runs analyzeVacancy, updates the row's progress column on a timer,
  // saves the final report, and sets status='done'.
  const startAnalyze = async (text: string, category: string) => {
    setPendingJobId(null);
    // Start at step 0 / 0% so Loading renders externally-driven from
    // the first frame (never falls back to the internal timer that
    // would race real progress events).
    setStageIdx(0);
    setProgressPct(0);
    setScreen("loading");

    // Step 1: enqueue. This returns in <500ms — just a DB write + queue
    // send; the actual Gemini call runs on the worker.
    let jobId: string;
    try {
      const response = await fetchWithTimeout("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancyText: text, category, locale }),
        timeout: 30000,
        retries: 0,
      });
      if (!response.ok) throw new Error("Analysis failed");
      const data = await response.json();
      if (!data.jobId) throw new Error("Unexpected analysis response");
      jobId = data.jobId as string;
      setPendingJobId(jobId);
    } catch (error) {
      console.error("Analyze enqueue error:", error);
      const msg = error instanceof Error ? getErrorMessage(error, locale) : v2messages.errors.analysisFailed;
      setBanner({ message: msg, variant: "error" });
      setScreen("landing");
      return;
    }

    // Step 2+: poll loop. 2-second interval, max 180 polls (~6 min cap).
    const POLL_INTERVAL_MS = 2000;
    const MAX_POLLS = 180;
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      let status: { status: string; progress: number; stage?: string; reportId?: string; error?: string };
      try {
        const res = await fetch(`/api/analyze/status?id=${encodeURIComponent(jobId)}`, {
          headers: { "Cache-Control": "no-cache" },
        });
        if (!res.ok) throw new Error(`status ${res.status}`);
        status = await res.json();
      } catch (err) {
        // Single transient poll failure isn't fatal — retry on next tick.
        console.warn("Poll error:", err);
        continue;
      }

      // Map progress → step index so the Loading component has both.
      // 6 steps, 100% → step 5, monotonic.
      const mappedStage = Math.min(5, Math.floor((status.progress / 100) * 6));
      setStageIdx((prev) => Math.max(prev ?? 0, mappedStage));
      setProgressPct((prev) => Math.max(prev ?? 0, status.progress));

      if (status.status === "done" && status.reportId) {
        router.push(`/${locale}/v2/report/${status.reportId}`);
        return;
      }
      if (status.status === "failed") {
        setBanner({ message: status.error ?? v2messages.errors.analysisFailed, variant: "error" });
        setScreen("landing");
        return;
      }
      // else: pending or running → keep polling
    }

    // Fell out of the loop without a terminal state — worker is stuck.
    setBanner({ message: v2messages.errors.analysisTimeout, variant: "error" });
    setScreen("landing");
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
                jobId={pendingJobId}
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
