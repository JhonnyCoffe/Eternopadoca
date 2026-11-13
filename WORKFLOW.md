# Workflow de publicação e operação

Cada task tem um dono (eu = agente, você = usuário) e inputs necessários. Não avanço na próxima sem a task anterior concluída e os inputs recebidos.

## Contexto atual (feito)
- Código verde: tsc, lint, build, testes.
- Infra pronta: Dockerfile, docker-compose, Caddyfile, CI, healthcheck, backup, update.
- Repositório GitHub: `https://github.com/JhonnyCoffe/Eternopadoca.git` (branch `main`).

---

## Tarefas

| # | Task | Dono | Inputs necessários | Status |
|---|------|------|--------------------|--------|
| 1 | Provisionar VPS Ubuntu (2 GB RAM, Docker instalado) | Você | — | Aberto |
| 2 | DNS: registros `A @` e `A www` → IP da VPS | Você | — | Aberto |
| 3 | Inserir `.env` de produção no servidor | Você | DOMAIN, ACME_EMAIL, ADMIN_PASSWORD, AUTH_SECRET | Solicitando |
| 4 | Clonar repo e subir `docker compose up -d --build` | Eu | IP da VPS / acesso SSH (opcional, se eu executar remotamente) | Bloqueado |
| 5 | Verificar `https://DOMINIO/api/health` = `{"ok":true}` | Eu | — | Bloqueado |
| 6 | Configurar cron de backup (`deploy/backup.sh`) | Você | — | Bloqueado |
| 7 | Testar restauração de backup | Eu / Você | arquivo de backup válido | Bloqueado |
| 8 | Substituir 36 imagens placeholder (`docs/produtos-sem-imagem.md`) | Você | imagens dos produtos | Bloqueado |
| 9 | CNPJ, endereço e contato reais (`src/app/layout.tsx`) | Você | dados da loja | Bloqueado |
| 10 | Assinar DPA com processadores (`DPA-modelo.md`) | Você | documento assinado | Bloqueado |
| 11 | Configurar `S3_*` (opcional, uploads externos) | Você | credenciais S3/R2 | Bloqueado |
| 12 | Teste real: pedido de entrega + retirada | Você / Eu | — | Bloqueado |

---

## Como avançamos

Você me responde com o bloco de dados da task 3 (ou diz que prefere executar as tasks 4–5 você mesmo no servidor). Eu então:

- Se você fornecer IP + acesso SSH: eu executo clone + compose remotamente.
- Se não: eu te entrego os comandos exatos para copiar e colar na VPS, e eu verifico o resultado depois.

Quais dados você tem agora para a task 3?