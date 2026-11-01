# 🍔 Cardápio Digital + Painel de Pedidos

Uma versão funcional inspirada na OlaClick: **cardápio digital com pedidos** e **painel administrativo** para o restaurante. Tudo roda no seu computador, sem precisar configurar banco de dados.

---

## ▶️ Como abrir o app

**Opção 1 — mais fácil (Windows)**
Dê **duplo clique** em `INICIAR.bat`. Ele abre o servidor e o navegador sozinho.

**Opção 2 — pelo terminal**
```bash
npm run dev
```
Depois abra: http://localhost:3000

---

## 🔐 Painel do restaurante

- Endereço: http://localhost:3000/admin
- Senha padrão: `admin123`

> Para trocar a senha, edite o arquivo `.env.local` e mude `ADMIN_PASSWORD`. Depois reinicie o servidor.

---

## 🧭 O que já funciona

### Experiência
- Tema escuro por padrão, minimalista, com transparência e cantos arredondados
- Animações suaves de entrada em páginas e listas
- Layout responsivo (celular, tablet e desktop)

### Cardápio (cliente)
- Categorias com emoji, busca e destaques
- Fotos, descrições e preços dos produtos
- Carrinho que **não some** ao recarregar a página
- Checkout com entrega ou retirada, taxa de entrega e pedido mínimo
- Pagamento: Pix, cartão na entrega ou dinheiro
- Pedido gera um **código** (ex: `#NQ44`) e um botão que abre o **WhatsApp** do restaurante com tudo preenchido
- Loja aberta/fechada reflete na hora no cardápio

### Painel (restaurante)
- **Dashboard** com faturamento, pedidos, ticket médio, gráfico de 7 dias, status, mais vendidos e pagamentos
- Lista de pedidos com filtros por status e atualização automática a cada 15s
- Resumo do dia: pedidos, faturamento, ticket médio e pedidos aguardando
- Avanço de status: **Novo → Preparando → Pronto/Saiu → Concluído** (ou cancelar)
- Botão para chamar o cliente no WhatsApp
- Crescer/apagar produtos, pausar item sem excluir
- **Upload de foto direto do dispositivo** (arrastar ou escolher arquivo, até 5 MB)
- **Dimensões da imagem exibidas** (ex: 720 × 720 px) com aviso quando não é quadrada
- Gerenciar categorias
- Configurar nome, cor da marca, capa, logo, WhatsApp, endereço, taxas, Pix etc.

---

## 💾 Onde ficam os dados

Por padrão, tudo é salvo em `data/db.json` (criado automaticamente na primeira execução com um cardápio de exemplo).

Para ativar SQLite local:

```env
DB_DRIVER=sqlite
```

Depois execute `node scripts/migrate-json-to-sqlite.mjs` antes de iniciar o app. O banco fica em `data/app.sqlite`.

- Para voltar ao JSON: use `DB_DRIVER=json` e reinicie o servidor.
- Para **zerar** dados JSON: apague `data/db.json` e reinicie o servidor.
- Para **fazer backup**: copie `data/db.json` ou o arquivo `data/app.sqlite`.
- A migração cria backup timestampado do JSON antes de importar.
- Fotos enviadas pelo painel ficam em `public/uploads` (linkadas automaticamente ao produto).
- Também é possível usar links externos (ex: Unsplash) colando a URL.

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|---|---|
| Runtime | Node.js 22.5+ (`node:sqlite`) |
| Framework | Next.js 16 (App Router) |
| Interface | React 19 + Tailwind CSS 4 (tema escuro) |
| Ícones | lucide-react |
| Dados | Arquivo JSON local (`data/db.json`) |
| Imagens | Upload em `public/uploads` (até 5 MB) |
| Login | Cookie de sessão (senha no `.env.local`) |

### Estrutura principal
```
src/
  app/
    page.tsx              → cardápio público
    api/orders/route.ts   → cria pedidos (valida preços no servidor)
    api/upload/route.ts   → upload de imagens (protegido por login)
    admin/                → dashboard, pedidos, cardápio, configurações
  components/
    storefront/           → vitrine + carrinho
    admin/                → dashboard, pedidos, produtos, configurações
  lib/
    db.ts                 → leitura/gravação dos dados
    seed.ts               → cardápio de exemplo
```

> 📌 Próximas fases, complexidade e estimativas em [`ROADMAP.md`](./ROADMAP.md).

---

## ⚠️ Limitações desta versão (v1)

- Feito para **uma loja só** (não é multi-restaurante como a OlaClick).
- Dados em arquivo local: funciona bem no seu PC. Para publicar na internet com vários clientes, o próximo passo é trocar por um banco (ex: Postgres/Supabase).
- Envio do pedido depende do cliente clicar em "Abrir WhatsApp" — não envia automaticamente.
- Sem integração com pagamento online, impressão, entregador ou nota fiscal ainda.

---

## 🚀 Próximos passos sugeridos

1. Trocar fotos e produtos pelos do seu restaurante (Painel → Cardápio)
2. Ajustar cores e textos (Painel → Configurações)
3. Publicar online (Vercel) + banco de dados
4. Login por restaurante (multi-loja) e link próprio por cliente
5. Integrações: impressora, iFood, pagamento online

---

Feito para evoluir junto com você. Peça mudanças em linguagem natural e seguimos construindo. 🚀
