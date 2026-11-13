#!/usr/bin/env bash
# Atualiza o servidor: puxa o codigo, rebuilda a imagem e recria o container.
set -euo pipefail

cd "$(dirname "$0")/.."

git pull --ff-only
docker compose build app
docker compose up -d
docker image prune -f

echo "atualizado: $(git log --oneline -1)"
