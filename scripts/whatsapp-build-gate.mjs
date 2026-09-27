export function shouldRequireWhatsAppNumber(environment) {
  return environment === "preview" || environment === "production";
}

export function isValidWhatsAppNumber(value) {
  return typeof value === "string" && /^\d{10,15}$/.test(value);
}

export function validateWhatsAppBuild(environment, value) {
  const required = shouldRequireWhatsAppNumber(environment);
  return { valid: !required || isValidWhatsAppNumber(value), required };
}
