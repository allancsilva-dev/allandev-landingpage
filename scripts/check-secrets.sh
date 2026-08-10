#!/usr/bin/env sh
set -eu
if git grep -nE '(ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|re_[A-Za-z0-9]{30,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)' -- . ':!pnpm-lock.yaml'; then
  echo "Possível segredo versionado" >&2
  exit 1
fi
echo "Nenhum padrão de segredo encontrado."
