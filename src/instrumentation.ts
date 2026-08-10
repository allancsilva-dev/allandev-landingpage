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
    process.env.NEXT_RUNTIME === "nodejs" &&
    process.env.APP_ENV === "production"
  )
    productionEnv.parse(process.env);
}
