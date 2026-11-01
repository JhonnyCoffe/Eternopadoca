# Cardápio real com extração de fotos — Plano

> **Para agentes:** Subskill obrigatório: superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans.

**Objetivo:** Criar tela `/admin/fotos` para extração manual, copiar fotos de `Desktop\FOTOSD`, destacar estoque em `ProductsManager`.

**Arquitetura:** Copiar fotos para `public/uploads/fotos/`. Nova página no admin (`ProductsManager` já existe) que lista thumbnails; cada foto abre lista de produtos vinculados (nome, preço, estoque, categoria). Estoque visível na lista sem abrir edição.

**Tech Stack:** Next.js (App Router), TypeScript, React, lucide-react, mesmo DB JSON.

**Spec:** `docs/superpowers/specs/2026-11-01-cardapio-real-design.md`

---

## Restrições globais
- Não altera `StoreFront`.
- Cada foto pode gerar vários produtos.
- Fotos devem ser copiadas manualmente (não upload automático do desktop via web).
- Estoque já existe (`trackStock`, `stock`, `lowStockAt`); apenas destacar visualmente.

## Foco de revisão
- Fotos não encontradas após cópia (`public/uploads/fotos/` vazio).
- Produto vinculado sem foto ou categoria inválida.
- Estoque não atualizado após edição direta no `ProductsManager`.
- Tamanho das imagens no card (`StoreFront`) não foi alterado (não faz parte).

---

### Tarefa 1: Copiar fotos para `public/uploads/fotos/`

**Arquivos:** Nenhum de código; ação manual no sistema de arquivos.

**Passos:**
- [ ] Passo 1: Copiar 10 fotos de `C:\Users\Kawan\Desktop\FOTOSD` para `public/uploads/fotos/`.
- [ ] Passo 2: Verificar que `public/uploads/fotos/` contém as 10 imagens (nome original preservado ou renomeado para `foto-01.jpg` etc.).
- [ ] Passo 3: Commit das fotos (se o repo incluir `public/`).

---

### Tarefa 2: Criar página `/admin/fotos`

**Arquivos:**
- Criar: `src/app/admin/fotos/page.tsx`
- Modificar: `src/app/admin/page.tsx` (adicionar link/navegação para `/fotos` se necessário)

**Interfaces:**
- Usa: `categories`, `products` do DB (`getDb`).
- Produz: Página com lista de fotos (`/uploads/fotos/`) e formulário para adicionar produtos vinculados.

**Passos:**
- [ ] Passo 1: Criar componente básico `src/app/admin/fotos/page.tsx` com lista de thumbnails (`/uploads/fotos/*.jpg` ou similar). Usar `fs` no lado servidor para listar arquivos? Melhor: listar manualmente com array de nomes das fotos, já que são 10 fixas.
- [ ] Passo 2: Adicionar seção por foto: título da foto, lista de produtos vinculados (nome, preço, estoque, categoria). Permitir adicionar novo produto vinculado a essa foto (reutilizar `Draft` de `ProductsManager`).
- [ ] Passo 3: Salvar produto via `saveProduct` (já existente em `src/app/admin/actions.ts`). Vincular `imageUrl` à foto selecionada (`/uploads/fotos/nome.jpg`).
- [ ] Passo 4: Testar acesso a `/admin/fotos` com sessão `dono`.
- [ ] Passo 5: Commit.

---

### Tarefa 3: Destacar estoque em `ProductsManager`

**Arquivos:**
- Modificar: `src/components/admin/ProductsManager.tsx`

**Interfaces:**
- Usa: `product.stock`, `product.trackStock`.
- Produz: Badge de estoque sempre visível (não só quando `trackStock` é true? Manter atual: só quando `trackStock` é true, mas destacar mais). O usuário quer que fique visível sem clicar em editar — já está visível na lista. Talvez melhorar destaque.

**Passos:**
- [ ] Passo 1: Verificar se estoque já aparece (`Estoque: X un`). Se sim, apenas melhorar contraste (ex.: adicionar `font-black` e cor verde quando `trackStock` e `stock > 0`).
- [ ] Passo 2: Se não aparece sem `trackStock`, fazer com que apareça quando `trackStock` é true (já faz). Manter.
- [ ] Passo 3: Adicionar no card (`StoreFront`) não faz parte; ignorar.
- [ ] Passo 4: Rodar `npm run lint` e `npm run build` para confirmar.
- [ ] Passo 5: Commit.

---

### Tarefa 4: Confirmar fotos 800×800 e ajuste visual

**Arquivos:**
- Nenhum código novo. As fotos já são copiadas; o código já indica `ideal 800 × 800`. Se as fotos originais não forem 800×800, o usuário deve redimensionar manualmente antes de copiar, ou aceitar o tamanho atual.
- Se necessário, criar `scripts/resize-fotos.mjs` para redimensionar as fotos copiadas para 800×800.

**Passos:**
- [ ] Passo 1: Verificar dimensões das fotos em `public/uploads/fotos/`. Se não forem 800×800, criar script simples (`sharp` ou `jimp`) para redimensionar.
- [ ] Passo 2: Aplicar redimensionamento.
- [ ] Passo 3: Confirmar que `ProductsManager` ainda exibe `imageUrl` corretamente.
- [ ] Passo 4: Commit.
