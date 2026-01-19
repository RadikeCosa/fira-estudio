/**
 * Validation Utilities for Contact Form
 * 
 * Provides validation functions and text sanitization to prevent
 * spam, XSS attacks, and invalid data submissions.
 */

/** Validation limits for form fields */
export const VALIDATION_LIMITS = {
  nombre: { min: 2, max: 50 },
  email: { min: 5, max: 100 },
  telefono: { min: 10, max: 20 },
  mensaje: { min: 10, max: 500 },
} as const;

/** Regular expressions for validation */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const TELEFONO_REGEX = /^\+?[0-9\s\-()]{10,20}$/;
const TEXTO_REGEX = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

/** TypeScript Types */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ContactFormData {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
}

export interface ContactFormValidation {
  isValid: boolean;
  errors: {
    nombre?: string;
    email?: string;
    telefono?: string;
    mensaje?: string;
  };
}

/** Validation Functions */

/**
 * Validates nombre field
 * @param nombre - Name to validate
 * @returns Validation result with error message if invalid
 */
export function validateNombre(nombre: string): ValidationResult {
  const trimmed = nombre.trim();
  
  if (trimmed.length < VALIDATION_LIMITS.nombre.min) {
    return {
      isValid: false,
      error: `El nombre debe tener al menos ${VALIDATION_LIMITS.nombre.min} caracteres`,
    };
  }
  
  if (trimmed.length > VALIDATION_LIMITS.nombre.max) {
    return {
      isValid: false,
      error: `El nombre no puede tener más de ${VALIDATION_LIMITS.nombre.max} caracteres`,
    };
  }
  
  if (!TEXTO_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: "El nombre solo puede contener letras y espacios",
    };
  }
  
  return { isValid: true };
}

/**
 * Validates email field
 * @param email - Email address to validate
 * @returns Validation result with error message if invalid
 */
export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  
  if (trimmed.length < VALIDATION_LIMITS.email.min || trimmed.length > VALIDATION_LIMITS.email.max) {
    return {
      isValid: false,
      error: "El email debe tener entre 5 y 100 caracteres",
    };
  }
  
  if (!EMAIL_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: "Por favor, ingresá un email válido",
    };
  }
  
  return { isValid: true };
}

/**
 * Validates telefono field (optional)
 * @param telefono - Phone number to validate (optional)
 * @returns Validation result with error message if invalid
 */
export function validateTelefono(telefono?: string): ValidationResult {
  // Telefono is optional
  if (!telefono || telefono.trim().length === 0) {
    return { isValid: true };
  }
  
  const trimmed = telefono.trim();
  
  if (trimmed.length < VALIDATION_LIMITS.telefono.min || trimmed.length > VALIDATION_LIMITS.telefono.max) {
    return {
      isValid: false,
      error: `El teléfono debe tener entre ${VALIDATION_LIMITS.telefono.min} y ${VALIDATION_LIMITS.telefono.max} caracteres`,
    };
  }
  
  if (!TELEFONO_REGEX.test(trimmed)) {
    return {
      isValid: false,
      error: "Por favor, ingresá un teléfono válido",
    };
  }
  
  return { isValid: true };
}

/**
 * Validates mensaje field
 * @param mensaje - Message to validate
 * @returns Validation result with error message if invalid
 */
export function validateMensaje(mensaje: string): ValidationResult {
  const trimmed = mensaje.trim();
  
  if (trimmed.length < VALIDATION_LIMITS.mensaje.min) {
    return {
      isValid: false,
      error: `El mensaje debe tener al menos ${VALIDATION_LIMITS.mensaje.min} caracteres`,
    };
  }
  
  if (trimmed.length > VALIDATION_LIMITS.mensaje.max) {
    return {
      isValid: false,
      error: `El mensaje no puede tener más de ${VALIDATION_LIMITS.mensaje.max} caracteres`,
    };
  }
  
  return { isValid: true };
}

/**
 * Sanitizes text by removing HTML tags and dangerous characters
 * @param text - Text to sanitize
 * @returns Sanitized text safe for use
 */
export function sanitizeText(text: string): string {
  // Remove HTML tags (multiple passes to handle nested/malformed tags)
  let sanitized = text.replace(/<[^>]*>/g, "");
  sanitized = sanitized.replace(/<[^>]*>/g, ""); // Second pass for nested tags
  
  // Remove any remaining angle brackets and dangerous characters
  sanitized = sanitized.replace(/[<>"']/g, "");
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit to 1000 characters as additional security
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized;
}

/**
 * Validates entire contact form
 * @param data - Form data to validate
 * @returns Validation result with all field errors
 */
export function validateContactForm(data: ContactFormData): ContactFormValidation {
  const errors: ContactFormValidation["errors"] = {};
  
  // Validate nombre
  const nombreResult = validateNombre(data.nombre);
  if (!nombreResult.isValid) {
    errors.nombre = nombreResult.error;
  }
  
  // Validate email
  const emailResult = validateEmail(data.email);
  if (!emailResult.isValid) {
    errors.email = emailResult.error;
  }
  
  // Validate telefono (optional)
  const telefonoResult = validateTelefono(data.telefono);
  if (!telefonoResult.isValid) {
    errors.telefono = telefonoResult.error;
  }
  
  // Validate mensaje
  const mensajeResult = validateMensaje(data.mensaje);
  if (!mensajeResult.isValid) {
    errors.mensaje = mensajeResult.error;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
