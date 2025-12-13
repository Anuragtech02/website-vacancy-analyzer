"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Layout,
  Users,
  Award,
  MessageSquare,
  Heart,
  Smartphone,
  Search,
  Brain,
  ChevronDown,
  ArrowRight,
  TrendingUp
} from "lucide-react";

interface PillarScore {
  score: number;
  diagnosis: string;
}

interface Pillars {
  structure_layout: PillarScore;
  persona_fit: PillarScore;
  evp_brand: PillarScore;
  tone_of_voice: PillarScore;
  inclusion_bias: PillarScore;
  mobile_experience: PillarScore;
  seo_findability: PillarScore;
  neuromarketing: PillarScore;
}

interface EstimatedScores {
  structure_layout: number;
  persona_fit: number;
  evp_brand: number;
  tone_of_voice: number;
  inclusion_bias: number;
  mobile_experience: number;
  seo_findability: number;
  neuromarketing: number;
  total_score: number;
  weighted_score: number;
}

interface PillarGridProps {
  pillars: Pillars;
  estimatedScores?: EstimatedScores;
  isUnlocked: boolean;
}

const pillarConfig: Record<string, { label: string; icon: typeof Layout; color: string; bgColor: string }> = {
  structure_layout: {
    label: "Structure & Layout",
    icon: Layout,
    color: "text-blue-600",
    bgColor: "bg-blue-50 group-hover:bg-blue-100",
  },
  persona_fit: {
    label: "Persona Fit",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50 group-hover:bg-purple-100",
  },
  evp_brand: {
    label: "EVP & Brand",
    icon: Award,
    color: "text-amber-600",
    bgColor: "bg-amber-50 group-hover:bg-amber-100",
  },
  tone_of_voice: {
    label: "Tone of Voice",
    icon: MessageSquare,
    color: "text-pink-600",
    bgColor: "bg-pink-50 group-hover:bg-pink-100",
  },
  inclusion_bias: {
    label: "Inclusion & Bias",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50 group-hover:bg-rose-100",
  },
  mobile_experience: {
    label: "Mobile Experience",
    icon: Smartphone,
    color: "text-teal-600",
    bgColor: "bg-teal-50 group-hover:bg-teal-100",
  },
  seo_findability: {
    label: "SEO Findability",
    icon: Search,
    color: "text-orange-600",
    bgColor: "bg-orange-50 group-hover:bg-orange-100",
  },
  neuromarketing: {
    label: "Neuromarketing",
    icon: Brain,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 group-hover:bg-indigo-100",
  },
};

function getScoreColor(score: number) {
  if (score >= 8) return { bg: "bg-green-500", text: "text-green-700", badge: "bg-green-100" };
  if (score >= 6) return { bg: "bg-yellow-500", text: "text-yellow-700", badge: "bg-yellow-100" };
  return { bg: "bg-red-500", text: "text-red-700", badge: "bg-red-100" };
}

function PillarCard({
  pillarKey,
  pillar,
  estimatedScore,
  isUnlocked,
}: {
  pillarKey: string;
  pillar: PillarScore;
  estimatedScore?: number;
  isUnlocked: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = pillarConfig[pillarKey];
  const scoreColors = getScoreColor(pillar.score);
  const estimatedColors = estimatedScore ? getScoreColor(estimatedScore) : null;
  const Icon = config.icon;

  const hasImprovement = isUnlocked && estimatedScore && estimatedScore > pillar.score;

  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200 p-4 transition-all duration-200 group cursor-pointer",
        "hover:shadow-md hover:border-slate-300"
      )}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg transition-colors", config.bgColor)}>
            <Icon className={cn("w-4 h-4", config.color)} />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{config.label}</span>
        </div>

        {/* Score badge(s) */}
        <div className="flex items-center gap-2">
          {hasImprovement ? (
            <>
              <span className={cn("text-sm font-bold px-2 py-0.5 rounded", scoreColors.badge, scoreColors.text)}>
                {pillar.score.toFixed(1)}
              </span>
              <ArrowRight className="w-3 h-3 text-green-500" />
              <span className={cn("text-sm font-bold px-2 py-0.5 rounded", estimatedColors?.badge, estimatedColors?.text)}>
                {estimatedScore?.toFixed(1)}
              </span>
              <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            </>
          ) : (
            <span className={cn("text-sm font-extrabold px-2 py-0.5 rounded", scoreColors.badge, scoreColors.text)}>
              {pillar.score.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
        <div
          className={cn("h-full rounded-full transition-all duration-500", scoreColors.bg)}
          style={{ width: `${pillar.score * 10}%` }}
        />
      </div>

      {/* Diagnosis - always show first line, expand for more */}
      <p className={cn(
        "text-xs text-slate-500 leading-relaxed transition-all duration-200",
        isExpanded ? "" : "line-clamp-2"
      )}>
        {pillar.diagnosis}
      </p>

      {/* Expand indicator */}
      {pillar.diagnosis.length > 100 && (
        <div className="flex items-center justify-center mt-2">
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      )}
    </div>
  );
}

export function PillarGrid({ pillars, estimatedScores, isUnlocked }: PillarGridProps) {
  const pillarEntries = Object.entries(pillars) as [keyof Pillars, PillarScore][];

  return (
    <section className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Score Breakdown</h2>
          <p className="text-sm text-slate-500">
            How your vacancy performs across 8 key areas
          </p>
        </div>
        {isUnlocked && estimatedScores && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              Improved scores shown
            </span>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillarEntries.map(([key, pillar]) => (
          <PillarCard
            key={key}
            pillarKey={key}
            pillar={pillar}
            estimatedScore={estimatedScores?.[key]}
            isUnlocked={isUnlocked}
          />
        ))}
      </div>
    </section>
  );
}
