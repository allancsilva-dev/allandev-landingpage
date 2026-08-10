import type { ContactInput } from "./schema";

const timeoutSignal = (ms: number) => AbortSignal.timeout(ms);

export function getClientIp(request: Request) {
  if (process.env.APP_ENV === "production")
    return request.headers.get("x-real-ip") ?? "unknown";
  return request.headers.get("x-real-ip") ?? "127.0.0.1";
}

export function isAllowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const allowedUrl = new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000",
  );
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (process.env.APP_ENV === "production")
    return origin === allowedUrl.origin && host === allowedUrl.host;
  return origin === null || origin === allowedUrl.origin;
}

export async function validateTurnstile(token: string, remoteIp: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret && process.env.APP_ENV !== "production") return true;
  if (!secret) return false;
  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: remoteIp,
    idempotency_key: crypto.randomUUID(),
  });
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body, signal: timeoutSignal(5_000) },
  );
  if (!response.ok) return false;
  const result = (await response.json()) as {
    success?: boolean;
    hostname?: string;
    action?: string;
  };
  const expectedHost = new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4000",
  ).hostname;
  return (
    result.success === true &&
    result.hostname === expectedHost &&
    result.action === "contact"
  );
}

function textBody(data: ContactInput) {
  return [
    `Novo contato Allan.Dev`,
    `Nome: ${data.nome}`,
    `E-mail: ${data.email}`,
    `Empresa: ${data.empresa || "Não informada"}`,
    `Tipo: ${data.tipoProjeto}`,
    "",
    data.mensagem,
  ].join("\n");
}

export async function sendContactEmail(data: ContactInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if ((!apiKey || !to || !from) && process.env.APP_ENV !== "production")
    return { id: "development" };
  if (!apiKey || !to || !from)
    throw new Error("Contact provider is not configured");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `contact/${data.requestId}`,
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: data.email,
      subject: `Contato Allan.Dev — ${data.tipoProjeto}`,
      text: textBody(data),
    }),
    signal: timeoutSignal(8_000),
  });
  if (!response.ok)
    throw new Error(`Contact provider failed with ${response.status}`);
  return response.json() as Promise<{ id: string }>;
}
