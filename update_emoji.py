import sqlite3, json
conn = sqlite3.connect('data/app.sqlite')
emoji_map = {
    'Bebidas': '🥤', 'Porções': '🍟', 'Burgers': '🍔', 'Sobremesas': '🍫',
    'Limpeza': '🧼', 'Higiene Pessoal': '🧴', 'Mercearia': '🛒',
    'Doces e Chocolates': '🍬', 'Utilidades': '🧰', 'Padaria': '🍞',
    'Confeitaria': '🍰', 'Salgados': '🥐',
}
for row in conn.execute('SELECT id, data FROM categories').fetchall():
    cat = json.loads(row[1])
    cat['emoji'] = emoji_map.get(cat['name'], '🍽️')
    conn.execute('UPDATE categories SET data = ? WHERE id = ?', (json.dumps(cat), row[0]))
conn.commit()
for row in conn.execute('SELECT data FROM categories').fetchall():
    cat = json.loads(row[0])
    print(cat['name'], '|', cat['emoji'])
