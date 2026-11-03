import openpyxl
from openpyxl import Workbook
from openpyxl.styles import Font, Alignment
from openpyxl.utils import get_column_letter

wb = openpyxl.load_workbook('cadastro_produtos_loja_atualizado.xlsx', data_only=True)
ws = wb['Produtos da Loja']

# Encontrar índice da coluna Embalagem / Tamanho (D) para inserir após
headers = [cell.value for cell in ws[1]]
# Encontrar coluna após "Embalagem / Tamanho" (índice 3 -> D)
# Inserir nova coluna no índice 4 (E) - antes dos preços
# Vamos apenas adicionar uma nova coluna após D (índice 4) movendo as outras, ou adicionar no final
# O usuário pediu "coluna com nome prompt img. prod." - vamos adicionar como última coluna (após H)

# Encontrar a última coluna com dados
max_col = ws.max_column

# Adicionar cabeçalho na última coluna + 1
header_cell = ws.cell(row=1, column=max_col + 1, value="prompt img. prod.")
header_cell.font = Font(bold=True)
header_cell.alignment = Alignment(horizontal='center', wrap_text=True)

# Definir categorias que indicam bebida gelada e quente
bebidas_cats = {'Bebidas'}
quentes_cats = {'Padaria', 'Salgados', 'Confeitaria'}

for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
    # Pegar valores
    categoria = row[0].value
    marca = row[1].value
    sabor = row[2].value
    embalagem = row[3].value
    
    # Montar descrição do produto
    desc_partes = []
    if marca:
        desc_partes.append(str(marca))
    if sabor and sabor != 'Variados':
        desc_partes.append(str(sabor))
    desc_produto = " ".join(desc_partes) if desc_partes else "produto"
    
    # Incluir embalagem com unidade (kg, g, ml, L, etc)
    embalagem_texto = f", {embalagem}" if embalagem else ""
    
    # Montar prompt base
    if categoria in bebidas_cats:
        temperatura = "cold bottle with heavy condensation and frost droplets"
    elif categoria in quentes_cats:
        temperatura = "freshly baked hot with warm golden steam rising"
    else:
        temperatura = "premium gourmet presentation"
    
    prompt = (
        f"Ultra-modern food photography, {desc_produto}{embalagem_texto} "
        f"professional studio shot on dark minimalist charcoal gray background (#2d2d2d), "
        f"soft studio lighting, sharp focus, hyper-realistic, clean elegant composition, 800x800, "
        f"no text, premium style, {temperatura}"
    )
    
    # Escrever na nova coluna (max_col + 1)
    cell = ws.cell(row=row[0].row, column=max_col + 1, value=prompt)
    cell.alignment = Alignment(wrap_text=True, vertical='top')
    # Ajustar largura aproximada (não obrigatório, mas útil)

# Ajustar largura da nova coluna para facilitar leitura
ws.column_dimensions[openpyxl.utils.get_column_letter(max_col + 1)].width = 90

# Salvar
wb.save('cadastro_produtos_loja_atualizado.xlsx')
print("Arquivo atualizado. Coluna 'prompt img. prod.' adicionada na coluna", openpyxl.utils.get_column_letter(max_col + 1))
