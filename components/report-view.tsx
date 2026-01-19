"use client";

import { useState, useEffect } from "react";
import { AnalysisResult, OptimizationResult } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowRight } from "lucide-react";

import { OptimizationResultView } from "@/components/report/optimization-result-view";

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

// Limit Reached Modal
function LimitReachedModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
       {/* Backdrop */}
       <div
         className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
         onClick={onClose}
       />
       {/* Modal */}
       <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-5 duration-300 text-center">
           <button
             onClick={onClose}
             className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
           >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>

           <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl">✨</span>
           </div>

           <h3 className="text-2xl font-black text-slate-900 mb-2">De smaak te pakken?</h3>
           <p className="text-slate-600 mb-8 leading-relaxed">
             Je hebt al twee gratis herschrijvingen gebruikt met Vacature Tovenaar. Vraag volledige toegang aan voor onbeperkt gebruik.
           </p>

           <div className="space-y-3">
             <Button
                className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 rounded-xl"
                onClick={() => window.open("https://meetings-eu1.hubspot.com/jknuvers", "_blank")}
             >
                Plan een Demo
             </Button>
             
             <Button
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-900"
                onClick={() => window.location.href = "mailto:joost@vacaturetovenaar.nl"}
             >
                Contacteer Ons
             </Button>
           </div>
       </div>
    </div>
  );
}

