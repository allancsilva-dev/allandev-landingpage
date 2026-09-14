import { describe, expect, it } from "vitest";
import {
  MemoryRateLimiter,
  anonymizeIp,
  rateLimitSubject,
} from "@/lib/contact/rate-limiter";

describe("MemoryRateLimiter", () => {
  it("bloqueia após o limite e libera depois do TTL", () => {
    const limiter = new MemoryRateLimiter(2, 1_000, 10);
    expect(limiter.consume("ip", 0).allowed).toBe(true);
    expect(limiter.consume("ip", 1).allowed).toBe(true);
    expect(limiter.consume("ip", 2)).toEqual({ allowed: false, retryAfter: 1 });
    expect(limiter.consume("ip", 1_001).allowed).toBe(true);
  });
  it("mantém memória limitada", () => {
    const limiter = new MemoryRateLimiter(5, 10_000, 2);
    limiter.consume("a", 0);
    limiter.consume("b", 0);
    limiter.consume("c", 0);
    expect(limiter.size()).toBe(2);
  });
  it("não usa IP bruto como chave", () => {
    expect(anonymizeIp("203.0.113.1", "x".repeat(32))).not.toContain(
      "203.0.113.1",
    );
  });
  it("agrupa IPv6 pelo prefixo /64", () => {
    expect(rateLimitSubject("2001:db8:1:2:aaaa::1")).toBe(
      "2001:0db8:0001:0002::/64",
    );
    expect(rateLimitSubject("2001:db8:1:2::ffff")).toBe(
      rateLimitSubject("2001:DB8:1:2:dead:beef:0:1"),
    );
    expect(rateLimitSubject("2001:db8::1")).toBe("2001:0db8:0000:0000::/64");
    expect(rateLimitSubject("2001:db8:1:3::1")).not.toBe(
      rateLimitSubject("2001:db8:1:2::1"),
    );
  });
  it("mantém IPv4 e IPv4 mapeado como endereço único", () => {
    expect(rateLimitSubject("203.0.113.1")).toBe("203.0.113.1");
    expect(rateLimitSubject("::ffff:203.0.113.1")).toBe("203.0.113.1");
    expect(rateLimitSubject("unknown")).toBe("unknown");
  });
});
