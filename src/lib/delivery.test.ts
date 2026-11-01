import test from "node:test";
import assert from "node:assert/strict";
import { isVisibleToDriver } from "./delivery.ts";
import type { Order } from "./types.ts";

const order = (overrides: Partial<Order> = {}): Order => ({
  id: "1", code: "0123", createdAt: "2026-01-01T00:00:00.000Z", customerName: "Cliente", customerPhone: "11999999999", type: "delivery", items: [], subtotal: 0, deliveryFee: 0, total: 0, payment: "pix", paymentStatus: "pendente", status: "pronto", ...overrides,
});

test("assigned ready order remains visible to assigned driver", () => {
  assert.equal(isVisibleToDriver(order({ driverId: "kawan" }), "kawan"), true);
  assert.equal(isVisibleToDriver(order({ driverId: "other" }), "kawan"), false);
});

test("unassigned ready order remains available to every driver", () => {
  assert.equal(isVisibleToDriver(order(), "kawan"), true);
});
