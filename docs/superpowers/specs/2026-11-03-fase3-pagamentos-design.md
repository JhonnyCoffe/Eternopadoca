# Fase 3 — Pagamentos (decisão simples)

**Escolha:** SIMPLES — manter Pix chave fixa (já existe `pixKey` no `.env` e no `storefront`), cartão/VR/dinheiro na entrega sem gateway automático. Sem webhook, sem QR dinâmico, sem billing externo.

**O que já existe:**
- `Checkout` com `Pix` (chave fixa), `cartão`, `dinheiro`, `vr`.
- `SettingsForm` edita `pixKey`, `deliveryFee`, `minOrder`.
- `Dashboard` mostra pagamentos (`pago`/`pendente`).

**O que falta para concluir:** nada além do que já está implementado.

## Próximos passos após Fase 3 simples
- Fase 4 (WhatsApp oficial — bloqueado por Meta/burocracia) ou
- Fase 5 (multi-loja / SaaS — grande escopo, 4-8 semanas).
