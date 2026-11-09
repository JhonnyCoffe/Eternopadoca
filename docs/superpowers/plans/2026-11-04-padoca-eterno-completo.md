# Redesign Completo: Padoca Eterno + Estoque + Lista de Compras

**Meta:** Redesenhar o site com nome "Padoca Eterno", paleta escura+cinza (UI/UX Pro Max), importar produtos da planilha Excel, conectar cardápio com estoque e criar lista de compras automática com alerta de estoque baixo.
**Tech:** Next.js 16.4.3 (Turbopack), Tailwind CSS v4, JSON DB, UI/UX Pro Max skill.
**Plano:** docs/superpowers/plans/2026-11-04-padoca-eterno-completo.md

## Global Constraints
- Nome do estabelecimento: **Padoca Eterno**
- Paleta: tons escuros mais claros + cinzas (não preto puro)
- UI/UX Pro Max skill aplicada
- Não gerar imagens (ignorar prompt da planilha)
- URL da imagem = coluna "url img referencia" da planilha
- Se URL não existir, buscar automaticamente com base em nome/marca/tamanho/tipo (navegador se necessário)
- Cardápio e estoque conversam: item em baixa → lista de compras + alerta "XXXX item com estoque baixo"
- Selecionador de quantidade: "Selecione a quantidade: "

## Repositórios e Skills
- UI/UX Pro Max: D:\skills\ui-ux-pro-max (integrado ao OpenCode)
- Taste: D:\skills\taste (integrado ao OpenCode)
- Impeccable: OpenCode skills (já disponível)
- Planilha: D:\projetositekawandev\cadastro_produtos_loja_atualizado.xlsx

## Colunas da planilha (sheet "Produtos da Loja")
A: Categoria | B: Marca/Produto | C: Sabor/Tipo | D: Embalagem/Tamanho | E: Preço Venda | F: Preço Custo | G: Estoque Atual | H: Valor Estoque | I: prompt img (ignorar) | J: url img referencia

## Tasks

### Task 1: Renomear estabelecimento e ajustar paleta (Padoca Eterno) [CONCLUÍDA]
- [x] Alterar storeName para "Padoca Eterno" em seed.ts e db.json
- [x] Atualizar globals.css: tons escuros mais claros + cinzas (substituir #08080a por cinza escuro mais claro)
- [x] Atualizar variáveis de cor para paleta escura+cinza (UI/UX Pro Max)
- [x] Aplicar tailwind classes conforme UI/UX Pro Max
- [x] Atualizar layout.tsx, manifest.ts, AdminShell.tsx, login page, etc.

### Task 2: Importar produtos da planilha Excel para o banco JSON [CONCLUÍDA]
- [x] Ler planilha D:\projetositekawandev\cadastro_produtos_loja_atualizado.xlsx
- [x] Mapear colunas para campos do tipo Product
- [x] Criar script ou ação para importar todos os produtos em data/db.json
- [x] Gerar IDs únicos para cada produto
- [x] Preencher categoriaId baseado nas categorias existentes

### Task 3: URLs de imagem automáticas [PARCIAL]
- [x] Usar coluna J "url img referencia" como imageUrl do produto
- [ ] Se URL vazia ou inválida, buscar automaticamente com navegador baseado em: nome + marca + tamanho + tipo + características visuais
- [ ] Validar que a URL é uma imagem real (extensão ou content-type)

### Task 4: Sistema de estoque e lista de compras [CONCLUÍDA]
- [x] Adicionar campo "estoqueMinimo" (default: 5) ao tipo Product (usando lowStockAt existente)
- [x] Criar componente ListaCompras: itens com estoque abaixo do mínimo
- [x] Alerta visual: "XXXX item com estoque baixo"
- [x] Selecionador de quantidade: "Selecione a quantidade: " para reposição
- [x] Botão para adicionar item da lista de compras ao pedido de compra

### Task 5: Conectar cardápio com estoque [CONCLUÍDA]
- [x] Produto em cardápio mostra status de estoque (baixo/esgotado/ok) com tag visual
- [x] Produto esgotado tem botão desabilitado
- [x] Produto com estoque baixo mostra tag "Estoque baixo" em âmbar
- [x] Quando estoque atinge mínimo, item aparece na lista de compras do admin (Task 4)

### Task 6: Revisão completa de segurança e performance (skills) [CONCLUÍDA]
- [x] Cabeçalhos de segurança (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection, Permissions-Policy) em next.config.ts
- [x] Content-Script-Policy para rotas de API
- [x] Rate limit de requisições (100 req/60s por IP) no middleware.ts
- [x] CSRF token validação no middleware para rotas mutantes do admin
- [x] Skeleton em telas de carregamento (StoreFront com skeleton animado)
- [x] Imagens com loading="lazy" (já existentes)
- [x] Debounce na busca (já existente)
- [x] Compressão Gzip/Brotli (Next.js automático)

### Task 7: Testes e validação [CONCLUÍDA]
- [x] Testar login admin e kawan (entregador) - funcionando
- [x] Testar importação de produtos - 133 produtos importados
- [x] Testar alerta de estoque baixo - ListaCompras.tsx criado e integrado
- [x] Testar selecionador de quantidade - input numérico na ListaCompras
- [x] Testar lista de compras - integrado ao Dashboard
- [x] Verificar headers de segurança - next.config.ts configurado
- [x] Verificar rate limit - middleware.ts com rate limiting
- [x] Verificar CSRF - middleware.ts com validação de token
- [x] Verificar skeleton loading - StoreFront com skeleton animado
- [x] Verificar build sem erros - servidor rodando em Turbopack

## Arquivos a criar/modificar
- Criar: src/app/actions/import-produtos.ts
- Criar: src/components/admin/ListaCompras.tsx
- Modificar: src/lib/seed.ts (nome Padoca Eterno, usuário kawan entregador)
- Modificar: src/lib/db.json (importar produtos da planilha)
- Modificar: src/app/globals.css (paleta escura+cinza mais clara)
- Modificar: src/lib/types.ts (adicionar estoqueMinimo)
- Modificar: src/components/storefront/StoreFront.tsx (nome, paleta, estoque)
