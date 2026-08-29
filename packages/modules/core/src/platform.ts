/**
 * KIFAA V0.1 Core Platform — vertical slice.
 * Environment: SANDBOX / NON-PRODUCTION.
 * Internal balances are double-entry ledger projections for test money only.
 */

import { createHash } from "node:crypto";
import {
  IdempotencyConflictError,
  NotFoundError,
  ValidationError,
  AuthError,
  newId,
  newJournalId,
  newTransactionId,
} from "@kifaa/shared";
import { InMemoryLedger } from "@kifaa/ledger";
import type { JournalInput } from "@kifaa/ledger";
import { hashPin, verifyPin, assertPinUnlocked, recordPinFailure, recordPinSuccess } from "./pin.js";
import { SandboxProvider } from "./providers.js";
import type {
  UserAccount,
  MerchantAccount,
  AgentAccount,
  CoreTransaction,
  CoreTxnStatus,
  QrIdentity,
  TransferInput,
  AddTestMoneyInput,
  AgentCashInInput,
  AgentCashOutInput,
  MerchantPayInput,
  AgentStatus,
} from "./types.js";

const FLOAT_ACCOUNT = "sys_sandbox_float";
const SYSTEM_SUSPENSE = "sys_suspense";

function hashBody(body: unknown): string {
  return createHash("sha256").update(JSON.stringify(body ?? {})).digest("hex");
}

function makeKifaaId(phone: string): string {
  const digits = phone.replace(/\D/g, "").slice(-9);
  return `KF${digits.padStart(9, "0")}`;
}

