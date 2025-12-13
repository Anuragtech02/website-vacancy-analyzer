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
  Target
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

          {/* Main content grid: Score + Summary + CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-[140px_1fr_auto] gap-6 lg:gap-8 items-center">
            {/* Score Circle */}
            <div className="relative group cursor-default justify-self-start">
              <div className="relative bg-slate-50 p-2 rounded-full">
                <div className="relative w-28 h-28 flex items-center justify-center">
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
                    <span className={cn("text-3xl font-black tracking-tight", scoreColors.text)}>
                      {score.toFixed(1)}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                      / 10
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary text */}
            <div className="text-left">
              <p className="text-slate-600 text-base lg:text-lg leading-relaxed">
                {executiveSummary || config.description}
              </p>
            </div>

            {/* CTA or Success State */}
            <div className="justify-self-start lg:justify-self-end">
              {isUnlocked ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-900">Check your inbox!</span>
                  </div>
                  {submittedEmail && (
                    <p className="text-sm text-green-700">{submittedEmail}</p>
                  )}
                </div>
              ) : (
                <Button
                  onClick={onUnlockClick}
                  size="lg"
                  className="h-12 px-6 text-base font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 group whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get 10/10 Version
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
        {!isUnlocked && (
          <div className="bg-slate-50 border-t border-slate-100 px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center justify-start gap-4 lg:gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Target className="w-4 h-4 text-primary" />
                <span>Potential score: <strong className="text-green-600">9.5+</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Est. <strong>+40%</strong> more applicants</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-slate-500">
                <Sparkles className="w-4 h-4" />
                <span>AI-powered optimization</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
