"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { AnalysisResult, OptimizationResult } from "@/lib/gemini";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Check,
  X,
  AlertTriangle,
  Lock,
  Sparkles,
  Loader2,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportViewProps {
  analysis: AnalysisResult;
  vacancyText: string;
  reportId: string;
}

// Email capture modal component
function EmailModal({
  isOpen,
  onClose,
  onSubmit,
  status,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
  status: "idle" | "loading" | "success" | "error";
}) {
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) onSubmit(email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl shadow-2xl border border-border/50 p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">
              We have the optimized version ready!
            </h3>
            <p className="text-muted-foreground">
              Where should we send your fully optimized 10/10 vacancy?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your work email"
              className="w-full px-4 py-3 rounded-xl bg-muted border border-input text-base focus:ring-2 focus:ring-primary outline-none"
              disabled={status === "loading"}
            />
            <Button
              type="submit"
              className="w-full py-6 text-base"
              disabled={status === "loading" || !email}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Generating optimization...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Unlock Full Optimization
                </>
              )}
            </Button>
          </form>

          {status === "error" && (
            <p className="text-red-500 text-sm text-center">
              Something went wrong. Please try again.
            </p>
          )}

          <p className="text-xs text-muted-foreground text-center">
            We respect your privacy. No spam, ever.
          </p>
        </div>
      </div>
    </div>
  );
}

// Score icon based on value
function ScoreIcon({ score }: { score: number }) {
  if (score >= 8) {
    return <Check className="w-5 h-5 text-green-500" />;
  } else if (score >= 5) {
    return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
  } else {
    return <X className="w-5 h-5 text-red-500" />;
  }
}

// Pillar display names
const PILLAR_NAMES: Record<string, string> = {
  structure_layout: "Structure & Layout",
  persona_fit: "Persona-Fit",
  evp_brand: "EVP & Brand",
  tone_of_voice: "Tone-of-Voice",
  inclusion_bias: "Inclusion & Bias",
  mobile_experience: "Mobile Experience",
  seo_findability: "SEO Findability",
  neuromarketing: "Neuromarketing",
};

