# Sistema de anotação Obsidian (híbrido)

> **Para agentes:** REQUERIDO: Use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans para implementar tarefa por tarefa. Passos usam checkbox (`- [ ]`).

**Objetivo:** Catalogar histórico OpenCode (`claude-mem`, `.opencode`) e Claude Mem (`.claude-mem`) no vault `Obsidian/` como `.md` com assunto, contexto, links internos, tags e resumo; capturar conversas futuras.

**Arquitetura:** Híbrido — script de importação (`import-annotation.mjs`) lê fontes SQLite/log e gera `.md`; plugin/hook (`plugin/`) observa novas mensagens e escreve continuamente.

**Tech Stack:** Node v24, SQLite (`claude-mem.db`), `.md` YAML frontmatter.

**Spec:** `docs/superpowers/specs/2026-11-01-obsidian-annotation-system-design.md`

## Global Constraints
- Node `v24.22.1`.
- `Obsidian/` em `D:\projetositekawandev\Obsidian\`.
- Fontes: `C:\Users\Kawan\.claude-mem\` (`claude-mem.db`, `corpora/`, `logs/`), `C:\Users\Kawan\.config\opencode\`.
- Nenhum arquivo existente do app alterado.
- Formato: YAML frontmatter (`tags`, `resumo`, `contexto`, `fonte`) + corpo com links internos `[[...]]`.

## Review Focus
- Histórico ausente (`claude-mem.db` vazio): script deve falhar gracefully e criar `.md` vazio com aviso.
- Nome duplicado: se `assunto` + `hash` colidir, adicionar `-<n>` ao arquivo.
- Contexto sem link: criar `contexto/<nome>.md` automaticamente.
- Tags com espaços: normalizar para `#keyword` (sem espaços).
- Plugin sem permissão: se `opencode.json` não permitir hook, logar erro sem quebrar sessão.

---

### Task 1: Script de importação (`import-annotation.mjs`)

**Files:**
- Create: `scripts/import-annotation.mjs`
- Create: `Obsidian/contexto/index.md` (template de contexto)
- Modify: `docs/superpowers/plans/2026-11-01-obsidian-annotation-system.md` (referência)

**Interfaces:**
- Consome: `claude-mem.db`, `.claude-mem/logs/*.log`
- Produz: `Obsidian/<YYYY-MM-DD>-<assunto>-<hash>.md`, `Obsidian/contexto/*.md`

- [ ] **Step 1: Escrever teste de leitura `claude-mem.db`**

```javascript
equal(readTable("SELECT id, text FROM observations LIMIT 1")[0].text.length, > 0)
```

- [ ] **Step 2: Implementar `readObservations(dbPath) -> Array<{id, text, timestamp}>`**

Em `scripts/import-annotation.mjs`. Usar `node:sqlite` para abrir `claude-mem.db`.

- [ ] **Step 3: Implementar `classifySubject(text) -> string`**

Palavras-chave: `design`, `bugfix`, `chat`, `anotacao`, `planejamento`.

- [ ] **Step 4: Implementar `generateNote(data) -> string`**

YAML frontmatter (`tags`, `resumo`, `contexto`, `fonte`) + corpo.

- [ ] **Step 5: Implementar `findOrCreateContext(title) -> string`**

Se `contexto/` tem `.md` com título, retorna link `[[contexto/<nome>]]`; senão cria arquivo.

- [ ] **Step 6: Escrever arquivo `.md` para cada observação**

Salvar em `Obsidian/` com nome único.

- [ ] **Step 7: Commit**

`git add scripts/import-annotation.mjs Obsidian/` + commit com mensagem `feat: import script for annotation system`.

---

### Task 2: Plugin de captura contínua (`plugin/live-capture`)

**Files:**
- Create: `plugin/live-capture.mjs`
- Modify: `opencode.json` (adicionar plugin se necessário)

**Interfaces:**
- Consome: eventos de mensagem do OpenCode (via hook `session-start` ou SDK)
- Produz: `Obsidian/<YYYY-MM-DD>-<assunto>-<hash>.md`

- [ ] **Step 1: Escrever teste mock de evento**

Simular evento `message` com `text`.

- [ ] **Step 2: Implementar `onMessage(event)`**

Classifica `text`, cria `.md` se não existir para a sessão atual (identificada por hash de contexto).

- [ ] **Step 3: Integrar com `opencode.json`**

Se `plugin` já existe (`headroom-opencode`), adicionar referência ou criar hook separado em `.config/opencode/hooks/` (não modificar `opencode.json` se não for necessário).

- [ ] **Step 4: Commit**

`git add plugin/live-capture.mjs opencode.json` + commit.

---

### Task 3: Classificador de assunto (`classifier`)

**Files:**
- Create: `scripts/classifier.mjs`
- Test: `tests/classifier.test.mjs`

**Interfaces:**
- Entrada: `string`
- Saída: `string` (`design`, `bugfix`, `chat`, `anotacao`, `planejamento`, `geral`)

- [ ] **Step 1: Teste de classificação por palavra-chave**

`assert(classify("vamos refazer o design") === "design")`

- [ ] **Step 2: Implementar `classify`**

Regex simples, fallback `geral`.

- [ ] **Step 3: Commit**

`git add scripts/classifier.mjs tests/classifier.test.mjs` + commit.

---

### Task 4: Linkador de contexto (`context-linker`)

**Files:**
- Create: `scripts/link-context.mjs`
- Modify: `Obsidian/` (criar `contexto/*.md` quando necessário)

**Interfaces:**
- Entrada: `title` (assunto ou contexto)
- Saída: `string` (`[[contexto/nome]]` ou `` + cria arquivo)

- [ ] **Step 1: Teste de criação de contexto ausente**

`assert(linkContext("Novo Projeto") === "[[contexto/Novo Projeto]]")` e arquivo existe.

- [ ] **Step 2: Implementar `linkContext`**

Verifica `Obsidian/contexto/<nome>.md`; se não existe, cria com template `# Contexto: <nome>\n\nTags: #contexto`.

- [ ] **Step 3: Commit**

`git add scripts/link-context.mjs` + commit.
