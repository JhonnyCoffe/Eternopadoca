# Sistema de anotação Obsidian (híbrido: histórico + captura contínua)

## Intenção
Catalogar todo histórico de chat OpenCode e Claude Mem no vault `Obsidian/` como notas `.canvas` (visual Obsidian) com assunto, contexto, links internos, tags e resumo. Criar contexto automaticamente quando ausente.

## Objetivos
- Importar histórico existente (`claude-mem.db`, `corpora/`, logs `.claude-mem/`, `opencode.json` e skills).
- Classificar assunto por sessão/anotação (ex: `design`, `bugfix`, `planejamento`).
- Vincular anotações por contexto (`[[nota-contexto]]`) ou criar contexto novo.
- Gerar YAML frontmatter (`tags`, `data`, `resumo`, `fonte`).
- Capturar conversas futuras via plugin/hook OpenCode (contínuo).
- Manter tudo em português, sem alterar código existente do app.

## Fora de escopo
- Alterar `claude-mem` ou OpenCode diretamente (apenas ler).
- Reescrever o app Next.js.
- Sincronizar com nuvem ou outros vaults.
- Análise semântica profunda (usar classificação simples por palavras-chave + contexto).

## Restrições
- `node` v24 disponível.
- `D:\projetositekawandev\Obsidian\` é o vault.
- `C:\Users\Kawan\.claude-mem\` é a fonte Claude Mem.
- `C:\Users\Kawan\.config\opencode\` é a fonte OpenCode.
- Não há arquivo de chat bruto (`.json` de sessões) no `.opencode`; usar `claude-mem.db` e logs como fonte primária.

## Abordagens consideradas
1. Script único de importação: rejeitado — não captura futuro.
2. Plugin OpenCode em tempo real: rejeitado — perde histórico existente.
3. Híbrido (importação + captura contínua): escolhido — cobre passado e futuro.

## Decisões
- Formato: `.md` no `Obsidian/` com YAML frontmatter (`---` no topo).
- Nome do arquivo: `<YYYY-MM-DD>-<assunto>-<hash-curto>.md`.
- Assunto: classificado por palavras-chave na mensagem inicial da sessão (`design`, `bugfix`, `chat`, `anotacao`).
- Contexto: se encontrar `contexto` na mensagem ou link existente, vincula (`[[...]]`); senão, cria arquivo `contexto/<nome>.md`.
- Tags: `#opencode`, `#claude-mem`, `#sessao`, `#<assunto>`.
- Resumo: 1-2 linhas extraídas da primeira mensagem do usuário + resposta inicial.
- Plugin contínuo: usar `hooks/session-start` ou SDK `opencode` para observar mensagens e escrever no vault após cada interação.
- Importação: script Node (`scripts/import-annotation.mjs`) lê `claude-mem.db` (SQLite) e logs `.claude-mem/logs/`, gera `.md` no `Obsidian/`.

## Resultado esperado
Vault `Obsidian/` contém notas catalogadas por assunto e contexto, com links internos e tags. Novas sessões são adicionadas automaticamente pelo plugin. Nenhum arquivo existente do app é alterado.
