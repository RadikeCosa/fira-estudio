/**
 * Security Logger Utility
 * 
 * Provides security event logging and suspicious pattern detection
 * to protect against XSS, bot attacks, and other security threats.
 */

/** Security event types for logging */
export type SecurityEventType =
  | "rate_limit_check"
  | "rate_limit_exceeded"
  | "rate_limit_error"
  | "bot_detected"
  | "validation_failed"
  | "suspicious_activity"
  | "xss_attempt";

/** Security event data structure */
export interface SecurityEventData {
  [key: string]: unknown;
}

/**
 * Logs a security event with timestamp and environment context
 * 
 * @param event - Type of security event
 * @param data - Additional event data
 */
export function logSecurityEvent(
  event: SecurityEventType,
  data: SecurityEventData
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    environment: process.env.NODE_ENV || "development",
    ...data,
  };

  // In development, log with console.warn for visibility
  if (process.env.NODE_ENV === "development") {
    console.warn("[SECURITY]", event, logEntry);
  } else {
    // In production, log as JSON for structured logging
    console.warn("[SECURITY]", JSON.stringify(logEntry));
  }

  // TODO(#future): Integrate with monitoring service like Sentry for production alerting
  // Example: Sentry.captureMessage(`Security event: ${event}`, {
  //   level: 'warning',
  //   extra: logEntry,
  // });
}

/**
 * Detects suspicious patterns that may indicate XSS or injection attempts
 * 
 * @param text - Text to analyze
 * @returns true if suspicious pattern detected, false otherwise
 */
export function detectSuspiciousPattern(text: string): boolean {
  const suspiciousPatterns = [
    /<script/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /<iframe/i,
    /eval\(/i,
    /alert\(/i,
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(text));
}

/**
 * Logs an XSS attempt with field and context information
 * 
 * @param field - Field name where XSS was detected
 * @param value - Suspicious value (truncated to 100 chars)
 * @param context - Context where the attempt occurred
 */
export function logXSSAttempt(
  field: string,
  value: string,
  context: string
): void {
  logSecurityEvent("xss_attempt", {
    field,
    value: value.slice(0, 100),
    context,
    severity: "high",
  });
}
