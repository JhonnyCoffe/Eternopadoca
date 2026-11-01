# Hermes Co-Agente — Brasa & Burger

Projeto: `D:\projetositekawandev`
Co-agente: OpenCode (harness atual).

## Contexto compartilhado
- `AGENTS.md` — regras do Next.js (não apagar bloco `next dev`).
- `CONTEXTOapp1.md` — estado atual do app, problemas pendentes, próximo passo.
- `docs/superpowers/` — specs e plans de tarefas em andamento.
- `opencode.json` — plugin superpowers.

## Como interagir
Antes de qualquer ação, ler `CONTEXTOapp1.md` e `docs/superpowers/plans/*.md` relevantes.
Não inventar requisitos; seguir specs existentes.

## Ferramentas disponíveis
`read_file`, `write_file`, `patch`, `terminal` (npm, node, git), `delegate_task`.

## Delegação (`delegate_task`)
Quando uma tarefa é grande (ex: migração SQLite, revisão de segurança, build + verificação), usar:

```
delegate_task(
  goal="Tarefa específica",
  context="Contexto do CONTEXTOapp1.md e docs relevantes",
  toolsets=["terminal", "read_file", "write_file", "patch"],
  role="leaf"
)
```

O subagente retorna resultado; você confirma no arquivo do projeto (`docs/`, `AGENTS.md` ou código).

## Convenções
- Não alterar `.env.local` sem confirmar no contexto.
- Não excluir `node_modules/next/dist/docs/` ou `AGENTS.md`.
- Manter `DB_DRIVER` padrão (`json`) a menos que `CONTEXTOapp1.md` autorize troca para SQLite.
- Usar `npm run lint` e `npm run build` antes de declarar conclusão.

## Próximo passo típico (exemplo)
1. Ler `CONTEXTOapp1.md`.
2. Confirmar pedido de teste `YW8B` ainda existe.
3. Se sim, excluir pedido e mensagens; rodar lint/build; confirmar badge `(1)`.
