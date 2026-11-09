# Fase 5 — Multi-loja / SaaS (design curto — início)

## Decisão
Começar com isolamento básico por loja: subdomínio (ex: `loja1.app.com`) + painel super-admin simples. Postgres e S3 só depois, quando necessário para escala.

## O que fazer agora
- Criar tabela `stores` no SQLite (id, subdomain, name, active).
- Criar `subdomain` middleware/rota que resolve pedido da loja atual.
- Criar página `/super-admin/stores` com lista e criação simples.
- Manter SQLite por enquanto; migrar para Postgres só com múltiplos servidores.

## Abordagens descartadas agora
- Postgres imediato (SQLite ainda atende para MVP multi-loja).
- S3 (uploads ainda podem ser locais até volume crescer; usar `.env` para definir.

## Critérios
- Super-admin vê lista de lojas.
- Cada loja tem subdomínio/link único.
- Sem quebrar loja atual.
