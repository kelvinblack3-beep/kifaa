/**
 * KIFAA V0.1 core domain types.
 * SANDBOX / NON-PRODUCTION: balances are internal ledger projections.
 */

export type AccountKind = "user" | "merchant" | "agent" | "system" | "sandbox_float";
export type AgentStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "REVOKED";
export type CoreTxnStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REVERSED";
export type CoreTxnType =
  | "TRANSFER"
  | "RECEIVE"
  | "ADD_TEST_MONEY"
  | "AGENT_CASH_IN"
  | "AGENT_CASH_OUT"
  | "MERCHANT_PAY"
  | "REVERSAL"
  | "REFUND";

export interface UserAccount {
  id: string;
  kifaaId: string;
  phone: string;
  displayName: string;
  pinHash: string;
  pinSalt: string;
  pinFailedAttempts: number;
  pinLockedUntil?: Date;
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
  ledgerAccountId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MerchantAccount {
  id: string;
  userId: string;
  businessName: string;
  tillCode: string;
  qrPayload: string;
  status: "ACTIVE" | "SUSPENDED";
  ledgerAccountId: string;
  createdAt: Date;
}

export interface AgentAccount {
  id: string;
  agentId: string;
  userId: string;
  businessName: string;
  status: AgentStatus;
  qrPayload: string;
  dailyLimitMinor: bigint;
  createdAt: Date;
  updatedAt: Date;
  audit: Array<{ at: Date; action: string; by?: string; note?: string }>;
}

export interface CoreTransaction {
  id: string;
  reference: string;
  type: CoreTxnType;
  status: CoreTxnStatus;
  amountMinor: bigint;
  currency: "KES";
  senderAccountId?: string;
  receiverAccountId?: string;
  senderKifaaId?: string;
  receiverKifaaId?: string;
  agentId?: string;
  merchantId?: string;
  journalId?: string;
  idempotencyKey: string;
  requestHash: string;
  metadata: Record<string, unknown>;
  sandbox: true;
  events: Array<{ at: Date; status: CoreTxnStatus; note?: string }>;
  createdAt: Date;
  completedAt?: Date;
  updatedAt: Date;
}

export interface QrIdentity {
  version: 1;
  kind: "user" | "merchant" | "agent";
  kifaaId?: string;
  agentId?: string;
  tillCode?: string;
  label?: string;
}

export interface TransferInput {
  idempotencyKey: string;
  senderUserId: string;
  receiverKifaaIdOrPhone: string;
  amountMinor: bigint;
  pin: string;
  note?: string;
}

export interface AddTestMoneyInput {
  idempotencyKey: string;
  userId: string;
  amountMinor: bigint;
}

export interface AgentCashInInput {
  idempotencyKey: string;
  customerUserId: string;
  agentQrPayload: string;
  amountMinor: bigint;
  pin: string;
}

export interface AgentCashOutInput {
  idempotencyKey: string;
  customerUserId: string;
  agentQrPayload: string;
  amountMinor: bigint;
  pin: string;
}

export interface MerchantPayInput {
  idempotencyKey: string;
  payerUserId: string;
  merchantQrOrTill: string;
  amountMinor: bigint;
  pin: string;
}
