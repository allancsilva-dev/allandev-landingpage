# Runbook AllanDev

Produção: `https://allandev.nexostech.com.br` em VPS Hostinger, Nginx + Let's Encrypt na frente de um container Docker em `127.0.0.1:4000`. DNS na Hostinger, sem CDN.

## Bootstrap do VPS (uma vez)

### 1. Sistema

```sh
sudo apt update && sudo apt upgrade -y
sudo apt install -y unattended-upgrades fail2ban ufw certbot python3-certbot-nginx
sudo dpkg-reconfigure -plow unattended-upgrades
```

- `/etc/ssh/sshd_config`: `PasswordAuthentication no`, `PermitRootLogin no`, `KbdInteractiveAuthentication no`. Testar login por chave **em outra sessão** antes de `sudo systemctl reload ssh`.
- Firewall:
  ```sh
  sudo ufw default deny incoming
  sudo ufw allow OpenSSH
  sudo ufw allow 'Nginx Full'
  sudo ufw enable
  ```
- Portas publicadas pelo Docker ignoram o ufw. Conferir que nada além de 22/80/443 escuta em `0.0.0.0`/`[::]`:
  ```sh
  sudo ss -ltnp
  docker ps --format '{{.Names}} {{.Ports}}'
  ```
- hPanel: 2FA na conta Hostinger e snapshots/backups ativos.

### 2. Usuário de deploy

```sh
sudo adduser --disabled-password --gecos "" deploy
sudo usermod -aG docker deploy
sudo install -d -o deploy -g deploy -m 0750 /opt/allandev /opt/allandev/infra
```

Gerar um par de chaves exclusivo (na sua máquina): `ssh-keygen -t ed25519 -f allandev-deploy -N ""`.

Em `/home/deploy/.ssh/authorized_keys` (uma linha só; o grupo docker equivale a root, então a chave **só** pode rodar o script):

```
restrict,command="/usr/local/sbin/deploy-allandev \"$SSH_ORIGINAL_COMMAND\"" ssh-ed25519 AAAA... allandev-deploy
```

Login no GHCR com PAT clássico só com `read:packages`:

```sh
sudo -u deploy docker login ghcr.io -u allancsilva-dev
```

### 3. Arquivos da aplicação

```sh
sudo install -m 0755 infra/deploy-allandev /usr/local/sbin/deploy-allandev
sudo install -o deploy -g deploy -m 0644 infra/compose.yml /opt/allandev/infra/compose.yml
sudo install -o deploy -g deploy -m 0600 /dev/null /opt/allandev/.env
```

Conteúdo de `/opt/allandev/.env` (o container recusa subir se faltar algo, ver `src/instrumentation.ts`):

```
APP_ENV=production
NEXT_PUBLIC_SITE_URL=https://allandev.nexostech.com.br
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
RESEND_API_KEY=...            # chave com permissão "Sending access" apenas
CONTACT_TO_EMAIL=...
CONTACT_FROM_EMAIL=AllanDev <contato@nexostech.com.br>
RATE_LIMIT_HMAC_SECRET=...    # openssl rand -hex 32
```

### 4. Nginx e TLS

1. DNS Hostinger: `A allandev → IP do VPS` (e `AAAA` se houver IPv6).
2. Copiar os snippets:
   ```sh
   sudo install -m 0644 infra/nginx/allandev-http.conf /etc/nginx/conf.d/
   sudo install -m 0644 infra/nginx/allandev-server.conf /etc/nginx/snippets/
   ```
3. Emitir o certificado **antes** de habilitar o server 443:
   ```sh
   sudo certbot certonly --nginx -d allandev.nexostech.com.br
   ```
4. Instalar o server block:
   ```sh
   sudo install -m 0644 infra/nginx/allandev-site.conf /etc/nginx/sites-available/allandev.conf
   sudo ln -s /etc/nginx/sites-available/allandev.conf /etc/nginx/sites-enabled/
   ```
5. Se `grep -rn default_server /etc/nginx/` não retornar nada, habilitar o catch-all comentado no fim de `allandev-site.conf`.
6. Validar e recarregar: `sudo nginx -t && sudo systemctl reload nginx`. Depois `sudo certbot renew --dry-run`.

### 5. Serviços externos

- Cloudflare Turnstile: widget com hostname exato `allandev.nexostech.com.br` (não exige DNS no Cloudflare).
- Resend: domínio verificado (SPF, DKIM e DMARC no DNS da Hostinger).

### 6. GitHub

- Settings → Environments → `production`: _Deployment branches_ só `main`; opcional: _Required reviewers_.
- Secrets do environment: `DEPLOY_SSH_KEY` (chave privada), `DEPLOY_HOST`, `DEPLOY_USER=deploy`, `DEPLOY_KNOWN_HOSTS` (`ssh-keyscan -t ed25519 <IP>`).
- Variable: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.

## Publicação

Actions → **Deploy** → _Run workflow_ na `main`. O workflow roda `pnpm check`, varredura de segredos e `pnpm audit`, builda a imagem `ghcr.io/allancsilva-dev/allandev-landingpage:<sha>` e chama o forced command. O script usa lock contra deploys concorrentes e, se o novo container não ficar healthy, volta para a imagem anterior.

Nunca usar tag `latest`. Rollback manual:

```sh
sudo -u deploy /usr/local/sbin/deploy-allandev ghcr.io/allancsilva-dev/allandev-landingpage:<sha-anterior>
```

## Verificação pós-deploy

```sh
docker compose -f /opt/allandev/infra/compose.yml ps                  # healthy
curl -sI https://allandev.nexostech.com.br | grep -iE 'strict|content-security|x-frame|server'
curl -s -o /dev/null -w '%{http_code}\n' https://allandev.nexostech.com.br/api/health   # 404
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://allandev.nexostech.com.br/api/contact  # 403
```

De fora: `nmap -Pn <IP>` só com 22/80/443, SSL Labs nota A e securityheaders.com.

## Incidente

- Container: `docker compose -f /opt/allandev/infra/compose.yml ps` e `logs --since 15m site`.
- Logs do Docker são rotacionados (3 × 10 MB). Nginx: `/var/log/nginx/`.
- Nunca publicar `.env`, corpo do formulário, tokens ou IP bruto em ticket/log.
- Disco/RAM acima de 80%: investigar antes de reiniciar (`df -h`, `docker system df`).
- Manter backup criptografado de `.env`, Nginx e Compose fora da VPS; testar restauração trimestral.
- Chave de deploy vazada: remover a linha do `authorized_keys`, gerar nova e atualizar o secret.
