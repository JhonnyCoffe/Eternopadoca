# Rastreamento de entrega em tempo real Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o cliente acompanhe a localização atual do entregador durante `saiu`, usando SQLite como fonte única, SSE como transporte principal e polling como fallback.

**Architecture:** A tabela `order_locations` guarda apenas a posição atual e metadados mínimos. O entregador publica por endpoint autenticado, enquanto o cliente recebe snapshot inicial e eventos SSE autorizados pelo código assinado do pedido. A interface usa Leaflet/OpenStreetMap, mas mantém fallback textual e link externo.

**Tech Stack:** Next.js 16.4.3, React 19.3.0, TypeScript, SQLite existente, SSE nativo, `leaflet`, `react-leaflet`, OpenStreetMap.

**Spec:** `docs/superpowers/specs/2026-11-01-real-time-delivery-tracking-design.md`

## Global Constraints

- SQLite atual permanece como fonte única de verdade.
- Não usar Supabase nesta primeira versão.
- Publicar localização somente quando o entregador atribuído estiver em `saiu`.
- Limpar localização ao chegar, concluir ou cancelar.
- Não persistir histórico do trajeto.
- Exigir HTTPS em produção para geolocalização.
- Não registrar coordenadas em logs.
- Código do pedido não será tratado como segredo; usar token assinado para o canal público.
- SSE deve ser opcional; polling deve manter funcionamento quando SSE falhar.
- OpenStreetMap precisa de atribuição visível.
- Preservar fallback para link externo quando mapa não carregar.

## Review Focus

- Código público enumerável não pode autorizar localização: teste de token assinado e rejeição de token inválido.
- Entregador diferente não pode publicar posição: teste de autorização por `driverId`.
- Status fora de `saiu` não pode publicar nem manter localização: teste de transição e limpeza.
- Ping frequente não pode reescrever pedido inteiro: teste da camada de localização separada.
- SSE interrompido não pode congelar a tela: teste de fallback para polling e estado de conexão.

---

