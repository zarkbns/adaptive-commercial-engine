#!/usr/bin/env bash
set -euo pipefail

# Script to initialize HydraDB OSS data directories and auth token for ace
echo "==> Initializing HydraDB OSS directory structure..."

# 1. Primary volume directory for Docker Compose
mkdir -p hydradb-data/store
mkdir -p hydradb-data/cache

# 2. Official root local cache directories per HydraDB OSS README (.hydradb and hydra-db)
mkdir -p .hydradb/store
mkdir -p .hydradb/cache

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

# Write token to ignored local auth-token files
printf '%s\n' "$AUTH_TOKEN" > hydradb-data/auth-token
printf '%s\n' "$AUTH_TOKEN" > .hydradb/auth-token

# Set strict and correct directory/file permissions
chmod 755 hydradb-data
chmod 755 hydradb-data/store
chmod 755 hydradb-data/cache
chmod 600 hydradb-data/auth-token

chmod 755 .hydradb
chmod 755 .hydradb/store
chmod 755 .hydradb/cache
chmod 600 .hydradb/auth-token

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
echo "    - Docker Volume Storage: hydradb-data/store (chmod 755)"
echo "    - Docker Volume Cache:   hydradb-data/cache (chmod 755)"
echo "    - Root Local Cache:      .hydradb/cache (chmod 755)"
echo "    - Root Local Store:      .hydradb/store (chmod 755)"
echo "    - Auth Token:            hydradb-data/auth-token & .hydradb/auth-token (chmod 600)"
echo "    - Token Length:          ${#AUTH_TOKEN} characters"
echo "    - Local .env:            HYDRADB_API_KEY configured"
echo "==> Run: export HOST_UID=\$(id -u) && export HOST_GID=\$(id -g)"
echo "==> Run: docker compose up --build -d"
echo "==> (Optional) Seed demo customer memory: bash scripts/seed-hydradb.sh"
