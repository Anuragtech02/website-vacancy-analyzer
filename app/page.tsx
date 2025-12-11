"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
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
    }, 800);

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
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Header / Top Bar */}
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-foreground">
                Vacature Tovenaar
              </h1>
              <p className="text-xs text-muted-foreground">
                The #1 Recruitment Software
              </p>
            </div>
          </div>
          <a
            href="https://vacaturetovenaar.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Visit Main Site →
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="max-w-4xl w-full space-y-8 text-center">
          {/* Hero Section */}
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Powered by Vacature Tovenaar</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
              Analyze & optimize your vacancy <br className="hidden sm:block" />
              <span className="text-primary">in seconds</span>
            </h2>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get instant AI feedback on clarity, inclusivity, and
              attractiveness. Attract the right talent with data-driven
              insights.
            </p>
          </div>

          {/* Input Section */}
          <div className="w-full max-w-3xl mx-auto">
            <div className="bg-card p-2 rounded-2xl shadow-xl border border-border/50 ring-1 ring-black/5">
              <textarea
                value={vacancyText}
                onChange={(e) => setVacancyText(e.target.value)}
                placeholder="Paste your full vacancy text here (including job title, introduction, and 'about us') for the best analysis score."
                className="w-full h-72 p-5 bg-transparent border-none resize-none focus:ring-0 text-foreground placeholder:text-muted-foreground/60 text-base leading-relaxed"
                style={{ whiteSpace: "pre-wrap" }}
                disabled={isAnalyzing}
              />
              <div className="flex justify-between items-center px-4 pb-3 pt-2 border-t border-border/30">
                <span className="text-xs text-muted-foreground font-medium">
                  {vacancyText.length} characters
                </span>
                <button
                  onClick={handleAnalyze}
                  disabled={!vacancyText.trim() || isAnalyzing}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {loadingMessage}
                    </>
                  ) : (
                    <>
                      Analyze Vacancy
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Social Proof - Below Button */}
            <p className="mt-4 text-sm text-muted-foreground">
              Over{" "}
              <span className="font-semibold text-foreground">
                1,500 vacancies
              </span>{" "}
              already optimized
            </p>
          </div>

          {/* Why Checklist */}
          <div className="w-full max-w-2xl mx-auto pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-4">
              For the best analysis, include:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Introduction
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For a Tone-of-Voice check
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Benefits & Conditions
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For a Competitive Analysis
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    'About Us' Section
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For a Culture Fit check
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Vacature Tovenaar. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
