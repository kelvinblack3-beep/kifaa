/**
 * Money helpers — integer minor units only.
 * KES 1,500.00 = 150_000 minor units (cents).
 * Never use floating-point for monetary arithmetic.
 */

export type CurrencyCode = "KES" | "USD" | "EUR" | "GBP";

export interface Money {
  amountMinor: bigint;
  currency: CurrencyCode;
}

export function money(amountMinor: bigint | number | string, currency: CurrencyCode = "KES"): Money {
  return {
    amountMinor: BigInt(amountMinor),
    currency,
  };
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amountMinor: a.amountMinor + b.amountMinor, currency: a.currency };
}

export function sub(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amountMinor: a.amountMinor - b.amountMinor, currency: a.currency };
}

export function isPositive(m: Money): boolean {
  return m.amountMinor > 0n;
}

export function isZero(m: Money): boolean {
  return m.amountMinor === 0n;
}

export function isNegative(m: Money): boolean {
  return m.amountMinor < 0n;
}

export function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}

/** Format for display, e.g. 150000 → "1,500.00" */
export function formatMoney(m: Money, locale = "en-KE"): string {
  const major = Number(m.amountMinor) / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: m.currency,
    minimumFractionDigits: 2,
  }).format(major);
}

/**
 * Parse display string "1500.00" or "1,500.00" or "-0.50" → minor units.
 * Sign is taken from a leading minus so "-0.50" → -50n (not +50n).
 */
export function parseToMinor(input: string): bigint {
  const cleaned = input.replace(/,/g, "").trim();
  const match = cleaned.match(/^(-)?(\d+)(?:\.(\d{0,2}))?$/);
  if (!match) throw new Error(`Invalid money string: ${input}`);
  const negative = match[1] === "-";
  const whole = BigInt(match[2]);
  const frac = match[3] ? match[3].padEnd(2, "0") : "00";
  const fracMinor = BigInt(frac.slice(0, 2));
  const abs = whole * 100n + fracMinor;
  return negative ? -abs : abs;
}

export function zero(currency: CurrencyCode = "KES"): Money {
  return { amountMinor: 0n, currency };
}
