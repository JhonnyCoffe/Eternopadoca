---
title: "Padoca Eterno — Sessão de reestruturação e testes E2E"
date: 2026-11-04
time: "15:45"
project: "projetositekawandev"
tags:
  - padoca-eterno
  - nextjs
  - cardapio-digital
  - estoque
  - lista-compras
  - seguranca
  - test-e2e
  - obsidian
related:
  - "[[Padoca Eterno]]"
  - "[[Next.js 16]]"
  - "[[Estoque e Compras]]"
  - "[[Segurança Web]]"
---

# salvar.dia — 2026-11-04 15:45

## Resumo executivo

Sessão dedicada à reestruturação do site de restaurante para **Padoca Eterno** (padaria/mercearia), importação de 133 produtos da planilha Excel, criação de sistema de estoque com lista de compras e alertas, reforço de segurança (headers, rate limit, CSRF por origem), e **teste end-to-end completo** (pedido → preparo → despacho → entrega → conclusão). Todas as falhas encontradas foram corrigidas e o `tsc --noEmit` passa com 0 erros.

## Objetivos da sessão

- Renomear estabelecimento para **Padoca Eterno** e aplicar paleta escura (tons de cinza, sem preto puro).
- Importar produtos de `cadastro_produtos_loja_atualizado.xlsx` (133 itens).
- Criar usuários: `admin / lukapine` (dono) e `kawan / lukapine` (entregador).
- Conectar cardápio ao estoque: estoque baixo → lista de compras + alerta `"{nome} item com estoque baixo"` + seletor `"Selecione a quantidade: "`.
- Testar fluxo completo de pedido e corrigir falhas.

## Decisões técnicas

- **Driver de banco**: JSON (`data/db.json`), porque `node:sqlite` não está disponível neste ambiente.
- **Stack**: Next.js 16 (Turbopack), React 19, Tailwind v4, TypeScript.
- **Segurança**: CSRF por origem (não token em memória, que quebrava Server Actions), rate limit 300 req/60s por IP, headers de segurança no `next.config.ts`.
- **Imagens ausentes**: fallback para `public/placeholder-food.svg` via `lib/image.ts`.
- **Categorias**: remapeadas para categorias reais da planilha (Padaria, Confeitaria, Salgados, Mercearia, Doces e Chocolates, Bebidas, Limpeza, Higiene Pessoal, Utilidades).

## Arquivos criados/modificados

- `src/app/globals.css` — paleta escura + `--brand` caramelo `#c98a4b`
- `src/app/layout.tsx`, `src/app/manifest.ts` — nome "Padoca Eterno"
- `src/app/next.config.ts` — headers de segurança + CSP para API
- `src/middleware.ts` — rate limit + CSRF por origem + fix parsing de host (remove porta)
- `src/lib/seed.ts` — nome, usuários, cores, hero
- `src/lib/db.json` — 133 produtos, 2 usuários, categorias remapeadas, settings atualizadas
- `src/lib/image.ts` — fallback de imagem
- `src/components/storefront/StoreFront.tsx` — skeleton, paleta, estoque, `inc()` para carrinho
- `src/components/storefront/ProductCard.tsx` — tags "Estoque baixo"/"Esgotado", botão desabilitado
- `src/components/storefront/CartDrawer.tsx` — checkout completo (nome, telefone, entrega/retirada, endereço, região, pagamento, observações)
- `src/components/admin/ListaCompras.tsx` — lista de compras com alerta e seletor de quantidade
- `src/components/admin/Dashboard.tsx` — integração da lista + fix `recent`
- `src/components/tracking/LiveDeliveryTracker.tsx` — `DeliveryMap` via `dynamic` (ssr:false)
- `scripts/import_produtos.py` — importador Excel→JSON
- `scripts/remap_categorias.py` — remapeamento de categorias sem perder estoque
- `public/placeholder-food.svg` — placeholder de produto
- `public/sw.js` — cache renomeado para `padoca-v2`
- `docs/superpowers/plans/2026-11-04-padoca-eterno-completo.md` — plano com tasks marcadas

