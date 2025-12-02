type RateLimitStore = Map<string, { count: number; lastReset: number }>;

const store: RateLimitStore = new Map();

const WINDOW_SIZE = 24 * 60 * 60 * 1000; // 24 hours
const MAX_REQUESTS = 5; // Limit per IP per day

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = store.get(ip);

  if (!record) {
    store.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (now - record.lastReset > WINDOW_SIZE) {
    store.set(ip, { count: 1, lastReset: now });
    return true;
  }

  if (record.count >= MAX_REQUESTS) {
    return false;
  }

  record.count += 1;
  return true;
}
