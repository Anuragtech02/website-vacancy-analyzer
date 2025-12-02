"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [vacancyText, setVacancyText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const router = useRouter();

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

      const data = await response.json();
      router.push(`/report/${data.reportId}`);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full space-y-12 text-center">
        
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Vacancy Analysis</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-foreground">
            Optimize your vacancy <br className="hidden sm:block" />
            <span className="text-primary">in seconds</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Get instant feedback on clarity, inclusivity, and attractiveness. 
            Attract the right talent with data-driven insights.
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-2xl mx-auto bg-card p-2 rounded-2xl shadow-xl border border-border/50 ring-1 ring-black/5">
          <textarea
            value={vacancyText}
            onChange={(e) => setVacancyText(e.target.value)}
            placeholder="Paste your vacancy text here..."
            className="w-full h-48 p-4 bg-transparent border-none resize-none focus:ring-0 text-foreground placeholder:text-muted-foreground/50 text-lg"
          />
          <div className="flex justify-between items-center px-4 pb-2">
            <span className="text-xs text-muted-foreground font-medium">
              {vacancyText.length} characters
            </span>
            <button
              onClick={handleAnalyze}
              disabled={!vacancyText.trim() || isAnalyzing}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              )}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
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

        {/* Features / Social Proof (Optional placeholder) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 border-t border-border/50">
          {[
            { label: "Instant Feedback", value: "< 30s" },
            { label: "Optimization Pillars", value: "4+" },
            { label: "Powered By", value: "Gemini AI" },
          ].map((stat, i) => (
            <div key={i} className="space-y-1">
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
