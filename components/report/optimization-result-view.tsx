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
  return null;
}
