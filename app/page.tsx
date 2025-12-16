"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, CheckCircle2, Lock, Search, MessageSquare, FileText, Layout, Smartphone, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ANALYSIS_STEPS = [
  { id: 1, label: "Scanning for bias", icon: Search, duration: 2000 },
  { id: 2, label: "Checking tone of voice", icon: MessageSquare, duration: 2500 },
  { id: 3, label: "Analyzing readability", icon: FileText, duration: 2000 },
  { id: 4, label: "Evaluating structure", icon: Layout, duration: 1500 },
  { id: 5, label: "Checking mobile experience", icon: Smartphone, duration: 1500 },
  { id: 6, label: "Analyzing SEO findability", icon: Globe, duration: 2000 },
];

export default function Home() {
  const [vacancyText, setVacancyText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const router = useRouter();

  // Animate through steps when analyzing
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    let stepIndex = 0;

    const runStep = () => {
      if (stepIndex >= ANALYSIS_STEPS.length) return;

      setCurrentStep(stepIndex + 1);

      const timeout = setTimeout(() => {
        setCompletedSteps(prev => [...prev, stepIndex + 1]);
        stepIndex++;
        if (stepIndex < ANALYSIS_STEPS.length) {
          runStep();
        }
      }, ANALYSIS_STEPS[stepIndex].duration);

      return timeout;
    };

    const timeout = runStep();
    return () => { if (timeout) clearTimeout(timeout); };
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!vacancyText.trim()) return;

    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vacancyText }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = (await response.json()) as { reportId: string };
      router.push(`/report/${data.reportId}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex flex-col">
      {/* Header / Top Bar */}
      <header className="w-full fixed top-0 z-50 bg-[#F8FAFC]/80 backdrop-blur-md border-b border-border/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-foreground tracking-tight">
                Vacancy Analyser
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a
               href="https://vacaturetovenaar.nl"
               className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
             >
               Visit Main Site
             </a>
            <a
              href="#analyze"
              className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all shadow-md shadow-primary/25"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {/* Main Hero Content */}
      <div className="flex-1 flex flex-col pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center mb-12">
            {/* Left Column: Copy */}
            <div className="space-y-8 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-medium text-xs uppercase tracking-wide">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Powered by Vacature Tovenaar</span>
                </div>

                <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1]">
                    Write job ads that <br/>
                    <span className="text-primary relative inline-block">
                        actually convert.
                        <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                        </svg>
                    </span>
                </h2>

                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                    Stop guessing. Our AI analyzes your vacancy for bias, clarity, and conversion aimed at top talent.
                </p>

                <div className="flex flex-col gap-4 pt-2">
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                         <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-foreground/80 font-medium">Remove unconscious bias instantly</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                         <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-foreground/80 font-medium">Boost SEO visibility & findability</span>
                   </div>
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                         <CheckCircle2 className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-foreground/80 font-medium">Increase applicant conversion by 30%</span>
                   </div>
                </div>
            </div>

            {/* Right Column: Interactive Card */}
            <div className="relative">
                {/* Decorative blobs */}
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                {!isAnalyzing ? (
                  <>
                    {/* Floating Elements (Graphics) - Only show when not analyzing */}
                    <div className="absolute -right-8 top-12 bg-white p-3 rounded-xl shadow-xl border border-border/40 animate-bounce duration-[3000ms] hidden lg:block z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs font-bold text-foreground">Inclusive?</span>
                        </div>
                    </div>
                    <div className="absolute -left-8 bottom-24 bg-white p-3 rounded-xl shadow-xl border border-border/40 animate-pulse hidden lg:block z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-primary">A+</span>
                            </div>
                            <span className="text-xs font-bold text-foreground">Score: 9.8</span>
                        </div>
                    </div>

                    {/* Input Card */}
                    <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                        {/* Fake Browser Header */}
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="text-xs font-medium text-muted-foreground/60 flex items-center gap-2">
                                <Lock className="w-3 h-3" />
                                Analyse Vacature
                            </div>
                        </div>

                        <div className="p-6 sm:p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground ml-1">Paste your vacancy text</label>
                                <textarea
                                    value={vacancyText}
                                    onChange={(e) => setVacancyText(e.target.value)}
                                    placeholder="E.g. We are looking for a Marketing Manager who..."
                                    className="w-full h-64 p-4 bg-slate-50 rounded-xl border border-slate-200 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base leading-relaxed placeholder:text-muted-foreground/50"
                                    style={{ whiteSpace: "pre-wrap" }}
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="text-xs text-muted-foreground font-medium pl-1">
                                    {vacancyText.length > 0 ? `${vacancyText.length} chars` : 'Ready to analyze'}
                                </div>
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!vacancyText.trim()}
                                    className={cn(
                                        "flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0",
                                        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/25",
                                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                                    )}
                                >
                                    Analyze for Free
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                  </>
                ) : (
                  /* Analysis Progress Card */
                  <div className="relative bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary to-indigo-600">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">Analyzing Your Vacancy</h3>
                          <p className="text-xs text-white/70">This usually takes 10-15 seconds</p>
                        </div>
                      </div>
                    </div>

                    {/* Steps List */}
                    <div className="p-6 sm:p-8 space-y-4">
                      {ANALYSIS_STEPS.map((step) => {
                        const StepIcon = step.icon;
                        const isCompleted = completedSteps.includes(step.id);
                        const isActive = currentStep === step.id && !isCompleted;
                        const isPending = step.id > currentStep;

                        return (
                          <div
                            key={step.id}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                              isCompleted && "bg-green-50 border border-green-100",
                              isActive && "bg-primary/5 border border-primary/20 scale-[1.02]",
                              isPending && "bg-slate-50 border border-transparent opacity-50"
                            )}
                          >
                            {/* Icon */}
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0",
                              isCompleted && "bg-green-500 text-white",
                              isActive && "bg-primary text-white",
                              isPending && "bg-slate-200 text-slate-400"
                            )}>
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5" />
                              ) : isActive ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <StepIcon className="w-5 h-5" />
                              )}
                            </div>

                            {/* Label */}
                            <div className="flex-1">
                              <span className={cn(
                                "font-medium transition-colors duration-300",
                                isCompleted && "text-green-700",
                                isActive && "text-primary font-semibold",
                                isPending && "text-slate-400"
                              )}>
                                {step.label}
                              </span>
                              {isActive && (
                                <div className="mt-1.5 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                                  <div className="h-full bg-primary rounded-full animate-progress" style={{ animationDuration: `${step.duration}ms` }} />
                                </div>
                              )}
                            </div>

                            {/* Status badge */}
                            {isCompleted && (
                              <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                Done
                              </span>
                            )}
                            {isActive && (
                              <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full animate-pulse">
                                In progress
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Completion message */}
                      {completedSteps.length === ANALYSIS_STEPS.length && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 animate-in fade-in duration-300">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-green-800">Analysis Complete!</p>
                              <p className="text-sm text-green-600">Redirecting to your report...</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
        </div>

        {/* Social Proof Strip */}
        <div className="w-full border-t border-border/40 pt-10 mt-12 mb-8">
             <p className="text-center text-sm font-medium text-muted-foreground mb-6 uppercase tracking-widest opacity-70">
                Trusted by
             </p>
             <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-3">
                    {/* Rijkswaterstaat Logo Representation */}
                    <div className="w-10 h-10 bg-[#003366] rounded-sm flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white transform rotate-45"></div>
                    </div>
                    <span className="text-xl font-bold text-[#003366] tracking-tight">Rijkswaterstaat</span>
                </div>
             </div>
        </div>
      </div>

    </main>
  );
}
