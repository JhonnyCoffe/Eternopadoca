import sqlite3 from "sqlite3";
import path from "path";
import type { Database } from "sqlite3";
import type { Db, Settings, Category, Product, Order, User, ChatMessage } from "./types";

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
  CREATE TABLE IF NOT EXISTS stores (id TEXT PRIMARY KEY, subdomain TEXT NOT NULL UNIQUE, name TEXT NOT NULL, active INTEGER DEFAULT 1, created_at TEXT NOT NULL, data TEXT);
  CREATE TABLE IF NOT EXISTS password_reset_tokens (token TEXT PRIMARY KEY, user_id TEXT NOT NULL, expires_at TEXT NOT NULL, created_at TEXT NOT NULL, used INTEGER DEFAULT 0);
  CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user ON password_reset_tokens (user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at);
  CREATE INDEX IF NOT EXISTS idx_messages_order_created ON messages (order_id, created_at);
`;

function parse(value: string) {
  return JSON.parse(value);
}

type SqliteRow = Record<string, unknown>;

function all(db: Database, sql: string, params: unknown[] = []): Promise<SqliteRow[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve((rows || []) as SqliteRow[]);
    });
  });
}

function get(db: Database, sql: string, params: unknown[] = []): Promise<SqliteRow | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row as SqliteRow | undefined);
    });
  });
}

function run(db: Database, sql: string, params: unknown[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

function exec(db: Database, sql: string): Promise<void> {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

type SqliteStore = {
  db: Database;
  tables: () => Promise<string[]>;
  close: () => void;
};

function openSqliteDb(filePath?: string): SqliteStore {
  const file = filePath || path.join(process.cwd(), "data", "app.sqlite");
  const db = new sqlite3.Database(file);
  return {
    db,
    tables: async () => {
      const rows = await all(db, "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
      return rows.map((row) => String(row.name));
    },
    close: () => {
      try { db.close(); } catch { /* noop */ }
    },
  };
}

async function initializeSqlite(store: SqliteStore): Promise<void> {
  await exec(store.db, SCHEMA);
}

async function readSqliteDb(store: SqliteStore): Promise<Db> {
  const settingsRow = await get(store.db, "SELECT data FROM settings WHERE id = 1");
  const settingsData: Settings = settingsRow ? (parse(String(settingsRow.data)) as Settings) : ({ deliveryZones: [], autoHours: false, hours: {} } as unknown as Settings);
  const readTable = async <T>(table: string): Promise<T[]> => {
    const rows = await all(store.db, `SELECT data FROM ${table}`);
    return rows.map((row) => parse(String(row.data))) as T[];
  };
  const [categories, products, orders, users, messages] = await Promise.all([
    readTable<Category>("categories"),
    readTable<Product>("products"),
    readTable<Order>("orders"),
    readTable<User>("users"),
    readTable<ChatMessage>("messages"),
  ]);
  const itemsByOrder = new Map<string, OrderItem[]>();
  const itemRows = await all(store.db, "SELECT order_id, data FROM order_items ORDER BY id");
  for (const item of itemRows) {
    const items = itemsByOrder.get(String(item.order_id)) || [];
    items.push(parse(String(item.data)) as OrderItem);
    itemsByOrder.set(String(item.order_id), items);
  }
  for (const order of orders) {
    if (itemsByOrder.has(order.id)) order.items = itemsByOrder.get(order.id)!;
  }
  return {
    settings: settingsData,
    categories,
    products,
    orders,
    users,
    messages,
  };
}

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
  cost?: number;
}

async function writeSqliteDb(store: SqliteStore, db: Db): Promise<void> {
  await exec(store.db, "BEGIN IMMEDIATE");
  try {
    await exec(
      store.db,
      "DELETE FROM order_items; DELETE FROM messages; DELETE FROM orders; DELETE FROM products; DELETE FROM categories; DELETE FROM users; DELETE FROM delivery_zones; DELETE FROM settings; DELETE FROM order_locations;"
    );
    await run(store.db, "INSERT INTO settings (id, data) VALUES (1, ?)", [JSON.stringify(db.settings)]);
    for (const row of db.categories) {
      await run(store.db, "INSERT INTO categories (id, data) VALUES (?, ?)", [row.id, JSON.stringify(row)]);
    }
    for (const row of db.products) {
      await run(store.db, "INSERT INTO products (id, data) VALUES (?, ?)", [row.id, JSON.stringify(row)]);
    }
    for (const row of db.users) {
      await run(store.db, "INSERT INTO users (id, data) VALUES (?, ?)", [row.id, JSON.stringify(row)]);
    }
    for (const row of db.orders) {
      await run(store.db, "INSERT INTO orders (id, code, created_at, data) VALUES (?, ?, ?, ?)", [
        row.id,
        row.code,
        row.createdAt,
        JSON.stringify(row),
      ]);
      for (const item of row.items) {
        await run(store.db, "INSERT INTO order_items (order_id, data) VALUES (?, ?)", [row.id, JSON.stringify(item)]);
      }
    }
    for (const row of db.messages) {
      await run(store.db, "INSERT INTO messages (id, order_id, created_at, data) VALUES (?, ?, ?, ?)", [
        row.id,
        row.orderId,
        row.createdAt,
        JSON.stringify(row),
      ]);
    }
    for (const row of db.settings.deliveryZones) {
      await run(store.db, "INSERT INTO delivery_zones (id, data) VALUES (?, ?)", [row.id, JSON.stringify(row)]);
    }
    await exec(store.db, "COMMIT");
  } catch (error) {
    await exec(store.db, "ROLLBACK").catch(() => {});
    throw error;
  }
}

async function importJsonIfEmpty(store: SqliteStore, db: Db): Promise<boolean> {
  const row = await get(store.db, "SELECT COUNT(*) AS count FROM settings");
  if (row && Number(row.count) > 0) return false;
  await writeSqliteDb(store, db);
  return true;
}

export type { SqliteStore };
export {
  openSqliteDb,
  initializeSqlite,
  readSqliteDb,
  writeSqliteDb,
  importJsonIfEmpty,
};
