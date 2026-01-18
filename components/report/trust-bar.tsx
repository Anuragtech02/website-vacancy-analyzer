"use client";

import { Clock, TrendingUp, Users, ExternalLink, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustBarProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const metrics = [
  {
    icon: Clock,
    value: "75%",
    label: "minder tijd per vacature",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    icon: TrendingUp,
    value: "25%",
    label: "hogere conversie",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    icon: Users,
    value: "15%",
    label: "meer sollicitanten",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
];

export function TrustBar({ variant = 'full', className }: TrustBarProps) {
  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center justify-center gap-6 py-4 text-sm text-slate-500", className)}>
        <a
          href="https://vacaturetovenaar.nl"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:text-slate-700 transition-colors"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="font-medium">Mogelijk gemaakt door Vacature Tovenaar</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    );
  }

  return (
    <section className={cn("mb-10", className)}>
      <div className="bg-gradient-to-r from-surface-container to-surface-container-high/50 rounded-2xl border border-outline-variant/60 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Metrics */}
          <div className="flex flex-wrap items-center justify-start gap-4 lg:gap-8">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-lg", metric.bgColor)}>
                    <Icon className={cn("w-4 h-4", metric.color)} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-lg">{metric.value}</span>
                    <span className="text-slate-500 text-sm ml-1.5">{metric.label}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Branding link */}
          <a
            href="https://vacaturetovenaar.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-start lg:justify-center gap-2 px-4 py-2 bg-white rounded-lg border border-slate-200 hover:border-primary/30 hover:shadow-sm transition-all group w-fit"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-semibold text-slate-700 group-hover:text-primary transition-colors">
              Mogelijk gemaakt door Vacature Tovenaar
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-primary transition-colors" />
          </a>
        </div>
      </div>
    </section>
  );
}
