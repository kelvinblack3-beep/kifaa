import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseToMinor, money, formatMoney } from "./money.js";

describe("parseToMinor", () => {
  it("parses positive amounts", () => {
    assert.equal(parseToMinor("1500.00"), 150000n);
    assert.equal(parseToMinor("1,500.00"), 150000n);
    assert.equal(parseToMinor("0.50"), 50n);
  });

  it("preserves negative zero-subunit sign (-0.50 → -50n)", () => {
    assert.equal(parseToMinor("-0.50"), -50n);
    assert.equal(parseToMinor("-0.01"), -1n);
    assert.equal(parseToMinor("-1.00"), -100n);
    assert.equal(parseToMinor("-10.25"), -1025n);
  });

  it("rejects invalid strings", () => {
    assert.throws(() => parseToMinor("abc"));
  });
});

describe("money helpers", () => {
  it("formats KES", () => {
    const m = money(150000n, "KES");
    assert.ok(formatMoney(m).includes("1,500") || formatMoney(m).includes("1500"));
  });
});
