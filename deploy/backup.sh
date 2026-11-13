#!/usr/bin/env bash
# Backup de dados + uploads para backups/app-<data>.tar.gz
# Uso: ./deploy/backup.sh   (KEEP=30 ./deploy/backup.sh para guardar 30)
set -euo pipefail

cd "$(dirname "$0")/.."

KEEP="${KEEP:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p backups

docker compose exec -T app tar -czf - -C /app data public/uploads \
  > "backups/app-${STAMP}.tar.gz"

# Remove backups antigos, mantendo os KEEP mais recentes.
ls -1t backups/app-*.tar.gz | tail -n +"$((KEEP + 1))" | xargs -r rm -f --

echo "backup: backups/app-${STAMP}.tar.gz"
