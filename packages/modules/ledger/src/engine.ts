import {
  ImmutableLedgerError,
  UnbalancedJournalError,
  newId,
} from "@kifaa/shared";
import type {
  AccountBalance,
  JournalInput,
  LedgerLineInput,
  LedgerStore,
  PostedJournal,
} from "./types.js";

function sumDebits(lines: LedgerLineInput[]): bigint {
  return lines
    .filter((l) => l.direction === "debit")
    .reduce((s, l) => s + l.amountMinor, 0n);
}

function sumCredits(lines: LedgerLineInput[]): bigint {
  return lines
    .filter((l) => l.direction === "credit")
    .reduce((s, l) => s + l.amountMinor, 0n);
}

function assertBalanced(lines: LedgerLineInput[]): void {
  if (lines.length < 2) {
    throw new UnbalancedJournalError("Journal must have at least two lines");
  }
  for (const line of lines) {
    if (line.amountMinor <= 0n) {
      throw new UnbalancedJournalError("Line amounts must be positive minor units");
    }
  }
  const debits = sumDebits(lines);
  const credits = sumCredits(lines);
  if (debits !== credits) {
    throw new UnbalancedJournalError(
      `Unbalanced: debits=${debits} credits=${credits}`
    );
  }
}

/**
 * In-memory double-entry ledger for unit tests and as reference implementation.
 * Production path persists via PostgreSQL (immutable journal_entries + ledger_lines).
 */
export class InMemoryLedger implements LedgerStore {
  private journals = new Map<string, PostedJournal>();
  private balances = new Map<string, bigint>();
  private postedTransactionIds = new Set<string>();

  postJournal(input: JournalInput): PostedJournal {
    assertBalanced(input.lines);

    if (this.journals.has(input.id)) {
      throw new ImmutableLedgerError(`Journal ${input.id} already exists`);
    }

    if (input.transactionId && this.postedTransactionIds.has(input.transactionId)) {
      throw new ImmutableLedgerError(
        `Transaction ${input.transactionId} already has a posted journal (duplicate prevention)`
      );
    }

    const posted: PostedJournal = {
      id: input.id,
      transactionId: input.transactionId,
      description: input.description,
      status: "posted",
      postedAt: new Date(),
      lines: input.lines.map((l) => ({ ...l, id: newId() })),
    };

    this.journals.set(posted.id, posted);

    for (const line of posted.lines) {
      const current = this.balances.get(line.accountId) ?? 0n;
      const delta = line.direction === "debit" ? line.amountMinor : -line.amountMinor;
      this.balances.set(line.accountId, current + delta);
    }

    if (input.transactionId) {
      this.postedTransactionIds.add(input.transactionId);
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
      throw new ImmutableLedgerError("Journal already reversed");
    }

    original.status = "reversed";

    const reversingLines: LedgerLineInput[] = original.lines.map((l) => ({
      accountId: l.accountId,
      direction: l.direction === "debit" ? "credit" : "debit",
      amountMinor: l.amountMinor,
      currency: l.currency,
    }));

    return this.postJournal({
      id: newJournalId,
      transactionId: original.transactionId
        ? `${original.transactionId}_rev`
        : undefined,
      description: reason ?? `Reversal of ${journalId}`,
      lines: reversingLines,
      createdBy: "system",
      metadata: { reverses: journalId },
    });
  }

  getBalance(accountId: string): bigint {
    return this.balances.get(accountId) ?? 0n;
  }

  rebuildBalances(): Map<string, bigint> {
    const rebuilt = new Map<string, bigint>();
    for (const journal of this.journals.values()) {
      if (journal.status !== "posted") continue;
      for (const line of journal.lines) {
        const current = rebuilt.get(line.accountId) ?? 0n;
        const delta = line.direction === "debit" ? line.amountMinor : -line.amountMinor;
        rebuilt.set(line.accountId, current + delta);
      }
    }
    for (const [accountId, bal] of rebuilt) {
      const projected = this.balances.get(accountId) ?? 0n;
      if (projected !== bal) {
        throw new Error(
          `Balance mismatch for ${accountId}: projection=${projected} rebuilt=${bal}`
        );
      }
    }
    return rebuilt;
  }

  getAllBalances(): AccountBalance[] {
    return [...this.balances.entries()].map(([accountId, balanceMinor]) => ({
      accountId,
      balanceMinor,
      currency: "KES" as const,
    }));
  }
}
