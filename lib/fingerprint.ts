// Browser fingerprinting utility for abuse prevention
export function generateFingerprint(): string {
  if (typeof window === 'undefined') return '';

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    !!window.sessionStorage,
    !!window.localStorage,
    navigator.hardwareConcurrency || 0,
  ];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
    components.push(canvas.toDataURL());
  }

  const fingerprint = components.join('|');
  return hashString(fingerprint);
}

// Simple hash function
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Get client IP from headers (server-side).
//
// Order of preference:
//   1. cf-connecting-ip — set by Cloudflare; the only IP the client
//      cannot spoof when the deployment is proxied through CF. Checked
//      FIRST because it's the most trustworthy signal when present.
//   2. x-forwarded-for — set by Traefik on Coolify. Client can send a
//      fake XFF, but Traefik appends the real peer IP to the end, so
//      the last entry is more trustworthy than the first. For now we
//      take the first (client-facing) entry because that's what older
//      code did — tolerated risk. Flagged as a follow-up: behind
//      Traefik the LAST entry is the trustworthy one.
//   3. x-real-ip — set by some proxies; trust level varies, last resort.
//
// Normalisation:
//   - strips port suffixes (e.g. "1.2.3.4:53421" → "1.2.3.4") so the
//     same client isn't counted as many different IPs across ephemeral
//     ports. Regression was: incognito tabs got different "IPs" when
//     the proxy appended the peer port, defeating the IP cap.
//   - IPv6 addresses keep their brackets stripped; zone IDs preserved.
//   - returns undefined for empty strings so the caller's `ipAddress`
//     null-check path is taken (cap query skipped instead of matching
//     every null-IP row in the leads table).
export function getClientIP(request: Request): string | undefined {
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    const normalized = normalizeIP(cfConnectingIP);
    if (normalized) return normalized;
  }

  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    const normalized = normalizeIP(first);
    if (normalized) return normalized;
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    const normalized = normalizeIP(realIP);
    if (normalized) return normalized;
  }

  return undefined;
}

// Strip port suffixes and bracket wrappers. Returns undefined for empty
// strings so the caller treats them as "no IP known" rather than a
// wildcard that would match every null-IP row in the leads table.
function normalizeIP(raw: string | undefined): string | undefined {
  if (!raw) return undefined;
  let ip = raw.trim();
  if (!ip) return undefined;
  // IPv6 in bracket form: "[::1]:443" → "::1"
  if (ip.startsWith('[')) {
    const closeIdx = ip.indexOf(']');
    if (closeIdx > 0) return ip.slice(1, closeIdx) || undefined;
  }
  // IPv4 with port: "1.2.3.4:443" → "1.2.3.4".
  // Only strip the port if the address looks like IPv4 (single colon,
  // four dotted octets). Bare IPv6 like "::1" has multiple colons and
  // must not be split.
  if (ip.includes('.') && ip.includes(':') && ip.split(':').length === 2) {
    ip = ip.split(':')[0];
  }
  return ip || undefined;
}
