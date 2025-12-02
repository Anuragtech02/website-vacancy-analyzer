"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface OptimizationCTAProps {
  reportId: string;
}

import type { OptimizationResult } from "@/lib/gemini";

// ...

export function OptimizationCTA({ reportId }: OptimizationCTAProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reportId }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      const data = await response.json();
      setResult(data.optimization);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (status === "success" && result) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-green-900">Optimization Complete!</h3>
          <p className="text-green-700">
            Here is your optimized vacancy. We've also sent a copy to <strong>{email}</strong>.
          </p>
        </div>

        <div className="bg-card rounded-3xl p-8 sm:p-12 shadow-xl border border-border/50 space-y-8">
          <div className="space-y-4">
             <h2 className="text-2xl font-bold">Optimized Vacancy</h2>
             <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-muted/50 p-4 rounded-xl">
                  <span className="block text-muted-foreground mb-1">New Structure Score</span>
                  <span className="text-2xl font-bold text-primary">{result.estimated_scores.structure_layout}/10</span>
                </div>
                <div className="bg-muted/50 p-4 rounded-xl">
                  <span className="block text-muted-foreground mb-1">New Total Score</span>
                  <span className="text-2xl font-bold text-primary">{result.estimated_scores.total_score}/10</span>
                </div>
             </div>
          </div>

          <div className="prose prose-lg max-w-none dark:prose-invert bg-muted/30 p-6 rounded-xl border border-border/50">
            <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed">
              {result.full_text_markdown}
            </pre>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Key Improvements</h3>
            <ul className="space-y-3">
              {result.changes.improvements.map((imp, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <Check className="w-5 h-5 text-green-500 shrink-0" />
                  <span>
                    <strong className="font-medium text-foreground">{imp.pillar}:</strong> {imp.change}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary text-secondary-foreground rounded-2xl p-8 sm:p-12 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
      
      <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary font-medium text-sm">
            <Lock className="w-4 h-4" />
            <span>Unlock Full Optimization</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold">
            Want to improve your score?
          </h2>
          <p className="text-lg text-secondary-foreground/80">
            Let our AI rewrite your vacancy to maximize clarity, inclusivity, and conversion. 
            Enter your email to receive the optimized version.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your work email"
            className="flex-1 px-6 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Optimize
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
        
        {status === "error" && (
          <p className="text-red-400 text-sm">Something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  );
}
