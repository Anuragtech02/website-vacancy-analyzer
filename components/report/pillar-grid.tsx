"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
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

const pillarConfig: Record<string, { label: string; icon: typeof Layout; color: string; bgColor: string; watermark: string; gradient: string }> = {
  structure_layout: {
    label: "Structuur & Opmaak",
    icon: Layout,
    color: "text-blue-600",
    bgColor: "bg-blue-50 group-hover:bg-blue-100",
    watermark: "text-blue-500",
    gradient: "from-blue-50/40 via-white to-white",
  },
  persona_fit: {
    label: "Doelgroep Match",
    icon: Users,
    color: "text-purple-600",
    bgColor: "bg-purple-50 group-hover:bg-purple-100",
    watermark: "text-purple-500",
    gradient: "from-purple-50/40 via-white to-white",
  },
  evp_brand: {
    label: "EVP & Merk",
    icon: Award,
    color: "text-amber-600",
    bgColor: "bg-amber-50 group-hover:bg-amber-100",
    watermark: "text-amber-500",
    gradient: "from-amber-50/40 via-white to-white",
  },
  tone_of_voice: {
    label: "Tone of Voice",
    icon: MessageSquare,
    color: "text-pink-600",
    bgColor: "bg-pink-50 group-hover:bg-pink-100",
    watermark: "text-pink-500",
    gradient: "from-pink-50/40 via-white to-white",
  },
  inclusion_bias: {
    label: "Inclusie & Bias",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50 group-hover:bg-rose-100",
    watermark: "text-rose-500",
    gradient: "from-rose-50/40 via-white to-white",
  },
  mobile_experience: {
    label: "Mobiele Ervaring",
    icon: Smartphone,
    color: "text-teal-600",
    bgColor: "bg-teal-50 group-hover:bg-teal-100",
    watermark: "text-teal-500",
    gradient: "from-teal-50/40 via-white to-white",
  },
  seo_findability: {
    label: "SEO Vindbaarheid",
    icon: Search,
    color: "text-orange-600",
    bgColor: "bg-orange-50 group-hover:bg-orange-100",
    watermark: "text-orange-500",
    gradient: "from-orange-50/40 via-white to-white",
  },
  neuromarketing: {
    label: "Neuromarketing",
    icon: Brain,
    color: "text-violet-600",
    bgColor: "bg-violet-50 group-hover:bg-violet-100",
    watermark: "text-violet-500",
    gradient: "from-violet-50/40 via-white to-white",
  },
};

function getScoreColor(score: number) {
  if (score >= 8) return { bg: "bg-green-500", text: "text-green-700", badge: "bg-green-100" };
  if (score >= 6) return { bg: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-100" };
  return { bg: "bg-red-500", text: "text-red-700", badge: "bg-red-100" };
}

const getBentoSpan = (index: number) => {
  // Config for 8 items in a 4-column grid (Desktop)
  // Row 1: [2] [1] [1]
  // Row 2: [1] [1] [2]
  // Row 3: [2] [2]
  const spans = [
    "lg:col-span-2", // 0: Structure
    "lg:col-span-1", // 1: Persona
    "lg:col-span-1", // 2: EVP
    "lg:col-span-1", // 3: Tone
    "lg:col-span-1", // 4: Inclusion
    "lg:col-span-2", // 5: Mobile
    "lg:col-span-2", // 6: SEO
    "lg:col-span-2", // 7: Neuro
  ];
  return spans[index] || "lg:col-span-1";
};

function PillarCard({
  pillarKey,
  pillar,
  estimatedScore,
  isUnlocked,
  index,
  className
}: {
  pillarKey: string;
  pillar: PillarScore;
  estimatedScore?: number;
  isUnlocked: boolean;
  index: number;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = pillarConfig[pillarKey];
  const scoreColors = getScoreColor(pillar.score);
  const estimatedColors = estimatedScore ? getScoreColor(estimatedScore) : null;
  const Icon = config.icon;

  const hasImprovement = isUnlocked && estimatedScore && estimatedScore > pillar.score;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={className}
    >
      <Card
        variant="outlined"
        className={cn(
          "h-full p-4 sm:p-5 relative overflow-hidden bg-gradient-to-br transition-all duration-300",
          config.gradient
        )}
      >
        {/* Decorative Watermark Icon */}
        <Icon className={cn("absolute -bottom-8 -right-8 w-32 h-32 opacity-[0.03] transform -rotate-12 pointer-events-none", config.watermark)} />

        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2.5 rounded-xl transition-colors", config.bgColor)}>
              <Icon className={cn("w-5 h-5", config.color)} />
            </div>
            <span className="font-bold text-slate-800 text-sm">{config.label}</span>
          </div>

          {/* Score badge(s) */}
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-extrabold px-2.5 py-1 rounded-lg", scoreColors.badge, scoreColors.text)}>
              {pillar.score.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
          <motion.div
            className={cn("h-full rounded-full", scoreColors.bg)}
            initial={{ width: 0 }}
            animate={{ width: `${pillar.score * 10}%` }}
            transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
          />
        </div>

        {/* Diagnosis */}
        <div className="relative">
             <p className="text-sm text-slate-600 leading-relaxed">
               {pillar.diagnosis}
             </p>
        </div>
      </Card>
    </motion.div>
  );
}

export function PillarGrid({ pillars, estimatedScores, isUnlocked }: PillarGridProps) {
  const pillarEntries = Object.entries(pillars) as [keyof Pillars, PillarScore][];

  return (
    <section className="mb-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Score Verdeling</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gedetailleerde analyse van 8 belangrijke onderdelen
          </p>
        </div>
      </div>

      {/* Bento-like Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 auto-rows-fr">
        {pillarEntries.map(([key, pillar], idx) => (
          <PillarCard
            key={key}
            pillarKey={key}
            pillar={pillar}
            estimatedScore={estimatedScores?.[key]}
            isUnlocked={isUnlocked}
            index={idx}
            className={getBentoSpan(idx)}
          />
        ))}
      </div>
    </section>
  );
}
