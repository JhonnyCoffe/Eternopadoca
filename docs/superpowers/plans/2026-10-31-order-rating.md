# Avaliação do pedido Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Salvar avaliação de 1–5 estrelas no pedido concluído e exibi-la ao cliente após entrega.

**Architecture:** O campo opcional fica em `Order`. Endpoint público valida código, status e nota usando `mutateDb`; `TrackingView` mostra card de estrelas somente após `concluido`.

**Tech Stack:** Next.js 16.4.3, React 19, TypeScript, SQLite/JSON existente.

**Spec:** `docs/superpowers/specs/2026-10-31-order-rating-design.md`

## Global Constraints

- Aceitar somente inteiros de 1 a 5.
- Permitir uma avaliação por pedido.
- Salvar via `mutateDb`.
- Mostrar exatamente `Código de entrega: 0000`.
- Não adicionar comentário nesta etapa.

## Review Focus

- Nota decimal, zero, seis ou texto deve retornar 400. Teste no endpoint/helper.
- Pedido não concluído não aceita avaliação. Teste no endpoint/helper.
- Segunda avaliação não sobrescreve primeira. Teste no endpoint/helper.
- Pedido inexistente retorna 404. Teste no endpoint/helper.
- Cliente sem avaliação vê estrelas; cliente avaliado vê confirmação. Teste visual/manual.

---

### Task 1: Modelo e validação de avaliação

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/rating.ts`
- Test: `src/lib/rating.test.ts`

**Interfaces:**
- `saveOrderRating(db: Db, code: string, rating: number): { ok: true; order: Order } | { ok: false; status: number; error: string }`.

- [ ] Escrever teste falhando para nota válida, inválida, pedido não concluído e segunda avaliação.
- [ ] Rodar teste e confirmar falha porque campo/helper não existe.
- [ ] Adicionar `rating?: number` e `ratedAt?: string` a `Order`.
- [ ] Implementar validação e gravação no objeto encontrado pelo código.
- [ ] Rodar teste focado e confirmar aprovação.

### Task 2: Endpoint público

**Files:**
- Create: `src/app/api/pedido/[code]/avaliacao/route.ts`
- Test: `src/lib/rating.test.ts`

**Interfaces:**
- `POST /api/pedido/:code/avaliacao` recebe `{ rating }` e retorna `{ ok, order }`.

- [ ] Adicionar teste de contrato para status HTTP e payload.
- [ ] Implementar endpoint usando `mutateDb` e `saveOrderRating`.
- [ ] Retornar 404 para pedido inexistente, 400 para entrada inválida, 409 para segunda avaliação ou status incorreto.
- [ ] Rodar teste focado.

### Task 3: Tela de acompanhamento

**Files:**
- Modify: `src/components/tracking/TrackingView.tsx`

**Interfaces:**
- Card de avaliação aparece somente em `order.status === "concluido"`.
- Envio usa `POST /api/pedido/${order.code}/avaliacao`.

- [ ] Atualizar descrição de `chegou` para `Código de entrega: ${order.code}`.
- [ ] Criar estado local de nota, envio e erro.
- [ ] Renderizar cinco botões acessíveis de estrela.
- [ ] Enviar nota e atualizar pedido retornado.
- [ ] Mostrar confirmação após avaliação salva.

### Task 4: Verificação

**Files:**
- Modify: nenhum, salvo defeito encontrado.

- [ ] Rodar `npm run lint`.
- [ ] Rodar `npm run build`.
- [ ] Rodar testes de rating, SQLite, entrega, código e chat.
- [ ] Testar manualmente pedido concluído e segunda tentativa.
