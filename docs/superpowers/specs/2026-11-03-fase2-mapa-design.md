# Fase 2 — Mapa / Link Google Maps (design curto)

## Decisão
Começar pelo mapa embutido (Leaflet + OSM) e link de rota externo (`maps/dir/?api=1`), conforme design 2026-11-01. Google Maps Platform fica para depois (custo/billing).

## O que fazer agora
- Componente `TrackingMap` (`src/components/tracking/TrackingMap.tsx`) com Leaflet.
- Ponto `order_locations` já existe (`latitude`, `longitude`, `updated_at`) — usar `src/lib/sqlite` para ler/atualizar.
- Página `/pedido/[code]` já tem `TrackingView.tsx`; adicionar bloco de mapa quando `status === 'saiu'`.
- Painel entregador (`/entregador`): botão "Iniciar rota" + `watchPosition` + POST para `/api/orders/[id]/location` (novo endpoint ou ação).
- Link externo de rota: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` (sem API key).

## Abordagens descartadas agora
- Google Maps embutido (requer billing/chave).
- Supabase Realtime nesta primeira entrega (a design prevê, mas para "mapa primeiro" mantemos polling curto + SSE opcional depois).

## Critérios de aceitação
- Cliente vê mapa em `/pedido/[code]` quando `saiu`.
- Entregador inicia compartilhamento e posição aparece.
- Link Google Maps funciona sem chave.
- Sem quebrar SQLite nem rotas existentes.
