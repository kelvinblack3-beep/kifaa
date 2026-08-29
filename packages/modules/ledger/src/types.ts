import type { CurrencyCode, EntryDirection, LedgerAccountType } from "@kifaa/shared";

export interface LedgerLineInput {
  accountId: string;
  direction: EntryDirection;
  amountMinor: bigint;
  /** Required for multi-currency journals; defaults to KES when omitted */
  currency?: CurrencyCode;
}

export interface JournalInput {
  id: string;
  transactionId?: string;
  description?: string;
  lines: LedgerLineInput[];
  createdBy?: string;
  metadata?: Record<string, unknown>;
  /** Explicit link when this journal reverses another */
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
  reversesJournalId?: string;
  reversedByJournalId?: string;
}

export interface AccountBalance {
  accountId: string;
  balanceMinor: bigint;
  currency: CurrencyCode;
}

/** Minimal account registry entry — connects id to LedgerAccountType */
export interface LedgerAccount {
  id: string;
  type: LedgerAccountType;
  currency?: CurrencyCode;
  label?: string;
}

/**
 * Ledger persistence contract — async-compatible for future PostgreSQL.
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
