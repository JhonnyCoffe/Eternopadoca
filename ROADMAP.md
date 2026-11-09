# 🗺️ Roadmap — Cardápio Digital (uso interno)

> Documento vivo. As estimativas são de **esforço de desenvolvimento** (não incluem espera por aprovação de terceiros, como gateways e Meta).

## Fase 0 — Concluída ✅

- [x] Cardápio digital público (categorias, busca, destaques, carrinho)
- [x] Checkout entrega/retirada, taxa, pedido mínimo, pagamento declarado
- [x] Pedido com código + envio via WhatsApp (link `wa.me`)
- [x] Painel com login (senha em `.env.local`)
- [x] Gestão de produtos e categorias
- [x] Fluxo de status: Novo → Preparando → Pronto → Concluído
- [x] Configurações da loja (nome, cor, capa, taxas, Pix, aberto/fechado)
- [x] Upload de imagem do dispositivo + leitura de dimensões (ideal 800×800)
- [x] Dashboard (KPIs, faturamento 7 dias, status, mais vendidos, pagamentos)
- [x] Tema escuro minimalista com transparência e animações

---

## Fase 1 — Base operacional sólida (1–2 semanas)

> **Lembrete:** ao iniciar esta fase, usar Superpowers para brainstorming, plano, implementação, revisão e verificação. Não usar para ajustes visuais pequenos.

| Item | Complexidade | Esforço |
|---|---|---|
| Login com usuários e permissões (dono, atendente, cozinha) | Média | 2–3 dias |
| Banco SQLite (troca do JSON, mantém simplicidade) | Média | 2–3 dias |
| Chat interno por pedido (cliente ↔ loja) | Média-alta | 3–5 dias |
| Link público de acompanhamento do pedido (sem mapa) | Baixa | 1 dia |
| Horário de funcionamento por dia da semana | Baixa | 1 dia |
| Taxa de entrega por bairro/raio | Média | 2 dias |
| Cupons de desconto simples | Baixa | 1 dia |
| PWA (instalar no celular, ícone, offline básico) | Baixa | 1–2 dias |
| Notificações no painel (som + badge) | Baixa | 1 dia |

**Recomendação:** começar pelo banco (SQLite) + usuários, pois tudo depois depende disso.

---

## Fase 2 — Entregadores e rastreamento (2–4 semanas)

| Item | Complexidade | Esforço | Observação |
|---|---|---|---|
| Cadastro de entregadores + login próprio | Média | 2–3 dias | mesma base de usuários |
| Fila de entregas / aceite / status | Média | 3–4 dias | |
| Link de rota no Google Maps | Baixa | 0,5 dia | `maps/dir/?api=1&destination=` sem API key |
| Mapa embutido | Média | 2–3 dias | requer API key + billing (Google) ou Leaflet/OSM grátis |
| Rastreamento em tempo real (GPS do entregador) | Alta | 4–6 dias | entregador precisa manter o PWA aberto |
| Notificações push para cliente | Média | 2–3 dias | PWA + service worker |

---

## Fase 3 — Pagamentos online (2–3 semanas + burocracia)

| Item | Complexidade | Esforço | Observação |
|---|---|---|---|
| Pix automático (QR + webhook) | Média | 4–6 dias | gateway: Mercado Pago, Pagar.me, Asaas |
| Cartão de crédito/débito online | Média | 3–5 dias | checkout hospedado (PCI) |
| Vale refeição/alimentação online | Alta | 5–10 dias | exige credenciamento com adquirente; muitos só aceitam POS físico |
| Conciliação e estorno | Média | 2–3 dias | |

**Atenção:** taxas por transação, KYC/CNPJ e contratos são externos ao código.

---

## Fase 4 — WhatsApp oficial + crescimento (2–4 semanas)

| Item | Complexidade | Esforço | Observação |
|---|---|---|---|
| WhatsApp Cloud API (Meta) | Alta | 1–2 semanas | número verificado, templates aprovados, custo por conversa |
| Alertas automáticos (“abrimos”, “hoje não abriremos”) | Média | 2–3 dias | exige opt-in do cliente (LGPD) |
| Campanhas/promoções segmentadas | Média | 3–5 dias | |
| Programa de fidelidade / cashback | Média | 4–6 dias | |
| Estoque com baixa automática | Média | 3–5 dias | |
| Ficha técnica + CMV + margem por item | Média | 4–6 dias | |
| Relatórios e fechamento de caixa | Média | 3–4 dias | exportação CSV |

**Alternativa sem burocracia:** manter `wa.me` + listas de transmissão manuais (já funciona) e usar o chat interno do app para o operacional.

---

## Fase 5 — Multi-loja / SaaS (4–8 semanas)

- Isolamento por restaurante, subdomínio/link próprio
- Painel super-admin, planos e cobrança
- Onboarding self-service
- Escala de banco (Postgres) e storage de imagens (S3/R2)

---

## Ordem sugerida

1. **Banco + usuários** (fundação)
2. **Chat interno + link de rastreio por status** (reduz WhatsApp no dia a dia)
3. **Entregadores + mapa** (operação)
4. **Pagamentos online** (receita)
5. **WhatsApp oficial + fidelidade/estoque** (crescimento)

## Riscos e cuidados

- **LGPD:** telefone, endereço e histórico são dados pessoais. Definir retenção e consentimento (especialmente para promoções).
- **WhatsApp não oficial** (Baileys etc.): risco real de banimento do número. Evitar em produção.
- **JSON local:** ok para 1–5 usuários; não usar com acessos simultâneos intensos. Migrar para SQLite cedo.
- **Uploads em disco:** em deploy serverless (Vercel) o disco é temporário; usar storage externo ao publicar.
- **Escopo:** priorizar a operação diária antes de features “bonitas”. Medir uso real por 2–4 semanas.


---

## Fase 6 — Pendências de segurança e performance (infra/deploy)

> Itens de código "faz agora" já implementados. Os abaixo dependem de hospedagem/configuração.

### Segurança (infra)
- [ ] HTTPS obrigatório — grátis (Vercel/Netlify/Cloudflare, Let's Encrypt automático)
- [ ] CORS restrito — grátis, configurar headers no host/proxy
- [ ] Banco protegido — grátis, permissões de arquivo no servidor
- [ ] Segredos vazados no Git — grátis, revogar/girar chaves se encontrar (scan feito, sem segredos)

### Performance (infra)
- [ ] CDN para estáticos — grátis nos hosts acima
- [ ] Monitoramento de velocidade (Lighthouse CI) — grátis (GitHub Actions)
- [ ] Fila em background (BullMQ/Redis) — free tier (Upstash) ou self-host
- [ ] OpenTelemetry — lib grátis; coletor/infra (Grafana Cloud free tier ou self-host)
- [ ] Múltiplas instâncias / load balancer — geralmente pago

### Observações
- Uploads em disco (public/uploads) são temporários em serverless (Vercel): migrar para storage externo (S3/R2) ao publicar.
- Fila e múltiplas instâncias só fazem sentido com volume; manter simples até medir uso real.
