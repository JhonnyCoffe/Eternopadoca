---
title: "Padoca Eterno — Página de detalhe do produto, variações (tamanho/sabor) e upload de imagem via Family Drawer"
date: 2026-11-08
time: "00:00"
project: "projetositekawandev"
tags:
  - padoca-eterno
  - nextjs
  - cardapio-digital
  - produto-detalhe
  - variacoes
  - carrinho
  - familia-drawer
  - upload-imagem
related:
  - "[[Padoca Eterno]]"
  - "[[Next.js 16]]"
  - "[[Estoque e Compras]]"
  - "[[Carrinho de Compras]]"
  - "[[Painel Admin]]"
---

# salvar.dia — 2026-11-08

## Resumo executivo

Implementação da **página de detalhe do produto** no estilo iFood para o cardápio digital **Padoca Eterno** (Next.js 16 + React 19 + Tailwind v4), com suporte a **variações de tamanho e sabor**, **carrinho com variação persistida** e **checkout enviando tamanho/sabor nos itens**. Também integrado o **File Upload Flow** (Family Drawer + Vaul + Framer Motion) no painel do dono para upload de imagem do produto ao editar/cadastrar. Além disso, adicionado o campo de variações no `ProductsManager` (admin). Build e `tsc --noEmit` passaram com 0 erros.

## Objetivos da sessão

- Criar página de detalhe do produto (`/produto/[id]`) com foto no terço superior, nome + descrição persuasiva no centro, selecionador de quantidade (− 1 +) e total no terço inferior
- Suportar variações de produto (tamanho: 350ml / 2L; sabor: uva / laranja / limão / guaraná)
- Carrinho armazena variação selecionada e exibe no `CartDrawer`
- Checkout (`POST /api/orders`) envia `size` e `flavor` em cada item
- Integrar File Upload Flow (Family Drawer) para upload de imagem na edição de produto no painel admin
- Adicionar UI de cadastro de variações no `ProductsManager`
- Manter `tsc --noEmit` e `next build` verdes

## Decisões técnicas

- **Rota dinâmica**: `src/app/produto/[id]/page.tsx` (server component) busca o produto via action `getProductById(id)` e renderiza `ProductDetailPage`
- **Tipos**: `ProductVariant` (size, flavor, price, stock, active), `variants?: ProductVariant[]` em `Product`; `CartLine` ganhou `size?`, `flavor?`, `unitPrice?`; `OrderItem` ganhou `size?`, `flavor?`
- **Carrinho persistido** em `localStorage` (`brasa_cart_v1`) com chave composta `productId::size:X::flavor:Y`; `StoreFront` escuta evento `storage` para sincronizar entre abas/páginas
- **Página de detalhe**: `ProductDetailPage` grava no mesmo `localStorage` e dispara `StorageEvent` para o `StoreFront` atualizar o contador do carrinho em tempo real
- **File Upload Flow**: `ProductImageUploadDrawer` com 3 views (select → preview → confirm), renderizado via `createPortal(document.body)` para não ficar preso ao stacking context do modal de edição; `z-[60]` no conteúdo e `z-[55]` no overlay do drawer para ficar acima do modal (`z-50`)
- **Framer Motion + Vaul**: dependências `vaul`, `clsx`, `tailwind-merge` instaladas; `src/lib/utils.ts` com utilitário `cn`
- **Variações no admin**: seção "Variações do produto" no modal de `ProductsManager` com add/remover/editar tamanho, sabor, preço, estoque, ativo/inativo

## Arquivos criados/modificados

### Criados
- `src/components/ui/family-drawer.tsx` — `FamilyDrawerRoot`, `Trigger`, `Content`, `AnimatedWrapper`, `AnimatedContent`, `ViewContent`, `Header`, `Button`, `SecondaryButton`, `Close`, `Portal`, `Overlay`, `useFamilyDrawer` (baseado em Vaul + Framer Motion)
- `src/components/ui/product-image-upload-drawer.tsx` — `ProductImageUploadDrawer` (File Upload Flow: seleção, pré-visualização, confirmação)
- `src/components/storefront/ProductDetailPage.tsx` — página cliente de detalhe do produto com seletor de variação, qty − 1 +, total e adicionar ao carrinho
- `src/app/produto/[id]/page.tsx` — rota dinâmica de detalhe do produto
- `src/app/actions/get-product.ts` — action server `getProductById(id)`
- `src/lib/utils.ts` — utilitário `cn` (clsx + tailwind-merge)

