import test from "node:test";
import assert from "node:assert/strict";
import { saveOrderRating } from "./rating.ts";
import type { Db } from "./types.ts";

const db = (status: "novo" | "concluido" = "concluido"): Db => ({
  settings: {} as Db["settings"], categories: [], products: [], users: [], messages: [],
  orders: [{ id: "1", code: "0123", createdAt: "2026-01-01", customerName: "Cliente", customerPhone: "11999999999", type: "delivery", items: [], subtotal: 0, deliveryFee: 0, total: 0, payment: "pix", paymentStatus: "pendente", status }],
});

test("saves one integer rating from one to five on completed order", () => {
  const result = saveOrderRating(db(), "0123", 5);
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.order.rating, 5);
});

test("rejects invalid or premature ratings", () => {
  assert.equal(saveOrderRating(db(), "0123", 0).ok, false);
  assert.equal(saveOrderRating(db(), "0123", 5.5).ok, false);
  assert.equal(saveOrderRating(db("novo"), "0123", 5).ok, false);
});

test("rejects a second rating", () => {
  const state = db();
  saveOrderRating(state, "0123", 4);
  const result = saveOrderRating(state, "0123", 5);
  assert.equal(result.ok, false);
});
