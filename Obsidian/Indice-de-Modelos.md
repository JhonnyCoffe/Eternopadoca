# Índice de Modelos — OpenCode / Provedores

Fonte: `.config/opencode/opencode.json` (31/10/2026).  
Atualizado: 01/11/2026.

---

## Legenda

- `✅ Grátis` — acesso livre / free tier / `:free`
- `❌ Pago` — requer crédito / assinatura
- `⚠️ Proxy` — roteado via `headroom` (`:8787`)
- `🔧 Coding` — código / arquitetura / debug
- `🧠 Reasoning` — raciocínio / multi-step / análise
- `💬 Chat` — conversa / assistente geral
- `👁️ Vision` — aceita imagens / multimodal
- `⚡ Flash` — resposta rápida / baixa latência
- `🖼️ Image` — geração / edição de imagem

---

## Provedores conectados

| Provedor | Base URL | Tipo | Observação |
|---|---|---|---|
| `opencode` | nativo | Hub próprio | `model: opencode/flint-40b-free` |
| `9router` | `http://127.0.0.1:20128/v1` | Open-compatible | `deepseek-v4-flash`, `kimi-k2.7-code` |
| `headroom` | `http://127.0.0.1:8787/v1` | Proxy | `auto/best-*` (coding, reasoning, chat) |
| `console-nvidia` | console | NVIDIA / parceiros | `nemotron`, `minimax`, `stepfun` |
| `console-openrouter` | console | OpenRouter | `:free` (grátis via openrouter) |

---

## Modelos favoritos (favorite_models)

### `opencode/*` — Hub próprio

| Modelo | Grátis | Melhor para | Notas |
|---|---|---|---|
| `opencode/flint-40b-free` | ✅ Grátis | `🔧 Coding`, agente `build` | Modelo padrão do agente build |
| `opencode/nemotron-3.5-super-vl-free` | ✅ Grátis | `👁️ Vision`, `🧠 Reasoning` | Vision-language; multimodal |
| `opencode/beam-free` | ✅ Grátis | `💬 Chat` | Conversa rápida |
| `opencode/mimo-v2.6-flash-free` | ✅ Grátis | `💬 Chat`, `⚡ Flash` | Modelo pequeno (`small_model`); agente `explorer` |
| `opencode/deepseek-v4.1-flash-free` | ✅ Grátis | `🧠 Reasoning` | Modelo de raciocínio (`plan`) |
| `opencode/glm-5.3-flash-free` | ✅ Grátis | `💬 Chat`, `⚡ Flash` | Flash / baixa latência |
| `opencode/big-pickle` | ❌ Pago? | `💬 Chat` | Modelo grande (`agent.general`) |

### `console-nvidia/*` — NVIDIA / parceiros (console)

| Modelo | Grátis | Melhor para | Notas |
|---|---|---|---|
| `console-nvidia/minimaxai/minimax-m3.1-flash` | ❌ Pago | `💬 Chat`, `⚡ Flash` | Flash / rápida resposta |
| `console-nvidia/nvidia/nemotron-3.5-super-vl-120b-a12b` | ❌ Pago | `👁️ Vision`, `🧠 Reasoning` | 120B parâmetros; vision-language |
| `console-nvidia/stepfun-ai/step-5-preview` | ❌ Pago | `🧠 Reasoning`, `💬 Chat` | Modelo de raciocínio (stepfun) |
| `console-nvidia/meta/muse-glimmer-30b` | ❌ Pago | `🖼️ Image`, `💬 Chat` | Geração de imagem (Muse / Glimmer) |
| `console-nvidia/poolside/laguna-xs-2.1` | ❌ Pago | `💬 Chat`, `🔧 Coding` | Modelo compacto (poolside) |
| `console-nvidia/google/diffusiongemma-26b-a4b-it` | ❌ Pago | `🖼️ Image` | Geração / edição de imagem |

