import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { KifaaPlatform } from "./platform.js";
import { IdempotencyConflictError, ValidationError, AuthError } from "@kifaa/shared";

function platform() {
  return new KifaaPlatform();
}

describe("KIFAA V0.1 Core Platform (SANDBOX)", () => {
  it("registers user with phone and kifaa id", () => {
    const p = platform();
    const u = p.registerUser({ phone: "0712345678", displayName: "Alice", pin: "1234" });
    assert.equal(u.phone, "254712345678");
    assert.match(u.kifaaId, /^KF/);
    assert.equal(u.pinHash, "[redacted]");
    assert.equal(p.getBalance(u.id).amountMinor, 0n);
    assert.equal(p.getBalance(u.id).sandbox, true);
  });

  it("logs in with pin", () => {
    const p = platform();
    const u = p.registerUser({ phone: "0711111111", displayName: "Bob", pin: "9999" });
    const logged = p.login("0711111111", "9999");
    assert.equal(logged.id, u.id);
  });

  it("rejects wrong pin", () => {
    const p = platform();
    p.registerUser({ phone: "0722222222", displayName: "C", pin: "1111" });
    assert.throws(() => p.login("0722222222", "0000"), AuthError);
  });

  it("add test money then transfer KIFAA→KIFAA", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000001", displayName: "A", pin: "1234" });
    const b = p.registerUser({ phone: "0700000002", displayName: "B", pin: "5678" });
    const fund = p.addTestMoney({ idempotencyKey: "fund-1", userId: a.id, amountMinor: 10_000_00n });
    assert.equal(fund.status, "COMPLETED");
    assert.equal(fund.sandbox, true);
    assert.equal(p.getBalance(a.id).amountMinor, 10_000_00n);
    const t = p.transfer({
      idempotencyKey: "xfer-1", senderUserId: a.id, receiverKifaaIdOrPhone: b.kifaaId,
      amountMinor: 2_500_00n, pin: "1234", note: "lunch",
    });
    assert.equal(t.status, "COMPLETED");
    assert.equal(t.type, "TRANSFER");
    assert.ok(t.reference.startsWith("KIF"));
    assert.equal(p.getBalance(a.id).amountMinor, 7_500_00n);
    assert.equal(p.getBalance(b.id).amountMinor, 2_500_00n);
    const hist = p.history(a.id);
    assert.ok(hist.length >= 2);
    const receipt = p.receipt(t.id);
    assert.equal(receipt.sandbox, true);
    assert.equal(receipt.amountMinor, "250000");
  });

  it("prevents overdraft", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000010", displayName: "A", pin: "1234" });
    const b = p.registerUser({ phone: "0700000011", displayName: "B", pin: "1234" });
    p.addTestMoney({ idempotencyKey: "f", userId: a.id, amountMinor: 100_00n });
    assert.throws(
      () => p.transfer({ idempotencyKey: "x", senderUserId: a.id, receiverKifaaIdOrPhone: b.phone, amountMinor: 200_00n, pin: "1234" }),
      ValidationError
    );
  });

  it("idempotent transfer returns same txn", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000020", displayName: "A", pin: "1234" });
    const b = p.registerUser({ phone: "0700000021", displayName: "B", pin: "1234" });
    p.addTestMoney({ idempotencyKey: "f2", userId: a.id, amountMinor: 5_000_00n });
    const t1 = p.transfer({ idempotencyKey: "same-key", senderUserId: a.id, receiverKifaaIdOrPhone: b.kifaaId, amountMinor: 1_000_00n, pin: "1234" });
    const t2 = p.transfer({ idempotencyKey: "same-key", senderUserId: a.id, receiverKifaaIdOrPhone: b.kifaaId, amountMinor: 1_000_00n, pin: "1234" });
    assert.equal(t1.id, t2.id);
    assert.equal(p.getBalance(a.id).amountMinor, 4_000_00n);
  });

  it("idempotency conflict on body mismatch", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000030", displayName: "A", pin: "1234" });
    const b = p.registerUser({ phone: "0700000031", displayName: "B", pin: "1234" });
    p.addTestMoney({ idempotencyKey: "f3", userId: a.id, amountMinor: 5_000_00n });
    p.transfer({ idempotencyKey: "dup", senderUserId: a.id, receiverKifaaIdOrPhone: b.kifaaId, amountMinor: 500_00n, pin: "1234" });
    assert.throws(
      () => p.transfer({ idempotencyKey: "dup", senderUserId: a.id, receiverKifaaIdOrPhone: b.kifaaId, amountMinor: 600_00n, pin: "1234" }),
      IdempotencyConflictError
    );
  });

  it("merchant pay via till", () => {
    const p = platform();
    const customer = p.registerUser({ phone: "0700000040", displayName: "Cust", pin: "1234" });
    const owner = p.registerUser({ phone: "0700000041", displayName: "Owner", pin: "1234" });
    const m = p.createMerchant({ userId: owner.id, businessName: "Mama Mboga" });
    p.addTestMoney({ idempotencyKey: "fm", userId: customer.id, amountMinor: 1_000_00n });
    const pay = p.payMerchant({ idempotencyKey: "pay1", payerUserId: customer.id, merchantQrOrTill: m.tillCode, amountMinor: 250_00n, pin: "1234" });
    assert.equal(pay.status, "COMPLETED");
    assert.equal(p.getBalance(customer.id).amountMinor, 750_00n);
  });

  it("agent cash-in and cash-out via QR", () => {
    const p = platform();
    const customer = p.registerUser({ phone: "0700000050", displayName: "Cust", pin: "1234" });
    const agentUser = p.registerUser({ phone: "0700000051", displayName: "Agent", pin: "1234" });
    const agent = p.createAgent({ userId: agentUser.id, businessName: "Kiosk 1" });
    assert.equal(agent.status, "PENDING");
    p.setAgentStatus(agent.agentId, "ACTIVE");
    const cin = p.agentCashIn({ idempotencyKey: "cin1", customerUserId: customer.id, agentQrPayload: agent.qrPayload, amountMinor: 3_000_00n, pin: "1234" });
    assert.equal(cin.status, "COMPLETED");
    assert.equal(cin.type, "AGENT_CASH_IN");
    assert.equal(p.getBalance(customer.id).amountMinor, 3_000_00n);
    const cout = p.agentCashOut({ idempotencyKey: "cout1", customerUserId: customer.id, agentQrPayload: agent.qrPayload, amountMinor: 1_000_00n, pin: "1234" });
    assert.equal(cout.status, "COMPLETED");
    assert.equal(p.getBalance(customer.id).amountMinor, 2_000_00n);
  });

  it("rejects agent ops when not ACTIVE", () => {
    const p = platform();
    const customer = p.registerUser({ phone: "0700000060", displayName: "Cust", pin: "1234" });
    const agentUser = p.registerUser({ phone: "0700000061", displayName: "Agent", pin: "1234" });
    const agent = p.createAgent({ userId: agentUser.id, businessName: "Kiosk" });
    assert.throws(
      () => p.agentCashIn({ idempotencyKey: "x", customerUserId: customer.id, agentQrPayload: agent.qrPayload, amountMinor: 100_00n, pin: "1234" }),
      ValidationError
    );
  });

  it("reverses a completed transfer", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000070", displayName: "A", pin: "1234" });
    const b = p.registerUser({ phone: "0700000071", displayName: "B", pin: "1234" });
    p.addTestMoney({ idempotencyKey: "fr", userId: a.id, amountMinor: 2_000_00n });
    const t = p.transfer({ idempotencyKey: "tr", senderUserId: a.id, receiverKifaaIdOrPhone: b.kifaaId, amountMinor: 500_00n, pin: "1234" });
    const rev = p.reverse(t.id, "customer dispute");
    assert.equal(rev.type, "REVERSAL");
    assert.equal(rev.status, "COMPLETED");
    assert.equal(p.getTransaction(t.id).status, "REVERSED");
    assert.equal(p.getBalance(a.id).amountMinor, 2_000_00n);
    assert.equal(p.getBalance(b.id).amountMinor, 0n);
  });

  it("QR does not embed secrets", () => {
    const p = platform();
    const u = p.registerUser({ phone: "0700000080", displayName: "U", pin: "4321" });
    const qr = p.userQr(u.id);
    assert.ok(qr.startsWith("kifaa:v1:"));
    assert.ok(!qr.includes("4321"));
    assert.ok(!qr.toLowerCase().includes("pin"));
  });

  it("rejects negative amounts", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000090", displayName: "A", pin: "1234" });
    assert.throws(() => p.addTestMoney({ idempotencyKey: "n", userId: a.id, amountMinor: -1n }), ValidationError);
  });
});
