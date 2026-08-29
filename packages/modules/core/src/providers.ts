/**
 * Provider adapter interfaces — rail-agnostic.
 * Live M-PESA / Airtel / bank adapters plug in later.
 * SANDBOX only for V0.1.
 */

export type ProviderMode = "SANDBOX" | "PRODUCTION";

export interface ProviderResult {
  success: boolean;
  providerReference: string;
  mode: ProviderMode;
  raw?: Record<string, unknown>;
  errorCode?: string;
  errorMessage?: string;
}

export interface FundingProvider {
  readonly code: string;
  readonly mode: ProviderMode;
  fund(input: {
    amountMinor: bigint;
    currency: string;
    accountRef: string;
    idempotencyKey: string;
  }): Promise<ProviderResult>;
}

export interface WithdrawalProvider {
  readonly code: string;
  readonly mode: ProviderMode;
  withdraw(input: {
    amountMinor: bigint;
    currency: string;
    accountRef: string;
    idempotencyKey: string;
  }): Promise<ProviderResult>;
}

export interface PaymentProvider {
  readonly code: string;
  readonly mode: ProviderMode;
  pay(input: {
    amountMinor: bigint;
    currency: string;
    payerRef: string;
    payeeRef: string;
    idempotencyKey: string;
  }): Promise<ProviderResult>;
}

export interface MobileMoneyProvider extends FundingProvider, WithdrawalProvider, PaymentProvider {}
export interface BankProvider extends FundingProvider, WithdrawalProvider {}

export interface AgentProvider {
  readonly code: string;
  readonly mode: ProviderMode;
  cashIn(input: {
    amountMinor: bigint;
    customerRef: string;
    agentRef: string;
    idempotencyKey: string;
  }): Promise<ProviderResult>;
  cashOut(input: {
    amountMinor: bigint;
    customerRef: string;
    agentRef: string;
    idempotencyKey: string;
  }): Promise<ProviderResult>;
}

/** Deterministic SANDBOX provider for tests and local dev. Never moves real money. */
export class SandboxProvider
  implements FundingProvider, WithdrawalProvider, PaymentProvider, AgentProvider
{
  readonly code = "SANDBOX";
  readonly mode: ProviderMode = "SANDBOX";
  private seq = 0;

  private ref(prefix: string): string {
    this.seq += 1;
    return `sbx_${prefix}_${this.seq}_${Date.now()}`;
  }

  async fund(input: {
    amountMinor: bigint;
    currency: string;
    accountRef: string;
    idempotencyKey: string;
  }): Promise<ProviderResult> {
    if (input.amountMinor <= 0n) {
      return {
        success: false,
        providerReference: this.ref("fund_fail"),
        mode: "SANDBOX",
        errorCode: "INVALID_AMOUNT",
        errorMessage: "Amount must be positive",
      };
    }
    return {
      success: true,
      providerReference: this.ref("fund"),
      mode: "SANDBOX",
      raw: { ...input, amountMinor: input.amountMinor.toString() },
    };
  }

  async withdraw(input: {
    amountMinor: bigint;
    currency: string;
    accountRef: string;
    idempotencyKey: string;
  }): Promise<ProviderResult> {
    if (input.amountMinor <= 0n) {
      return {
        success: false,
        providerReference: this.ref("wd_fail"),
        mode: "SANDBOX",
        errorCode: "INVALID_AMOUNT",
      };
    }
    return {
      success: true,
      providerReference: this.ref("wd"),
      mode: "SANDBOX",
      raw: { ...input, amountMinor: input.amountMinor.toString() },
    };
  }

  async pay(input: {
    amountMinor: bigint;
    currency: string;
    payerRef: string;
    payeeRef: string;
    idempotencyKey: string;
  }): Promise<ProviderResult> {
    return {
      success: true,
      providerReference: this.ref("pay"),
      mode: "SANDBOX",
      raw: { ...input, amountMinor: input.amountMinor.toString() },
    };
  }

  async cashIn(input: {
    amountMinor: bigint;
    customerRef: string;
    agentRef: string;
    idempotencyKey: string;
  }): Promise<ProviderResult> {
    return {
      success: true,
      providerReference: this.ref("cin"),
      mode: "SANDBOX",
      raw: { ...input, amountMinor: input.amountMinor.toString() },
    };
  }

  async cashOut(input: {
    amountMinor: bigint;
    customerRef: string;
    agentRef: string;
    idempotencyKey: string;
  }): Promise<ProviderResult> {
    return {
      success: true,
      providerReference: this.ref("cout"),
      mode: "SANDBOX",
      raw: { ...input, amountMinor: input.amountMinor.toString() },
    };
  }
}
