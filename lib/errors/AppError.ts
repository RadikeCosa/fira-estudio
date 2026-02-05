export type ErrorCode =
  | "VALIDATION_ERROR"
  | "PAYMENT_ERROR"
  | "RATE_LIMIT_ERROR"
  | "CONFIG_ERROR"
  | "ORDER_ERROR";

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly userMessage: string;
  public readonly details?: unknown;

  constructor(
    code: ErrorCode,
    statusCode: number,
    message: string,
    userMessage: string,
    details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.userMessage = userMessage;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, userMessage: string, details?: unknown) {
    super("VALIDATION_ERROR", 400, message, userMessage, details);
    this.name = "ValidationError";
  }
}

export class PaymentError extends AppError {
  constructor(message: string, userMessage: string, details?: unknown) {
    super("PAYMENT_ERROR", 500, message, userMessage, details);
    this.name = "PaymentError";
  }
}

export class RateLimitError extends AppError {
  constructor(message: string, userMessage: string, details?: unknown) {
    super("RATE_LIMIT_ERROR", 429, message, userMessage, details);
    this.name = "RateLimitError";
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, userMessage: string, details?: unknown) {
    super("CONFIG_ERROR", 500, message, userMessage, details);
    this.name = "ConfigurationError";
  }
}

export class OrderError extends AppError {
  constructor(message: string, userMessage: string, details?: unknown) {
    super("ORDER_ERROR", 500, message, userMessage, details);
    this.name = "OrderError";
  }
}