### `console-openrouter/*` — OpenRouter (grátis)

> Todos terminam com `:free` → acesso gratuito via OpenRouter.

| Modelo | Melhor para | Notas |
|---|---|---|
| `console-openrouter/xingchen-agi/xing4.0-29b-a4b:free` | `💬 Chat`, `🧠 Reasoning` | 29B parâmetros |
| `console-openrouter/nvidia/nemotron-3.5-super-vl:free` | `👁️ Vision`, `🧠 Reasoning` | Vision-language |
| `console-openrouter/liquid/lfm-2.5-2.6b:free` | `💬 Chat`, `⚡ Flash` | Modelo pequeno / rápido |
| `console-openrouter/thinkingmachines/inkling-small:free` | `💬 Chat`, `🔧 Coding` | Pensamento / código |
| `console-openrouter/cohere/north-mini-code:free` | `🔧 Coding` | Modelo otimizado para código |
| `console-openrouter/openrouter/free` | `💬 Chat` | Modelo genérico grátis |

---

## Provedores diretos (não em `favorite_models`)

### `9router`

| Modelo | Modalidades | Melhor para | Grátis? |
|---|---|---|---|
| `nvidia/deepseek-ai/deepseek-v4-flash` | `text` + `image` (in), `text` (out) | `💬 Chat`, `🔧 Coding` | ❌ Pago (9router) |
| `af/kimi-k2.7-code` | `text` + `image` (in), `text` (out) | `🔧 Coding` | ❌ Pago (9router) |

### `headroom` (proxy `:8787`)

| Modelo | Contexto | Melhor para | Grátis? |
|---|---|---|---|
| `auto/best-coding` | 1.050.000 / out 131.072 | `🔧 Coding` | ⚠️ Proxy |
| `auto/best-fast` | 1.050.000 / out 131.072 | `💬 Chat`, resposta rápida | ⚠️ Proxy |
| `auto/best-reasoning` | 1.050.000 / out 131.072 | `🧠 Reasoning` | ⚠️ Proxy |
| `auto/best-chat` | 1.050.000 / out 131.072 | `💬 Chat` | ⚠️ Proxy |

---

## Agentes ativos (agentes configurados)

| Agente | Modelo | Função |
|---|---|---|
| `build` | `opencode/flint-40b-free` | Construção / código |
| `general` | `opencode/big-pickle` | Tarefas gerais |
| `explorer` | `opencode/mimo-v2.6-flash-free` | Exploração de código |
| `plan` | `opencode/deepseek-v4.1-flash-free` | Planejamento / raciocínio |

---

## Modelo padrão (`model`) e modelo pequeno (`small_model`)

- `model`: `opencode/flint-40b-free`
- `small_model`: `opencode/mimo-v2.6-flash-free`

---

## Resumo rápido — quais usar?

| Objetivo | Modelo recomendado | Provedor | Grátis |
|---|---|---|---|
| Programar / código | `flint-40b-free` | `opencode` | ✅ |
| Raciocínio / análise complexa | `deepseek-v4.1-flash-free` | `opencode` | ✅ |
| Imagens / multimodal | `nemotron-3.5-super-vl-free` | `opencode` | ✅ |
| Resposta rápida (chat) | `mimo-v2.6-flash-free` | `opencode` | ✅ |
| Código (proxy) | `headroom/auto/best-coding` | `headroom` | ⚠️ |
| Vision (proxy) | `headroom/auto/best-reasoning` | `headroom` | ⚠️ |
| Imagem (geração) | `console-nvidia/meta/muse-glimmer-30b` | `console-nvidia` | ❌ |
| Código (openrouter) | `console-openrouter/cohere/north-mini-code:free` | `console-openrouter` | ✅ |
| Chat genérico (grátis) | `console-openrouter/openrouter/free` | `console-openrouter` | ✅ |

---

*Arquivo gerado automaticamente a partir de `.config/opencode/opencode.json`.*
