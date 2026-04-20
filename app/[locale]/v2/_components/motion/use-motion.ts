"use client";

import { Tokens } from "../theme";

export interface UseMotionReturn {
  /** Whether motion is active (motionMult > 0) */
  on: boolean;
  /** Raw motion multiplier (0 = still, 1 = calm, 1.4 = lively) */
  mult: number;
  /** Convert a base duration in ms to a scaled duration string, e.g. dur(600) → "428ms" */
  dur: (ms: number) => string;
}

export function useMotion(tokens: Tokens): UseMotionReturn {
  const mult = tokens.motionMult ?? 1;
  return {
    on: mult > 0,
    mult,
    dur: (ms: number) =>
      `${Math.round(ms / Math.max(0.01, mult))}ms`,
  };
}
