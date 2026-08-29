import { randomBytes, randomUUID } from "node:crypto";

export function newId(): string {
  return randomUUID();
}

export function newTransactionId(): string {
  return `txn_${randomUUID().replace(/-/g, "")}`;
}

export function newJournalId(): string {
  return `jnl_${randomUUID().replace(/-/g, "")}`;
}

export function newIdempotencyKey(): string {
  return randomBytes(16).toString("hex");
}

export function newRequestId(): string {
  return randomBytes(8).toString("hex");
}
