/**
 * Rate limiting for analysis API
 *
 * Analysis: UNLIMITED (this function always returns true).
 * Optimization (rewriting): limited to 2x per user via lib/db.ts.
 *
 * Usage is counted by (fingerprint, email) — NOT IP. Shared office/VPN/NAT
 * IPs would otherwise cause legitimate users to be blocked by a colleague's
 * usage.
 */
export function checkRateLimit(ip: string): boolean {
  // Unlimited analysis - always allow
  return true;
}
