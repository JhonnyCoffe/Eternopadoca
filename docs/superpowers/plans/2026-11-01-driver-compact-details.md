# Painel compacto do entregador Implementation Plan

**Goal:** Mostrar resumo operacional compacto, com detalhes expansíveis por entrega.

**Architecture:** `DriverPanel` mantém estado local de expansão por `order.id`. Frete, endereço e pagamento ficam sempre visíveis; itens, observações e total ficam em `<details>` controlado por botão.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS 4, lucide-react.

**Scope:** Atualizar cartões de entregas disponíveis e em rota. Histórico permanece compacto com frete.

## Tasks

- [x] Adicionar estado `expandedOrderId` e alternância acessível.
- [x] Mostrar endereço, pagamento e frete no resumo persistente.
- [x] Mostrar itens, observações e total no painel expandido.
- [x] Destacar pagamento pendente e dinheiro.
- [x] Manter ações GPS, WhatsApp e status fora do painel expansível.
- [x] Rodar detector visual, lint e build.
