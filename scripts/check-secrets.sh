#!/usr/bin/env sh
set -eu
if git grep -nE '(ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|re_[A-Za-z0-9]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)' -- . ':!pnpm-lock.yaml'; then
  echo "Possível segredo versionado" >&2
  exit 1
fi

# Code-shots must reach the site as rasters only. If a snippet's source text
# ever leaked into the repo, the bundle or the build output, these sentinels —
# identifiers that exist only inside the private repositories — would show up.
SENTINELS='processIdempotentItemV2|sync_mutation_inbox|AppGuardOrderValidator|ENTRY_LOCKED_PERIOD'
if git grep -nE "$SENTINELS" -- . ':!scripts/check-secrets.sh'; then
  echo "Texto-fonte de repositório privado versionado" >&2
  exit 1
fi
for dir in .next/static public; do
  [ -d "$dir" ] || continue
  if grep -rlE "$SENTINELS" "$dir" 2>/dev/null; then
    echo "Texto-fonte de repositório privado no build ($dir)" >&2
    exit 1
  fi
done

if [ -d .next/static ] && grep -rlE '(/Users/[^/]+/|RESEND_API_KEY|TURNSTILE_SECRET_KEY|RATE_LIMIT_HMAC_SECRET|CONTACT_TO_EMAIL|CONTACT_FROM_EMAIL)' .next/static 2>/dev/null; then
  echo "Metadado privado no bundle do navegador" >&2
  exit 1
fi

echo "Nenhum padrão de segredo encontrado."
