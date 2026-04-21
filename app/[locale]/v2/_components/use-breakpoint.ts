"use client";

// use-breakpoint.ts — single source of truth for v2 responsive breakpoints.
// All inline-style components call this hook and branch their styles on the
// returned bucket rather than embedding media queries (inline styles can't).
//
// Breakpoints:
//   mobile  — < 640px   (phone portrait)
//   tablet  — 640-1023  (phone landscape, small tablet)
//   desktop — >= 1024   (iPad landscape and up)

import { useEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

const MOBILE_MAX = 640;
const TABLET_MAX = 1024;

function compute(width: number): Breakpoint {
  if (width < MOBILE_MAX) return "mobile";
  if (width < TABLET_MAX) return "tablet";
  return "desktop";
}

export function useBreakpoint(): Breakpoint {
  // SSR-safe default: desktop. The first client-side effect corrects it on
  // mount. A brief flash on narrow viewports is acceptable; guarding with null
  // would cause a layout jump on every mount.
  const [bp, setBp] = useState<Breakpoint>("desktop");

  useEffect(() => {
    const handle = () => setBp(compute(window.innerWidth));
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, []);

  return bp;
}

// Convenience helpers so consumers don't have to inline the string comparison.
export function isMobile(bp: Breakpoint): boolean  { return bp === "mobile"; }
export function isTablet(bp: Breakpoint): boolean  { return bp === "tablet"; }
export function isDesktop(bp: Breakpoint): boolean { return bp === "desktop"; }
export function isNarrow(bp: Breakpoint): boolean  { return bp !== "desktop"; } // mobile OR tablet
