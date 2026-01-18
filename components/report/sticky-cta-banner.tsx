"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock, Shield, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface StickyCTABannerProps {
  onUnlockClick: () => void;
  isUnlocked: boolean;
  phase: number;
}

export function StickyCTABanner({ onUnlockClick, isUnlocked, phase }: StickyCTABannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isUnlocked || isDismissed) {
      setIsVisible(false);
      return;
    }

    // Show banner after scrolling 300px
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isUnlocked, isDismissed]);

  if (isUnlocked || !isVisible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transform transition-all duration-500 ease-out",
        isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      )}
    >
      {/* Gradient shadow above */}
      <div className="h-8 bg-gradient-to-t from-white/80 to-transparent pointer-events-none" />

      {/* Main banner */}
      <div className="bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_30px_rgb(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Left side - Message */}
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="hidden sm:flex w-12 h-12 bg-primary/10 rounded-xl items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                  Krijg de geoptimaliseerde versie van deze vacature
                </h3>
                <p className="text-sm text-slate-500 hidden sm:block">
                  Onze AI herschrijft hem voor maximale helderheid, inclusiviteit en conversie.
                </p>
              </div>
            </div>

            {/* Right side - CTA + Trust */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <Button
                onClick={onUnlockClick}
                size="lg"
                className={cn(
                  "flex-1 sm:flex-none h-12 px-6 font-bold text-white shadow-lg",
                  phase >= 3 
                    ? "bg-slate-900 hover:bg-slate-800 shadow-slate-900/20" 
                    : "bg-primary hover:bg-primary/90 shadow-primary/20"
                )}
              >
                <Lock className="w-4 h-4 mr-2" />
                {phase >= 3 ? "Ontgrendel met Demo" : "Nu Gratis Ontgrendelen"}
              </Button>

              {/* Dismiss button - mobile only */}
              <button
                onClick={() => setIsDismissed(true)}
                className="sm:hidden p-2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Trust indicators - visible on mobile */}
          <div className="flex items-center justify-center gap-4 mt-3 sm:hidden">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              <span>No Spam</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Shield className="w-3 h-3" />
              <span>Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
