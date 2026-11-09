import openpyxl
import json
import uuid
from datetime import datetime

EXCEL_PATH = r'D:\projetositekawandev\cadastro_produtos_loja_atualizado.xlsx'
DB_PATH = r'D:\projetositekawandev\data\db.json'

# Mapeamento de categorias da planilha para categorias do sistema
CATEGORIA_MAP = {
    'Bebidas': 'cat-bebidas',
    'Confeitaria': 'cat-doces',
    'Doces e Chocolates': 'cat-doces',
    'Higiene Pessoal': 'cat-porcoes',
    'Limpeza': 'cat-porcoes',
    'Mercearia': 'cat-burgers',
    'Padaria': 'cat-burgers',
    'Salgados': 'cat-burgers',
    'Utilidades': 'cat-porcoes',
}

# Valores padrão para campos vazios
PRECO_PADRAO = 10.00
CUSTO_PADRAO = 5.00
ESTOQUE_PADRAO = 20
ESTOQUE_MINIMO = 5

def main():
    wb = openpyxl.load_workbook(EXCEL_PATH)
    ws = wb['Produtos da Loja']

    # Ler cabeçalho
    headers = []
    for cell in ws[1]:
        headers.append(cell.value)

    # Ler produtos
    produtos = []
    categoria_ids_usados = set()
    for row in ws.iter_rows(min_row=2, values_only=True):
        categoria = str(row[0]).strip() if row[0] else ''
        if not categoria:  # para na primeira linha vazia
            break
        marca = str(row[1]).strip() if row[1] else 'Sem marca'
        sabor = str(row[2]).strip() if row[2] else ''
        embalagem = str(row[3]).strip() if row[3] else ''
        preco = row[4] if row[4] is not None else PRECO_PADRAO
        custo = row[5] if row[5] is not None else CUSTO_PADRAO
        estoque = row[6] if row[6] is not None else ESTOQUE_PADRAO
        url_img = str(row[9]).strip() if row[9] else ''

        # Nome do produto
        nome_parts = [marca, sabor, embalagem]
        nome = ' '.join([p for p in nome_parts if p and p != ''])

        # Categoria
        cat_id = CATEGORIA_MAP.get(categoria, 'cat-burgers')
        categoria_ids_usados.add(cat_id)

        # Descrição
        descricao = f'{marca} {sabor} {embalagem}'.strip()

        produto = {
            'id': str(uuid.uuid4()),
            'categoryId': cat_id,
            'name': nome,
            'description': descricao,
            'price': round(float(preco), 2),
            'imageUrl': url_img if url_img else 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
            'active': True,
            'featured': False,
            'badge': '',
            'cost': round(float(custo), 2),
            'stock': int(estoque),
            'trackStock': True,
            'lowStockAt': ESTOQUE_MINIMO,
        }
        produtos.append(produto)

    print(f'Total de produtos importados: {len(produtos)}')
    print(f'Categorias usadas: {sorted(categoria_ids_usados)}')

    # Carregar db.json existente
    with open(DB_PATH, 'r', encoding='utf-8') as f:
        db = json.load(f)

    # Substituir produtos existentes pelos importados
    db['products'] = produtos

    # Salvar
    with open(DB_PATH, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

    print(f'Banco atualizado com {len(produtos)} produtos.')
    print('Produtos amostra:')
    for p in produtos[:3]:
        print(f'  {p["name"]} - R$ {p["price"]} - Estoque: {p["stock"]} - Cat: {p["categoryId"]}')

if __name__ == '__main__':
    main()
