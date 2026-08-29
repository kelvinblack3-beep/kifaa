import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { InMemoryLedger } from "./engine.js";
import {
  ImmutableLedgerError,
  LedgerAccountError,
  UnbalancedJournalError,
  newJournalId,
  newTransactionId,
} from "@kifaa/shared";

const ACC_A = "acc-customer-a";
const ACC_B = "acc-customer-b";
const ACC_CLEARING = "acc-provider-clearing";

describe("double-entry ledger invariants", () => {
  it("rejects unbalanced journals", () => {
    const ledger = new InMemoryLedger();
    assert.throws(
      () =>
        ledger.postJournal({
          id: newJournalId(),
          lines: [
            { accountId: ACC_A, direction: "debit", amountMinor: 10000n },
            { accountId: ACC_B, direction: "credit", amountMinor: 9000n },
          ],
        }),
      (err: unknown) => err instanceof UnbalancedJournalError
    );
  });

  it("rejects single-line journals", () => {
    const ledger = new InMemoryLedger();
    assert.throws(
      () =>
        ledger.postJournal({
          id: newJournalId(),
          lines: [{ accountId: ACC_A, direction: "debit", amountMinor: 100n }],
        }),
      (err: unknown) => err instanceof UnbalancedJournalError
    );
  });

  it("rejects zero or negative line amounts", () => {
    const ledger = new InMemoryLedger();
    assert.throws(
      () =>
        ledger.postJournal({
          id: newJournalId(),
          lines: [
            { accountId: ACC_A, direction: "debit", amountMinor: 0n },
            { accountId: ACC_B, direction: "credit", amountMinor: 0n },
          ],
        }),
      (err: unknown) => err instanceof UnbalancedJournalError
    );
  });

  it("rejects cross-currency false balance (USD debit + KES credit)", () => {
    const ledger = new InMemoryLedger();
    assert.throws(
      () =>
        ledger.postJournal({
          id: newJournalId(),
          lines: [
            { accountId: ACC_A, direction: "debit", amountMinor: 100n, currency: "USD" },
            { accountId: ACC_B, direction: "credit", amountMinor: 100n, currency: "KES" },
          ],
        }),
      (err: unknown) => err instanceof UnbalancedJournalError
    );
  });

  it("accepts multi-currency journal when each currency balances", () => {
    const ledger = new InMemoryLedger();
    const posted = ledger.postJournal({
      id: newJournalId(),
      lines: [
        { accountId: ACC_A, direction: "debit", amountMinor: 100n, currency: "USD" },
        { accountId: ACC_B, direction: "credit", amountMinor: 100n, currency: "USD" },
        { accountId: ACC_A, direction: "debit", amountMinor: 500n, currency: "KES" },
        { accountId: ACC_B, direction: "credit", amountMinor: 500n, currency: "KES" },
      ],
    });
    assert.equal(posted.status, "posted");
    assert.equal(ledger.getBalance(ACC_A, "USD"), 100n);
    assert.equal(ledger.getBalance(ACC_A, "KES"), 500n);
  });

  it("posts a balanced journal and updates projections", () => {
    const ledger = new InMemoryLedger();
    const posted = ledger.postJournal({
      id: newJournalId(),
      transactionId: newTransactionId(),
      description: "P2P transfer",
      lines: [
        { accountId: ACC_A, direction: "debit", amountMinor: 150000n, currency: "KES" },
        { accountId: ACC_B, direction: "credit", amountMinor: 150000n, currency: "KES" },
      ],
    });
    assert.equal(posted.status, "posted");
    assert.equal(ledger.getBalance(ACC_A), 150000n);
    assert.equal(ledger.getBalance(ACC_B), -150000n);
  });

  it("prevents duplicate journal id", () => {
    const ledger = new InMemoryLedger();
    const jid = newJournalId();
    const lines = [
      { accountId: ACC_A, direction: "debit" as const, amountMinor: 100n },
      { accountId: ACC_CLEARING, direction: "credit" as const, amountMinor: 100n },
    ];
    ledger.postJournal({ id: jid, lines });
    assert.throws(() => ledger.postJournal({ id: jid, lines }), (err: unknown) => err instanceof ImmutableLedgerError);
  });

  it("prevents duplicate transaction posting", () => {
    const ledger = new InMemoryLedger();
    const txnId = newTransactionId();
    const lines = [
      { accountId: ACC_A, direction: "debit" as const, amountMinor: 500n },
      { accountId: ACC_CLEARING, direction: "credit" as const, amountMinor: 500n },
    ];
    ledger.postJournal({ id: newJournalId(), transactionId: txnId, lines });
    assert.throws(
      () => ledger.postJournal({ id: newJournalId(), transactionId: txnId, lines }),
      (err: unknown) => err instanceof ImmutableLedgerError
    );
  });

  it("posted journals cannot be edited", () => {
    const ledger = new InMemoryLedger();
    const jid = newJournalId();
    ledger.postJournal({
      id: jid,
      lines: [
        { accountId: ACC_A, direction: "debit", amountMinor: 100n },
        { accountId: ACC_B, direction: "credit", amountMinor: 100n },
      ],
    });
    assert.throws(() => ledger.tryMutateJournal(jid), (err: unknown) => err instanceof ImmutableLedgerError);
  });

  it("reversal creates explicit reversesJournalId and zeros net effect", () => {
    const ledger = new InMemoryLedger();
    const jid = newJournalId();
    const revId = newJournalId();
    ledger.postJournal({
      id: jid,
      transactionId: newTransactionId(),
      lines: [
        { accountId: ACC_A, direction: "debit", amountMinor: 25000n },
        { accountId: ACC_B, direction: "credit", amountMinor: 25000n },
      ],
    });
    const rev = ledger.reverseJournal(jid, revId, "Customer dispute");
    assert.equal(rev.reversesJournalId, jid);
    assert.equal(ledger.getJournal(jid)?.status, "reversed");
    assert.equal(ledger.getJournal(jid)?.reversedByJournalId, revId);
    assert.equal(ledger.getBalance(ACC_A), 0n);
  });

  it("double reversal is a domain error", () => {
    const ledger = new InMemoryLedger();
    const jid = newJournalId();
    ledger.postJournal({
      id: jid,
      lines: [
        { accountId: ACC_A, direction: "debit", amountMinor: 100n },
        { accountId: ACC_B, direction: "credit", amountMinor: 100n },
      ],
    });
    ledger.reverseJournal(jid, newJournalId(), "first");
    assert.throws(
      () => ledger.reverseJournal(jid, newJournalId(), "second"),
      (err: unknown) => err instanceof ImmutableLedgerError
    );
  });

  it("rebuildBalances matches projection after post → reverse", () => {
    const ledger = new InMemoryLedger();
    const jid = newJournalId();
    ledger.postJournal({
      id: jid,
      lines: [
        { accountId: ACC_A, direction: "debit", amountMinor: 25000n, currency: "KES" },
        { accountId: ACC_B, direction: "credit", amountMinor: 25000n, currency: "KES" },
      ],
    });
    ledger.reverseJournal(jid, newJournalId(), "dispute");
    const rebuilt = ledger.rebuildBalances();
    assert.equal(rebuilt.get(ACC_A)?.get("KES") ?? 0n, 0n);
    assert.equal(rebuilt.get(ACC_B)?.get("KES") ?? 0n, 0n);
  });

  it("rebuildBalances matches projection for posted journals", () => {
    const ledger = new InMemoryLedger();
    ledger.postJournal({
      id: newJournalId(),
      lines: [
        { accountId: ACC_A, direction: "debit", amountMinor: 1000n },
        { accountId: ACC_CLEARING, direction: "credit", amountMinor: 1000n },
      ],
    });
    ledger.postJournal({
      id: newJournalId(),
      lines: [
        { accountId: ACC_B, direction: "debit", amountMinor: 400n },
        { accountId: ACC_CLEARING, direction: "credit", amountMinor: 400n },
      ],
    });
    const rebuilt = ledger.rebuildBalances();
    assert.equal(rebuilt.get(ACC_A)?.get("KES"), 1000n);
    assert.equal(rebuilt.get(ACC_B)?.get("KES"), 400n);
    assert.equal(rebuilt.get(ACC_CLEARING)?.get("KES"), -1400n);
  });

  it("getAllBalances reports actual currency", () => {
    const ledger = new InMemoryLedger();
    ledger.postJournal({
      id: newJournalId(),
      lines: [
        { accountId: ACC_A, direction: "debit", amountMinor: 10n, currency: "USD" },
        { accountId: ACC_B, direction: "credit", amountMinor: 10n, currency: "USD" },
      ],
    });
    const usdA = ledger.getAllBalances().find((b) => b.accountId === ACC_A && b.currency === "USD");
    assert.ok(usdA);
    assert.equal(usdA!.balanceMinor, 10n);
  });

  it("registerAccount connects LedgerAccountType", () => {
    const ledger = new InMemoryLedger();
    ledger.registerAccount({ id: ACC_A, type: "customer", currency: "KES" });
    ledger.registerAccount({ id: ACC_CLEARING, type: "provider_clearing", currency: "KES" });
    assert.equal(ledger.getAccount(ACC_A)?.type, "customer");
    assert.equal(ledger.getAccount(ACC_CLEARING)?.type, "provider_clearing");
  });
});

