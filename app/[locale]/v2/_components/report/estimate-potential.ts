// estimate-potential.ts — derive a plausible post-optimization score when the
// real optimization hasn't run yet. Used behind the GateCard lock / StickyBanner
// CTA so the before→after promise scales with the actual current score instead
// of showing a fixed "8.2" that reads as mock data.
//
// Empirical lift from our corpus is +2.5 to +3.5 points, and even the best
// rewrites rarely exceed ~9.3. A floor keeps weak inputs showing a credible
// target (never below 7.0) and a ceiling keeps strong inputs from overclaiming.
export function estimatePotentialScore(currentScore: number): number {
  const LIFT = 3.0;
  const FLOOR = 7.0;
  const CEILING = 9.3;
  const raw = currentScore + LIFT;
  const clamped = Math.max(FLOOR, Math.min(CEILING, raw));
  return Math.round(clamped * 10) / 10;
}
