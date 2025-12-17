"use client";

import { useState, useEffect } from "react";
import { AnalysisResult, OptimizationResult } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowRight } from "lucide-react";

const OPTIMIZATION_MESSAGES = [
  "Verwijderen bureaucratische termen...",
  "Toevoegen psychologische veiligheid...",
  "Optimaliseren voor conversie...",
  "Herschrijven in warme toon...",
  "Versterken van EVP elementen...",
  "Toepassen Human AI Protocol...",
  "Genereren PDF document...",
  "Versturen naar je inbox...",
];

import { ScoreHero } from "@/components/report/score-hero";
import { PillarGrid } from "@/components/report/pillar-grid";
import { OriginalTextCollapsible } from "@/components/report/original-text-collapsible";
import { TrustBar } from "@/components/report/trust-bar";
import { StickyCTABanner } from "@/components/report/sticky-cta-banner";

interface ReportViewProps {
  analysis: AnalysisResult;
  vacancyText: string;
  reportId: string;
}

// Email capture modal component
function EmailModal({
  isOpen,
  onClose,
  onSubmit,
  status,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  status: "idle" | "loading" | "success" | "error";
}) {
  const [email, setEmail] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(OPTIMIZATION_MESSAGES[0]);

  // Cycle through loading messages when loading
  useEffect(() => {
    if (status !== "loading") {
      setLoadingMessage(OPTIMIZATION_MESSAGES[0]);
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % OPTIMIZATION_MESSAGES.length;
      setLoadingMessage(OPTIMIZATION_MESSAGES[index]);
    }, 2500);

    return () => clearInterval(interval);
  }, [status]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onSubmit(email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0F172A]/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={status === 'loading' ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl border border-white/20 p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-5 duration-300">

        {/* Close Button */}
        <button
           type="button"
           onClick={onClose}
           className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
           disabled={status === 'loading'}
           aria-label="Close modal"
           title="Close"
        >
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="space-y-6">
          <div className="text-center space-y-2 pt-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Where should we send it?
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto">
              We'll email you the fully optimized version of this vacancy.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
               <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Work Email</label>
               <input
                 type="email"
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="name@company.com"
                 className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium"
                 disabled={status === "loading"}
                 autoFocus
               />
            </div>
            <Button
              type="submit"
              className="w-full py-7 h-auto text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xl shadow-blue-600/20 active:scale-[0.98] transition-all"
              disabled={status === "loading" || !email}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {loadingMessage}
                </>
              ) : (
                <>
                  Send My Optimized Vacancy <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {status === "error" && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">
              Something went wrong. Please try again.
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
             No Spam
             <div className="w-1 h-1 rounded-full bg-slate-300"></div>
             Secure
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Report View Component
export function ReportView({
  analysis,
  vacancyText,
  reportId,
}: ReportViewProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const { summary, metadata, pillars } = analysis;

  const handleUnlock = async (email: string) => {
    setStatus("loading");
    setSubmittedEmail(email);

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reportId }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      const data = (await response.json()) as {
        optimization: OptimizationResult;
      };
      setOptimizationResult(data.optimization);
      setIsUnlocked(true);
      setStatus("success");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="font-sans text-slate-900">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8">
        {/* Hero Section with Score and Critical Issues */}
        <ScoreHero
          score={summary.total_score}
          verdict={summary.verdict}
          jobTitle={metadata?.job_title || "Vacancy Analysis"}
          organization={metadata?.organization || null}
          executiveSummary={summary.executive_summary}
          reportId={reportId}
          onUnlockClick={() => setShowModal(true)}
          isUnlocked={isUnlocked}
          submittedEmail={submittedEmail}
          issues={summary.key_issues || []}
        />

        {/* Pillar Scores Grid */}
        <PillarGrid
          pillars={pillars}
          estimatedScores={optimizationResult?.estimated_scores}
          isUnlocked={isUnlocked}
        />

        {/* Trust Bar */}
        <TrustBar variant="full" />

        {/* Original Text (Collapsible) */}
        <OriginalTextCollapsible vacancyText={vacancyText} />

        {/* Disclaimer */}
        <div className="mb-20 p-6 bg-slate-100 rounded-xl text-xs text-slate-500 leading-relaxed text-center max-w-2xl mx-auto">
          Disclaimer: This analysis is generated by AI. While we strive for accuracy, please review all suggestions contextually.
        </div>
      </div>

      {/* Sticky CTA Banner */}
      <StickyCTABanner
        onUnlockClick={() => setShowModal(true)}
        isUnlocked={isUnlocked}
      />

      {/* Email Modal */}
      <EmailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleUnlock}
        status={status}
      />
    </div>
  );
}
