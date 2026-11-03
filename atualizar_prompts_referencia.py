import openpyxl
from openpyxl.utils import get_column_letter
from openpyxl.styles import Font, Alignment
import urllib.request
import urllib.parse
import ssl
import re
from html.parser import HTMLParser

# Contexto SSL para permitir conexões
ctx = ssl.create_default_context()

class ImageURLExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.img_urls = []
    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'img':
            src = attrs_dict.get('src', '')
            # Filtra URLs válidas de imagens
            if src.startswith('http') and ('.jpg' in src or '.jpeg' in src or '.png' in src or '.webp' in src):
                self.img_urls.append(src)
            # Também tenta data-src
            data_src = attrs_dict.get('data-src', '')
            if data_src.startswith('http') and ('.jpg' in data_src or '.jpeg' in data_src or '.png' in data_src or '.webp' in data_src):
                self.img_urls.append(data_src)


def buscar_url_imagem(query, max_results=1):
    search_url = "https://www.google.com/search?q=" + urllib.parse.quote(query) + "&tbm=isch"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0 Safari/537.36"
    }
    try:
        req = urllib.request.Request(search_url, headers=headers)
        with urllib.request.urlopen(req, timeout=15, context=ctx) as response:
            html_content = response.read().decode('utf-8', errors='ignore')
        parser = ImageURLExtractor()
        parser.feed(html_content)
        # Limpar URLs duplicadas e pegar a primeira
        unique_urls = []
        for url in parser.img_urls:
            if url not in unique_urls:
                unique_urls.append(url)
            if len(unique_urls) >= max_results:
                break
        return unique_urls[0] if unique_urls else None
    except Exception as e:
        print(f"Erro ao buscar '{query}': {e}")
        return None


def montar_prompt_ref(produto, sabor, embalagem, categoria, url_img):
    desc_partes = []
    if produto:
        desc_partes.append(str(produto))
    if sabor and str(sabor) != 'Variados':
        desc_partes.append(str(sabor))
    desc_produto = " ".join(desc_partes) if desc_partes else "produto"
    embalagem_texto = f" {embalagem}" if embalagem else ""
    
    # Determinar temperatura visual
    bebidas_cats = {'Bebidas'}
    quentes_cats = {'Padaria', 'Salgados', 'Confeitaria'}
    
    if categoria in bebidas_cats:
        temperatura = "cold bottle or can with heavy condensation, frost droplets, refreshing cold look"
    elif categoria in quentes_cats:
        temperatura = "freshly baked hot, warm golden steam rising, appetizing warmth"
    else:
        temperatura = "premium gourmet presentation"
    
    # Prompt com referência visual
    prompt = (
        f"Ultra-modern food photography, generate image matching real product reference: {url_img if url_img else 'search image'}. "
        f"Keep exact original brand label, colors, typography and design from reference. "
        f"Subject: {desc_produto}{embalagem_texto}. "
        f"Visual style: {temperatura}, dark minimalist charcoal gray background (#2d2d2d), "
        f"soft studio lighting, sharp focus, hyper-realistic, clean elegant composition, 800x800, no text overlay, premium style. "
        f"Preserve authentic packaging, logo, and color palette from the reference image."
    )
    return prompt


# Abrir arquivo existente
wb = openpyxl.load_workbook('cadastro_produtos_loja_atualizado.xlsx', data_only=False)
ws = wb['Produtos da Loja']

# Encontrar colunas existentes
headers = [cell.value for cell in ws[1]]
print("Colunas existentes:", headers)

# Verificar se já existe coluna url img referencia
if "url img referencia" not in headers:
    col_url = ws.max_column + 1
    ws.cell(row=1, column=col_url, value="url img referencia")
    ws.cell(row=1, column=col_url).font = Font(bold=True)
    ws.cell(row=1, column=col_url).alignment = Alignment(horizontal='center', wrap_text=True)
else:
    col_url = headers.index("url img referencia") + 1

# Verificar se já existe coluna prompt atualizado
if "prompt img. prod." not in headers:
    col_prompt = ws.max_column + 1
    ws.cell(row=1, column=col_prompt, value="prompt img. prod.")
    ws.cell(row=1, column=col_prompt).font = Font(bold=True)
    ws.cell(row=1, column=col_prompt).alignment = Alignment(horizontal='center', wrap_text=True)
else:
    col_prompt = headers.index("prompt img. prod.") + 1

# Processar cada linha (a partir de 2, pulando cabeçalho)
for row in ws.iter_rows(min_row=2, max_row=ws.max_row):
    categoria = row[0].value
    marca = row[1].value
    sabor = row[2].value
    embalagem = row[3].value
    
    # Montar query de busca
    query_parts = []
    if marca:
        query_parts.append(str(marca))
    if sabor and str(sabor) != 'Variados':
        query_parts.append(str(sabor))
    if embalagem:
        query_parts.append(str(embalagem))
    query = " ".join(query_parts)
    
    # Buscar URL de referência
    url_img = buscar_url_imagem(query)
    
    # Escrever URL
    url_cell = ws.cell(row=row[0].row, column=col_url, value=url_img if url_img else "N/A")
    url_cell.hyperlink = url_img if url_img else None
    url_cell.font = Font(color="0563C1", underline="single")
    url_cell.alignment = Alignment(wrap_text=True, vertical='top')
    
    # Montar e escrever prompt atualizado
    prompt_text = montar_prompt_ref(marca, sabor, embalagem, categoria, url_img)
    prompt_cell = ws.cell(row=row[0].row, column=col_prompt, value=prompt_text)
    prompt_cell.alignment = Alignment(wrap_text=True, vertical='top')
    
    # Ajustar largura
    print(f"Linha {row[0].row}: {query[:60]}... | URL: {url_img if url_img else 'N/A'}")

# Ajustar largura das colunas
ws.column_dimensions[get_column_letter(col_url)].width = 45
ws.column_dimensions[get_column_letter(col_prompt)].width = 100

# Salvar
wb.save('cadastro_produtos_loja_atualizado.xlsx')
print("\nArquivo atualizado com mecanismo de referência visual.")
print(f"Coluna 'url img referencia': {get_column_letter(col_url)}")
print(f"Coluna 'prompt img. prod.': {get_column_letter(col_prompt)}")
