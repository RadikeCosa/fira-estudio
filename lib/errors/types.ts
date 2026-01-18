/**
 * Error classification system for Muma Estudio
 * Provides specific error types and classification logic
 */

/**
 * Types of errors that can occur in the application
 */
export enum ErrorType {
  /** Network connectivity issues (fetch failures, timeouts) */
  NETWORK = "NETWORK",
  /** Database/Supabase errors (PGRST codes) */
  DATABASE = "DATABASE",
  /** Resource not found (404) */
  NOT_FOUND = "NOT_FOUND",
  /** Validation errors (form inputs, data validation) */
  VALIDATION = "VALIDATION",
  /** Unknown or unclassified errors */
  UNKNOWN = "UNKNOWN",
}

/**
 * Classifies an error into a specific ErrorType
 * Detects common error patterns from network, database, and application errors
 * 
 * @param error - The error to classify
 * @returns The classified ErrorType
 * 
 * @example
 * ```ts
 * const error = new Error("fetch failed");
 * classifyError(error); // ErrorType.NETWORK
 * ```
 */
export function classifyError(error: Error): ErrorType {
  const errorMessage = error.message.toLowerCase();
  
  // Network errors: fetch failures, connection issues
  if (
    errorMessage.includes("fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("conexión") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("econnrefused")
  ) {
    return ErrorType.NETWORK;
  }
  
  // Database errors: Supabase PGRST codes
  if (
    errorMessage.includes("pgrst") ||
    errorMessage.includes("database") ||
    errorMessage.includes("postgres") ||
    errorMessage.includes("supabase")
  ) {
    // Special case: PGRST116 is "not found"
    if (errorMessage.includes("pgrst116")) {
      return ErrorType.NOT_FOUND;
    }
    return ErrorType.DATABASE;
  }
  
  // Not found errors: 404 status codes
  if (
    errorMessage.includes("404") ||
    errorMessage.includes("not found") ||
    errorMessage.includes("no encontrado")
  ) {
    return ErrorType.NOT_FOUND;
  }
  
  // Validation errors
  if (
    errorMessage.includes("validation") ||
    errorMessage.includes("validación") ||
    errorMessage.includes("invalid") ||
    errorMessage.includes("inválido")
  ) {
    return ErrorType.VALIDATION;
  }
  
  // Default to unknown
  return ErrorType.UNKNOWN;
}
