#!/usr/bin/env bash
# Builds an offline deployment bundle (run on a machine WITH internet + Docker).
#
# Output: dist/machinerysafety-<version>.zip with README.md, SHA256SUMS and
# machinerysafety-<version>.tar.gz (compiled Docker images and config only - no source code).
#
# Usage:  deploy/pack.sh
# Override any variable below via env, e.g.  PLATFORM=linux/arm64 deploy/pack.sh
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$(dirname "$DEPLOY_DIR")"
BACKEND_DIR="${BACKEND_DIR:-$(dirname "$FRONTEND_DIR")/MachinerySafety_backend}"

PLATFORM="${PLATFORM:-linux/amd64}"
VITE_LOG_LEVEL="${VITE_LOG_LEVEL:-warn}"

version_of() {
	local v
	v=$(git -C "$1" describe --tags --exact-match 2>/dev/null | sed 's/^v//') || v="dev-$(git -C "$1" rev-parse --short HEAD)"
	[ -n "$(git -C "$1" status --porcelain)" ] && v="${v}-dirty"
	echo "$v"
}
FRONTEND_VERSION="${FRONTEND_VERSION:-$(version_of "$FRONTEND_DIR")}"
BACKEND_VERSION="${BACKEND_VERSION:-$(version_of "$BACKEND_DIR")}"

FRONTEND_IMAGE="machinerysafety/frontend:${FRONTEND_VERSION}"
BACKEND_IMAGE="machinerysafety/backend:${BACKEND_VERSION}"
POSTGRES_IMAGE="${POSTGRES_IMAGE:-postgres:17-alpine}"
METABASE_IMAGE="${METABASE_IMAGE:-metabase/metabase:latest}"
# MinIO no longer publishes public images; a locally cached copy is used if the pull fails
MINIO_IMAGE="${MINIO_IMAGE:-minio/minio:latest}"

# Folder name is version-less so a new bundle unpacks over the old install,
# keeping its .env and data/
BUNDLE_NAME="machinerysafety-${FRONTEND_VERSION}"
OUT_DIR="$FRONTEND_DIR/dist/machinerysafety"

for repo in "$FRONTEND_DIR" "$BACKEND_DIR"; do
	if [ -n "$(git -C "$repo" status --porcelain)" ]; then
		echo "WARNING: $repo has uncommitted changes - they will be included in the build"
	fi
done

echo "==> Building frontend image $FRONTEND_IMAGE"
docker build --platform "$PLATFORM" \
	--build-arg VERSION="$FRONTEND_VERSION" \
	--build-arg VITE_LOG_LEVEL="$VITE_LOG_LEVEL" \
	-t "$FRONTEND_IMAGE" "$FRONTEND_DIR"

echo "==> Building backend image $BACKEND_IMAGE"
docker build --platform "$PLATFORM" \
	--build-arg VERSION="$BACKEND_VERSION" \
	-t "$BACKEND_IMAGE" "$BACKEND_DIR"

THIRD_PARTY=("$POSTGRES_IMAGE" "$METABASE_IMAGE" "$MINIO_IMAGE")
for img in "${THIRD_PARTY[@]}"; do
	echo "==> Pulling $img"
	if ! docker pull --platform "$PLATFORM" "$img"; then
		docker image inspect "$img" >/dev/null 2>&1 || { echo "ERROR: $img not available locally either" >&2; exit 1; }
		echo "WARNING: pull failed, using local copy of $img (created $(docker image inspect --format '{{.Created}}' "$img"))"
	fi
done

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

echo "==> Saving images (this takes a while)"
docker save "$FRONTEND_IMAGE" "$BACKEND_IMAGE" "${THIRD_PARTY[@]}" | gzip > "$OUT_DIR/images.tar.gz"

sed -e "s|@FRONTEND_IMAGE@|$FRONTEND_IMAGE|" \
	-e "s|@BACKEND_IMAGE@|$BACKEND_IMAGE|" \
	-e "s|@POSTGRES_IMAGE@|$POSTGRES_IMAGE|" \
	-e "s|@METABASE_IMAGE@|$METABASE_IMAGE|" \
	-e "s|@MINIO_IMAGE@|$MINIO_IMAGE|" \
	"$DEPLOY_DIR/docker-compose.yml" > "$OUT_DIR/docker-compose.yml"

cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/install.sh" "$DEPLOY_DIR/README.md" "$OUT_DIR/"
cp "$BACKEND_DIR/scripts/init-db.sql" "$OUT_DIR/init-db.sql"
chmod +x "$OUT_DIR/install.sh"

{
	echo "Machinery Safety bundle - built $(date -u +%Y-%m-%dT%H:%M:%SZ) for $PLATFORM"
	echo
	for img in "$FRONTEND_IMAGE" "$BACKEND_IMAGE" "${THIRD_PARTY[@]}"; do
		echo "$img  $(docker image inspect --format '{{.Id}}' "$img")"
	done
} > "$OUT_DIR/VERSIONS.txt"

# Delivery zip: README readable before unpacking, the install archive (tar keeps
# Linux file permissions) and a checksum to verify the transfer
STAGE_DIR="$FRONTEND_DIR/dist/stage"
ZIP_FILE="$FRONTEND_DIR/dist/$BUNDLE_NAME.zip"
rm -rf "$STAGE_DIR" "$ZIP_FILE"
mkdir -p "$STAGE_DIR"

echo "==> Packing $BUNDLE_NAME.tar.gz"
tar -C "$FRONTEND_DIR/dist" -czf "$STAGE_DIR/$BUNDLE_NAME.tar.gz" machinerysafety
rm -rf "$OUT_DIR"

echo "==> Creating $BUNDLE_NAME.zip"
cp "$DEPLOY_DIR/README.md" "$STAGE_DIR/"
(
	cd "$STAGE_DIR"
	sha256sum "$BUNDLE_NAME.tar.gz" > SHA256SUMS
	# -0: contents are already compressed
	zip -0 -q "$ZIP_FILE" README.md "$BUNDLE_NAME.tar.gz" SHA256SUMS
)
rm -rf "$STAGE_DIR"

echo
echo "Done: dist/$BUNDLE_NAME.zip ($(du -h "$ZIP_FILE" | cut -f1))"
