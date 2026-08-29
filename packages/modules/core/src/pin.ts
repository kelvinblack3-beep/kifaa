import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { AuthError, ValidationError } from "@kifaa/shared";

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEYLEN = 32;
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export function validatePinFormat(pin: string): void {
  if (!/^\d{4,6}$/.test(pin)) {
    throw new ValidationError("PIN must be 4–6 digits");
  }
}

export function hashPin(pin: string, salt?: Buffer): { hash: string; salt: string } {
  validatePinFormat(pin);
  const s = salt ?? randomBytes(16);
  const hash = scryptSync(pin, s, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  return { hash: hash.toString("hex"), salt: s.toString("hex") };
}

export function verifyPin(pin: string, hashHex: string, saltHex: string): boolean {
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(pin, salt, KEYLEN, { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P });
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export interface PinGateState {
  pinFailedAttempts: number;
  pinLockedUntil?: Date;
}

export function assertPinUnlocked(state: PinGateState): void {
  if (state.pinLockedUntil && state.pinLockedUntil.getTime() > Date.now()) {
    throw new AuthError("PIN locked due to too many failures", "PIN_LOCKED");
  }
}

export function recordPinFailure(state: PinGateState): PinGateState {
  const attempts = state.pinFailedAttempts + 1;
  if (attempts >= MAX_ATTEMPTS) {
    return {
      pinFailedAttempts: attempts,
      pinLockedUntil: new Date(Date.now() + LOCK_MS),
    };
  }
  return { pinFailedAttempts: attempts, pinLockedUntil: state.pinLockedUntil };
}

export function recordPinSuccess(): PinGateState {
  return { pinFailedAttempts: 0, pinLockedUntil: undefined };
}

export const PIN_MAX_ATTEMPTS = MAX_ATTEMPTS;
