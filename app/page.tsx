"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const LOADING_MESSAGES = [
  "Scanning for bias...",
  "Checking tone of voice...",
  "Analyzing readability...",
  "Evaluating structure...",
  "Checking mobile experience...",
  "Analyzing SEO findability...",
];

export default function Home() {
  const [vacancyText, setVacancyText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const router = useRouter();

  // Cycle through loading messages
  useEffect(() => {
    if (!isAnalyzing) return;

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % LOADING_MESSAGES.length;
      setLoadingMessage(LOADING_MESSAGES[index]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const handleAnalyze = async () => {
    if (!vacancyText.trim()) return;

    setIsAnalyzing(true);
    setLoadingMessage(LOADING_MESSAGES[0]);

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

                {/* Floating Elements (Graphics) */}
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
                                disabled={isAnalyzing}
                            />
                        </div>

                        <div className="flex items-center justify-between gap-4">
                            <div className="text-xs text-muted-foreground font-medium pl-1">
                                {vacancyText.length > 0 ? `${vacancyText.length} chars` : 'Ready to analyze'}
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={!vacancyText.trim() || isAnalyzing}
                                className={cn(
                                    "flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 active:translate-y-0",
                                    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/25",
                                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                                )}
                            >
                                {isAnalyzing ? (
                                    <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {loadingMessage}
                                    </>
                                ) : (
                                    <>
                                    Analyze for Free
                                    <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
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
