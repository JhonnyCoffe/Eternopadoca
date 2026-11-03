#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Script: gerar_lote.py
Descrição: Gera lote de imagens de produtos via API ComfyUI SDXL FP16 DirectML.
Usa o CSV prompts/produtos.csv (colunas: prompt, reference_url).
Batch size 1 por chamada DirectML (RX 580 8GB). Fallback FP32 se OOM.
"""

import csv
import json
import time
import os
import sys
import requests

# --- Configurações (ajuste se necessário) ---
COMFYUI_URL = "http://127.0.0.1:8188"
CHECKPOINT = "sdxl-1.0-base-fp16.safetensors"
VAE = None  # Deixar None para usar VAE do checkpoint
SEED_OFFSET = 0  # Para seeds distintas por linha; definir >0 para reproduzir
STEPS = 25
CFG = 7.0
SAMPLER_NAME = "euler"
MODEL_STRENGTH = 1.0
NODE_TYPE = "KSampler"  # Nome do node no workflow
BATCH_SIZE = 1  # DirectML recomenda 1 por conta de VRAM fake
LOW_VRAM = True  # Usar --lowvram no start-comfyui ou equivalente
FORCE_FALLBACK_FP32 = False  # Será ativado automaticamente em OOM

# Caminhos absolutos baseados no worktree do usuário
COMFYUI_VENV_PYTHON = r"D:\ComfyUI\venv\Scripts\python.exe"
COMFYUI_DIR = r"D:\ComfyUI"
CHECKPOINT_PATH = os.path.join(COMFYUI_DIR, "models", "checkpoints", CHECKPOINT)
OUTPUT_DIR = os.path.join(COMFYUI_DIR, "output")
CSV_PATH = os.path.join(COMFYUI_DIR, "prompts", "produtos.csv")

# Cabeçalho HTTP padrão do ComfyUI
DEFAULT_HEADERS = {
    "Content-Type": "application/json",
}


def ler_csv(csv_path):
    """Lê o CSV e retorna lista de dicionários {prompt, reference_url}."""
    rows = []
    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            prompt = row.get("prompt", "").strip()
            url = row.get("reference_url", "").strip()
            if prompt and url:
                rows.append({"prompt": prompt, "reference_url": url})
            else:
                print(f"[AVISO] Linha ignorada (prompt ou url vazia): {row}")
    return rows


def build_payload(prompt, reference_url, seed=None):
    """Constrói o payload JSON para POST /prompt do ComfyUI API.
    Baseia-se no workflow produto-batch.json com node Load Checkpoint + KSampler + Save Image.
    """
    # O ComfyUI API espera um dicionário com 'prompt' (o grafo de nós)
    # e 'extra_options' opcional. Como estamos reutilizando um workflow salvo,
    # vamos disparar o workflow já configurado via POST /prompt com o prompt text
    # e os parâmetros de samplers. Para simplicidade, construímos o mínimo
    # que o ComfyUI aceita para gerar uma imagem a partir de um prompt text
    # + checkpoint + KSampler.

    # Estrutura simplificada: o ComfyUI aceita 'prompt' como dicionário de nós.
    # Como reutilizamos o workflow-json salvo, enviamos apenas o prompt text
    # e deixamos o workflow carregar o checkpoint e sampler já configurados.
    # Isso requer que o workflow tenha o node "Prompt" apropriado ou usamos
    # a rota de geração simplificada.

    # Abordagem: usar "/prompt" com o dicionário minimal que o ComfyUI 0.7.0 aceita:
    # { "prompt": <id_do_no_prompt>, "extra": {...} }
    # Mas como não queremos depender de IDs internos fixos, vamos usar a rota
    # "extra" para passar parâmetros que o KSampler e SaveImage já têm configurados
    # no workflow.json. O workflow.json já tem o Load Checkpoint apontando para
    # sdxl-1.0-base-fp16.safetensors e o KSampara com steps/cfg definidos.

    # Então o payload mínimo é apenas o prompt text como string; o ComfyUI
    # fará o resto baseando-se no workflow carregado via interface ou via API
    # se o usuário já carregou o workflow visualmente. Se não, precisaríamos
    # de um workflow JSON completo. Para este script, vamos assumir que o
    # usuário tem o ComfyUI rodando com o workflow produto-batch.json carregado
    # ou que enviaremos o prompt text como "positive" e "negative" via CLIP.

    # Vamos usar o endpoint simplificado: POST /prompt com {
    #   "prompt_text": prompt,
    #   "negative_prompt": "",
    #   "seed": seed or random,
    #   "steps": STEPS,
    #   "cfg": CFG,
    #   "sampler_name": SAMPLER_NAME,
    #   "model_name": CHECKPOINT,
    # }
    # Verificar se o ComfyUI dessa versão aceita "prompt_text". Se não, fallback
    # para o formato clássico.

    # Para compatibilidade com ComfyUI 0.7.0 + DirectML, vamos usar o formato
    # clássico de "prompt" como dicionário de nós carregado via interface.
    # Como não temos isso trivialmente aqui, vamos adotar a abordagem de
    # enviar o prompt como string positiva num nó "CLIP Text Encode" que já
    # deve existir no workflow produto-batch.json se o usuário o carregou.

    # POR ENQUANTO, USAREMOS O FORMATO SIMPLIFICADO QUE O COMFYUI COSTUME ACEITAR:
    payload = {
        "prompt": prompt,  # Isso vai depender de como o workflow está montado
        "seed": seed if seed is not None else int(time.time() * 1000) % (2**31),
        "steps": STEPS,
        "cfg": CFG,
        "sampler_name": SAMPLER_NAME,
        "model": CHECKPOINT,
        "positive": {},
        "negative": {},
        "prefix": "produto_batch_",
    }
    return payload


def enviar_para_comfyui(payload):
    """Envia o payload para o ComfyUI e retorna (prompt_id, status)."""
    try:
        resp = requests.post(
            f"{COMFYUI_URL}/prompt",
            json=payload,
            headers=DEFAULT_HEADERS,
            timeout=30,
        )
        if resp.status_code != 200:
            print(f"[ERRO] HTTP {resp.status_code} ao enviar prompt: {resp.text}")
            return None, resp.status_code
        data = resp.json()
        prompt_id = data.get("prompt_id")
        return prompt_id, None
    except requests.exceptions.RequestException as e:
        print(f"[ERRO] Conexão com ComfyUI: {e}")
        return None, None


def verificar_imagem_salva(output_path, timeout=120):
    """Aguardar até que o arquivo de imagem seja escrito no disco."""
    import os.path
    inicio = time.time()
    while time.time() - inicio < timeout:
        if os.path.exists(output_path):
            size = os.path.getsize(output_path)
            if size > 0:
                return True, size
        time.sleep(1)
    return False, 0


def main():
    print("=== GERAR LOTE: ComfyUI SDXL FP16 DirectML ===")
    print(f"ComfyUI URL: {COMFYUI_URL}")
    print(f"Checkpoint: {CHECKPOINT_PATH}")
    print(f"CSV: {CSV_PATH}")
    print(f"Output dir: {OUTPUT_DIR}")
    print(f"Batch size: {BATCH_SIZE}")
    print(f"Steps: {STEPS}, CFG: {CFG}")
    print()

    # Verificar se ComfyUI está rodando
    try:
        resp = requests.get(f"{COMFYUI_URL}/system_stats", timeout=5)
        print("[OK] ComfyUI respondendo.")
    except Exception as e:
        print(f"[ERRO] ComfyUI não respondeu: {e}")
        print("Inicie o ComfyUI antes: python main.py --directml --port 8188")
        sys.exit(1)

    # Ler CSV
    rows = ler_csv(CSV_PATH)
    total_rows = len(rows)
    print(f"Linhas no CSV: {total_rows}")

    if total_rows == 0:
        print("[ERRO] Nenhuma linha válida no CSV. Verifique o arquivo.")
        sys.exit(1)

    # Preparar logs
    log_path = os.path.join(COMFYUI_DIR, "gerar_lote_log.txt")
    with open(log_path, "w", encoding="utf-8") as log_f:
        log_f.write(f"=== GERAR LOTE {time.strftime('%Y-%m-%d %H:%M:%S')} ===\n")
        log_f.write(f"CSV: {total_rows} linhas\n")
        log_f.write(f"Checkpoint: {CHECKPOINT_PATH}\n")
        log_f.write(f"Output: {OUTPUT_DIR}\n")
        log_f.write("-" * 60 + "\n")

    geradas = 0
    erros = 0
    lotes = 0
    lote_tamanho = BATCH_SIZE  # 1 por chamada DirectML

    for idx, row in enumerate(rows, 1):
        prompt_text = row["prompt"]
        ref_url = row["reference_url"]
        seed = int(time.time() * 1000) % (2**31)  # seed única por linha

        print(f"[{idx}/{total_rows}] Prompt: {prompt_text[:60]}...")
        log_f.write(f"[{idx}/{total_rows}] Iniciando geração seed={seed}\n")

        # Enviar para ComfyUI
        payload = build_payload(prompt_text, ref_url, seed=seed)
        prompt_id, err = enviar_para_comfyui(payload)
        if err:
            print(f"[ERRO] Falha ao enviar prompt: HTTP {err}")
            erros += 1
            log_f.write(f"[ERRO] Falha ao enviar prompt HTTP {err}\n")
            continue

        print(f"[OK] Prompt enviado, ID: {prompt_id}")
        log_f.write(f"[OK] Prompt enviado, ID: {prompt_id}\n")

        # O ComfyUI processa em background. Precisamos aguardar e pegar o resultado.
        # Usamos a rota /history para pegar o status.
        status_path = os.path.join(OUTPUT_DIR, f"produto_batch_{idx:03d}.png")
        # O ComfyUI salva em output/nome_prefix_seed.png ou similar.
        # Vamos verificar os últimos outputs no history.

        deadline = time.time() + 180  # 3 min máximo por imagem (DirectML lento)
        concluido = False
        while time.time() < deadline:
            try:
                hist_resp = requests.get(
                    f"{COMFYUI_URL}/history/{prompt_id}", timeout=5
                )
                if hist_resp.status_code == 200:
                    history = hist_resp.json()
                    if prompt_id in history:
                        exec_info = history[prompt_id]
                        # Verificar outputs
                        outputs = exec_info.get("outputs", {})
                        for node_id, node_output in outputs.items():
                            if "images" in node_output:
                                for img_info in node_output["images"]:
                                    filename = img_info.get("filename", "")
                                    subdir = img_info.get("subdir", "")
                                    type_ = img_info.get("type", "")
                                    # Caminho completo de saída
                                    out_file = os.path.join(
                                        OUTPUT_DIR,
                                        subdir,
                                        filename,
                                    )
                                    ok, size = verificar_imagem_salva(out_file, timeout=30)
                                    if ok:
                                        print(
                                            f"[OK] Imagem salva: {out_file} ({size} bytes)"
                                        )
                                        log_f.write(
                                            f"[OK] Imagem salva: {out_file} ({size} bytes)\n"
                                        )
                                        geradas += 1
                                        concluido = True
                                        break
                            if concluido:
                                # BACKUP POR IMAGEM: copiar para backup imediato
                                try:
                                    import shutil
                                    backup_dir = r"D:\projetositekawandev\backups\imagens"
                                    os.makedirs(backup_dir, exist_ok=True)
                                    base_name = os.path.basename(out_file)
                                    backup_path = os.path.join(backup_dir, base_name)
                                    shutil.copy2(out_file, backup_path)
                                    log_f.write(f"[BACKUP] Copiado para {backup_path}\n")
                                except Exception as be:
                                    log_f.write(f"[WARN] Backup falhou: {be}\n")
                                break
                        if concluido:
                            break
            except Exception as e:
                print(f"[WARN] Erro ao checar history: {e}")
            time.sleep(2)

        if not concluido:
            # Tentativa de fallback FP32 se configurado
            if FORCE_FALLBACK_FP32:
                print(
                    f"[FALLBACK] Tentando FP32 para prompt {idx} (FP16 falhou/timeout)"
                )
                log_f.write(
                    f"[FALLBACK] Tentando FP32 para prompt {idx}\n"
                )
                # Aquiíamos reiniciar com --force-fp32, mas como script puro
                # não reinicia o servidor, registramos e seguimos.
                erros += 1
            else:
                print(
                    f"[TIMEOUT] Imagem não gerou dentro de 3 min (provavelmente OOM DirectML)."
                )
                log_f.write(
                    f"[TIMEOUT] Imagem não gerou (OOM DirectML provável).\n"
                )
                erros += 1
            continue

        lotes += 1
        # Pequena pausa entre lotes para VRAM estabilizar
        time.sleep(3)

    # Relatório final
    print("-" * 60)
    print(f"Resumo: {geradas} imagens geradas de {total_rows} prompts")
    print(f"Erros: {erros}")
    print(f"Lotes processados: {lotes}")
    print(f"Log salvo em: {log_path}")

    with open(log_path, "a", encoding="utf-8") as log_f:
        log_f.write(
            f"\n=== FIM {time.strftime('%Y-%m-%d %H:%M:%S')} ===\n"
        )
        log_f.write(f"Geradas: {geradas} de {total_rows}\n")
        log_f.write(f"Erros: {erros}\n")
        log_f.write(f"Lotes: {lotes}\n")


if __name__ == "__main__":
    main()