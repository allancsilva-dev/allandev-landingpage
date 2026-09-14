import { z } from "zod";

const productionEnv = z.object({
  APP_ENV: z.literal("production"),
  NEXT_PUBLIC_SITE_URL: z.url({ protocol: /^https$/ }),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  TURNSTILE_SECRET_KEY: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  CONTACT_TO_EMAIL: z.email(),
  CONTACT_FROM_EMAIL: z.string().min(3),
  RATE_LIMIT_HMAC_SECRET: z.string().min(32),
});

export async function register() {
  if (
    process.env.NEXT_RUNTIME !== "nodejs" ||
    process.env.APP_ENV !== "production"
  )
    return;
  const result = productionEnv.safeParse(process.env);
  if (result.success) return;
  // A thrown error here is only logged and the server keeps answering health
  // checks, so a misconfigured deploy would look healthy. Exit instead, and
  // name the variables without echoing their values.
  const invalid = result.error.issues.map((issue) => issue.path.join("."));
  console.error(`Invalid production environment: ${invalid.join(", ")}`);
  process.exit(1);
}
