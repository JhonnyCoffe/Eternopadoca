import test from "node:test";
import assert from "node:assert/strict";
import { messageAlignment } from "./chat-layout.ts";

const base = { id: "1", orderId: "order", author: "A", text: "Oi", createdAt: "2026-01-01T00:00:00.000Z", readByStore: false, readByCustomer: false };

test("shows sent messages right and received messages left for store", () => {
  assert.equal(messageAlignment({ ...base, from: "loja" }, "loja"), "right");
  assert.equal(messageAlignment({ ...base, from: "cliente" }, "loja"), "left");
});

test("shows sent messages right and received messages left for customer", () => {
  assert.equal(messageAlignment({ ...base, from: "cliente" }, "cliente"), "right");
  assert.equal(messageAlignment({ ...base, from: "loja" }, "cliente"), "left");
});
