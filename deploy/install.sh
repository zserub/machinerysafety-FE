#!/usr/bin/env bash
# Installs / upgrades Machinery Safety on an offline server.
# Run from inside the unpacked bundle folder:  ./install.sh
set -euo pipefail

cd "$(dirname "$0")"

if ! docker compose version >/dev/null 2>&1; then
	echo "ERROR: Docker with the compose plugin is required." >&2
	exit 1
fi

if [ ! -f .env ]; then
	cp .env.example .env
	echo "Created .env from .env.example - fill in the CHANGE ME values, then run ./install.sh again."
	exit 1
fi

missing=$(grep -E "^(POSTGRES_PASSWORD|MINIO_ROOT_PASSWORD|SESSION_KEY)=$" .env | cut -d= -f1 || true)
if [ -n "$missing" ]; then
	echo "ERROR: these values are empty in .env:" >&2
	echo "$missing" >&2
	exit 1
fi

if [ -z "$(ls -A data/postgres 2>/dev/null)" ] && grep -qE "^INITIAL_ADMIN_PASSWORD=$" .env; then
	echo "ERROR: first install - set INITIAL_ADMIN_PASSWORD in .env to create the admin account." >&2
	exit 1
fi

if [ -f images.tar.gz ]; then
	echo "==> Loading Docker images"
	docker load < images.tar.gz
fi

mkdir -p data/postgres data/minio data/logs
# Backend runs as UID 1001
chown 1001:1001 data/logs 2>/dev/null || chmod 777 data/logs

echo "==> Starting services"
docker compose up -d

echo
docker compose ps
echo
echo "Machinery Safety is starting. Open $(grep -E '^APP_URL=' .env | cut -d= -f2 )"
echo "Metabase may need 1-2 minutes on first start."
