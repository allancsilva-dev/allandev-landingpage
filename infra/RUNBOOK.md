# Runbook AllanDev

## Publicação

1. Validar `pnpm check` e imagem no CI.
2. Definir `ALLANDEV_IMAGE=ghcr.io/allancsilva-dev/allandev-landingpage:<commit-sha>`.
3. Salvar tag atual como `ALLANDEV_PREVIOUS_IMAGE`.
4. Rodar `docker compose -f infra/compose.yml pull` e `up -d --wait`.
5. Verificar health local e HTTPS público. Se falhar, restaurar `ALLANDEV_PREVIOUS_IMAGE` e repetir `up -d --wait`.

Deploys precisam de lock de concorrência. Nunca usar tag `latest` como rollback.

## Nginx e Cloudflare

- Incluir `allandev-http.conf` dentro de `http {}` e `allandev-server.conf` no virtual host TLS.
- Executar `sync-cloudflare-ips.sh` por timer semanal. Restringir 80/443 aos ranges Cloudflare no firewall.
- Cloudflare: proxy ativo, Full (strict), Authenticated Origin Pulls e rate limit de POST em `/api/contact`.
- Validar `nginx -t` antes de todo reload. Porta 4000 deve responder apenas em loopback.

## Incidente

- Container: `docker compose -f infra/compose.yml ps` e logs com janela curta.
- Nunca publicar `.env`, corpo do formulário, tokens ou IP bruto em ticket/log.
- Disco/RAM acima de 80%: alertar e investigar antes de reiniciar.
- Manter backup criptografado de `.env`, Nginx e Compose fora da VPS; testar restauração trimestral.