describe("account registry integrity", () => {
  it("KES account + KES posting passes under strictAccounts", () => {
    const ledger = new InMemoryLedger({ strictAccounts: true });
    ledger.registerAccount({ id: ACC_A, type: "customer", currency: "KES" });
    ledger.registerAccount({ id: ACC_B, type: "customer", currency: "KES" });
    const posted = ledger.postJournal({
      id: newJournalId(),
      lines: [
        { accountId: ACC_A, direction: "debit", amountMinor: 100n, currency: "KES" },
        { accountId: ACC_B, direction: "credit", amountMinor: 100n, currency: "KES" },
      ],
    });
    assert.equal(posted.status, "posted");
  });

  it("KES account + USD posting is rejected under strictAccounts", () => {
    const ledger = new InMemoryLedger({ strictAccounts: true });
    ledger.registerAccount({ id: ACC_A, type: "customer", currency: "KES" });
    ledger.registerAccount({ id: ACC_B, type: "customer", currency: "KES" });
    assert.throws(
      () =>
        ledger.postJournal({
          id: newJournalId(),
          lines: [
            { accountId: ACC_A, direction: "debit", amountMinor: 100n, currency: "USD" },
            { accountId: ACC_B, direction: "credit", amountMinor: 100n, currency: "USD" },
          ],
        }),
      (err: unknown) => err instanceof LedgerAccountError
    );
  });

  it("USD account + USD posting passes under strictAccounts", () => {
    const ledger = new InMemoryLedger({ strictAccounts: true });
    ledger.registerAccount({ id: ACC_A, type: "customer", currency: "USD" });
    ledger.registerAccount({ id: ACC_B, type: "customer", currency: "USD" });
    const posted = ledger.postJournal({
      id: newJournalId(),
      lines: [
        { accountId: ACC_A, direction: "debit", amountMinor: 50n, currency: "USD" },
        { accountId: ACC_B, direction: "credit", amountMinor: 50n, currency: "USD" },
      ],
    });
    assert.equal(ledger.getBalance(ACC_A, "USD"), 50n);
    assert.equal(posted.status, "posted");
  });

  it("identical re-registration is idempotent", () => {
    const ledger = new InMemoryLedger({ strictAccounts: true });
    ledger.registerAccount({ id: ACC_A, type: "customer", currency: "KES" });
    ledger.registerAccount({ id: ACC_A, type: "customer", currency: "KES", label: "Alice" });
    assert.equal(ledger.getAccount(ACC_A)?.type, "customer");
    assert.equal(ledger.getAccount(ACC_A)?.currency, "KES");
  });

  it("re-registration with different currency is rejected", () => {
    const ledger = new InMemoryLedger();
    ledger.registerAccount({ id: ACC_A, type: "customer", currency: "KES" });
    assert.throws(
      () => ledger.registerAccount({ id: ACC_A, type: "customer", currency: "USD" }),
      (err: unknown) => err instanceof LedgerAccountError
    );
  });

  it("re-registration with different type is rejected", () => {
    const ledger = new InMemoryLedger();
    ledger.registerAccount({ id: ACC_A, type: "customer", currency: "KES" });
    assert.throws(
      () => ledger.registerAccount({ id: ACC_A, type: "merchant", currency: "KES" }),
      (err: unknown) => err instanceof LedgerAccountError
    );
  });

  it("empty account id is rejected", () => {
    const ledger = new InMemoryLedger();
    assert.throws(
      () => ledger.registerAccount({ id: "", type: "customer", currency: "KES" }),
      (err: unknown) => err instanceof LedgerAccountError
    );
  });

  it("strict ledger rejects unregistered account", () => {
    const ledger = new InMemoryLedger({ strictAccounts: true });
    assert.throws(
      () =>
        ledger.postJournal({
          id: newJournalId(),
          lines: [
            { accountId: "ghost", direction: "debit", amountMinor: 1n, currency: "KES" },
            { accountId: "ghost2", direction: "credit", amountMinor: 1n, currency: "KES" },
          ],
        }),
      (err: unknown) => err instanceof LedgerAccountError
    );
  });

  it("non-strict ledger still posts without registration", () => {
    const ledger = new InMemoryLedger({ strictAccounts: false });
    const posted = ledger.postJournal({
      id: newJournalId(),
      lines: [
        { accountId: "unreg-a", direction: "debit", amountMinor: 10n },
        { accountId: "unreg-b", direction: "credit", amountMinor: 10n },
      ],
    });
    assert.equal(posted.status, "posted");
    assert.equal(ledger.getBalance("unreg-a"), 10n);
  });
});
