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
          We've sent the optimized vacancy to <strong>{email}</strong>.
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
                  <h4 className="font-bold text-green-900 mb-2">Curious how to use this structurally?</h4>
                  <p className="text-sm text-green-800 mb-4">
                     This approach attracts better-fit candidates faster across multiple vacancies.
                  </p>
                  <div className="space-y-2">
                    <Button 
                      onClick={() => window.open("https://meetings-eu1.hubspot.com/jknuvers", "_blank")}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
                    >
                       Schedule a Demo
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => window.location.href = "mailto:joost@vacaturetovenaar.nl"}
                      className="w-full text-green-800 hover:text-green-950 hover:bg-green-100/50 h-8 text-sm"
                    >
                       Contact Us
                    </Button>
                  </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
