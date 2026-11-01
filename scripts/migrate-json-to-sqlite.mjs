import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const root = process.cwd();
const dataDir = path.join(root, "data");
const jsonPath = path.join(dataDir, "db.json");
const sqlitePath = process.env.SQLITE_PATH || path.join(dataDir, "app.sqlite");
const backupPath = `${jsonPath}.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`;

await mkdir(dataDir, { recursive: true });
await copyFile(jsonPath, backupPath);
const source = JSON.parse(await readFile(jsonPath, "utf8"));
source.categories ??= [];
source.products ??= [];
source.orders ??= [];
source.users ??= [];
source.messages ??= [];
source.settings ??= {};
source.settings.deliveryZones ??= [];
for (const product of source.products) {
  product.trackStock ??= false;
  product.stock ??= 0;
  product.cost ??= 0;
  product.lowStockAt ??= 5;
}
for (const order of source.orders) {
  order.paymentStatus ??= "pendente";
  for (const item of order.items ?? []) item.cost ??= source.products.find((product) => product.id === item.productId)?.cost ?? 0;
}
const orderIds = new Set(source.orders.map((order) => order.id));
source.messages = source.messages.filter((message) => orderIds.has(message.orderId));
const db = new DatabaseSync(sqlitePath);
db.exec(`
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, created_at TEXT NOT NULL, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS delivery_zones (id TEXT PRIMARY KEY, data TEXT NOT NULL);
`);
const tx = () => {
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec("DELETE FROM order_items; DELETE FROM messages; DELETE FROM orders; DELETE FROM products; DELETE FROM categories; DELETE FROM users; DELETE FROM delivery_zones; DELETE FROM settings;");
    db.prepare("INSERT INTO settings (id, data) VALUES (1, ?)").run(JSON.stringify(source.settings));
    const insert = (table, row) => db.prepare(`INSERT INTO ${table} (id, data) VALUES (?, ?)`).run(row.id, JSON.stringify(row));
    for (const row of source.categories ?? []) insert("categories", row);
    for (const row of source.products ?? []) insert("products", row);
    for (const row of source.users ?? []) insert("users", row);
    for (const row of source.settings?.deliveryZones ?? []) insert("delivery_zones", row);
    for (const row of source.orders ?? []) {
      db.prepare("INSERT INTO orders (id, code, created_at, data) VALUES (?, ?, ?, ?)").run(row.id, row.code, row.createdAt, JSON.stringify(row));
      for (const item of row.items ?? []) db.prepare("INSERT INTO order_items (order_id, data) VALUES (?, ?)").run(row.id, JSON.stringify(item));
    }
    for (const row of source.messages ?? []) db.prepare("INSERT INTO messages (id, order_id, created_at, data) VALUES (?, ?, ?, ?)").run(row.id, row.orderId, row.createdAt, JSON.stringify(row));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
};
tx();
console.log(JSON.stringify({ backupPath, sqlitePath, counts: { categories: source.categories?.length ?? 0, products: source.products?.length ?? 0, orders: source.orders?.length ?? 0, users: source.users?.length ?? 0, messages: source.messages?.length ?? 0 } }, null, 2));
db.close();