function makeReference(): string {
  return `KIF${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

function encodeQr(identity: QrIdentity): string {
  return `kifaa:v1:${Buffer.from(JSON.stringify(identity)).toString("base64url")}`;
}

function decodeQr(payload: string): QrIdentity {
  if (!payload.startsWith("kifaa:v1:")) {
    throw new ValidationError("Invalid KIFAA QR payload");
  }
  try {
    const json = Buffer.from(payload.slice("kifaa:v1:".length), "base64url").toString("utf8");
    return JSON.parse(json) as QrIdentity;
  } catch {
    throw new ValidationError("Corrupt KIFAA QR payload");
  }
}

function normalizePhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("254") && d.length === 12) return d;
  if (d.startsWith("0") && d.length === 10) return `254${d.slice(1)}`;
  if (d.length === 9) return `254${d}`;
  return d;
}

export class KifaaPlatform {
  readonly mode = "SANDBOX" as const;
  private ledger = new InMemoryLedger();
  private sandbox = new SandboxProvider();
  private users = new Map<string, UserAccount>();
  private usersByPhone = new Map<string, string>();
  private usersByKifaaId = new Map<string, string>();
  private merchants = new Map<string, MerchantAccount>();
  private merchantsByTill = new Map<string, string>();
  private agents = new Map<string, AgentAccount>();
  private agentsByAgentId = new Map<string, string>();
  private txns = new Map<string, CoreTransaction>();
  private byIdempotency = new Map<string, string>();
  private auditLog: Array<{ at: Date; action: string; actor?: string; meta?: Record<string, unknown> }> = [];

  constructor() {
    this.ledger.postJournal({
      id: newJournalId(),
      description: "Initialize sandbox float (SANDBOX ONLY)",
      lines: [
        { accountId: FLOAT_ACCOUNT, direction: "debit", amountMinor: 1_000_000_000n, currency: "KES" },
        { accountId: SYSTEM_SUSPENSE, direction: "credit", amountMinor: 1_000_000_000n, currency: "KES" },
      ],
      createdBy: "system",
      metadata: { sandbox: true },
    });
  }

  registerUser(input: { phone: string; displayName: string; pin: string }): UserAccount {
    const phone = normalizePhone(input.phone);
    if (this.usersByPhone.has(phone)) throw new ValidationError("Phone already registered");
    const { hash, salt } = hashPin(input.pin);
    const id = newId();
    const kifaaId = makeKifaaId(phone);
    const ledgerAccountId = `usr_${id}`;
    const now = new Date();
    const user: UserAccount = {
      id, kifaaId, phone, displayName: input.displayName.trim(),
      pinHash: hash, pinSalt: salt, pinFailedAttempts: 0, status: "ACTIVE",
      ledgerAccountId, createdAt: now, updatedAt: now,
    };
    this.users.set(id, user);
    this.usersByPhone.set(phone, id);
    this.usersByKifaaId.set(kifaaId, id);
    this.audit("user.register", id, { phone, kifaaId });
    return this.publicUser(user);
  }

  login(phone: string, pin: string): UserAccount {
    const user = this.requireUserByPhone(phone);
    this.checkPin(user, pin);
    this.audit("user.login", user.id, {});
    return this.publicUser(user);
  }

  getUser(userId: string): UserAccount {
    return this.publicUser(this.requireUser(userId));
  }

  getBalance(userId: string): { amountMinor: bigint; currency: "KES"; projection: true; sandbox: true } {
    const user = this.requireUser(userId);
    const raw = this.ledger.getBalance(user.ledgerAccountId);
    return { amountMinor: -raw, currency: "KES", projection: true, sandbox: true };
  }

  userQr(userId: string): string {
    const user = this.requireUser(userId);
    return encodeQr({ version: 1, kind: "user", kifaaId: user.kifaaId, label: user.displayName });
  }

  createMerchant(input: { userId: string; businessName: string }): MerchantAccount {
    this.requireUser(input.userId);
    const id = newId();
    const tillCode = `TILL${Math.floor(100000 + Math.random() * 899999)}`;
    const ledgerAccountId = `mrc_${id}`;
    const qrPayload = encodeQr({ version: 1, kind: "merchant", tillCode, label: input.businessName });
    const m: MerchantAccount = {
      id, userId: input.userId, businessName: input.businessName, tillCode, qrPayload,
      status: "ACTIVE", ledgerAccountId, createdAt: new Date(),
    };
    this.merchants.set(id, m);
    this.merchantsByTill.set(tillCode, id);
    this.audit("merchant.create", input.userId, { merchantId: id, tillCode });
    return m;
  }

  createAgent(input: { userId: string; businessName: string }): AgentAccount {
    this.requireUser(input.userId);
    const id = newId();
    const agentId = `AG${Date.now().toString(36).toUpperCase()}`;
    const qrPayload = encodeQr({ version: 1, kind: "agent", agentId, label: input.businessName });
    const agent: AgentAccount = {
      id, agentId, userId: input.userId, businessName: input.businessName, status: "PENDING",
      qrPayload, dailyLimitMinor: 500_000_00n, createdAt: new Date(), updatedAt: new Date(),
      audit: [{ at: new Date(), action: "created", by: input.userId }],
    };
    this.agents.set(id, agent);
    this.agentsByAgentId.set(agentId, id);
    this.audit("agent.create", input.userId, { agentId });
    return agent;
  }

  setAgentStatus(agentId: string, status: AgentStatus, by = "system"): AgentAccount {
    const agent = this.requireAgentByAgentId(agentId);
    agent.status = status;
    agent.updatedAt = new Date();
    agent.audit.push({ at: new Date(), action: `status:${status}`, by });
    this.audit("agent.status", by, { agentId, status });
    return agent;
  }

  addTestMoney(input: AddTestMoneyInput): CoreTransaction {
    this.assertPositive(input.amountMinor);
    const user = this.requireUser(input.userId);
    const body = { type: "ADD_TEST_MONEY", userId: input.userId, amountMinor: input.amountMinor.toString() };
    const existing = this.idempotentLookup(input.idempotencyKey, body);
    if (existing) return existing;
    const txn = this.beginTxn({
      type: "ADD_TEST_MONEY", amountMinor: input.amountMinor,
      receiverAccountId: user.ledgerAccountId, receiverKifaaId: user.kifaaId,
      idempotencyKey: input.idempotencyKey, requestHash: hashBody(body),
      metadata: { channel: "sandbox_test_money" },
    });
    this.setStatus(txn, "PROCESSING");
    return this.completeWithJournal(txn, () =>
      this.post({
        description: `SANDBOX Add test money ${txn.reference}`, transactionId: txn.id,
        lines: [
          { accountId: SYSTEM_SUSPENSE, direction: "debit", amountMinor: input.amountMinor, currency: "KES" },
          { accountId: user.ledgerAccountId, direction: "credit", amountMinor: input.amountMinor, currency: "KES" },
        ],
      })
    );
  }

  transfer(input: TransferInput): CoreTransaction {
    this.assertPositive(input.amountMinor);
    const sender = this.requireUser(input.senderUserId);
    this.checkPin(sender, input.pin);
    const receiver = this.resolveReceiver(input.receiverKifaaIdOrPhone);
    if (receiver.id === sender.id) throw new ValidationError("Cannot transfer to self");
    const body = { type: "TRANSFER", sender: sender.id, receiver: receiver.id, amountMinor: input.amountMinor.toString() };
    const existing = this.idempotentLookup(input.idempotencyKey, body);
    if (existing) return existing;
    const available = this.getBalance(sender.id).amountMinor;
    if (input.amountMinor > available) {
      throw new ValidationError("Insufficient balance", { available: available.toString(), requested: input.amountMinor.toString() });
    }
    const txn = this.beginTxn({
      type: "TRANSFER", amountMinor: input.amountMinor,
      senderAccountId: sender.ledgerAccountId, receiverAccountId: receiver.ledgerAccountId,
      senderKifaaId: sender.kifaaId, receiverKifaaId: receiver.kifaaId,
      idempotencyKey: input.idempotencyKey, requestHash: hashBody(body),
      metadata: { note: input.note, sandbox: true },
    });
    this.setStatus(txn, "PROCESSING");
    return this.completeWithJournal(txn, () =>
      this.post({
        description: `Transfer ${txn.reference}`, transactionId: txn.id,
        lines: [
          { accountId: sender.ledgerAccountId, direction: "debit", amountMinor: input.amountMinor, currency: "KES" },
          { accountId: receiver.ledgerAccountId, direction: "credit", amountMinor: input.amountMinor, currency: "KES" },
        ],
      })
    );
  }

  payMerchant(input: MerchantPayInput): CoreTransaction {
    this.assertPositive(input.amountMinor);
    const payer = this.requireUser(input.payerUserId);
    this.checkPin(payer, input.pin);
    const merchant = this.resolveMerchant(input.merchantQrOrTill);
    const body = { type: "MERCHANT_PAY", payer: payer.id, merchant: merchant.id, amountMinor: input.amountMinor.toString() };
    const existing = this.idempotentLookup(input.idempotencyKey, body);
    if (existing) return existing;
    const available = this.getBalance(payer.id).amountMinor;
    if (input.amountMinor > available) throw new ValidationError("Insufficient balance");
    const txn = this.beginTxn({
      type: "MERCHANT_PAY", amountMinor: input.amountMinor,
      senderAccountId: payer.ledgerAccountId, receiverAccountId: merchant.ledgerAccountId,
      senderKifaaId: payer.kifaaId, merchantId: merchant.id,
      idempotencyKey: input.idempotencyKey, requestHash: hashBody(body),
      metadata: { tillCode: merchant.tillCode, sandbox: true },
    });
    this.setStatus(txn, "PROCESSING");
    return this.completeWithJournal(txn, () =>
      this.post({
        description: `Merchant pay ${txn.reference}`, transactionId: txn.id,
        lines: [
          { accountId: payer.ledgerAccountId, direction: "debit", amountMinor: input.amountMinor, currency: "KES" },
          { accountId: merchant.ledgerAccountId, direction: "credit", amountMinor: input.amountMinor, currency: "KES" },
        ],
      })
    );
  }

  agentCashIn(input: AgentCashInInput): CoreTransaction {
    this.assertPositive(input.amountMinor);
    const customer = this.requireUser(input.customerUserId);
    this.checkPin(customer, input.pin);
    const agent = this.resolveAgentQr(input.agentQrPayload);
    if (agent.status !== "ACTIVE") throw new ValidationError(`Agent is ${agent.status}`);
    const body = { type: "AGENT_CASH_IN", customer: customer.id, agent: agent.agentId, amountMinor: input.amountMinor.toString() };
    const existing = this.idempotentLookup(input.idempotencyKey, body);
    if (existing) return existing;
    const txn = this.beginTxn({
      type: "AGENT_CASH_IN", amountMinor: input.amountMinor,
      receiverAccountId: customer.ledgerAccountId, receiverKifaaId: customer.kifaaId, agentId: agent.agentId,
      idempotencyKey: input.idempotencyKey, requestHash: hashBody(body),
      metadata: { sandbox: true, provider: this.sandbox.code },
    });
    this.setStatus(txn, "PROCESSING");
    return this.completeWithJournal(txn, () =>
      this.post({
        description: `Agent cash-in ${txn.reference}`, transactionId: txn.id,
        lines: [
          { accountId: SYSTEM_SUSPENSE, direction: "debit", amountMinor: input.amountMinor, currency: "KES" },
          { accountId: customer.ledgerAccountId, direction: "credit", amountMinor: input.amountMinor, currency: "KES" },
        ],
      })
    );
  }

  agentCashOut(input: AgentCashOutInput): CoreTransaction {
    this.assertPositive(input.amountMinor);
    const customer = this.requireUser(input.customerUserId);
    this.checkPin(customer, input.pin);
    const agent = this.resolveAgentQr(input.agentQrPayload);
    if (agent.status !== "ACTIVE") throw new ValidationError(`Agent is ${agent.status}`);
    const body = { type: "AGENT_CASH_OUT", customer: customer.id, agent: agent.agentId, amountMinor: input.amountMinor.toString() };
    const existing = this.idempotentLookup(input.idempotencyKey, body);
    if (existing) return existing;
    const available = this.getBalance(customer.id).amountMinor;
    if (input.amountMinor > available) throw new ValidationError("Insufficient balance");
    const txn = this.beginTxn({
      type: "AGENT_CASH_OUT", amountMinor: input.amountMinor,
      senderAccountId: customer.ledgerAccountId, senderKifaaId: customer.kifaaId, agentId: agent.agentId,
      idempotencyKey: input.idempotencyKey, requestHash: hashBody(body),
      metadata: { sandbox: true, provider: this.sandbox.code },
    });
    this.setStatus(txn, "PROCESSING");
    return this.completeWithJournal(txn, () =>
      this.post({
        description: `Agent cash-out ${txn.reference}`, transactionId: txn.id,
        lines: [
          { accountId: customer.ledgerAccountId, direction: "debit", amountMinor: input.amountMinor, currency: "KES" },
          { accountId: SYSTEM_SUSPENSE, direction: "credit", amountMinor: input.amountMinor, currency: "KES" },
        ],
      })
    );
  }

  reverse(transactionId: string, reason: string): CoreTransaction {
    const original = this.txns.get(transactionId);
    if (!original) throw new NotFoundError("Transaction");
    if (original.status !== "COMPLETED") throw new ValidationError("Only COMPLETED transactions can be reversed");
    if (!original.journalId) throw new ValidationError("Missing journal");
    const revId = newTransactionId();
    const revJournalId = newJournalId();
    this.ledger.reverseJournal(original.journalId, revJournalId, reason);
    original.status = "REVERSED";
    original.updatedAt = new Date();
    original.events.push({ at: original.updatedAt, status: "REVERSED", note: reason });
    const rev: CoreTransaction = {
      id: revId, reference: makeReference(), type: "REVERSAL", status: "COMPLETED",
      amountMinor: original.amountMinor, currency: "KES",
      senderAccountId: original.receiverAccountId, receiverAccountId: original.senderAccountId,
      journalId: revJournalId, idempotencyKey: `rev_${original.id}`, requestHash: hashBody({ reverses: original.id }),
      metadata: { reverses: original.id, reason, sandbox: true }, sandbox: true,
      events: [{ at: new Date(), status: "COMPLETED", note: reason }],
      createdAt: new Date(), completedAt: new Date(), updatedAt: new Date(),
    };
    this.txns.set(rev.id, rev);
    this.audit("txn.reverse", undefined, { original: original.id, reversal: rev.id });
    return rev;
  }

  getTransaction(id: string): CoreTransaction {
    const t = this.txns.get(id);
    if (!t) throw new NotFoundError("Transaction");
    return t;
  }

  history(userId: string): CoreTransaction[] {
    const user = this.requireUser(userId);
    return [...this.txns.values()]
      .filter((t) =>
        t.senderAccountId === user.ledgerAccountId ||
        t.receiverAccountId === user.ledgerAccountId ||
        t.senderKifaaId === user.kifaaId ||
        t.receiverKifaaId === user.kifaaId
      )
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  receipt(transactionId: string) {
    const t = this.getTransaction(transactionId);
    return {
      reference: t.reference, type: t.type, status: t.status,
      amountMinor: t.amountMinor.toString(), currency: "KES" as const,
      sender: t.senderKifaaId, receiver: t.receiverKifaaId,
      createdAt: t.createdAt.toISOString(), completedAt: t.completedAt?.toISOString(), sandbox: true as const,
    };
  }

  getAuditLog() { return [...this.auditLog]; }

  private publicUser(u: UserAccount): UserAccount {
    return { ...u, pinHash: "[redacted]", pinSalt: "[redacted]" };
  }
  private requireUser(id: string): UserAccount {
    const u = this.users.get(id);
    if (!u || u.status !== "ACTIVE") throw new NotFoundError("User");
    return u;
  }
  private requireUserByPhone(phone: string): UserAccount {
    const id = this.usersByPhone.get(normalizePhone(phone));
    if (!id) throw new AuthError("Invalid phone or PIN");
    return this.requireUser(id);
  }
  private resolveReceiver(kifaaIdOrPhone: string): UserAccount {
    const byK = this.usersByKifaaId.get(kifaaIdOrPhone);
    if (byK) return this.requireUser(byK);
    const byP = this.usersByPhone.get(normalizePhone(kifaaIdOrPhone));
    if (byP) return this.requireUser(byP);
    throw new NotFoundError("Receiver");
  }
  private resolveMerchant(qrOrTill: string): MerchantAccount {
    if (qrOrTill.startsWith("kifaa:v1:")) {
      const idn = decodeQr(qrOrTill);
      if (idn.kind !== "merchant" || !idn.tillCode) throw new ValidationError("Not a merchant QR");
      return this.requireMerchantByTill(idn.tillCode);
    }
    return this.requireMerchantByTill(qrOrTill);
  }
  private requireMerchantByTill(till: string): MerchantAccount {
    const id = this.merchantsByTill.get(till);
    if (!id) throw new NotFoundError("Merchant");
    const m = this.merchants.get(id)!;
    if (m.status !== "ACTIVE") throw new ValidationError("Merchant not active");
    return m;
  }
  private resolveAgentQr(payload: string): AgentAccount {
    const idn = decodeQr(payload);
    if (idn.kind !== "agent" || !idn.agentId) throw new ValidationError("Not an agent QR");
    return this.requireAgentByAgentId(idn.agentId);
  }
  private requireAgentByAgentId(agentId: string): AgentAccount {
    const id = this.agentsByAgentId.get(agentId);
    if (!id) throw new NotFoundError("Agent");
    return this.agents.get(id)!;
  }
  private checkPin(user: UserAccount, pin: string): void {
    assertPinUnlocked(user);
    if (!verifyPin(pin, user.pinHash, user.pinSalt)) {
      const next = recordPinFailure(user);
      user.pinFailedAttempts = next.pinFailedAttempts;
      user.pinLockedUntil = next.pinLockedUntil;
      user.updatedAt = new Date();
      this.audit("pin.failure", user.id, { attempts: user.pinFailedAttempts });
      throw new AuthError("Invalid phone or PIN");
    }
    const ok = recordPinSuccess();
    user.pinFailedAttempts = ok.pinFailedAttempts;
    user.pinLockedUntil = ok.pinLockedUntil;
  }
  private assertPositive(amount: bigint): void {
    if (amount <= 0n) throw new ValidationError("Amount must be positive");
  }
  private idempotentLookup(key: string, body: unknown): CoreTransaction | null {
    const existingId = this.byIdempotency.get(key);
    if (!existingId) return null;
    const existing = this.txns.get(existingId)!;
    if (existing.requestHash !== hashBody(body)) throw new IdempotencyConflictError();
    return existing;
  }
  private beginTxn(partial: Omit<CoreTransaction, "id" | "reference" | "status" | "events" | "createdAt" | "updatedAt" | "sandbox" | "currency"> & { currency?: "KES" }): CoreTransaction {
    const now = new Date();
    const txn: CoreTransaction = {
      id: newTransactionId(), reference: makeReference(), status: "PENDING", currency: "KES",
      sandbox: true, events: [{ at: now, status: "PENDING" }], createdAt: now, updatedAt: now, ...partial,
    };
    this.txns.set(txn.id, txn);
    this.byIdempotency.set(txn.idempotencyKey, txn.id);
    return txn;
  }
  private setStatus(txn: CoreTransaction, status: CoreTxnStatus, note?: string): void {
    txn.status = status;
    txn.updatedAt = new Date();
    txn.events.push({ at: txn.updatedAt, status, note });
  }
  private post(input: Omit<JournalInput, "id" | "createdBy"> & { createdBy?: string }) {
    return this.ledger.postJournal({ id: newJournalId(), createdBy: input.createdBy ?? "platform", ...input });
  }
  private completeWithJournal(txn: CoreTransaction, journalFn: () => { id: string }): CoreTransaction {
    try {
      const journal = journalFn();
      txn.journalId = journal.id;
      this.setStatus(txn, "COMPLETED");
      txn.completedAt = new Date();
      this.audit("txn.completed", undefined, { id: txn.id, type: txn.type, ref: txn.reference });
      return txn;
    } catch (e) {
      this.setStatus(txn, "FAILED", e instanceof Error ? e.message : "error");
      throw e;
    }
  }
  private audit(action: string, actor?: string, meta?: Record<string, unknown>): void {
    this.auditLog.push({ at: new Date(), action, actor, meta });
  }
}

export { encodeQr, decodeQr, normalizePhone };
