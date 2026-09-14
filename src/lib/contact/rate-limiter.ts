import { createHmac } from "node:crypto";
import { isIPv4, isIPv6 } from "node:net";

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfter: number };
export interface RateLimiter {
  consume(key: string, now?: number): RateLimitResult;
}

type Entry = { count: number; resetAt: number };

export class MemoryRateLimiter implements RateLimiter {
  private readonly entries = new Map<string, Entry>();
  constructor(
    private readonly limit = 5,
    private readonly windowMs = 60 * 60 * 1000,
    private readonly maxEntries = 10_000,
  ) {}

  consume(key: string, now = Date.now()): RateLimitResult {
    this.prune(now);
    const current = this.entries.get(key);
    if (!current || current.resetAt <= now) {
      this.entries.set(key, { count: 1, resetAt: now + this.windowMs });
      return { allowed: true };
    }
    if (current.count >= this.limit)
      return {
        allowed: false,
        retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
      };
    current.count += 1;
    return { allowed: true };
  }

  size() {
    return this.entries.size;
  }

  private prune(now: number) {
    for (const [key, entry] of this.entries)
      if (entry.resetAt <= now) this.entries.delete(key);
    while (this.entries.size >= this.maxEntries) {
      const oldest = this.entries.keys().next().value as string | undefined;
      if (!oldest) break;
      this.entries.delete(oldest);
    }
  }
}

// A single IPv6 subscriber usually controls a whole /64, so keying on the full
// address would let one client rotate through 2^64 rate-limit buckets.
export function rateLimitSubject(ip: string) {
  const mapped = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)?.[1];
  if (mapped && isIPv4(mapped)) return mapped;
  if (!isIPv6(ip)) return ip;
  const [head, tail = ""] = ip.toLowerCase().split("::");
  const left = head ? head.split(":") : [];
  const right = tail ? tail.split(":") : [];
  const groups = ip.includes("::")
    ? [...left, ...Array(8 - left.length - right.length).fill("0"), ...right]
    : left;
  return `${groups
    .slice(0, 4)
    .map((group) => group.padStart(4, "0"))
    .join(":")}::/64`;
}

export function anonymizeIp(ip: string, secret: string) {
  return createHmac("sha256", secret)
    .update(rateLimitSubject(ip))
    .digest("base64url");
}

export const contactRateLimiter = new MemoryRateLimiter();
