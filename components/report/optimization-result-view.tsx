"use client";

import { OptimizationResult } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";

interface OptimizationResultViewProps {
  result: OptimizationResult;
  email: string;
  phase: number;
}

export function OptimizationResultView({ result, email, phase }: OptimizationResultViewProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 mb-12">
      {/* Success Banner */}
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
          <Check className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-green-900">Optimization Complete!</h3>
        <p className="text-green-700">
          Here is your optimized vacancy. We've also sent a copy to <strong>{email}</strong>.
        </p>
        
        {/* Phase-based Actions */}
        <div className="pt-4 flex justify-center">
           {phase === 1 ? (
             <Button 
              onClick={() => window.location.href = "/"}
              className="bg-white text-green-700 border border-green-200 hover:bg-green-100 hover:text-green-800 font-bold shadow-sm"
             >
               <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Analyze Another Vacancy
             </Button>
           ) : (
              <div className="bg-white/60 p-6 rounded-xl border border-green-200/50 max-w-sm mx-auto backdrop-blur-sm">
                  <h4 className="font-bold text-green-900 mb-2">Want to scale this?</h4>
                  <p className="text-sm text-green-800 mb-4">
                     Get a custom license for your whole team or integrate logically.
                  </p>
                  <Button 
                    onClick={() => window.open("https://vacaturetovenaar.nl/demo", "_blank")}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                     Schedule a Demo
                  </Button>
              </div>
           )}
        </div>
      </div>

      {/* Result Card */}
      <div className="bg-bg-surface-container-low rounded-3xl p-6 sm:p-12 shadow-xl border border-outline-variant/60 space-y-8 bg-white relative overflow-hidden">
        <div className="relative z-10 space-y-8">
            <div className="space-y-4">
               <h2 className="text-2xl font-bold text-slate-900">Optimized Vacancy</h2>
               <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="block text-slate-500 mb-1 font-medium">New Structure Score</span>
                    <span className="text-3xl font-black text-primary">{result.estimated_scores.structure_layout.toFixed(1)}/10</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="block text-slate-500 mb-1 font-medium">New Total Score</span>
                    <span className="text-3xl font-black text-primary">{result.estimated_scores.total_score.toFixed(1)}/10</span>
                  </div>
               </div>
            </div>

            <div className="prose prose-lg max-w-none prose-slate bg-slate-50/50 p-6 sm:p-8 rounded-2xl border border-slate-100">
              <pre className="whitespace-pre-wrap font-sans text-base leading-relaxed text-slate-700">
                {result.full_text_markdown}
              </pre>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-slate-900">Key Improvements</h3>
              <ul className="space-y-3">
                {result.changes.improvements.map((imp, i) => (
                  <li key={i} className="flex gap-3 text-sm group">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-green-200 transition-colors">
                        <Check className="w-3.5 h-3.5 text-green-700" />
                    </div>
                    <span className="text-slate-600 leading-relaxed">
                      <strong className="font-semibold text-slate-900">{imp.pillar}:</strong> {imp.change}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
        </div>
      </div>
    </div>
  );
}
