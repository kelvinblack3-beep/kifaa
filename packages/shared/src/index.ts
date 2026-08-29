export * from "./money.js";
export * from "./errors.js";
export * from "./ids.js";

export type TransactionStatus =
  | "created"
  | "risk_rejected"
  | "awaiting_confirmation"
  | "queued"
  | "awaiting_provider"
  | "provider_pending"
  | "posted"
  | "failed"
  | "expired"
  | "reverse_pending"
  | "reversed"
  | "refund_pending"
  | "refunded";

export type LedgerAccountType =
  | "asset"
  | "liability"
  | "equity"
  | "revenue"
  | "expense"
  | "customer"
  | "merchant"
  | "provider_clearing"
  | "fee"
  | "suspense";

export type EntryDirection = "debit" | "credit";
