# syntax=docker/dockerfile:1.7
FROM node:26.8-bookworm-slim AS base
ENV PNPM_HOME=/pnpm PATH=/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@11.6.0 --activate

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_SITE_URL=https://allandev.nexostech.com.br NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
RUN test -n "$NEXT_PUBLIC_TURNSTILE_SITE_KEY" || (echo "NEXT_PUBLIC_TURNSTILE_SITE_KEY build arg is required" >&2; exit 1)
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:26.8-bookworm-slim AS runner
WORKDIR /app
ENV APP_ENV=production NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_SITE_URL=https://allandev.nexostech.com.br PORT=4000 HOSTNAME=0.0.0.0
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# The image cache volume inherits this ownership; without it the non-root user cannot write.
RUN mkdir -p .next/cache/images && chown -R nextjs:nodejs .next/cache
USER nextjs
EXPOSE 4000
HEALTHCHECK --interval=20s --timeout=3s --start-period=15s --retries=3 CMD ["node", "-e", "fetch('http://127.0.0.1:4000/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"]
CMD ["node", "server.js"]
