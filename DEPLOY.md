# Publicar na VPS (Docker + Caddy)

Guia do deploy em producao. Stack: Next.js 16 em container, SQLite em volume, Caddy com HTTPS automatico.

## 0. Pre-requisitos

- VPS com Ubuntu 22.04/24.04, **minimo 2 GB RAM e 1 vCPU** (build do Next consome memoria).
- Dominio com acesso ao DNS.
- Repositorio no GitHub (o repo local ainda nao tem remote).

Criar o remote e enviar o codigo:

```bash
git remote add origin git@github.com:<usuario>/<repo>.git
git push -u origin master
```

## 1. DNS

No painel do seu provedor de dominio, crie dois registros tipo `A`:

| Nome | Valor |
|---|---|
| `@` (ou o subdominio, ex: `cardapio`) | IP da VPS |
| `www` | IP da VPS |

Espere a propagacao (`nslookup cardapio.seudominio.com.br`) antes de subir o Caddy, senao o certificado falha.

## 2. Preparar a VPS

```bash
ssh root@SEU_IP

# Docker + compose
curl -fsSL https://get.docker.com | sh

# Firewall: apenas SSH, HTTP e HTTPS
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

## 3. Baixar o projeto

```bash
mkdir -p /srv && cd /srv
git clone git@github.com:<usuario>/<repo>.git cardapio
cd cardapio
```

Se o repo for privado, gere uma deploy key na VPS (`ssh-keygen -t ed25519`) e cadastre a chave publica em **GitHub → Settings → Deploy keys** (somente leitura).

## 4. Configurar variaveis

```bash
cp deploy/env.production.example .env
nano .env
```

Obrigatorio preencher:

- `DOMAIN` e `ACME_EMAIL`
- `ADMIN_PASSWORD` — senha longa e unica
- `AUTH_SECRET` — gere com `openssl rand -hex 32`

Opcional: `S3_*` para guardar imagens no R2/S3 em vez do disco da VPS.

## 5. Subir

```bash
docker compose up -d --build
docker compose ps
```

Primeiro build leva alguns minutos. Verificacoes:

```bash
curl -fsS https://SEU_DOMINIO/api/health   # {"ok":true}
curl -I https://SEU_DOMINIO                # 200 e HSTS
```

Acesse `https://SEU_DOMINIO/admin` e entre com o usuario `admin` e a senha do `.env`.

## 6. Dados iniciais

O primeiro boot cria o banco em `/app/data/app.sqlite` (volume `app_data`) com o cardapio de exemplo.

Para importar os dados do seu PC (JSON local):

```bash
# no seu PC, envie o arquivo
scp data/db.json root@SEU_IP:/srv/cardapio/data-import.json

# na VPS, antes do primeiro start
docker compose create
docker compose cp data-import.json app:/app/data/db.json
docker compose up -d
```

O app importa o JSON para o SQLite automaticamente no primeiro acesso. Uploads antigos: copie `public/uploads/*` para o volume `app_uploads` (ou refaca os uploads pelo painel).

## 7. Backup automatico

Teste manual:

```bash
chmod +x deploy/*.sh
./deploy/backup.sh
```

Agende no cron (`crontab -e`), todo dia as 3h:

```cron
0 3 * * * cd /srv/cardapio && ./deploy/backup.sh >> logs/backup.log 2>&1
```

Backups ficam em `backups/` na VPS. Copie para fora da VPS periodicamente (ex: `rclone` para R2/Drive). Backup no mesmo servidor nao protege contra perda do servidor.

Restaurar:

```bash
docker compose stop app
docker compose run --rm -v "$PWD/backups:/backups" app \
  sh -c "tar -xzf /backups/app-AAAAMMDD-HHMMSS.tar.gz -C /app"
docker compose start app
```

## 8. Atualizar

```bash
./deploy/update.sh
```

O script faz `git pull`, rebuild da imagem e recria o container. O volume de dados nao e afetado.

## 9. Checklist antes de divulgar

- [ ] 36 imagens de produto trocadas (`docs/produtos-sem-imagem.md`)
- [ ] CNPJ, endereco e contato reais em `src/app/layout.tsx` (linhas ~44-50)
- [ ] WhatsApp e dados da loja conferidos em **Admin → Configuracoes**
- [ ] Senha do usuario `kawan` alterada ou usuario removido (Admin → Usuarios)
- [ ] `AUTH_SECRET` e `ADMIN_PASSWORD` fortes e fora do Git
- [ ] `S3_*` configurado (recomendado) ou backup do volume `app_uploads`
- [ ] DPA assinado com os processadores (`DPA-modelo.md`)
- [ ] Teste real: pedido de entrega e de retirada do inicio ao fim
- [ ] Backup rodando e restauracao testada uma vez

## Problemas comuns

| Sintoma | Causa provavel | Solucao |
|---|---|---|
| Caddy nao emite certificado | DNS nao aponta para a VPS ou porta 80/443 fechada | `dig SEU_DOMINIO`, `ufw status` |
| Container `unhealthy` | App nao sobe (env faltando) | `docker compose logs app` |
| `SQLITE_BUSY` | Duas instancias escrevendo no mesmo banco | Rode **uma** replica do servico `app` |
| Imagens somem apos deploy | Uploads em disco fora do volume | Confirme o volume `app_uploads` ou use `S3_*` |
| Erro `AUTH_SECRET ausente` | `.env` sem `AUTH_SECRET` | Gere e recrie: `docker compose up -d` |

## Notas

- Uma unica instancia do `app`: SQLite nao suporta varias replicas escrevendo.
- Se um dia migrar para Vercel/serverless, a camada de dados precisa virar Postgres (arquivo local nao persiste).
- Logs: `docker compose logs -f app` e `docker compose logs -f caddy`.
