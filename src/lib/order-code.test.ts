import test from "node:test";
import assert from "node:assert/strict";
import { makeOrderCode } from "./order-code.ts";

test("generates a four-digit delivery code", () => {
  for (let index = 0; index < 100; index += 1) {
    assert.match(makeOrderCode(), /^\d{4}$/);
  }
});
