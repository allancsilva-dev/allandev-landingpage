#!/usr/bin/env sh
set -eu
output="$(mktemp)"
trap 'rm -f "$output"' EXIT
{
  curl -fsS https://www.cloudflare.com/ips-v4 | sed 's#^#set_real_ip_from #; s#$#;#'
  curl -fsS https://www.cloudflare.com/ips-v6 | sed 's#^#set_real_ip_from #; s#$#;#'
  printf '%s\n' 'real_ip_header CF-Connecting-IP;' 'real_ip_recursive on;'
} > "$output"
install -o root -g root -m 0644 "$output" /etc/nginx/snippets/cloudflare-realip.conf
nginx -t
systemctl reload nginx
