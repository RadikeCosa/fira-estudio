import { createHmac } from "crypto";

/**
 * IPs autorizadas de Mercado Pago
 * Fuente: https://www.mercadopago.com.ar/developers/es/docs/webhooks/additional-info/verifying-webhooks
 * Actualizar según configuración de producción
 */
const MERCADOPAGO_IPS = [
  // IPs oficiales de Mercado Pago - Argentina
  "200.121.192.0/24",
  "201.217.242.0/24",
  "203.0.113.0/24",
  // IPs adicionales que MP puede usar (AWS y Google Cloud)
  "18.0.0.0/8",      // AWS (MP usa AWS)
  "52.0.0.0/8",      // AWS
  "54.0.0.0/8",      // AWS
  "34.0.0.0/8",      // Google Cloud
  "35.0.0.0/8",      // Google Cloud
];

/**
 * Valida que la IP de origen sea de Mercado Pago
 * En desarrollo, permite localhost. En producción, valida contra IPs autorizadas
 */
export function validateMercadoPagoIP(clientIP: string | null): boolean {
  // Log detallado para debugging
  console.log(`[Webhook Security] Validating IP: ${clientIP}`);
  
  if (!clientIP) {
    console.warn("[Webhook Security] No client IP found in request headers");
    return false;
  }

  // Desarrollo: permitir localhost/127.0.0.1
  if (process.env.NODE_ENV === "development") {
    if (clientIP === "127.0.0.1" || clientIP === "localhost") {
      console.log("[Webhook Security] Development mode - localhost allowed");
      return true;
    }
  }

  // Función para validar CIDR
  const isIpInRange = (ip: string, cidr: string): boolean => {
    const [network, maskBits] = cidr.split("/");
    const maskLength = parseInt(maskBits, 10);

    const ipParts = ip.split(".").map((part) => parseInt(part, 10));
    const networkParts = network.split(".").map((part) => parseInt(part, 10));

    if (ipParts.length !== 4 || networkParts.length !== 4) {
      return false;
    }

    const ipInt = ipParts.reduce((acc, part) => (acc << 8) | part, 0);
    const networkInt = networkParts.reduce((acc, part) => (acc << 8) | part, 0);
    const mask = ~((1 << (32 - maskLength)) - 1);

    return (ipInt & mask) === (networkInt & mask);
  };

  // Validar contra rangos autorizados
  for (const cidr of MERCADOPAGO_IPS) {
    if (isIpInRange(clientIP, cidr)) {
      console.log(`[Webhook Security] IP ${clientIP} matched range ${cidr}`);
      return true;
    }
  }

  console.warn(`[Webhook Security] IP ${clientIP} NOT in any authorized range`);
  console.warn(`[Webhook Security] Authorized ranges: ${MERCADOPAGO_IPS.join(", ")}`);
  return false;
}

/**
 * Valida la firma del webhook usando HMAC-SHA256
 *
 * Mercado Pago envía el header x-signature con formato:
 * ts=timestamp;v1=signature
 *
 * La firma se calcula como:
 * signature = HMAC-SHA256(webhook_secret, `id=paymentId;type=payment;ts=timestamp`)
 */
export function validateWebhookSignature(
  headers: Record<string, string | string[] | undefined>,
  _rawBody: string,
  paymentId: string | number,
  _timestamp: string,
): boolean {
  const signature = headers["x-signature"];
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error(
      "[Webhook Security] Missing x-signature header or MERCADOPAGO_WEBHOOK_SECRET",
    );
    return false;
  }

  // Parsear firma: "ts=timestamp;v1=signature"
  const signatureParts = (
    typeof signature === "string" ? signature : signature[0]
  ).split(";");
  const signatureMap = Object.fromEntries(
    signatureParts.map((part) => part.split("=") as [string, string]),
  );

  const providedTs = signatureMap.ts;
  const providedSignature = signatureMap.v1;

  if (!providedTs || !providedSignature) {
    console.error(
      "[Webhook Security] Invalid signature format in x-signature header",
    );
    return false;
  }

  // Validar que el timestamp no sea antiguo (máximo 5 minutos)
  const tsNumber = parseInt(providedTs, 10);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const maxAgeSec = 300; // 5 minutos

  if (Math.abs(nowSeconds - tsNumber) > maxAgeSec) {
    console.error(
      `[Webhook Security] Request timestamp too old: ${Math.abs(nowSeconds - tsNumber)}s`,
    );
    return false;
  }

  // Reconstruir el payload original para validación
  // Formato: "id=paymentId;type=payment;ts=timestamp"
  const payload = `id=${paymentId};type=payment;ts=${providedTs}`;

  // Calcular firma esperada
  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  // Comparación segura contra timing attacks
  const isValid =
    providedSignature.length === expectedSignature.length &&
    timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature),
    );

  if (!isValid) {
    console.error(
      "[Webhook Security] Invalid webhook signature - possible tampering or wrong secret",
    );
  }

  return isValid;
}

/**
 * Comparación segura contra timing attacks
 */
function timingSafeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

/**
 * Extrae la IP del cliente desde headers de Next.js/Vercel
 * Considera proxies y headers como X-Forwarded-For
 */
export function extractClientIP(
  headers: Record<string, string | string[] | undefined>,
): string | null {
  // En Vercel, usar x-forwarded-for
  const forwarded = headers["x-forwarded-for"];
  if (forwarded) {
    // x-forwarded-for puede tener múltiples IPs, la primera es la del cliente
    const ips = typeof forwarded === "string" ? forwarded : forwarded[0];
    return ips.split(",")[0].trim();
  }

  // Fallback a cf-connecting-ip (Cloudflare)
  const cfConnectingIp = headers["cf-connecting-ip"];
  if (cfConnectingIp) {
    return typeof cfConnectingIp === "string"
      ? cfConnectingIp
      : cfConnectingIp[0];
  }

  return null;
}
