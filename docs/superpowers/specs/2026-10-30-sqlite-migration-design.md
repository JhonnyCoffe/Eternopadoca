# Migração incremental para SQLite

## Intenção
Substituir persistência em `data/db.json` por SQLite local, mantendo contrato atual de `src/lib/db.ts`, rotas e componentes.

## Objetivos
- Preservar `getDb`, `saveDb` e `mutateDb`.
- Importar dados existentes uma única vez.
- Manter normalização de bancos antigos.
- Criar backup antes da importação.
- Permitir fallback temporário para JSON.
- Evitar SQL espalhado pelas rotas.
- Validar lint, build e fluxos principais.

## Fora de escopo
- PostgreSQL ou deploy em nuvem.
- Reescrita dos componentes.
- Alteração do modelo de negócio.
- Push, pagamentos online ou novas telas.

## Restrições
- Projeto Next.js 16.4.3 com React 19.3.0.
- Ambiente atual: Node `v24.22.1`.
- Banco deve funcionar no servidor Node, não no navegador.
- Uploads continuam em disco nesta fase.
- Dados E2E já foram removidos, com backup preservado.

## Abordagens consideradas
1. SQLite compatível com API atual: escolhida. Reduz risco e mantém rotas estáveis.
2. Repositórios por entidade: parcialmente adotada, isolando persistência no módulo SQLite.
3. SQL espalhado nas rotas: rejeitada por aumentar acoplamento e risco.

## Decisões
- Usar `node:sqlite`, disponível no Node atual, evitando dependência nativa externa.
- Criar banco em `data/app.sqlite`.
- Manter JSON como fonte de fallback durante transição.
- Usar tabelas para configurações, categorias, produtos, pedidos, itens, usuários, mensagens e zonas.
- Serializar campos complexos somente quando necessário; relações principais ficam normalizadas.
- Inicializar schema e importar JSON dentro de `getDb` quando SQLite estiver ativo e vazio.
- Selecionar backend por `DB_DRIVER=json|sqlite`, com `sqlite` como destino de ativação explícita inicial.
- Fazer operações SQLite dentro de transações quando houver escrita relacionada.

## Resultado esperado
O app lê e grava SQLite com comportamento equivalente ao JSON. O JSON original permanece intacto como backup/fallback até validação manual dos fluxos.
