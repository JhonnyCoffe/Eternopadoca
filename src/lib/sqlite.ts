import { DatabaseSync } from "node:sqlite";
import path from "node:path";
import type { Db } from "./types";

export type SqliteStore = {
  db: DatabaseSync;
  tables: () => string[];
  close: () => void;
};

const SCHEMA = `
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS categories (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS order_items (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE, created_at TEXT NOT NULL, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS delivery_zones (id TEXT PRIMARY KEY, data TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS order_locations (order_id TEXT PRIMARY KEY NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL, accuracy REAL NOT NULL, heading REAL, speed REAL, updated_at TEXT NOT NULL);
  CREATE INDEX IF NOT EXISTS idx_order_locations_updated_at ON order_locations (updated_at);
`;

function parse<T>(value: string): T {
  return JSON.parse(value) as T;
}

export function openSqliteDb(filePath = path.join(process.cwd(), "data", "app.sqlite")): SqliteStore {
  const db = new DatabaseSync(filePath);
  return {
    db,
    tables: () => {
      const rows = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all() as Array<{ name: string }>;
      return rows.map((row: { name: string }) => row.name);
    },
    close: () => db.close(),
  };
}

export function initializeSqlite(store: SqliteStore): void {
  store.db.exec(SCHEMA);
}

export function readSqliteDb(store: SqliteStore): Db {
  const settingsRow = store.db.prepare("SELECT data FROM settings WHERE id = 1").get() as { data: string } | undefined;
  const rows = <T>(table: string) => store.db.prepare(`SELECT data FROM ${table}`).all().map((row: unknown) => parse<T>((row as { data: string }).data));
  const settings = settingsRow ? parse<Db["settings"]>(settingsRow.data) : undefined;
  const orders = rows<Db["orders"][number]>("orders");
  const itemsByOrder = new Map<string, Db["orders"][number]["items"]>();
  const itemRows = store.db.prepare("SELECT order_id, data FROM order_items ORDER BY id").all() as Array<{ order_id: string; data: string }>;
  for (const item of itemRows) {
    const items = itemsByOrder.get(item.order_id) ?? [];
    items.push(parse<Db["orders"][number]["items"][number]>(item.data));
    itemsByOrder.set(item.order_id, items);
  }
  for (const order of orders) {
    if (itemsByOrder.has(order.id)) order.items = itemsByOrder.get(order.id)!;
  }
  return {
    settings: settings ?? ({ deliveryZones: [] } as unknown as Db["settings"]),
    categories: rows<Db["categories"][number]>("categories"),
    products: rows<Db["products"][number]>("products"),
    orders,
    users: rows<Db["users"][number]>("users"),
    messages: rows<Db["messages"][number]>("messages"),
  };
}

export function writeSqliteDb(store: SqliteStore, db: Db): void {
  const sqlite = store.db;
  sqlite.exec("BEGIN IMMEDIATE");
  try {
    sqlite.exec("DELETE FROM order_items; DELETE FROM messages; DELETE FROM orders; DELETE FROM products; DELETE FROM categories; DELETE FROM users; DELETE FROM delivery_zones; DELETE FROM settings;");
    sqlite.prepare("INSERT INTO settings (id, data) VALUES (1, ?)").run(JSON.stringify(db.settings));
    const insert = (table: string, row: { id: string }, data: unknown) => sqlite.prepare(`INSERT INTO ${table} (id, data) VALUES (?, ?)`).run(row.id, JSON.stringify(data));
    for (const row of db.categories) insert("categories", row, row);
    for (const row of db.products) insert("products", row, row);
    for (const row of db.users) insert("users", row, row);
    for (const row of db.orders) {
      sqlite.prepare("INSERT INTO orders (id, code, created_at, data) VALUES (?, ?, ?, ?)").run(row.id, row.code, row.createdAt, JSON.stringify(row));
      for (const item of row.items) sqlite.prepare("INSERT INTO order_items (order_id, data) VALUES (?, ?)").run(row.id, JSON.stringify(item));
    }
    for (const row of db.messages) sqlite.prepare("INSERT INTO messages (id, order_id, created_at, data) VALUES (?, ?, ?, ?)").run(row.id, row.orderId, row.createdAt, JSON.stringify(row));
    for (const row of db.settings.deliveryZones) insert("delivery_zones", row, row);
    sqlite.exec("COMMIT");
  } catch (error) {
    sqlite.exec("ROLLBACK");
    throw error;
  }
}

export function importJsonIfEmpty(store: SqliteStore, db: Db): boolean {
  const row = store.db.prepare("SELECT COUNT(*) AS count FROM settings").get() as { count: number };
  if (row.count > 0) return false;
  writeSqliteDb(store, db);
  return true;
}
