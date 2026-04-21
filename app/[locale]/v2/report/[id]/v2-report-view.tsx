"use client";

// v2-report-view.tsx — client wrapper for the /v2/report/[id] route. Takes
// the server-hydrated analysis + vacancy text and renders the v2 Report with
// the full unlock flow (EmailModal → optimize → unlocked state + rewrite
// section). Mirrors the "report screen" state that used to live inside
// /v2/page.tsx, but now it's URL-addressable: every report has its own
// shareable link.

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { buildTokens, DEFAULT_TWEAKS } from "../../_components/theme";
import { PageShaderBackdrop } from "../../_components/shader";
import { Navbar } from "../../_components/navbar";
import { Footer } from "../../_components/landing/footer";
import { Report } from "../../_components/report";
import { EmailModal, LimitModal, DemoModal } from "../../_components/modals";
import { V2MessagesProvider } from "../../_components/i18n-context";
import { BannerProvider, type BannerState } from "../../_components/banner-context";
import { BannerOverlay } from "../../_components/banner-overlay";
import { getV2Messages } from "../../_messages";
import { generateFingerprint } from "@/lib/fingerprint";
import type { AnalysisResult, OptimizationResult } from "@/lib/gemini";

type Modal = "email" | "limit" | "demo" | null;

interface V2ReportViewProps {
  reportId: string;
  analysis: AnalysisResult;
  vacancyText: string;
}

export function V2ReportView({ reportId, analysis, vacancyText }: V2ReportViewProps) {
  const tokens = useMemo(() => buildTokens(DEFAULT_TWEAKS), []);
  const locale = useLocale();
  const router = useRouter();
  const v2messages = useMemo(() => getV2Messages(locale), [locale]);

  // Unlock state is still client-side — optimization isn't persisted to the
  // DB (only the analysis is), so /v2/report/[id] starts locked and the user
  // re-unlocks via email modal. That matches v1's behaviour for shareable
  // report links.
  const [unlocked, setUnlocked]             = useState<boolean>(false);
  const [optimization, setOptimization]     = useState<OptimizationResult | null>(null);
  const [usesLeft, setUsesLeft]             = useState<number>(2);
  const [modal, setModal]                   = useState<Modal>(null);
  const [banner, setBanner]                 = useState<BannerState | null>(null);
  const [fingerprint, setFingerprint]       = useState<string>("");

  useEffect(() => {
    setFingerprint(generateFingerprint());
  }, []);

  // Hydrate uses-count + per-report unlock/optimization from localStorage.
  // The unlock state is keyed on reportId so each shareable URL remembers
  // whether the owning-browser has unlocked it. If you open someone else's
  // link on a fresh browser, you'll start locked — which is correct.
  useEffect(() => {
    const savedUses = parseInt(localStorage.getItem("va2_uses") ?? "", 10);
    if (!isNaN(savedUses)) setUsesLeft(Math.max(0, savedUses));

    if (localStorage.getItem(`va2_unlocked:${reportId}`) === "true") {
      setUnlocked(true);
    }
    try {
      const savedOpt = localStorage.getItem(`va2_optimization:${reportId}`);
      if (savedOpt) setOptimization(JSON.parse(savedOpt) as OptimizationResult);
    } catch {
      localStorage.removeItem(`va2_optimization:${reportId}`);
    }
  }, [reportId]);

  // Persist per-report unlock state.
  useEffect(() => {
    localStorage.setItem(`va2_unlocked:${reportId}`, String(unlocked));
  }, [unlocked, reportId]);

  useEffect(() => {
    if (optimization) {
      localStorage.setItem(`va2_optimization:${reportId}`, JSON.stringify(optimization));
    }
  }, [optimization, reportId]);

  useEffect(() => {
    localStorage.setItem("va2_uses", String(usesLeft));
  }, [usesLeft]);

  const handleUnlock = (optim: OptimizationResult, _email: string) => {
    setOptimization(optim);
    setUnlocked(true);
    setUsesLeft((n) => Math.max(0, n - 1));
    setModal(null);
    setBanner(null);
  };

  const openEmailOrLimit = () => {
    if (usesLeft <= 0 && !unlocked) {
      setModal("limit");
    } else {
      setModal("email");
    }
  };

  // Navbar "home" sends the user back to landing for a fresh analysis.
  const goHome = () => router.push(`/${locale}/v2`);

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
              screen="report"
            />

            {banner && (
              <BannerOverlay
                banner={banner}
                tokens={tokens}
                onDismiss={() => setBanner(null)}
              />
            )}

            <Report
              tokens={tokens}
              unlocked={unlocked}
              usesLeft={usesLeft}
              submittedText={vacancyText}
              analysis={analysis}
              optimization={optimization}
              onOpenEmail={openEmailOrLimit}
              onOpenLimit={() => setModal("limit")}
              onOpenDemo={() => setModal("demo")}
            />

            <Footer tokens={tokens} />

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
