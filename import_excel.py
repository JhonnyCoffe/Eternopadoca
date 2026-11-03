#!/usr/bin/env python3
"""Importa produtos do Excel para SQLite (data/app.sqlite) com valores padrão."""
import openpyxl
import sqlite3
import json
import uuid
import os

DB_PATH = "data/app.sqlite"
XLSX_PATH = "cadastro_produtos_loja_atualizado.xlsx"

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Carrega categorias existentes
    cursor.execute("SELECT id, data FROM categories")
    categories = {}
    for row in cursor.fetchall():
        cat = json.loads(row[1])
        categories[cat["name"]] = row[0]

    # Carrega produtos existentes (por nome)
    cursor.execute("SELECT id, data FROM products")
    existing = {}
    for row in cursor.fetchall():
        prod = json.loads(row[1])
        existing[prod["name"]] = prod

    wb = openpyxl.load_workbook(XLSX_PATH, data_only=True)
    ws = wb.active  # 'Produtos da Loja'

    rows = list(ws.iter_rows(values_only=True))
    header = rows[0]
    data_rows = rows[1:]

    new_categories = 0
    new_products = 0
    updated = 0

    for row in data_rows:
        if row is None or len(row) < 4:
            continue
        cat_name = str(row[0]).strip() if row[0] else None
        brand = str(row[1]).strip() if row[1] else ""
        flavor = str(row[2]).strip() if row[2] else ""
        packaging = str(row[3]).strip() if row[3] else ""

        if not cat_name or not brand:
            continue

        # Normaliza nome da categoria
        cat_key = cat_name
        if cat_key not in categories:
            cat_id = str(uuid.uuid4())
            categories[cat_key] = cat_id
            new_categories += 1
            cursor.execute(
                "INSERT INTO categories (id, data) VALUES (?, ?)",
                (cat_id, json.dumps({
                    "id": cat_id,
                    "name": cat_key,
                    "emoji": "🍽️",
                    "order": len(categories) + 1,
                }))
            )

        # Monta nome e descrição
        name = f"{brand}"
        if flavor:
            name += f" {flavor}"
        description = f"{packaging}" if packaging else ""
        # Evita duplicados exatos
        if name in existing:
            updated += 1
            continue

        prod_id = str(uuid.uuid4())
        prod_data = {
            "id": prod_id,
            "categoryId": categories[cat_key],
            "name": name,
            "description": description,
            "price": 0,
            "imageUrl": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
            "active": True,
            "featured": False,
            "badge": "",
            "cost": 0,
            "stock": 0,
            "trackStock": False,
            "lowStockAt": 5,
        }
        cursor.execute(
            "INSERT INTO products (id, data) VALUES (?, ?)",
            (prod_id, json.dumps(prod_data))
        )
        existing[name] = prod_data
        new_products += 1

    conn.commit()
    conn.close()
    print(f"Categorias novas: {new_categories}")
    print(f"Produtos novos: {new_products}")
    print(f"Produtos ignorados (duplicados): {updated}")

if __name__ == "__main__":
    main()
