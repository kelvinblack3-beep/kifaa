import type { CurrencyCode, EntryDirection } from "@kifaa/shared";

export interface LedgerLineInput {
  accountId: string;
  direction: EntryDirection;
  amountMinor: bigint;
  currency?: CurrencyCode;
}

export interface JournalInput {
  id: string;
  transactionId?: string;
  description?: string;
  lines: LedgerLineInput[];
  createdBy?: string;
  metadata?: Record<string, unknown>;
}

export interface PostedJournal {
  id: string;
  transactionId?: string;
  description?: string;
  status: "posted" | "reversed";
  postedAt: Date;
  lines: Array<LedgerLineInput & { id: string }>;
}

export interface AccountBalance {
  accountId: string;
  balanceMinor: bigint;
  currency: CurrencyCode;
}

/**
 * In-memory store for unit tests of ledger invariants.
 * Production uses PostgreSQL via @kifaa/database.
 */
export interface LedgerStore {
  postJournal(input: JournalInput): PostedJournal;
  getJournal(id: string): PostedJournal | undefined;
  reverseJournal(journalId: string, newJournalId: string, reason?: string): PostedJournal;
  getBalance(accountId: string): bigint;
  rebuildBalances(): Map<string, bigint>;
}
