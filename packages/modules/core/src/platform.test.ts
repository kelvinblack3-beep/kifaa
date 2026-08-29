import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { KifaaPlatform } from "./platform.js";
import {
  IdempotencyConflictError,
  ValidationError,
  AuthError,
  ImmutableLedgerError,
} from "@kifaa/shared";
import { InMemoryLedger } from "@kifaa/ledger";
import type { JournalInput } from "@kifaa/ledger";

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
      idempotencyKey: "xfer-1",
      senderUserId: a.id,
      receiverKifaaIdOrPhone: b.kifaaId,
      amountMinor: 2_500_00n,
      pin: "1234",
      note: "lunch",
    });
    assert.equal(t.status, "COMPLETED");
    assert.equal(t.type, "TRANSFER");
    assert.ok(t.reference.startsWith("KIF"));
    assert.equal(p.getBalance(a.id).amountMinor, 7_500_00n);
    assert.equal(p.getBalance(b.id).amountMinor, 2_500_00n);
  });

  it("prevents overdraft", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000010", displayName: "A", pin: "1234" });
    const b = p.registerUser({ phone: "0700000011", displayName: "B", pin: "1234" });
    p.addTestMoney({ idempotencyKey: "f", userId: a.id, amountMinor: 100_00n });
    assert.throws(
      () =>
        p.transfer({
          idempotencyKey: "x",
          senderUserId: a.id,
          receiverKifaaIdOrPhone: b.phone,
          amountMinor: 200_00n,
          pin: "1234",
        }),
      ValidationError
    );
  });

  it("idempotent transfer returns same txn", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000020", displayName: "A", pin: "1234" });
    const b = p.registerUser({ phone: "0700000021", displayName: "B", pin: "1234" });
    p.addTestMoney({ idempotencyKey: "f2", userId: a.id, amountMinor: 5_000_00n });
    const t1 = p.transfer({
      idempotencyKey: "same-key",
      senderUserId: a.id,
      receiverKifaaIdOrPhone: b.kifaaId,
      amountMinor: 1_000_00n,
      pin: "1234",
    });
    const t2 = p.transfer({
      idempotencyKey: "same-key",
      senderUserId: a.id,
      receiverKifaaIdOrPhone: b.kifaaId,
      amountMinor: 1_000_00n,
      pin: "1234",
    });
    assert.equal(t1.id, t2.id);
    assert.equal(p.getBalance(a.id).amountMinor, 4_000_00n);
  });

  it("idempotency conflict on body mismatch", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000030", displayName: "A", pin: "1234" });
    const b = p.registerUser({ phone: "0700000031", displayName: "B", pin: "1234" });
    p.addTestMoney({ idempotencyKey: "f3", userId: a.id, amountMinor: 5_000_00n });
    p.transfer({
      idempotencyKey: "dup",
      senderUserId: a.id,
      receiverKifaaIdOrPhone: b.kifaaId,
      amountMinor: 500_00n,
      pin: "1234",
    });
    assert.throws(
      () =>
        p.transfer({
          idempotencyKey: "dup",
          senderUserId: a.id,
          receiverKifaaIdOrPhone: b.kifaaId,
          amountMinor: 600_00n,
          pin: "1234",
        }),
      IdempotencyConflictError
    );
  });

  it("merchant pay via till", () => {
    const p = platform();
    const customer = p.registerUser({ phone: "0700000040", displayName: "Cust", pin: "1234" });
    const owner = p.registerUser({ phone: "0700000041", displayName: "Owner", pin: "1234" });
    const m = p.createMerchant({ userId: owner.id, businessName: "Mama Mboga" });
    p.addTestMoney({ idempotencyKey: "fm", userId: customer.id, amountMinor: 1_000_00n });
    const pay = p.payMerchant({
      idempotencyKey: "pay1",
      payerUserId: customer.id,
      merchantQrOrTill: m.tillCode,
      amountMinor: 250_00n,
      pin: "1234",
    });
    assert.equal(pay.status, "COMPLETED");
    assert.equal(p.getBalance(customer.id).amountMinor, 750_00n);
  });

  it("agent cash-in and cash-out via QR", () => {
    const p = platform();
    const customer = p.registerUser({ phone: "0700000050", displayName: "Cust", pin: "1234" });
    const agentUser = p.registerUser({ phone: "0700000051", displayName: "Agent", pin: "1234" });
    const agent = p.createAgent({ userId: agentUser.id, businessName: "Kiosk 1" });
    p.setAgentStatus(agent.agentId, "ACTIVE");
    const cin = p.agentCashIn({
      idempotencyKey: "cin1",
      customerUserId: customer.id,
      agentQrPayload: agent.qrPayload,
      amountMinor: 3_000_00n,
      pin: "1234",
    });
    assert.equal(cin.status, "COMPLETED");
    assert.equal(p.getBalance(customer.id).amountMinor, 3_000_00n);
    const cout = p.agentCashOut({
      idempotencyKey: "cout1",
      customerUserId: customer.id,
      agentQrPayload: agent.qrPayload,
      amountMinor: 1_000_00n,
      pin: "1234",
    });
    assert.equal(cout.status, "COMPLETED");
    assert.equal(p.getBalance(customer.id).amountMinor, 2_000_00n);
  });

  it("rejects agent ops when not ACTIVE", () => {
    const p = platform();
    const customer = p.registerUser({ phone: "0700000060", displayName: "Cust", pin: "1234" });
    const agentUser = p.registerUser({ phone: "0700000061", displayName: "Agent", pin: "1234" });
    const agent = p.createAgent({ userId: agentUser.id, businessName: "Kiosk" });
    assert.throws(
      () =>
        p.agentCashIn({
          idempotencyKey: "x",
          customerUserId: customer.id,
          agentQrPayload: agent.qrPayload,
          amountMinor: 100_00n,
          pin: "1234",
        }),
      ValidationError
    );
  });

  it("reverses a completed transfer", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000070", displayName: "A", pin: "1234" });
    const b = p.registerUser({ phone: "0700000071", displayName: "B", pin: "1234" });
    p.addTestMoney({ idempotencyKey: "fr", userId: a.id, amountMinor: 2_000_00n });
    const t = p.transfer({
      idempotencyKey: "tr",
      senderUserId: a.id,
      receiverKifaaIdOrPhone: b.kifaaId,
      amountMinor: 500_00n,
      pin: "1234",
    });
    const rev = p.reverse(t.id, "customer dispute");
    assert.equal(rev.type, "REVERSAL");
    assert.equal(p.getTransaction(t.id).status, "REVERSED");
    assert.equal(p.getBalance(a.id).amountMinor, 2_000_00n);
  });

  it("QR does not embed secrets", () => {
    const p = platform();
    const u = p.registerUser({ phone: "0700000080", displayName: "U", pin: "4321" });
    const qr = p.userQr(u.id);
    assert.ok(qr.startsWith("kifaa:v1:"));
    assert.ok(!qr.includes("4321"));
  });

  it("rejects negative amounts", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000090", displayName: "A", pin: "1234" });
    assert.throws(
      () => p.addTestMoney({ idempotencyKey: "n", userId: a.id, amountMinor: -1n }),
      ValidationError
    );
  });

  it("FAILED without journalId is retryable with same key (exactly one journal)", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000100", displayName: "A", pin: "1234" });
    let failsLeft = 1;
    const original = p.ledger.postJournal.bind(p.ledger);
    p.ledger.postJournal = ((input: JournalInput) => {
      if (failsLeft > 0) {
        failsLeft -= 1;
        throw new Error("simulated ledger post failure");
      }
      return original(input);
    }) as typeof p.ledger.postJournal;

    assert.throws(
      () =>
        p.addTestMoney({
          idempotencyKey: "retry-fund-1",
          userId: a.id,
          amountMinor: 1_000_00n,
        }),
      /simulated ledger post failure/
    );
    assert.equal(p.getBalance(a.id).amountMinor, 0n);

    const failed = [...p["txns"].values()].find(
      (t) => t.idempotencyKey === "retry-fund-1" && t.status === "FAILED"
    );
    assert.ok(failed);
    assert.equal(failed!.journalId, undefined);

    const ok = p.addTestMoney({
      idempotencyKey: "retry-fund-1",
      userId: a.id,
      amountMinor: 1_000_00n,
    });
    assert.equal(ok.status, "COMPLETED");
    assert.ok(ok.journalId);
    assert.equal(p.getBalance(a.id).amountMinor, 1_000_00n);

    const again = p.addTestMoney({
      idempotencyKey: "retry-fund-1",
      userId: a.id,
      amountMinor: 1_000_00n,
    });
    assert.equal(again.id, ok.id);
    assert.equal(p.getBalance(a.id).amountMinor, 1_000_00n);
  });

  it("FAILED attempt still conflicts on different body", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000101", displayName: "A", pin: "1234" });
    let failsLeft = 1;
    const original = p.ledger.postJournal.bind(p.ledger);
    p.ledger.postJournal = ((input: JournalInput) => {
      if (failsLeft > 0) {
        failsLeft -= 1;
        throw new Error("simulated ledger post failure");
      }
      return original(input);
    }) as typeof p.ledger.postJournal;

    assert.throws(
      () =>
        p.addTestMoney({
          idempotencyKey: "conflict-after-fail",
          userId: a.id,
          amountMinor: 500_00n,
        }),
      /simulated/
    );

    assert.throws(
      () =>
        p.addTestMoney({
          idempotencyKey: "conflict-after-fail",
          userId: a.id,
          amountMinor: 999_00n,
        }),
      IdempotencyConflictError
    );
  });

  it("registers system, user, and merchant ledger accounts", () => {
    const p = platform();
    assert.equal(p.ledger.getAccount("sys_sandbox_float")?.type, "asset");
    assert.equal(p.ledger.getAccount("sys_suspense")?.type, "suspense");
    const u = p.registerUser({ phone: "0700000102", displayName: "U", pin: "1234" });
    assert.equal(p.ledger.getAccount(u.ledgerAccountId)?.type, "customer");
    const m = p.createMerchant({ userId: u.id, businessName: "Shop" });
    assert.equal(p.ledger.getAccount(m.ledgerAccountId)?.type, "merchant");
  });

  it("strict ledger rejects unregistered accounts", () => {
    const ledger = new InMemoryLedger({ strictAccounts: true });
    assert.throws(
      () =>
        ledger.postJournal({
          id: "j-unreg",
          lines: [
            { accountId: "ghost-a", direction: "debit", amountMinor: 1n },
            { accountId: "ghost-b", direction: "credit", amountMinor: 1n },
          ],
        }),
      (err: unknown) =>
        err instanceof ImmutableLedgerError && String(err.message).includes("Unregistered")
    );
  });

  it("fund → transfer → reverse → rebuildBalances matches projection", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000103", displayName: "A", pin: "1234" });
    const b = p.registerUser({ phone: "0700000104", displayName: "B", pin: "1234" });
    p.addTestMoney({ idempotencyKey: "rb-fund", userId: a.id, amountMinor: 5_000_00n });
    const t = p.transfer({
      idempotencyKey: "rb-xfer",
      senderUserId: a.id,
      receiverKifaaIdOrPhone: b.kifaaId,
      amountMinor: 1_000_00n,
      pin: "1234",
    });
    p.reverse(t.id, "rebuild test");
    const rebuilt = p.ledger.rebuildBalances();
    assert.equal(p.getBalance(a.id).amountMinor, 5_000_00n);
    assert.equal(p.getBalance(b.id).amountMinor, 0n);
    assert.equal(-(rebuilt.get(a.ledgerAccountId)?.get("KES") ?? 0n), 5_000_00n);
    assert.equal(-(rebuilt.get(b.ledgerAccountId)?.get("KES") ?? 0n), 0n);
  });

  it("PIN material absent from receipt, QR, audit, ledger metadata", () => {
    const p = platform();
    const a = p.registerUser({ phone: "0700000105", displayName: "A", pin: "9876" });
    const b = p.registerUser({ phone: "0700000106", displayName: "B", pin: "9876" });
    p.addTestMoney({ idempotencyKey: "sec-fund", userId: a.id, amountMinor: 1_000_00n });
    const t = p.transfer({
      idempotencyKey: "sec-xfer",
      senderUserId: a.id,
      receiverKifaaIdOrPhone: b.kifaaId,
      amountMinor: 100_00n,
      pin: "9876",
    });
    assert.ok(!JSON.stringify(p.receipt(t.id)).includes("9876"));
    assert.ok(!p.userQr(a.id).includes("9876"));
    assert.ok(!JSON.stringify(p.getAuditLog()).includes("9876"));
    const journal = p.ledger.getJournal(t.journalId!);
    const journalBlob = JSON.stringify(journal, (_k, v) => (typeof v === "bigint" ? v.toString() : v));
    assert.ok(!journalBlob.includes("9876"));
  });

  it("sandbox boundary: mode SANDBOX and txn.sandbox true", () => {
    const p = platform();
    assert.equal(p.mode, "SANDBOX");
    const a = p.registerUser({ phone: "0700000107", displayName: "A", pin: "1234" });
    const fund = p.addTestMoney({ idempotencyKey: "sb-1", userId: a.id, amountMinor: 100_00n });
    assert.equal(fund.sandbox, true);
    assert.equal(p.getBalance(a.id).sandbox, true);
  });
});
