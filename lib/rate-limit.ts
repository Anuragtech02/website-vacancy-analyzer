/**
 * Rate limiting for analysis API
 *
 * IMPORTANT: Per client request, analysis should be UNLIMITED.
 * Only optimization (rewriting) is limited to 2x per user.
 *
 * This function now always returns true (unlimited analysis).
 * We keep the function signature for backwards compatibility.
 *
 * Rate limiting is enforced only on optimization via database in:
 * - app/api/optimize/route.ts
 * - lib/db.ts (countLeadsByEmail, countLeadsByIdentity)
 */
export function checkRateLimit(ip: string): boolean {
  // Unlimited analysis - always allow
  return true;
}
