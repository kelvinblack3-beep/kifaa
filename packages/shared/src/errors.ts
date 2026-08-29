export class KifaaError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "KifaaError";
  }
}

export class IdempotencyConflictError extends KifaaError {
  constructor(message = "Idempotency key reused with different request body") {
    super(message, "IDEMPOTENCY_CONFLICT", 409);
  }
}

export class UnbalancedJournalError extends KifaaError {
  constructor(message = "Journal is unbalanced: sum(debits) must equal sum(credits)") {
    super(message, "UNBALANCED_JOURNAL", 400);
  }
}

export class ImmutableLedgerError extends KifaaError {
  constructor(message = "Posted ledger entries are immutable") {
    super(message, "IMMUTABLE_LEDGER", 409);
  }
}

/** Account registry / posting identity violations (existence, type, currency). */
export class LedgerAccountError extends KifaaError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "LEDGER_ACCOUNT_ERROR", 400, details);
  }
}

export class TransactionStateError extends KifaaError {
  constructor(message: string) {
    super(message, "INVALID_TRANSACTION_STATE", 409);
  }
}

export class AuthError extends KifaaError {
  constructor(message = "Authentication failed", code = "AUTH_FAILED") {
    super(message, code, 401);
  }
}

export class ForbiddenError extends KifaaError {
  constructor(message = "Forbidden") {
    super(message, "FORBIDDEN", 403);
  }
}

export class NotFoundError extends KifaaError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, "NOT_FOUND", 404);
  }
}

export class RateLimitError extends KifaaError {
  constructor(message = "Rate limit exceeded") {
    super(message, "RATE_LIMIT", 429);
  }
}

export class ValidationError extends KifaaError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", 400, details);
  }
}
