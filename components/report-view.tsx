"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { AnalysisResult, OptimizationResult } from "@/lib/gemini";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Check, Lock, AlertCircle, ChevronRight, Sparkles, ArrowRight, Loader2, FileText, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportViewProps {
  analysis: AnalysisResult;
  vacancyText: string;
  reportId: string;
}

export function ReportView({ analysis, vacancyText, reportId }: ReportViewProps) {
  const [activePillar, setActivePillar] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [viewMode, setViewMode] = useState<"analysis" | "optimized">("analysis");

  const { pillars, summary } = analysis;
  const overallScore = summary.total_score;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reportId }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      const data = await response.json() as { optimization: OptimizationResult };
      setOptimizationResult(data.optimization);
      setIsUnlocked(true);
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const pillarKeys = Object.keys(pillars) as Array<keyof typeof pillars>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Left Column: Vacancy Text Viewer */}
      <Card className="lg:col-span-2 flex flex-col h-full overflow-hidden border-border/50 shadow-xl">
        <CardHeader className="border-b bg-muted/30 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className="flex p-1 bg-muted rounded-lg border">
                 <button
                   onClick={() => setViewMode("analysis")}
                   className={cn(
                     "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                     viewMode === "analysis" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                   )}
                 >
                   <FileText className="w-4 h-4" />
                   Original
                 </button>
                 <button
                   onClick={() => isUnlocked && setViewMode("optimized")}
                   disabled={!isUnlocked}
                   className={cn(
                     "px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2",
                     viewMode === "optimized" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground",
                     !isUnlocked && "opacity-50 cursor-not-allowed"
                   )}
                 >
                   <Wand2 className="w-4 h-4" />
                   Optimized
                   {!isUnlocked && <Lock className="w-3 h-3 ml-1" />}
                 </button>
               </div>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {viewMode === "analysis" ? vacancyText.length : optimizationResult?.full_text_plain.length || 0} chars
            </Badge>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 p-6">

          <div className="prose prose-lg max-w-none dark:prose-invert">
            {viewMode === "analysis" ? (
              <div className="whitespace-pre-wrap font-sans text-foreground/80 leading-relaxed">
                {vacancyText}
              </div>
            ) : (
              <div className="font-sans text-foreground/80 leading-relaxed">
                <ReactMarkdown>
                  {optimizationResult?.full_text_markdown || ""}
                </ReactMarkdown>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Right Column: Analysis Sidebar */}
      <Card className="flex flex-col h-full overflow-hidden border-border/50 shadow-xl bg-muted/10">
        <CardHeader className="border-b bg-background pb-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                {viewMode === "analysis" ? "Analysis Report" : "Optimization Result"}
              </h2>
              <Badge 
                variant={overallScore >= 8 ? "default" : overallScore >= 5 ? "secondary" : "destructive"}
                className="text-lg px-3 py-1"
              >
                {viewMode === "analysis" ? overallScore : optimizationResult?.estimated_scores.total_score}/10
              </Badge>
            </div>
            <Progress 
              value={(viewMode === "analysis" ? overallScore : (optimizationResult?.estimated_scores.total_score || 0)) * 10} 
              className="h-2" 
            />
            <p className="text-sm text-muted-foreground leading-snug">
              {viewMode === "analysis" ? summary.executive_summary : optimizationResult?.changes.summary}
            </p>
          </div>
        </CardHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {viewMode === "analysis" ? (
              pillarKeys.map((key) => {
                const pillar = pillars[key];
                const isActive = activePillar === key;
                const scoreColor = pillar.score >= 8 ? "text-green-600" : pillar.score >= 5 ? "text-yellow-600" : "text-red-600";
                
                return (
                  <div 
                    key={key}
                    className={cn(
                      "group rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md",
                      isActive ? "bg-background ring-2 ring-primary border-transparent" : "bg-card border-border/50 hover:border-border"
                    )}
                    onClick={() => setActivePillar(isActive ? null : key)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium capitalize text-sm">
                        {key.replace(/_/g, " ")}
                      </h3>
                      <span className={cn("font-bold text-sm", scoreColor)}>
                        {pillar.score}/10
                      </span>
                    </div>
                    
                    <div className="relative">
                      <p className={cn(
                        "text-sm text-muted-foreground leading-relaxed transition-all",
                        !isUnlocked && "blur-sm select-none"
                      )}>
                        {pillar.diagnosis}
                      </p>
                      
                      {!isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
                          <Lock className="w-4 h-4 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Key Improvements</h3>
                {optimizationResult?.changes.improvements.map((imp, i) => (
                  <div key={i} className="bg-card border p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">{imp.pillar}</Badge>
                    </div>
                    <p className="text-sm font-medium">{imp.change}</p>
                    {imp.before_example && (
                      <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mt-2">
                        <span className="text-red-400 font-medium">Before:</span> "{imp.before_example}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Unlock CTA Footer */}
        {!isUnlocked && (
          <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Sparkles className="w-4 h-4" />
                <span>Unlock full analysis & optimization</span>
              </div>
              <form onSubmit={handleUnlock} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-input text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  Unlock Report
                </Button>
              </form>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
