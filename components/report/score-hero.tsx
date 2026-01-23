"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Layout,
  MapPin,
  Share2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { PeelCTA } from "./peel-cta";

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
  jobType: string | null;
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
    label: "Uitstekend",
    description: "Je vacature presteert geweldig!",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
  good: {
    label: "Goed",
    description: "Je vacature is solide maar heeft ruimte voor verbetering.",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  needs_work: {
    label: "Verbetering nodig",
    description: "Je vacature heeft aandachtspunten.",
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
  },
  poor: {
    label: "Zwak",
    description: "Kritieke problemen gedetecteerd.",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
  },
};

export function ScoreHero({
  score,
  verdict,
  jobTitle,
  organization,
  jobType,
  executiveSummary,
  reportId,
  onUnlockClick,
  isUnlocked,
  issues = [],
}: ScoreHeroProps) {
  const config = verdictConfig[verdict];

  const getScoreColor = (s: number) => {
    if (s >= 8) return { stroke: "text-green-500", text: "text-green-600" };
    if (s >= 6) return { stroke: "text-amber-500", text: "text-amber-600" };
    return { stroke: "text-red-500", text: "text-red-600" };
  };

  const scoreColors = getScoreColor(score);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-8 gap-6 mb-8 items-stretch">
      {/* LEFT COLUMN: Job Title + Summary Explanation */}
      <Card variant="outlined" className="lg:col-span-5 overflow-hidden relative flex flex-col bg-white shadow-sm border border-slate-200">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <CardContent className="p-6 sm:p-8 relative flex flex-col gap-4">
           {/* Header */}
          <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                     <span className="px-2.5 py-1 bg-primary/10 rounded-md text-[10px] font-bold text-primary uppercase tracking-wider">
                       Analyse Rapport
                     </span>
                    <span className="text-[10px] text-slate-400 font-mono">#{reportId.slice(0, 8)}</span>
                 </div>
                 <Share2 className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                    {jobTitle}
                </h1>
                <div className="flex items-center gap-4 text-sm text-slate-500 font-medium">
                    {jobType && (
                        <span className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-slate-400" /> {jobType}
                        </span>
                    )}
                    {organization && (
                        <span className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                            <Layout className="w-4 h-4 text-slate-400" /> {organization}
                        </span>
                    )}
                </div>
              </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mt-2">
             {/* Donut Score Chart */}
             <div className="relative shrink-0 w-32 h-32 flex items-center justify-center">
                 {/* SVG Circle Background */}
                 <svg className="w-full h-full transform -rotate-90">
                     <circle
                         cx="64"
                         cy="64"
                         r="56"
                         stroke="currentColor"
                         strokeWidth="8"
                         fill="transparent"
                         className="text-slate-50"
                     />
                     <circle
                         cx="64"
                         cy="64"
                         r="56"
                         stroke="currentColor"
                         strokeWidth="8"
                         fill="transparent"
                         strokeDasharray={351.86} // 2 * pi * 56
                         strokeDashoffset={351.86 - (351.86 * score) / 10}
                         className={cn("transition-all duration-1000 ease-out", scoreColors.text)}
                         strokeLinecap="round"
                     />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                     <span className={cn("text-3xl font-black tracking-tighter leading-none", scoreColors.text)}>
                         {score.toFixed(1)}
                     </span>
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide mt-1">
                         Van de 10
                     </span>
                 </div>
             </div>

            {/* Verdict & Summary */}
            <div className="space-y-3 text-center sm:text-left">
                 <div className={cn("inline-flex items-center px-3 py-1 rounded-full text-xs font-bold", config.bgColor, config.textColor)}>
                    {config.label}
                 </div>
                 <p className="text-sm text-slate-600 leading-relaxed font-medium line-clamp-4">
                    {executiveSummary}
                 </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RIGHT COLUMN: Critical Issues */}
      <div className="lg:col-span-3 flex flex-col h-full">
         {!isUnlocked ? (
             <PeelCTA onUnlock={onUnlockClick} currentScore={score} />
         ) : (
             <Card variant="filled" className="h-full bg-red-50/50 border-red-100 flex flex-col">
                <div className="p-5 border-b border-red-100 flex items-center gap-2 bg-red-50">
                   <AlertCircle className="w-5 h-5 text-red-600" />
                   <h3 className="font-bold text-red-900 text-sm">Kritieke Punten</h3>
                   <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs font-bold text-red-600 border border-red-100">{issues.length}</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto max-h-[350px] space-y-3 custom-scrollbar">
                   {issues.length > 0 ? issues.slice(0, 5).map((issue, idx) => (
                      <div key={idx} className="bg-white p-4 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-all">
                         <h4 className="font-bold text-sm text-red-900 mb-2 leading-tight flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span> {issue.problem}
                         </h4>
                         <p className="text-xs text-slate-500 leading-relaxed pl-3.5 border-l-2 border-slate-100 ml-1">
                            {issue.why_it_matters}
                         </p>
                      </div>
                   )) : (
                     <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <CheckCircle2 className="w-12 h-12 text-green-400 mb-4" />
                        <p className="text-sm text-slate-600 font-bold">Uitstekend werk!</p>
                        <p className="text-xs text-slate-500">Geen kritieke problemen gedetecteerd.</p>
                     </div>
                   )}
                </div>
             </Card>
         )}
      </div>
    </div>
  );
}
