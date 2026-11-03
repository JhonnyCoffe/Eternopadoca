# Imagens de Produtos com SDXL Local - Plano

> Para agentes: Use superpowers:subagent-driven-development (recomendado) ou superpowers:executing-plans.

**Objetivo:** Montar workflow ComfyUI para gerar centenas de imagens de produtos localmente com SDXL quantizado (FP16/INT8) na RX 580 8GB.

**Arquitetura:** ComfyUI + batch loader (CSV de prompts) + modelo SDXL base. Quantização via FP16 para caber em 8GB VRAM. Geração em lotes pequenos.

**Stack:** ComfyUI, SDXL 1.0 base, Python (opcional para script de prompts), RX 580 8GB.

**Spec:** docs/superpowers/specs/2026-11-02-produto-imagens-design.md (design curto aprovado)

## Restrições Globais
- Modelo: SDXL 1.0 base (não FLUX, devido VRAM/velocidade).
- Quantização: FP16 obrigatório para RX 580 8GB.
- Ferramenta: ComfyUI (open source, gratuito).
- Volume: centenas de imagens (batch pequeno por rodada).

## Foco de Revisão
- VRAM excede 8GB? Testar batch de 2 imagens simultâneas.
- Qualidade com FP16 aceitável para produto?
- Prompts variam ângulo/fundo corretamente?

---

### Task 1: Instalar ComfyUI e baixar SDXL base FP16

**Arquivos:**
- Criar: `workflows/comfyui/` (estrutura de instalação)
- Baixar: `models/checkpoints/sdxl-1.0-base-fp16.safetensors`

**Passos:**
- [ ] Baixar ComfyUI (git clone) e instalar dependências (`pip install -r requirements.txt`).
- [ ] Baixar SDXL 1.0 base FP16 para `models/checkpoints/`.
- [ ] Verificar: `python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0))"` deve retornar RX 580.

### Task 2: Criar workflow ComfyUI para batch de produtos

**Arquivos:**
- Criar: `workflows/produto-batch.json`

**Passos:**
- [ ] Configurar node `Load Checkpoint` com SDXL base.
- [ ] Adicionar `Batch Loader` ou `Prompt Loader` com arquivo CSV (`prompts/produtos.csv`) contendo colunas: prompt, seed opcional.
- [ ] Configurar `KSampler` com FP16, steps 20-30, CFG 7.
- [ ] Adicionar `Save Image` com prefixo `produto_batch_`.
- [ ] Testar com 2 prompts simples: deve gerar 2 imagens sem OOM.

### Task 3: Criar script de prompts e gerar lote piloto

**Arquivos:**
- Criar: `prompts/produtos.csv`
- Criar: `scripts/gerar_lote.py` (opcional, para chamar ComfyUI via API se preferir automação)

**Passos:**
- [ ] Criar `prompts/produtos.csv` com 10 prompts de teste (produto, fundo, ângulo).
- [ ] Executar workflow ComfyUI com CSV.
- [ ] Verificar saída em `output/` (10 imagens, sem erro de VRAM, tempo aceitável).
- [ ] Se necessário, reduzir batch para 1 imagem por execução e repetir em loop.

### Task 4: Escalar para centenas de imagens

**Passos:**
- [ ] Expandir `prompts/produtos.csv` para centenas de linhas.
- [ ] Criar loop (shell ou Python) que chama ComfyUI em lotes de 10-20 imagens.
- [ ] Monitorar temperatura/VRAM da RX 580 durante execução.
- [ ] Commit final com workflow e prompts.
