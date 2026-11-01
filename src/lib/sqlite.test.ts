import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { openSqliteDb, initializeSqlite, readSqliteDb, writeSqliteDb, importJsonIfEmpty } from "./sqlite.ts";

function fixtureDb() {
  const hours = Object.fromEntries(Array.from({ length: 7 }, (_, index) => [String(index), { closed: false, open: "18:00", close: "23:30" }])) as import("./types").Db["settings"]["hours"];
  return {
    settings: { storeName: "Brasa", tagline: "", logoUrl: "", heroImage: "", whatsapp: "", address: "", instagram: "", deliveryFee: 7.9, minOrder: 25, isOpen: true, avgDeliveryTime: "", pixKey: "", primaryColor: "#e11d48", autoHours: false, hours, deliveryZones: [{ id: "z1", name: "Centro", fee: 7.9, active: true }] },
    categories: [{ id: "cat1", name: "Burgers", emoji: "ðŸ”", order: 1 }],
    products: [{ id: "p1", categoryId: "cat1", name: "Classic", description: "", price: 32.9, imageUrl: "", active: true, badge: "Teste", cost: 12.5, stock: 0, trackStock: false, lowStockAt: 5 }],
    orders: [], users: [{ id: "u1", name: "Dono", username: "admin", passwordHash: "hash", role: "dono", active: true, createdAt: "2026-01-01T00:00:00.000Z" }], messages: [],
  } as unknown as import("./types").Db;
}

test("initializes SQLite schema", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "brasa-sqlite-"));
  const store = openSqliteDb(path.join(dir, "app.sqlite"));

  initializeSqlite(store);
  assert.deepEqual(store.tables(), [
    "categories",
    "delivery_zones",
    "messages",
    "order_items",
    "orders",
    "products",
    "settings",
    "users",
  ]);

  store.close();
  await rm(dir, { recursive: true, force: true });
});

test("round trips complete database state through SQLite", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "brasa-sqlite-"));
  const store = openSqliteDb(path.join(dir, "app.sqlite"));
  initializeSqlite(store);
  const db = fixtureDb();
  db.products[0].badge = "Teste";
  db.orders.push({
    id: "order-1", code: "AB12", createdAt: new Date().toISOString(), customerName: "Cliente",
    customerPhone: "11999999999", type: "delivery", address: "Rua A", items: [{ productId: "p-classic", name: "Brasa Classic", price: 32.9, qty: 1, cost: 12.5 }],
    subtotal: 32.9, deliveryFee: 7.9, total: 40.8, payment: "pix", paymentStatus: "pendente", status: "novo",
  });
  db.messages.push({ id: "message-1", orderId: "order-1", from: "cliente", author: "Cliente", text: "OlÃ¡", createdAt: new Date().toISOString(), readByStore: false, readByCustomer: true });

  writeSqliteDb(store, db);
  const actual = readSqliteDb(store);
  assert.deepEqual(actual.settings, db.settings);
  assert.deepEqual(actual.categories, db.categories);
  assert.deepEqual(actual.products, db.products);
  assert.deepEqual(actual.orders, db.orders);
  assert.deepEqual(actual.users, db.users);
  assert.deepEqual(actual.messages, db.messages);

  store.close();
  await rm(dir, { recursive: true, force: true });
});

test("imports JSON only when SQLite is empty", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "brasa-sqlite-"));
  const store = openSqliteDb(path.join(dir, "app.sqlite"));
  initializeSqlite(store);
  const db = fixtureDb();

  assert.equal(importJsonIfEmpty(store, db), true);
  assert.equal(importJsonIfEmpty(store, fixtureDb()), false);
  assert.equal(readSqliteDb(store).products.length, db.products.length);

  store.close();
  await rm(dir, { recursive: true, force: true });
});

