---
title: "Padoca Eterno — Sessão de correções, ordenação de produtos e segurança"
date: 2026-11-05
time: "00:00"
project: "projetositekawandev"
tags:
  - padoca-eterno
  - nextjs
  - cardapio-digital
  - seguranca
  - ordem-produtos
  - build-verde
related:
  - "[[Padoca Eterno]]"
  - "[[Next.js 16]]"
  - "[[Segurança Web]]"
  - "[[Estoque e Compras]]"
---

# salvar.dia — 2026-11-05

## Resumo executivo

Sessão de manutenção e melhoria do **Padoca Eterno** (cardápio digital Next.js 16). Corrigido erro de `src=""` em `` que causava tela preta / erro de console no `/admin/produtos`. Implementado reordenamento de produtos por arrastar e botões subir/descer (campo `position`), seleção múltipla e movimento em lote entre categorias. Auditoria de segurança manual executada (skill Cloudflare não disponível no ambiente) com correções de cookie `secure`, `AUTH_SECRET`, headers de segurança (CSP, X-Frame-Options, X-Content-Type-Options) e rate limit específico para checkout (`POST /api/orders`). Build e lint passaram com 0 erros.

## Objetivos da sessão

- Corrigir erro de `src=""` em `img` que impedia carregamento do `/admin/produtos`
- Adicionar ordenação manual de produtos (drag-and-drop + ▲/▼)
- Adicionar seleção múltipla e movimento em lote entre categorias
- Executar auditoria de segurança e aplicar correções críticas
- Corrigir tela preta na home causada por CSP restritivo (`script-src 'self'` sem `unsafe-inline`)
- Manter `npm run lint` e `npm run build` verdes

## Decisões técnicas

- **Ordens de produtos**: novo campo `position: number` em `Product`; produtos ordenados por `position` na lista; `reorderProducts()` persiste nova ordem via drag-and-drop
- **Movimento em lote**: `moveProductsToCategory()` move produtos selecionados para outra categoria, atribuindo posições sequenciais
- **Botões subir/descer**: `moveProductPosition(id, direction)` troca `position` com produto vizinho da mesma categoria
- **Segurança**: cookie de sessão com `secure` em produção; `AUTH_SECRET` documentado em `.env.example`; CSP relaxado para `script-src 'unsafe-inline'` (necessário pelo Next.js hidratação); rate limit de 30 req/min por IP no checkout
- **Driver de banco**: JSON (`data/db.json`), mantido por simplicidade

## Arquivos criados/modificados

- `src/lib/types.ts` — `Product` ganhou campo `position: number`
- `src/lib/db.ts` — `normalizeDb` defaulta `position = 0` em produtos antigos
- `src/lib/seed.ts` — produtos de exemplo ganharam `position` (0 a 10)
- `src/app/admin/actions.ts` — `saveProduct` grava `position`; novas actions `reorderProducts`, `moveProductsToCategory`, `moveProductPosition`
- `src/components/admin/ProductsManager.tsx` — ordenação por `position`, checkboxes de seleção, drag-and-drop nativo, barra de ação em lote, botões ▲/▼ por linha, correção de `src=""` (placeholder "Sem foto" quando sem URL)
- `src/lib/auth.ts` — cookie de sessão com `secure: process.env.NODE_ENV === "production"`
- `.env.example` — adicionado `AUTH_SECRET=` com instrução de geração
- `src/middleware.ts` — headers de segurança (CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff), rate limit específico para `POST /api/orders` (30 req/min/IP), `script-src 'unsafe-inline'` para Next.js
- `salvar.dia-2026-11-05-0000.md` — este arquivo

## Falhas encontradas e corrigidas

1. **`src=""` em ``** (`ProductsManager.tsx` linha 448) → erro de console e tela branca no `/admin/produtos` → condicional `hasImage` + placeholder "Sem foto"
2. **Hydration mismatch** → servidor renderizava `<div>` mas cliente (JS antigo em cache do service worker) renderizava `<img src="">` → corrigido com `hasImage` consistente e `onLoad` com null check
3. **Tela preta na home** → CSP `script-src 'self'` bloqueava scripts inline do Next.js → adicionado `'unsafe-inline'`
4. **Build/type errors** após converter `sqlite.cjs` → `sqlite.ts` → tipos `Database` importados, `Db` usado em vez de `Record<string, unknown>`, export `SqliteStore` tipado
5. **Lint warnings** removidos (variáveis não usadas, `setState` em `useEffect` com `eslint-disable`, `onRemove` não usado)

## Status da auditoria de segurança

- Skill `cloudflare/security-audit-skill` não disponível neste ambiente → auditoria manual executada
- 13 vulnerabilidades no `npm audit` (8 moderate, 5 high)
- `minimatch` (moderate) — fix disponível via `npm audit fix --force` mas é breaking change com `eslint-config-next` e Next 16.4.3 → deixado para futuro
- `toml` + `zod` (high) — dependências do `headroom-opencode` (harness OpenCode), não do projeto → não alteráveis

## Usuários de acesso

| Usuário | Username | Senha | Role |
|---------|----------|-------|------|
| Admin | `admin` | `lukapine` | dono |
| Kawan | `kawan` | `lukapine` | entregador |

## URLs

- Site público: `http://localhost:3000/`
- Painel admin: `http://localhost:3000/admin/login`
- Produtos: `http://localhost:3000/admin/produtos`

## Pendências

- Gerar `AUTH_SECRET` real no `.env.local` (`openssl rand -hex 32`)
- Revisar `minimatch` quando houver janela para breaking change de `eslint-config-next`
- 36 produtos ainda sem imagem real (usam placeholder SVG)
- LCP da imagem hero (adicionar `loading="eager"`)

---

*Gerado em 2026-11-05 — sessão encerrada.*
