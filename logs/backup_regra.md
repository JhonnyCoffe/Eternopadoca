# Backup por Imagem — Regra de Recuperação

**Regra:** Cada imagem gerada (`produto_batch_NNN.png`) é copiada imediatamente para `D:\projetositekawandev\backups\imagens\` com nome `produto_batch_NNN_YYYYMMDD_HHMMSS.png`.

**Se cair energia/internet:**
1. Verifique `D:\ComfyUI\output\` — quais `produto_batch_*.png` estão lá.
2. Copie os faltantes do backup: `xcopy /Y /S D:\projetositekawandev\backups\imagens\ D:\ComfyUI\output\`
3. Confira `D:\ComfyUI\gerar_lote_log.txt` — último `prompt_id` processado indica onde retomar.
4. Restaure o CSV sem duplicar: já processados estão no log; reinicie script filtrando por IDs já no log.

**Backup automático:** O `scripts/gerar_lote.py` já grava log por imagem. Adicionar cópia no loop:
```python
import shutil
shutil.copy(output_file, r"D:\projetositekawandev\backups\imagens\")
```

**Criar pasta de backup:**
`mkdir D:\projetositekawandev\backups\imagens`