// Email capture modal component (unchanged most logic, just kept minimal for brevity in diff if unchanged)
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
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={status === 'loading' ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-[28px] shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 slide-in-from-bottom-5 duration-300">

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
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <Mail className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Waar mogen we het heen sturen?
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed max-w-[280px] mx-auto">
              We sturen je de geoptimaliseerde versie van deze vacature per e-mail.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
               <label className="text-xs font-bold uppercase text-slate-400 tracking-wider ml-1">Werk Email</label>
               <input
                 type="email"
                 required
                 value={email}
                 onChange={(e) => setEmail(e.target.value)}
                 placeholder="naam@bedrijf.nl"
                 className="w-full px-5 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium"
                 disabled={status === "loading"}
                 autoFocus
               />
            </div>
            <Button
              type="submit"
              className="w-full py-7 h-auto text-base font-bold rounded-xl shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all"
              disabled={status === "loading" || !email}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {loadingMessage}
                </>
              ) : (
                <>
                  Verstuur Mijn Geoptimaliseerde Vacature <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {status === "error" && (
            <p className="text-red-700 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">
              Er ging iets mis. Probeer het opnieuw.
            </p>
          )}

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium uppercase tracking-widest">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
             Geen Spam
             <div className="w-1 h-1 rounded-full bg-slate-300"></div>
             Veilig
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
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string>("");
  const [phase, setPhase] = useState<number>(1);

  const { summary, metadata, pillars } = analysis;

  useEffect(() => {
     // Determine User Phase from LocalStorage
     const count = parseInt(localStorage.getItem("vacancy_usage_count") || "0", 10);
     if (count > 2) setPhase(3);
     else if (count === 2) setPhase(2);
     else setPhase(1);
  }, []);

  const handleUnlockClick = () => {
      if (phase >= 3) {
          setShowLimitModal(true);
      } else {
          setShowModal(true);
      }
  };

  const handleUnlock = async (email: string) => {
    setStatus("loading");
    setSubmittedEmail(email);

    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reportId }),
      });

      const data = await response.json();

      if (data.isLocked) {
        setPhase(3);
        localStorage.setItem("vacancy_usage_count", "3"); // Force sync
        setShowLimitModal(true);
        setStatus("idle");
        setShowModal(false);
        return;
      }

      if (!data.success || !data.optimization) {
         throw new Error("Failed to optimize");
      }

      setOptimizationResult(data.optimization);
      setIsUnlocked(true);
      setStatus("success");
      setShowModal(false);
      
      // Update usage count in local storage
      const currentCount = parseInt(localStorage.getItem("vacancy_usage_count") || "0", 10);
      const newCount = currentCount + 1;
      localStorage.setItem("vacancy_usage_count", newCount.toString());
      
      // Update phase based on new count
      if (newCount >= 2) setPhase(2); // If 2nd, set Phase 2
      
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen pb-20 relative overflow-hidden selection:bg-primary/20">
      {/* Background Decorators */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Dot Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-70" />
        
        {/* Ambient Gradients - Aurora Effect */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-200/20 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full bg-blue-400/5 blur-[120px]" />

        {/* Side Decorations (Visible on wider screens) */}
        <div className="absolute left-10 top-0 bottom-0 w-px border-l border-dashed border-slate-300/50 hidden 2xl:block" />
        <div className="absolute right-10 top-0 bottom-0 w-px border-l border-dashed border-slate-300/50 hidden 2xl:block" />
        
        {/* Geometric Accents */}
        <div className="absolute top-40 left-6 hidden 2xl:block opacity-30 animate-pulse delay-700">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-400"><rect x="2" y="2" width="20" height="20" rx="6" strokeWidth="1.5" strokeDasharray="4 4" /></svg>
        </div>
        <div className="absolute bottom-40 right-6 hidden 2xl:block opacity-30 animate-pulse delay-1000">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-slate-400"><circle cx="12" cy="12" r="10" strokeWidth="1.5" strokeDasharray="4 4" /></svg>
        </div>
        <div className="absolute top-1/2 left-6 hidden 2xl:block opacity-20">
             <div className="h-32 w-0.5 bg-gradient-to-b from-transparent via-slate-400 to-transparent" />
        </div>
        <div className="absolute top-1/3 right-6 hidden 2xl:block opacity-20 transform rotate-45">
             <div className="h-8 w-8 border border-slate-400" />
        </div>
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        
        {/* Hero Section with Score and Critical Issues */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            <ScoreHero
            score={summary.total_score}
            verdict={summary.verdict}
            jobTitle={metadata?.job_title || "Vacancy Analysis"}
            organization={metadata?.organization || null}
            jobType={metadata?.job_type || null}
            executiveSummary={summary.executive_summary}
            reportId={reportId}
            onUnlockClick={handleUnlockClick}
            isUnlocked={isUnlocked}
            submittedEmail={submittedEmail}
            issues={summary.key_issues || []}
            />
        </div>

        {/* Display Optimization Result if Unlocked */}
        {isUnlocked && optimizationResult && (
             <OptimizationResultView 
                result={optimizationResult} 
                email={submittedEmail}
                phase={phase}
             />
        )}

        {/* Pillar Scores Grid */}
        <PillarGrid
          pillars={pillars}
          estimatedScores={optimizationResult?.estimated_scores}
          isUnlocked={isUnlocked}
        />

        {/* Trust Bar */}
        <div className="mb-12">
             <TrustBar variant="full" />
        </div>

        {/* Original Text (Collapsible) */}
        <OriginalTextCollapsible vacancyText={vacancyText} />

        {/* Disclaimer */}
        <div className="mb-20 p-6 rounded-xl text-xs text-muted-foreground leading-relaxed text-center max-w-2xl mx-auto">
          Disclaimer: Deze analyse is gegenereerd door software. Hoewel we streven naar nauwkeurigheid, raden we aan alle suggesties in context te beoordelen.
        </div>
      </div>

      {/* Sticky CTA Banner */}
      <StickyCTABanner
        onUnlockClick={handleUnlockClick}
        isUnlocked={isUnlocked}
        phase={phase}
      />

      {/* Email Modal */}
      <EmailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleUnlock}
        status={status}
      />

       {/* Limit Reached Modal */}
       <LimitReachedModal 
         isOpen={showLimitModal}
         onClose={() => setShowLimitModal(false)}
       />
    </div>
  );
}