## Falhas encontradas e corrigidas (teste E2E)

1. **Botão "Finalizar pedido" sem ação** → checkout completo implementado.
2. **Login admin 403** (CSRF token em memória nunca emitido) → proteção por origem.
3. **Dashboard quebrava** (`recent is not defined`) → variável definida.
4. **ListaCompras quebrava o admin** (função passada para Client Component a partir de Server Component) → chamada direta de `restockProduct`.
5. **`/pedido/[code]` 500** (leaflet acessa `window` no topo do módulo) → `dynamic` com `ssr:false`.
6. **36 produtos com `imageUrl: "N/A"`** → 404 `/N/A` → fallback `productImage()`.
7. **Categorias erradas** → remapeamento para categorias reais da planilha.
8. **Identidade burger residual** (laranja/rose, `@brasaeburger`) → caramelo, `@padocaeterno`.
9. **Cache do service worker** servia chunks antigos → `padoca-v2`.
10. **Bug no carrinho**: botão "+" chamava `add(Product)` com `string` → criado `inc(productId)`.
11. **`StoreFrontWrapper.tsx` morto** causava erro de tipo → removido.

## Teste E2E executado

- Pedido #3384: 3× Tang Refresco em Pó Sachê → subtotal R$ 30,00, entrega R$ 7,90, total R$ 37,90.
- Admin: login `admin/lukapine` → Receber (pago) → Iniciar preparo → Pronto → Despachar → Marcar chegada → Concluir (CONCLUÍDO/PAGO).
- Estoque baixado de 20 → 17; reposto via lista de compras → 24.
- Lista de compras: com estoque 4 apareceu alerta `"Tang Refresco em Pó Sachê item com estoque baixo"` e seletor `"Selecione a quantidade: "`; após reposição saiu da lista.
- Tracking `/pedido/3384` sem 500, sem erros de console.
- `npx tsc --noEmit` → 0 erros.

## Usuários de acesso

| Usuário | Username | Senha | Role |
|---------|----------|-------|------|
| Admin | `admin` | `lukapine` | dono |
| Kawan | `kawan` | `lukapine` | entregador |

## URLs

- Site público: `http://localhost:3000/`
- Painel admin: `http://localhost:3000/admin/login`
- Tracking de pedido: `http://localhost:3000/pedido/3384`

## Pendências menores

- 36 produtos ainda sem imagem real (usam placeholder SVG).
- Atribuição de entregador é manual antes de despachar.
- Botão "Falar com a loja (chat)" mantém cor rosa hardcoded (nit de design).

## Histórico de interações (resumo)

1. **Usuário**: pediu reestruturação para "Padoca Eterno", paleta escura, importação de produtos da planilha, usuários admin/kawan, estoque + lista de compras com alertas.
2. **Assistente**: instalou skills (taste, ui-ux-pro-max, design-motion), corrigiu site sem estilo (Turbopack), criou usuários, importou 133 produtos.
3. **Usuário**: escolheu Task 5 (conectar cardápio com estoque) → tags de estoque + botão desabilitado.
4. **Usuário**: escolheu Task 6 (segurança/performance) → headers, rate limit, CSRF, skeleton.
5. **Usuário**: pediu teste completo do fluxo de pedido → detectadas 11 falhas → todas corrigidas.
6. **Usuário**: pediu `salvar.dia` com data/hora e histórico para Obsidian.

## Conexões Obsidian (neural links)

- #padoca-eterno #nextjs #cardapio-digital #estoque #lista-compras #seguranca #test-e2e #obsidian
- [[Padoca Eterno]] · [[Next.js 16]] · [[Estoque e Compras]] · [[Segurança Web]] · [[Teste E2E]]
- Backlinks sugeridos: `[[Produtos]]`, `[[Pedidos]]`, `[[Usuários]]`, `[[Categorias]]`, `[[Service Worker]]`

---
*Gerado em 2026-11-04 15:45 — sessão encerrada.*
