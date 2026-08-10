import { contactRateLimiter, anonymizeIp } from "@/lib/contact/rate-limiter";
import { contactSchema } from "@/lib/contact/schema";
import {
  getClientIp,
  isAllowedOrigin,
  sendContactEmail,
  validateTurnstile,
} from "@/lib/contact/server";

const MAX_BODY_BYTES = 16 * 1024;
const json = (body: object, status: number, headers?: HeadersInit) =>
  Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });

export async function POST(request: Request) {
  if (!isAllowedOrigin(request))
    return json({ ok: false, code: "REQUEST_REJECTED" }, 403);
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return json({ ok: false, code: "INVALID_REQUEST" }, 400);
  const declaredSize = Number(request.headers.get("content-length") ?? 0);
  if (declaredSize > MAX_BODY_BYTES)
    return json({ ok: false, code: "PAYLOAD_TOO_LARGE" }, 413);

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES)
    return json({ ok: false, code: "PAYLOAD_TOO_LARGE" }, 413);
  let input: unknown;
  try {
    input = JSON.parse(raw);
  } catch {
    return json({ ok: false, code: "INVALID_REQUEST" }, 400);
  }
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success)
    return json({ ok: false, code: "VALIDATION_ERROR" }, 400);

  const ip = getClientIp(request);
  const secret =
    process.env.RATE_LIMIT_HMAC_SECRET ??
    (process.env.APP_ENV === "production"
      ? ""
      : "development-only-secret-at-least-32");
  if (secret.length < 32)
    return json({ ok: false, code: "SERVICE_UNAVAILABLE" }, 503);
  const rate = contactRateLimiter.consume(anonymizeIp(ip, secret));
  if (!rate.allowed)
    return json({ ok: false, code: "RATE_LIMITED" }, 429, {
      "Retry-After": String(rate.retryAfter),
    });
  if (parsed.data.website) return json({ ok: true }, 200);

  try {
    if (!(await validateTurnstile(parsed.data.turnstileToken, ip)))
      return json({ ok: false, code: "REQUEST_REJECTED" }, 403);
    await sendContactEmail(parsed.data);
    return json({ ok: true }, 200);
  } catch {
    return json({ ok: false, code: "SERVICE_UNAVAILABLE" }, 503);
  }
}
