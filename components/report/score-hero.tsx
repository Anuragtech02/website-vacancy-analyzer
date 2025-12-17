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
  AlertCircle,
  XCircle,
} from "lucide-react";

interface Issue {
  problem: string;
  why_it_matters: string;
  how_to_improve: string;
}

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
  issues?: Issue[];
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
  issues = [],
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

      {/* Three-column layout: Hero (50%) + Issues (30%) + CTA (20%) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.6fr_280px] gap-4">
        {/* Main hero card - 50% */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 lg:p-6">
            {/* Top row: Title + Meta */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
                  {jobTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  {organization && (
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                      <Layout className="w-3.5 h-3.5 text-slate-400" />
                      {organization}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    Remote / On-site
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Full-time
                  </span>
                </div>
              </div>

              {/* Verdict badge */}
              <div className={cn(
                "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold shrink-0",
                config.bgColor,
                config.textColor,
                config.borderColor,
                "border"
              )}>
                {config.label}
              </div>
            </div>

            {/* Score + Summary */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Score Circle */}
              <div className="relative group cursor-default shrink-0">
                <div className="relative bg-slate-50 p-1.5 rounded-full">
                  <div className="relative w-20 h-20 flex items-center justify-center">
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
                      <span className={cn("text-xl font-black tracking-tight", scoreColors.text)}>
                        {score.toFixed(1)}
                      </span>
                      <span className="text-[7px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                        / 10
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary text */}
              <div className="flex-1">
                <p className="text-slate-600 text-sm leading-relaxed">
                  {executiveSummary || config.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Issues - 30% */}
        {issues.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-red-50/50">
              <div className="p-1.5 bg-red-100 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Critical Issues</h2>
                <p className="text-[11px] text-slate-500">
                  {issues.length} issue{issues.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            {/* Scrollable issues list */}
            <div className="flex-1 overflow-y-auto max-h-[200px] p-3 space-y-2">
              {issues.map((issue, index) => (
                <div
                  key={index}
                  className="bg-red-50 rounded-lg p-3 border border-red-100"
                >
                  <div className="flex gap-2">
                    <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-900 text-sm mb-1 leading-tight">
                        {issue.problem}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {issue.why_it_matters}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA Card - Fixed width, full height */}
        <div>
          {isUnlocked ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center h-full flex flex-col items-center justify-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-900 text-sm">Check your inbox!</span>
              </div>
              {submittedEmail && (
                <p className="text-xs text-green-700">{submittedEmail}</p>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-2xl p-4 text-white shadow-xl shadow-primary/20 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                  AI Optimization
                </span>
              </div>
              <h3 className="font-bold text-base mb-1.5">
                Get the optimized version
              </h3>
              <p className="text-xs text-indigo-100 mb-3 leading-relaxed flex-1">
                Our AI rewrites your vacancy for maximum clarity and conversion.
              </p>
              <button
                type="button"
                onClick={onUnlockClick}
                className="w-full bg-white text-primary font-bold py-2.5 px-3 rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2 group text-sm"
              >
                Get It Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-indigo-200">
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
    </section>
  );
}
