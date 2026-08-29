import {
  ImmutableLedgerError,
  UnbalancedJournalError,
  newId,
  type CurrencyCode,
  type LedgerAccountType,
} from "@kifaa/shared";
import type {
  AccountBalance,
  JournalInput,
  LedgerAccount,
  LedgerLineInput,
  LedgerStore,
  PostedJournal,
} from "./types.js";

function balanceKey(accountId: string, currency: CurrencyCode): string {
  return `${accountId}\0${currency}`;
}

function parseBalanceKey(key: string): { accountId: string; currency: CurrencyCode } {
  const i = key.indexOf("\0");
  return { accountId: key.slice(0, i), currency: key.slice(i + 1) as CurrencyCode };
}

function assertBalanced(lines: LedgerLineInput[]): void {
  if (lines.length < 2) throw new UnbalancedJournalError("Journal must have at least two lines");
  for (const line of lines) {
    if (line.amountMinor <= 0n) throw new UnbalancedJournalError("Line amounts must be positive minor units");
  }
  const byCurrency = new Map<CurrencyCode, { debits: bigint; credits: bigint }>();
  for (const line of lines) {
    const c = (line.currency ?? "KES") as CurrencyCode;
    const bucket = byCurrency.get(c) ?? { debits: 0n, credits: 0n };
    if (line.direction === "debit") bucket.debits += line.amountMinor;
    else bucket.credits += line.amountMinor;
    byCurrency.set(c, bucket);
  }
  for (const [currency, { debits, credits }] of byCurrency) {
    if (debits !== credits) {
      throw new UnbalancedJournalError(`Unbalanced ${currency}: debits=${debits} credits=${credits}`);
    }
  }
}

export class InMemoryLedger implements LedgerStore {
  private journals = new Map<string, PostedJournal>();
  private balances = new Map<string, bigint>();
  private postedTransactionIds = new Set<string>();
  private accounts = new Map<string, LedgerAccount>();

  registerAccount(account: LedgerAccount): void {
    this.accounts.set(account.id, account);
  }

  getAccount(accountId: string): LedgerAccount | undefined {
    return this.accounts.get(accountId);
  }

  ensureAccount(accountId: string, type: LedgerAccountType = "customer", currency: CurrencyCode = "KES"): void {
    if (!this.accounts.has(accountId)) {
      this.registerAccount({ id: accountId, type, currency });
    }
  }

  postJournal(input: JournalInput): PostedJournal {
    assertBalanced(input.lines);
    if (this.journals.has(input.id)) throw new ImmutableLedgerError(`Journal ${input.id} already exists`);
    if (input.transactionId && this.postedTransactionIds.has(input.transactionId)) {
      throw new ImmutableLedgerError(`Transaction ${input.transactionId} already has a posted journal (duplicate prevention)`);
    }
    if (input.reversesJournalId) {
      const target = this.journals.get(input.reversesJournalId);
      if (!target) throw new ImmutableLedgerError(`Cannot reverse unknown journal ${input.reversesJournalId}`);
      if (target.status === "reversed") throw new ImmutableLedgerError(`Journal ${input.reversesJournalId} is already reversed`);
    }
    const posted: PostedJournal = {
      id: input.id,
      transactionId: input.transactionId,
      description: input.description,
      status: "posted",
      postedAt: new Date(),
      lines: input.lines.map((l) => ({ ...l, id: newId(), currency: (l.currency ?? "KES") as CurrencyCode })),
      reversesJournalId: input.reversesJournalId,
    };
    this.journals.set(posted.id, posted);
    this.applyLinesToProjection(posted.lines);
    if (input.transactionId) this.postedTransactionIds.add(input.transactionId);
    if (input.reversesJournalId) {
      const original = this.journals.get(input.reversesJournalId)!;
      original.status = "reversed";
      original.reversedByJournalId = posted.id;
    }
    return posted;
  }

  getJournal(id: string): PostedJournal | undefined {
    return this.journals.get(id);
  }

  tryMutateJournal(id: string): never {
    const j = this.journals.get(id);
    if (!j) throw new Error("Journal not found");
    throw new ImmutableLedgerError("Posted ledger entries are immutable");
  }

  reverseJournal(journalId: string, newJournalId: string, reason?: string): PostedJournal {
    const original = this.journals.get(journalId);
    if (!original) throw new Error(`Journal ${journalId} not found`);
    if (original.status === "reversed") {
      throw new ImmutableLedgerError(
        `Journal ${journalId} already reversed` + (original.reversedByJournalId ? ` by ${original.reversedByJournalId}` : "")
      );
    }
    const reversingLines: LedgerLineInput[] = original.lines.map((l) => ({
      accountId: l.accountId,
      direction: l.direction === "debit" ? "credit" : "debit",
      amountMinor: l.amountMinor,
      currency: l.currency,
    }));
    return this.postJournal({
      id: newJournalId,
      description: reason ?? `Reversal of ${journalId}`,
      lines: reversingLines,
      createdBy: "system",
      reversesJournalId: journalId,
      metadata: { reason },
    });
  }

  getBalance(accountId: string, currency: CurrencyCode = "KES"): bigint {
    return this.balances.get(balanceKey(accountId, currency)) ?? 0n;
  }

  rebuildBalances(): Map<string, Map<CurrencyCode, bigint>> {
    const rebuilt = new Map<string, Map<CurrencyCode, bigint>>();
    for (const journal of this.journals.values()) {
      if (journal.status !== "posted" && journal.status !== "reversed") continue;
      for (const line of journal.lines) {
        const currency = line.currency;
        let byCur = rebuilt.get(line.accountId);
        if (!byCur) { byCur = new Map(); rebuilt.set(line.accountId, byCur); }
        const current = byCur.get(currency) ?? 0n;
        const delta = line.direction === "debit" ? line.amountMinor : -line.amountMinor;
        byCur.set(currency, current + delta);
      }
    }
    for (const [accountId, byCur] of rebuilt) {
      for (const [currency, bal] of byCur) {
        const projected = this.getBalance(accountId, currency);
        if (projected !== bal) {
          throw new Error(`Balance mismatch for ${accountId} ${currency}: projection=${projected} rebuilt=${bal}`);
        }
      }
    }
    for (const [key, projected] of this.balances) {
      const { accountId, currency } = parseBalanceKey(key);
      const rebuiltBal = rebuilt.get(accountId)?.get(currency) ?? 0n;
      if (projected !== 0n && projected !== rebuiltBal) {
        throw new Error(`Balance mismatch for ${accountId} ${currency}: projection=${projected} rebuilt=${rebuiltBal}`);
      }
    }
    return rebuilt;
  }

  getAllBalances(): AccountBalance[] {
    return [...this.balances.entries()].map(([key, balanceMinor]) => {
      const { accountId, currency } = parseBalanceKey(key);
      return { accountId, balanceMinor, currency };
    });
  }

  private applyLinesToProjection(
    lines: Array<{ accountId: string; direction: "debit" | "credit"; amountMinor: bigint; currency: CurrencyCode }>
  ): void {
    for (const line of lines) {
      const key = balanceKey(line.accountId, line.currency);
      const current = this.balances.get(key) ?? 0n;
      const delta = line.direction === "debit" ? line.amountMinor : -line.amountMinor;
      this.balances.set(key, current + delta);
    }
  }
}
