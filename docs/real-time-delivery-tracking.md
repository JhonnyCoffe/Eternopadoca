# Rastreamento de entrega em tempo real — Operação

## Variáveis de ambiente

- `DB_DRIVER=sqlite`: SQLite como fonte única (`data/app.sqlite`).
- `TRACKING_TOKEN_SECRET`: segredo HMAC para tokens de rastreamento. Definir em `.env.local`.

## HTTPS e geolocalização

- `navigator.geolocation` exige `https://` em produção (não localhost).
- A localização só é publicada quando o entregador está com status `saiu`.
- Não registrar coordenadas em logs (apenas no SQLite e sem histórico de trajeto).

## Limites OSM

- Atribuição visível (`OpenStreetMap · Atribuição visível`).
- Fallback para link externo (`maps/dir/?api=1`) quando mapa não carrega.

## Fallback e privacidade

- SSE (`EventSource`) é o transporte principal; polling a cada 15s é o fallback.
- Token assinado (`createTrackingToken`) autoriza apenas o cliente do pedido pelo código (`order.code`) e pelo pedido (`order.id`).
- Limpar localização (`clearDeliveryLocation`) ao marcar `chegou`, `concluido` ou `cancelado`.
- O componente `LiveDeliveryTracker` encerra o `watchPosition` no unmount.