### Modificados
- `src/lib/types.ts` — `ProductVariant`, `variants` em `Product`, `size`/`flavor` em `OrderItem`
- `src/components/admin/ProductsManager.tsx` — `Draft.variants`, funções `addVariant`/`removeVariant`/`updateVariantField`/`toggleVariantActive`, UI de variações no modal, `ProductImageUploadDrawer` via portal no body, `TextAnimate` no título do modal, card navega para `/produto/[id]`
- `src/components/storefront/ProductCard.tsx` — clique no card navega para `/produto/[id]` (botões + / − mantêm add direto via `stopPropagation`)
- `src/components/storefront/StoreFront.tsx` — parse da chave composta do carrinho, subtotal usa `unitPrice`, escuta evento `storage` para sincronizar carrinho
- `src/components/storefront/CartDrawer.tsx` — linha exibe tamanho/sabor, `submit` envia `size`/`flavor` nos itens
- `src/app/admin/actions.ts` — `ProductInput.variants`, `saveProduct` grava variantes
- `data/db.json` — banco de dados (JSON) — produtos existentes sem `variants` (campo opcional)
- `package.json` — adicionado `vaul`, `clsx`, `tailwind-merge`, `framer-motion`
- `salvar.dia.md` — índice da última sessão

## Produtos do banco que parecem precisar de variações (candidatos)

| Produto | Variação sugerida |
|---------|-------------------|
| Coca-Cola Original Garrafa PET 600ml / 1L | tamanho: 600ml, 1L |
| Guaraná Antarctica Tradicional Garrafa PET Caçulinha / 600ml / 1L | tamanho |
| It! (Convenção) Laranja / Guaraná Garrafa PET Média | sabor: laranja, guaraná |
| Dolly Guaraná / Limão Garrafa PET Caçulinha | sabor: guaraná, limão |
| Pepsi Twist (Limão) Garrafa PET Pequena | sabor/tamanho |
| Bis (Lacta) Ao Leite / Branco Caixa | sabor: ao leite, branco |
| Parati Água e Sal / Maizena Pacote | tipo |
| Hellmann's Maionese Pote Grande / Pequeno | tamanho |
| Prato Fino Arroz Agulhinha 1kg / 5kg | tamanho |
| Bonare / Quero Milho Verde / Ervilha Lata | tipo |
| Chá Leão Hortelã / Outros Caixinha | sabor |
| Bauducco Wafer Chocolate / Morango Pacote | sabor |

> Como cadastrar variações: `/admin/produtos` → Editar produto → seção "Variações do produto" → `+` → preencher tamanho, sabor, preço, estoque, ativo → Salvar.

## Falhas encontradas e corrigidas

1. **Drawer por baixo do modal de edição** → `FamilyDrawerContent` e `FamilyDrawerOverlay` estavam no mesmo `z-50` do modal; movido o drawer para `createPortal(document.body)` com `z-[60]` e overlay `z-[55]`
2. **Foto do produto sobrepondo caixa de upload** → resolvido com o portal no body e stacking context separado
3. **TypeError `createPortal`** → importado de `react-dom` (não `react-dom/client`)
4. **TS: `size`/`flavor` podem ser `undefined`** → `String(v.size ?? "")` nos seletores de variação

## Usuários de acesso

| Usuário | Username | Senha | Role |
|---------|----------|-------|------|
| Admin | `admin` | `lukapine` | dono |
| Kawan | `kawan` | `lukapine` | entregador |

## URLs

- Site público: `http://localhost:3000/`
- Cardápio: `http://localhost:3000/`
- Detalhe de produto: `http://localhost:3000/produto/[id]`
- Painel admin: `http://localhost:3000/admin/login`
- Produtos (admin): `http://localhost:3000/admin/produtos`

## Pendências

- Preencher variações nos produtos candidatos listados acima via painel admin
- Gerar `AUTH_SECRET` real no `.env.local` (`openssl rand -hex 32`)
- 36 produtos ainda sem imagem real (usam placeholder SVG)
- LCP da imagem hero (adicionar `loading="eager"`)

---

## Conexões Obsidian (neural links)

- #padoca-eterno #nextjs #cardapio-digital #produto-detalhe #variacoes #carrinho #familia-drawer #upload-imagem #obsidian
- [[Padoca Eterno]] · [[Next.js 16]] · [[Estoque e Compras]] · [[Carrinho de Compras]] · [[Painel Admin]]
- Backlinks sugeridos: `[[Produtos]]`, `[[Pedidos]]`, `[[Usuários]]`, `[[Categorias]]`, `[[Carrinho]]`

---

*Gerado em 2026-11-08 — sessão encerrada.*
