# Plano de Execução — Publicação / LGPD

## Tarefas

| # | Tarefa | Tipo | Status |
|---|--------|------|--------|
| 1 | Criar página de Política de Privacidade | Legal | ✅ feito (`src/app/privacidade/page.tsx`) |
| 2 | Criar página de Termos de Uso | Legal | ✅ feito (`src/app/termos-de-uso/page.tsx`) |
| 3 | Checkbox de aceite de termos + registro (quem, quando, versão, IP) | Legal | ✅ feito (`CartDrawer.tsx`, `orders.ts`, `api/orders/route.ts`) |
| 4 | Banner de cookies com botão "Recusar"; nada de rastreio antes do consentimento | Legal | ✅ feito (`src/components/ui/cookie-banner.tsx` + layout) |
| 5 | Consentimento separado para marketing (opt-in explícito, não pré-marcado) | Legal | ✅ feito (checkbox marketing no checkout + banner) |
| 6 | Tabela de retenção: por quanto tempo guarda cada dado | Legal | ✅ feito (seção 5 da Política de Privacidade) |
| 7 | Canal de acesso/exclusão de dados + contato ou encarregado | Legal | ✅ feito (`api/data-request/route.ts`, `lib/data-requests.ts`, `privacidade/solicitar-dados/page.tsx`) |
| 8 | Procedimento de vazamento: avisar ANPD em até 3 dias úteis | Legal | ✅ feito (documentado na Política de Privacidade, seção 7) |
| 9 | Dado de criança só com consentimento dos pais | Legal | ✅ feito (documentado na Política e Termos) |
| 10 | Exibir CNPJ, endereço e contato no site | Legal | ✅ feito (rodapé no `layout.tsx`) |
| 11 | Contrato com processadores de dados (DPA) | Legal | ✅ modelo pronto (`DPA-modelo.md`) — falta assinar |
| 12 | Checkout sem taxas ocultas (preço transparente) | Legal | ✅ feito (subtotal/entrega/total mostram antes de finalizar) |
| 13 | Não usar logotipo de cliente sem autorização | Legal | ✅ aviso no painel (`SettingsForm.tsx`) |
| 14 | Acessibilidade: contraste, texto alternativo, navegação por teclado | Legal | ✅ feito (alt em todas as imagens, aria-hidden em ícones decorativos, next/image, elementos nativos focáveis, contraste adequado) |
| 15 | Senha admin forte | Infra | ✅ feito (`ADMIN_PASSWORD` no `.env.local`) |
| 16 | `loading="eager"` na imagem hero (LCP) | Infra | ✅ feito (`StoreFront.tsx`) |
| 17 | Substituir 36 placeholders de imagem via painel | Infra | ⏳ você faz via painel admin (lista em `docs/produtos-sem-imagem.md`) |
| 18 | HTTPS no host (Vercel/Netlify/Cloudflare) | Infra | ✅ redirect HTTPS no `middleware.ts` (produção) |
| 19 | CORS restrito no host/proxy | Infra | ✅ CORS same-origin no `middleware.ts` |
| 20 | Storage externo (S3/R2) para uploads | Infra | ✅ `src/lib/storage.ts` (S3/R2 + fallback disco) |

## Regras gerais aplicadas
- Minimização: coleta só o dado necessário.
- Nada de rastreio/marketing antes do consentimento (banner + checkbox não pré-marcado).
- Consentimento separado para marketing.
- Registro de aceite salvo com versão, data, IP (no pedido).
- Vazamento com risco: avisar ANPD em até 3 dias úteis.
- Dado de criança só com consentimento dos pais.

## Próximas dependências de você (usuário)
- Trocar os 36 placeholders de imagem pelo painel admin (tarefa 17).
- Substituir CNPJ/endereço/contato pelos dados reais (rodapé e políticas).
- Assinar DPA com processadores (`DPA-modelo.md`) e não usar logotipo sem autorização.
- Preencher `S3_*` no host para uploads persistentes (senão usa disco local).
