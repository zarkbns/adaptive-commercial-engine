#!/usr/bin/env bash
set -euo pipefail

# Script to initialize HydraDB OSS data directories and auth token for A.C.E
echo "==> Initializing HydraDB OSS directory structure..."

mkdir -p hydradb-data/store
mkdir -p hydradb-data/cache

# Generate secure random 32-byte (64 hex characters) token if not passed as arg or env
if [ -n "${1:-}" ]; then
  AUTH_TOKEN="$1"
elif [ -n "${HYDRADB_API_KEY:-}" ]; then
  AUTH_TOKEN="${HYDRADB_API_KEY}"
elif [ -f hydradb-data/auth-token ] && [ -s hydradb-data/auth-token ]; then
  AUTH_TOKEN="$(cat hydradb-data/auth-token | tr -d '\r\n ')"
else
  AUTH_TOKEN="$(openssl rand -hex 32)"
fi

# Write token to ignored local auth-token file
printf '%s\n' "$AUTH_TOKEN" > hydradb-data/auth-token

chmod 755 hydradb-data
chmod 755 hydradb-data/store
chmod 755 hydradb-data/cache
chmod 600 hydradb-data/auth-token

# Ensure local .env exists and contains HYDRADB_API_KEY (without tracking in git)
if [ ! -f .env ]; then
  touch .env
fi

if grep -q "^HYDRADB_API_KEY=" .env 2>/dev/null; then
  sed -i "s|^HYDRADB_API_KEY=.*|HYDRADB_API_KEY=\"$AUTH_TOKEN\"|" .env
else
  echo "HYDRADB_API_KEY=\"$AUTH_TOKEN\"" >> .env
fi

echo "==> HydraDB OSS storage and auth token initialized successfully:"
echo "    - Storage Path: hydradb-data/store (chmod 755)"
echo "    - Cache Path:   hydradb-data/cache (chmod 755)"
echo "    - Auth Token:   hydradb-data/auth-token (chmod 600)"
echo "    - Token Length: ${#AUTH_TOKEN} characters"
echo "    - Local .env:   HYDRADB_API_KEY configured"
echo "==> Run: export HOST_UID=\$(id -u) && export HOST_GID=\$(id -g)"
echo "==> Run: docker compose up --build -d"