export function ReportView({
  analysis,
  vacancyText,
  reportId,
}: ReportViewProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [optimizationResult, setOptimizationResult] =
    useState<OptimizationResult | null>(null);
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(
    new Set(),
  );

  const { pillars, summary } = analysis;
  const overallScore = summary.total_score;
  const pillarKeys = Object.keys(pillars) as Array<keyof typeof pillars>;

  const togglePillar = (key: string) => {
    const newExpanded = new Set(expandedPillars);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedPillars(newExpanded);
  };

  const handleUnlock = async (email: string) => {
    setStatus("loading");
    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reportId }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      const data = (await response.json()) as {
        optimization: OptimizationResult;
      };
      setOptimizationResult(data.optimization);
      setIsUnlocked(true);
      setStatus("success");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  // Get preview text (first paragraph) from optimization
  const getPreviewText = () => {
    if (!optimizationResult) {
      // Generate a teaser based on analysis
      return `# ${analysis.metadata.job_title || "Optimized Vacancy"}\n\n${analysis.metadata.detected_evp || "Your optimized vacancy will include a compelling hook, improved structure, and enhanced tone of voice..."}\n\n## What makes this role special\n\nYour rewritten content will appear here with improved clarity, better formatting, and enhanced persuasion techniques...`;
    }
    return optimizationResult.full_text_markdown;
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-8rem)]">
        {/* Left Column: Original Text (35% = 4/12 columns) */}
        <div className="lg:col-span-4 flex flex-col">
          <div className="bg-muted/50 rounded-2xl border border-border/30 flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-border/30">
              <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
                Original Vacancy
              </h3>
            </div>
            <ScrollArea className="flex-1 p-5">
              <div
                className="text-sm text-muted-foreground leading-relaxed font-sans"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {vacancyText}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Right Column: Analysis Report (65% = 8/12 columns) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Score Header Card */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-foreground">
                  Analysis Report
                </h2>
                <p className="text-sm text-muted-foreground">
                  {analysis.metadata.job_title || "Your Vacancy"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-4xl font-bold text-foreground">
                    {overallScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">out of 10</div>
                </div>
                <Badge
                  variant={
                    summary.verdict === "excellent"
                      ? "default"
                      : summary.verdict === "good"
                        ? "secondary"
                        : "destructive"
                  }
                  className="text-sm px-3 py-1 capitalize"
                >
                  {summary.verdict.replace("_", " ")}
                </Badge>
              </div>
            </div>
            <Progress value={overallScore * 10} className="h-2 mt-4" />
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              {summary.executive_summary}
            </p>
          </div>

          {/* Pillar Analysis Grid */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-xl p-6">
            <h3 className="font-semibold text-lg mb-4">Detailed Analysis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pillarKeys.map((key) => {
                const pillar = pillars[key];
                const isExpanded = expandedPillars.has(key);
                const scoreColor =
                  pillar.score >= 8
                    ? "text-green-600 bg-green-50"
                    : pillar.score >= 5
                      ? "text-yellow-600 bg-yellow-50"
                      : "text-red-600 bg-red-50";

                return (
                  <div
                    key={key}
                    className={cn(
                      "rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md",
                      isExpanded
                        ? "bg-muted/50 border-border"
                        : "bg-background border-border/50 hover:border-border",
                    )}
                    onClick={() => togglePillar(key)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ScoreIcon score={pillar.score} />
                        <span className="font-medium text-sm text-foreground">
                          {PILLAR_NAMES[key] || key.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-bold text-sm px-2 py-0.5 rounded",
                            scoreColor,
                          )}
                        >
                          {pillar.score}/10
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed pl-8">
                        {pillar.diagnosis}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-border/50">
              <div>
                <h4 className="font-medium text-sm text-green-600 mb-2 flex items-center gap-2">
                  <Check className="w-4 h-4" /> Top Strengths
                </h4>
                <ul className="space-y-1">
                  {summary.top_strengths.map((strength, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm text-red-600 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Critical Weaknesses
                </h4>
                <ul className="space-y-1">
                  {summary.critical_weaknesses.map((weakness, i) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Optimized Version Section (Gated) */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Optimized Version</h3>
              </div>
              {isUnlocked && optimizationResult && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  {optimizationResult.estimated_scores.total_score}/10 Estimated
                </Badge>
              )}
            </div>

            <div className="relative">
              {/* Preview / Full content */}
              <div
                className={cn("p-6", !isUnlocked && "max-h-64 overflow-hidden")}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {isUnlocked && optimizationResult ? (
                    <ReactMarkdown>
                      {optimizationResult.full_text_markdown}
                    </ReactMarkdown>
                  ) : (
                    <ReactMarkdown>{getPreviewText()}</ReactMarkdown>
                  )}
                </div>
              </div>

              {/* Blur overlay with CTA */}
              {!isUnlocked && (
                <div className="absolute inset-0 top-20 bg-gradient-to-t from-card via-card/95 to-transparent flex flex-col items-center justify-end pb-8">
                  <div className="text-center space-y-4 px-6">
                    <p className="text-muted-foreground">
                      Get the full AI-optimized version of your vacancy
                    </p>
                    <Button
                      size="lg"
                      className="px-8 py-6 text-base shadow-lg"
                      onClick={() => setShowModal(true)}
                    >
                      <Lock className="w-5 h-5 mr-2" />
                      Unlock full 10/10 optimized vacancy
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Key Improvements (shown after unlock) */}
            {isUnlocked && optimizationResult && (
              <div className="px-6 pb-6 pt-2 border-t border-border/30 mt-4">
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-4">
                  Key Improvements Made
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {optimizationResult.changes.improvements
                    .slice(0, 6)
                    .map((imp, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-medium text-primary capitalize">
                            {imp.pillar}
                          </span>
                          <p className="text-sm text-foreground">
                            {imp.change}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Capture Modal */}
      <EmailModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleUnlock}
        status={status}
      />
    </>
  );
}
