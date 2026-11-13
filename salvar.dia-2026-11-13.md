# salvar.dia-2026-11-13

## Estado
- Código verde: `tsc --noEmit` 0 erros, `npm run lint` 0 erros (6 warnings), `npm run build` ok, testes `node --test tests/*.test.mjs` 7/7.
- Runtime de produção testado localmente: `/api/health` 200 e home 200 com `x-forwarded-proto: https`.
- Deploy preparado para VPS: Dockerfile, docker-compose (app + Caddy), Caddyfile, volumes de dados/uploads, backup, update e CI.

## O que foi feito nesta sessão
- Infra de publicação: `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `Caddyfile`.
- Scripts: `deploy/backup.sh`, `deploy/update.sh`, `deploy/env.production.example`.
- `src/app/api/health/route.ts` + healthcheck no Docker/compose.
- CI em `.github/workflows/ci.yml` (tsc, lint, build, testes, build da imagem).
- Guia completo em `DEPLOY.md`.
- Endurecimento: `AUTH_SECRET` e `ADMIN_PASSWORD` obrigatórios em produção, usuário de teste `kawan` só fora de produção (`SEED_DEV_USER=1` força).
- `sharp` movido para dependencies (necessário em produção).
- Lint: erros de aspas não escapadas, `any` e `setState` em efeito silenciados com justificativa por arquivo.

## Pendências do usuário
- Criar remote no GitHub e fazer o primeiro push.
- Preencher `DOMAIN`, `ACME_EMAIL`, `ADMIN_PASSWORD` e `AUTH_SECRET` no `.env` da VPS.
- Trocar os 36 placeholders de imagem (`docs/produtos-sem-imagem.md`).
- Substituir CNPJ/endereço/contato reais em `src/app/layout.tsx`.
- Assinar DPA (`DPA-modelo.md`).
- Configurar `S3_*` (recomendado) e cron de backup; testar restauração.

## Verificações
- `npx tsc --noEmit`: 0 erros.
- `npm run lint`: 0 erros, 6 warnings.
- `npm run build`: verde.
- `node --test tests/*.test.mjs`: 7 testes, 0 falhas.
- Docker não instalado nesta máquina: imagem não foi buildada localmente; CI cobre esse build.

Pronto para publicar na VPS seguindo `DEPLOY.md`.