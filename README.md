# allandev-landingpage

Portfólio profissional AllanDev. Next.js 16, conteúdo MDX validado e deploy próprio atrás de Cloudflare/Nginx.

## Desenvolvimento

Requer Node 24.18.x e pnpm 11.6.0.

```bash
cp .env.example .env
pnpm install
pnpm dev
```

Abra `http://localhost:4000`. A porta `3000` não é usada.

## Verificação

```bash
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
docker compose -f infra/compose.yml up -d --build --wait
```

Produção publica somente `80/443` pelo Nginx. Container fica preso em `127.0.0.1:4000`. Veja [runbook](infra/RUNBOOK.md).
