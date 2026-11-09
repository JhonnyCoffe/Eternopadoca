"""Remapeia categorias dos produtos já importados sem perder estoque.

Lê a coluna A da planilha, monta nome -> categoria e atualiza
data/db.json. Também substitui a lista de categorias por categorias
de padaria/mercearia.
"""
import json
import openpyxl

EXCEL_PATH = r"D:\projetositekawandev\cadastro_produtos_loja_atualizado.xlsx"
DB_PATH = r"D:\projetositekawandev\data\db.json"

CATEGORIAS = {
    "Padaria": ("cat-padaria", "Padaria", "🥖", 1),
    "Confeitaria": ("cat-confeitaria", "Confeitaria", "🧁", 2),
    "Salgados": ("cat-salgados", "Salgados", "🥟", 3),
    "Mercearia": ("cat-mercearia", "Mercearia", "🛒", 4),
    "Doces e Chocolates": ("cat-doces", "Doces e Chocolates", "🍫", 5),
    "Bebidas": ("cat-bebidas", "Bebidas", "🥤", 6),
    "Limpeza": ("cat-limpeza", "Limpeza", "🧽", 7),
    "Higiene Pessoal": ("cat-higiene", "Higiene Pessoal", "🧼", 8),
    "Utilidades": ("cat-utilidades", "Utilidades", "🏠", 9),
}


def main():
    wb = openpyxl.load_workbook(EXCEL_PATH, data_only=True)
    ws = wb.active

    por_nome = {}
    for row in ws.iter_rows(min_row=2, values_only=True):
        categoria = str(row[0]).strip() if row[0] else ""
        if not categoria:
            break
        partes = [str(v).strip() for v in row[1:4] if v]
        nome = " ".join(partes)
        por_nome[nome] = categoria

    with open(DB_PATH, "r", encoding="utf-8") as f:
        db = json.load(f)

    db["categories"] = [
        {"id": cid, "name": nome, "emoji": emoji, "order": ordem}
        for cid, nome, emoji, ordem in CATEGORIAS.values()
    ]

    trocados = 0
    sem_match = []
    for produto in db["products"]:
        categoria = por_nome.get(produto["name"].strip())
        if not categoria:
            sem_match.append(produto["name"])
            continue
        novo_id = CATEGORIAS[categoria][0]
        if produto.get("categoryId") != novo_id:
            produto["categoryId"] = novo_id
            trocados += 1

    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

    print(f"produtos: {len(db['products'])} | remapeados: {trocados}")
    print(f"categorias: {[c['name'] for c in db['categories']]}")
    if sem_match:
        print(f"sem correspondência ({len(sem_match)}): {sem_match[:5]}")


if __name__ == "__main__":
    main()