### Task 1: Modelar localização e persistência separada

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/sqlite.ts`
- Modify: `src/lib/db.ts`
- Create: `src/lib/location.ts`
- Test: `src/lib/location.test.ts`

**Interfaces:**
- Produces `DeliveryLocation` com `orderId`, `latitude`, `longitude`, `accuracy`, `heading`, `speed`, `updatedAt`.
- Produces `getDeliveryLocation(orderId): Promise<DeliveryLocation | null>`.
- Produces `saveDeliveryLocation(location): Promise<void>`.
- Produces `clearDeliveryLocation(orderId): Promise<void>`.
- Produces `isValidLocationPayload(input): boolean` ou esquema equivalente, aceitando latitude entre -90/90, longitude entre -180/180 e limites de precisão/frequência.

- [ ] **Step 1: Escrever testes falhando** para validar coordenadas, rejeitar payload ausente, salvar/ler posição e limpar posição.
- [ ] **Step 2: Rodar `npm test` ou o comando de testes existente** e confirmar falha específica.
- [ ] **Step 3: Adicionar tabela `order_locations` ao inicializador SQLite**, com `order_id` como chave, índices necessários e `updated_at`.
- [ ] **Step 4: Implementar funções em `src/lib/location.ts`** usando a conexão SQLite existente, sem chamar `mutateDb` nem reescrever tabelas inteiras.
- [ ] **Step 5: Implementar fallback JSON compatível**, se o driver JSON continuar suportado; a posição pode usar arquivo separado `data/locations.json` com lock próprio.
- [ ] **Step 6: Rodar testes de localização e testes SQLite existentes.**
- [ ] **Step 7: Commitar `feat: add delivery location persistence`.**

### Task 2: Autorizar rastreamento público e endpoints de localização

**Files:**
- Modify: `src/lib/auth.ts`
- Create: `src/lib/tracking-token.ts`
- Create: `src/lib/tracking-token.test.ts`
- Create: `src/app/api/pedido/[code]/localizacao/route.ts`
- Create: `src/app/api/pedido/[code]/localizacao/stream/route.ts`
- Modify: `src/app/api/pedido/[code]/route.ts`
- Modify: `.env.example` or documentation file if present

**Interfaces:**
- Produces `createTrackingToken(orderId, code, expiresAt): string`.
- Produces `verifyTrackingToken(token, expectedOrderId, expectedCode): boolean`.
- `POST /api/pedido/[code]/localizacao` accepts `{ token, latitude, longitude, accuracy?, heading?, speed? }` and requires authenticated assigned driver session.
- `GET /api/pedido/[code]/localizacao?token=...` returns current snapshot.
- `GET /api/pedido/[code]/localizacao/stream?token=...` returns `text/event-stream` with `snapshot`, `location`, `status`, and heartbeat events.

- [ ] **Step 1: Escrever testes falhando** para token válido, token expirado, token adulterado, pedido inexistente, status inválido e entregador errado.
- [ ] **Step 2: Implementar token HMAC usando segredo explícito de produção**, com fallback somente para desenvolvimento e expiração configurável.
- [ ] **Step 3: Gerar token no carregamento da página do pedido**, sem expor segredo, e incluí-lo no payload inicial.
- [ ] **Step 4: Implementar POST autenticado**, validando sessão, `order.driverId`, `order.status === "saiu"`, payload e limite de frequência.
- [ ] **Step 5: Implementar GET público com token**, retornando somente localização e estado mínimo do pedido.
- [ ] **Step 6: Implementar SSE com snapshot, heartbeat, reconexão e encerramento após status terminal.** Usar um registro em memória de assinantes por `orderId`; publicar evento após cada gravação válida.
- [ ] **Step 7: Adicionar fallback de polling ao endpoint público.**
- [ ] **Step 8: Rodar testes de token, API e suíte existente.**
- [ ] **Step 9: Commitar `feat: add secure delivery tracking endpoints`.**

### Task 3: Integrar publicação GPS no painel do entregador

**Files:**
- Modify: `src/components/driver/DriverPanel.tsx`
- Create: `src/components/driver/DeliveryLocationPublisher.tsx`
- Modify: `src/app/admin/actions.ts` only if status cleanup requires server action
- Test: `src/components/driver/location-publisher.test.ts` if test tooling supports it; otherwise extract pure policy tests to `src/lib/location.ts`

**Interfaces:**
- `DeliveryLocationPublisher` recebe `{ orderId, code, status, trackingToken }`.
- Usa `navigator.geolocation.watchPosition` somente quando status for `saiu`.
- Publica no máximo uma posição por intervalo configurado, com filtro mínimo de deslocamento.
- Expõe estados `idle`, `requesting`, `active`, `denied`, `offline`, `stopped`.

- [ ] **Step 1: Escrever testes de política** para não publicar fora de `saiu`, limitar frequência e encerrar ao desmontar.
- [ ] **Step 2: Implementar componente cliente** com permissões, `watchPosition`, envio POST, erro de GPS, estado de conexão e última sincronização.
- [ ] **Step 3: Inserir componente no card “Comigo”**, com botão grande “Iniciar rota e compartilhar localização” e aviso de privacidade.
- [ ] **Step 4: Encerrar watcher quando ação de chegada ou conclusão retornar sucesso.**
- [ ] **Step 5: Verificar manualmente permissão negada e reconexão.**
- [ ] **Step 6: Rodar lint, typecheck e testes.**
- [ ] **Step 7: Commitar `feat: publish driver location from delivery panel`.**

### Task 4: Exibir mapa e tempo real para cliente

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/components/tracking/DeliveryMap.tsx`
- Create: `src/components/tracking/LiveDeliveryTracker.tsx`
- Modify: `src/components/tracking/TrackingView.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- `DeliveryMap` recebe posição atual e renderiza marcador, precisão e atribuição OSM.
- `LiveDeliveryTracker` recebe `orderCode`, `trackingToken`, `orderStatus` e posição inicial.
- `LiveDeliveryTracker` tenta SSE primeiro, atualiza conexão, reconecta e usa polling como fallback.

- [ ] **Step 1: Adicionar dependências Leaflet compatíveis com React 19** e tipos necessários.
- [ ] **Step 2: Criar mapa client-only**, evitando acesso a `window` durante SSR, com atribuição obrigatória.
- [ ] **Step 3: Criar tracker SSE** com `EventSource`, fechamento no unmount, heartbeat, reconexão e polling de 15 segundos após falha.
- [ ] **Step 4: Adicionar bloco de rastreamento somente para delivery em `saiu`**, colocando mapa como primeiro bloco visual.
- [ ] **Step 5: Implementar estados “Aguardando localização”, “Ao vivo”, “Reconectando”, “Última atualização há X min” e mapa indisponível.
- [ ] **Step 6: Manter chat, WhatsApp, endereço e link externo existentes.**
- [ ] **Step 7: Rodar build e lint.**
- [ ] **Step 8: Commitar `feat: show live delivery tracking map`.**

### Task 5: Limpeza de localização e documentação operacional

**Files:**
- Modify: `src/app/admin/actions.ts`
- Modify: `src/lib/orders.ts` or status transition owner identified during implementation
- Create: `docs/real-time-delivery-tracking.md`
- Modify: `AGENTS.md` only if project conventions need recording

- [ ] **Step 1: Adicionar limpeza explícita ao marcar `chegou`, `concluido` ou `cancelado`.**
- [ ] **Step 2: Rejeitar publicação posterior e encerrar streams ativos com evento de status.**
- [ ] **Step 3: Documentar variáveis de ambiente, HTTPS, limites OSM, escolha de hospedagem, fallback polling e privacidade.**
- [ ] **Step 4: Rodar testes, lint e build completos.**
- [ ] **Step 5: Commitar `docs: document live delivery tracking operations`.**

### Task 6: Revisão visual e hardening Impeccable

**Files:**
- Modify only changed UI files after visual inspection.

- [ ] **Step 1: Iniciar app em modo desenvolvimento e abrir página de cardápio, pedido e entregador.**
- [ ] **Step 2: Verificar visual em viewport mobile e desktop, incluindo estados sem GPS e erro.**
- [ ] **Step 3: Corrigir hierarquia, espaçamento, acessibilidade, foco, contraste e `prefers-reduced-motion` conforme design aprovado.**
- [ ] **Step 4: Rodar detector Impeccable uma vez nos alvos alterados:** `C:\Users\Kawan\.config\opencode\skills\impeccable\scripts\impeccable.cmd detect --json <changed targets>`.
- [ ] **Step 5: Corrigir achados críticos e repetir lint/build/testes.**
- [ ] **Step 6: Commitar `refactor: polish live tracking interface`.**

## Verificação final

Run:

```powershell
npm run lint
npm run build
npm test
```

Expected: all commands pass; production build completes without browser-only Leaflet imports during server rendering.
