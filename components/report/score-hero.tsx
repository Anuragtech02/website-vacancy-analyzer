"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Layout,
  MapPin,
  Clock,
  Share2,
  CheckCircle2,
  Mail,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface ScoreHeroProps {
  score: number;
  verdict: 'excellent' | 'good' | 'needs_work' | 'poor';
  jobTitle: string;
  organization: string | null;
  executiveSummary: string;
  reportId: string;
  onUnlockClick: () => void;
  isUnlocked: boolean;
  submittedEmail?: string;
  estimatedScore?: number;
}

const verdictConfig = {
  excellent: {
    label: "Excellent",
    description: "Your vacancy is performing great!",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
  good: {
    label: "Good",
    description: "Your vacancy is solid but has room for improvement.",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  needs_work: {
    label: "Needs Work",
    description: "Your vacancy has issues that may hurt your applicant conversion.",
    bgColor: "bg-yellow-50",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-200",
  },
  poor: {
    label: "Poor",
    description: "Your vacancy has critical issues that will significantly reduce applications.",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
};

export function ScoreHero({
  score,
  verdict,
  jobTitle,
  organization,
  executiveSummary,
  reportId,
  onUnlockClick,
  isUnlocked,
  submittedEmail,
  estimatedScore,
}: ScoreHeroProps) {
  const config = verdictConfig[verdict];

  const getScoreColor = (s: number) => {
    if (s >= 8) return { stroke: "text-green-500", text: "text-green-600", bg: "bg-green-500" };
    if (s >= 6) return { stroke: "text-yellow-500", text: "text-yellow-600", bg: "bg-yellow-500" };
    return { stroke: "text-red-500", text: "text-red-600", bg: "bg-red-500" };
  };

  const scoreColors = getScoreColor(score);

  return (
    <section className="mb-10">
      {/* Top badges row */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EEF2FF] text-[#4F46E5] text-xs font-bold uppercase tracking-wider border border-[#E0E7FF]">
          <Sparkles className="w-3.5 h-3.5" />
          Analysis Complete
        </div>
        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
          ID: {reportId.slice(0, 8)}
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-slate-700">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Main hero card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 lg:p-8">
          {/* Top row: Title + Meta */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-3">
                {jobTitle}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                {organization && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Layout className="w-4 h-4 text-slate-400" />
                    {organization}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  Remote / On-site
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Full-time
                </span>
              </div>
            </div>

            {/* Verdict badge - top right on desktop */}
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold shrink-0",
              config.bgColor,
              config.textColor,
              config.borderColor,
              "border"
            )}>
              {config.label}
            </div>
          </div>

          {/* Main content: Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-8">
            {/* Left side: Score + Summary */}
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Score Circle */}
              <div className="relative group cursor-default shrink-0">
                <div className="relative bg-slate-50 p-2 rounded-full">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r="56" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                      <circle
                        cx="64" cy="64" r="56"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={351.86}
                        strokeDashoffset={351.86 - (351.86 * score) / 10}
                        strokeLinecap="round"
                        className={cn(
                          "transition-all duration-1000 ease-out",
                          scoreColors.stroke
                        )}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={cn("text-2xl font-black tracking-tight", scoreColors.text)}>
                        {score.toFixed(1)}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                        / 10
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary text */}
              <div className="flex-1">
                <p className="text-slate-600 text-base leading-relaxed">
                  {executiveSummary || config.description}
                </p>
              </div>
            </div>

            {/* Right side: CTA Card or Success State */}
            <div className="lg:self-center">
              {isUnlocked ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-900">Check your inbox!</span>
                  </div>
                  {submittedEmail && (
                    <p className="text-sm text-green-700">{submittedEmail}</p>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-2xl p-5 text-white shadow-xl shadow-primary/20">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80">
                      AI Optimization
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">
                    Get the optimized version
                  </h3>
                  <p className="text-sm text-indigo-100 mb-4 leading-relaxed">
                    Our AI rewrites your vacancy for maximum clarity and conversion.
                  </p>
                  <button
                    type="button"
                    onClick={onUnlockClick}
                    className="w-full bg-white text-primary font-bold py-3 px-4 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 group"
                  >
                    Get It Free
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <div className="flex items-center justify-center gap-4 mt-4 text-xs text-indigo-200">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      Sent to email
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +40% applicants
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
