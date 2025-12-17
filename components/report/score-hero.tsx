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
    bgColor: "bg-green-100",
    textColor: "text-green-800",
  },
  good: {
    label: "Good",
    description: "Your vacancy is solid but has room for improvement.",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
  },
  needs_work: {
    label: "Needs Work",
    description: "Your vacancy has issues.",
    bgColor: "bg-amber-100",
    textColor: "text-amber-800",
  },
  poor: {
    label: "Poor",
    description: "Critical issues detected.",
    bgColor: "bg-red-100",
    textColor: "text-red-800",
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
    <div className="grid grid-cols-1 lg:grid-cols-8 gap-6 mb-8">
      {/* LEFT: Main Score Card (5/8 Columns = 62.5%) */}
      <Card variant="outlined" className="lg:col-span-5 overflow-hidden relative flex flex-col h-full">
         {/* Note: I'm keeping 'border-none shadow-sm' in className? No, I should REMOVE them if I want standard 'outlined'. 
             However, the user wants "M3 Expressive". M3 Outlined has a border.
             If I leave `border-none`, it overrides the variant. 
             If I leave `shadow-sm`, it adds a shadow.
             The user specifically said "Don't use elevated... some have border some have shadows".
          */}
         {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none" />

        <CardContent className="p-4 sm:p-8 relative flex-1 flex flex-col justify-between gap-6">
           {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider">
                  Analysis Report
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">#{reportId.slice(0, 8)}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mb-1 leading-tight">
                {jobTitle}
              </h1>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
                {organization && (
                  <span className="flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5" /> {organization}
                  </span>
                )}
                 <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> Remote / On-site
                  </span>
              </div>
            </div>
            
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
               <Share2 className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
            {/* Circular Score */}
            <div className="shrink-0">
               <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="currentColor" strokeWidth="8" className="text-secondary/10" fill="none" />
                    <motion.circle 
                      cx="56" cy="56" r="48" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      fill="none"
                      strokeLinecap="round"
                      className={scoreColors.stroke}
                      initial={{ strokeDasharray: 301, strokeDashoffset: 301 }}
                      animate={{ strokeDashoffset: 301 - (301 * score) / 10 }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={cn("text-3xl font-black tracking-tighter", scoreColors.text)}>
                       {score.toFixed(1)}
                    </span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">out of 10</span>
                  </div>
               </div>
            </div>

            {/* Verdict */}
            <div className="text-center sm:text-left">
               <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-2", config.bgColor, config.textColor)}>
                  {config.label}
               </div>
               <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium line-clamp-3">
                  {executiveSummary || config.description}
               </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RIGHT: Layout depends on Unlocked State (3/8 Columns) */}
      <div className="lg:col-span-3 h-full min-h-[300px]">
         {!isUnlocked ? (
             <PeelCTA onUnlock={onUnlockClick} currentScore={score} />
         ) : (
             <Card variant="filled" className="h-full bg-red-50/50 border-red-100 flex flex-col">
                <div className="p-5 border-b border-red-100 flex items-center gap-2 bg-red-50">
                   <AlertCircle className="w-5 h-5 text-red-600" />
                   <h3 className="font-bold text-red-900 text-sm">Critical Issues</h3>
                   <span className="ml-auto bg-white px-2 py-0.5 rounded-full text-xs font-bold text-red-600 border border-red-100">{issues.length}</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto max-h-[300px] space-y-3">
                   {issues.length > 0 ? issues.slice(0, 3).map((issue, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-xl border border-red-100 shadow-sm">
                         <h4 className="font-bold text-sm text-red-900 mb-1 leading-tight">{issue.problem}</h4>
                         <p className="text-xs text-slate-500 line-clamp-2 mt-1">{issue.why_it_matters}</p>
                      </div>
                   )) : (
                     <div className="h-full flex flex-col items-center justify-center text-center p-4">
                        <CheckCircle2 className="w-10 h-10 text-green-400 mb-2" />
                        <p className="text-sm text-slate-500 font-medium">Clean bill of health!</p>
                     </div>
                   )}
                </div>
             </Card>
         )}
      </div>
    </div>
  );
}
