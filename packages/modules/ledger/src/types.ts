import type { CurrencyCode, EntryDirection, LedgerAccountType } from "@kifaa/shared";

export interface LedgerLineInput {
  accountId: string;
  direction: EntryDirection;
  amountMinor: bigint;
  /** Required for multi-currency journals; defaults to KES when omitted for single-currency posts */
  currency?: CurrencyCode;
}

export interface JournalInput {
  id: string;
  transactionId?: string;
  description?: string;
  lines: LedgerLineInput[];
  createdBy?: string;
  metadata?: Record<string, unknown>;
  /** Explicit link when this journal reverses another (preferred over metadata) */
  reversesJournalId?: string;
}

export interface PostedJournal {
  id: string;
  transactionId?: string;
  description?: string;
  /** "posted" = active; "reversed" = original that was reversed (lines still historical fact) */
  status: "posted" | "reversed";
  postedAt: Date;
  lines: Array<LedgerLineInput & { id: string; currency: CurrencyCode }>;
  /** Journal this one reverses, if any */
  reversesJournalId?: string;
  /** Journal that reversed this one, if any */
  reversedByJournalId?: string;
}

export interface AccountBalance {
  accountId: string;
  balanceMinor: bigint;
  currency: CurrencyCode;
}

/**
 * Minimal account registry entry.
 * currency is required: under strictAccounts, postings must match registered currency.
 */
export interface LedgerAccount {
  id: string;
  type: LedgerAccountType;
  currency: CurrencyCode;
  label?: string;
}

/**
 * Ledger persistence contract.
 * Methods are async-compatible so PostgreSQL (and other) stores can implement
 * the same surface without changing callers later.
 */
export interface LedgerStore {
  postJournal(input: JournalInput): PostedJournal | Promise<PostedJournal>;
  getJournal(id: string): PostedJournal | undefined | Promise<PostedJournal | undefined>;
  reverseJournal(
    journalId: string,
    newJournalId: string,
    reason?: string
  ): PostedJournal | Promise<PostedJournal>;
  getBalance(accountId: string, currency?: CurrencyCode): bigint | Promise<bigint>;
  rebuildBalances():
    | Map<string, Map<CurrencyCode, bigint>>
    | Promise<Map<string, Map<CurrencyCode, bigint>>>;
  getAllBalances(): AccountBalance[] | Promise<AccountBalance[]>;
  registerAccount?(account: LedgerAccount): void | Promise<void>;
  getAccount?(accountId: string): LedgerAccount | undefined | Promise<LedgerAccount | undefined>;
}
