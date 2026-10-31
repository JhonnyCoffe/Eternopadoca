# Contexto do projeto

## Objetivo atual

Transformar cardápio digital em plataforma operacional multiusuário:

- Loja pública e checkout.
- Painel administrativo por função.
- Cozinha/KDS.
- Entregadores.
- Rastreamento de pedidos.
- Chat pedido-cliente.
- Pagamentos, incluindo VR na entrega.
- Estoque, CMV, margens e zonas de entrega.
- PWA instalável e alertas de novos pedidos.

## Decisões tomadas

- Manter projeto único Next.js.
- Usar rotas protegidas por função: `dono`, `atendente`, `cozinha` e `entregador`.
- Usar cookie de sessão assinado `kawan_session`.
- Manter JSON como banco temporário.
- Usar fila `withWriteLock` e gravação atômica.
- Usar URLs gratuitas do Google Maps, sem API key.
- Usar polling curto: pedidos a cada 10 segundos e chat a cada 4 segundos.
- Reservar WhatsApp para confirmação, promoções e emergências.
- Usar paleta escura com destaque rose/vermelho `#e11d48`.
- Usar PWA sem dependências externas.
- Usar modelos fortes para arquitetura e modelos econômicos para edições rotineiras.
- Não adicionar Playwright porque navegador já existe no harness.
- Criar recomendações de automação para proteção de `.env.local`, lint por arquivo, convenções, smoke test e revisão de segurança.

## Arquivos alterados

### Autenticação e banco

- `src/lib/auth.ts`
- `src/lib/db.ts`
- `src/lib/seed.ts`
- `src/lib/guard.ts`
- `src/lib/types.ts`
- `src/lib/password.ts`

Principais mudanças:

- Login multiusuário.
- Funções e permissões.
- Criação automática do usuário `admin` em banco antigo.
- Normalização de dados antigos.
- Proteção contra corrupção do JSON.

### Painel administrativo

- `src/app/admin/actions.ts`
- `src/app/admin/page.tsx`
- `src/app/admin/pedidos/page.tsx`
- `src/app/admin/cozinha/page.tsx`
- `src/app/admin/entregas/page.tsx`
- `src/app/admin/produtos/page.tsx`
- `src/app/admin/usuarios/page.tsx`
- `src/app/admin/config/page.tsx`
- `src/components/admin/AdminShell.tsx`
- `src/components/admin/OrdersBoard.tsx`
- `src/components/admin/KitchenDisplay.tsx`
- `src/components/admin/DeliveryManager.tsx`
- `src/components/admin/ProductsManager.tsx`
- `src/components/admin/SettingsForm.tsx`
- `src/components/admin/UsersManager.tsx`
- `src/components/admin/OrderAlert.tsx`

Principais mudanças:

- Navegação por função.
- Dashboard com CMV, margem, estoque e pagamentos.
- Gestão de produtos e usuários.
- Horários semanais.
- Zonas de entrega.
- Alertas de pedido novo.
- Badge no título da aba.
- Som de alerta.
- Notificação do sistema quando já autorizada.

### Loja, checkout e rastreamento

- `src/components/storefront/StoreFront.tsx`
- `src/components/storefront/CartDrawer.tsx`
- `src/components/tracking/TrackingView.tsx`
- `src/app/pedido/[code]/page.tsx`

Principais mudanças:

- Seleção de zona.
- Taxa de entrega.
- Retirada.
- Pix.
- Cartão na entrega.
- Dinheiro.
- Vale-refeição na entrega.
- Link de rastreamento após pedido.
- Pedido criado com código público.

### Chat e API

- `src/components/chat/OrderChat.tsx`
- `src/app/api/chat/[orderId]/route.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/upload/route.ts`

Principais mudanças:

- Chat vinculado ao pedido.
- Mensagens cliente/loja.
- Leitura por cada lado.
- Polling automático.
- Contador de mensagens não lidas.

### PWA

- `src/app/manifest.ts`
- `src/components/PwaRegister.tsx`
- `public/sw.js`
- `public/icons/icon-192.png`
- `public/icons/icon-512.png`
- `public/icons/maskable-512.png`
- `public/icons/apple-touch-icon.png`
- `scripts/gen-icons.js`
- `src/app/layout.tsx`

Principais mudanças:

- Manifesto PWA.
- Service worker.
- Cache offline básico.
- Ícones instaláveis.
- Tema rose no navegador.
- Ícone Apple.
- Registro automático do service worker.

### Configuração e documentação

- `eslint.config.mjs`
- `ROADMAP.md`

O ESLint ignora `scripts/**`.

## Problemas pendentes

1. Pedido de teste permanece no banco:
   - Código: `YW8B`
   - Cliente: `Teste E2E`
   - Valor: `R$ 40,80`
   - Pagamento: VR na entrega
   - Status: novo

2. Mensagens de teste permanecem no banco:
   - `Teste chat E2E`
   - `Mensagem do cliente E2E`

3. O badge do título funciona e foi verificado como:
   - `(1) Brasa & Burger — Cardápio digital`

4. O chat funciona, mas falta confirmar visualmente o contador de chat não lido depois de mensagem enviada sem sessão administrativa.

5. `OrderAlert.tsx` teve alteração final após o último build completo.
   - Precisa rodar lint e build novamente.

6. Ainda não foram feitos:
   - Migração para SQLite.
   - Cupons.
   - Push notifications reais.
   - GPS em tempo real.
   - Gateway Pix.
   - Integração oficial WhatsApp.

7. O alerta sonoro depende de interação prévia do navegador para liberar áudio.

8. Existe aviso de hidratação causado pelo Dark Reader:
   - `data-darkreader-mode`
   - Não vem da aplicação.

## Próximo passo exato

1. Rodar:

```powershell
npm run lint
npm run build
```

2. Abrir `/admin/pedidos`.

3. Confirmar:

```text
(1) Brasa & Burger — Cardápio digital
```

4. Abrir o pedido `YW8B`.

5. Confirmar que o chat mostra:

```text
Mensagem do cliente E2E
```

6. Cancelar ou excluir o pedido e mensagens de teste.

7. Depois disso, iniciar próxima fase: migrar JSON para SQLite.
