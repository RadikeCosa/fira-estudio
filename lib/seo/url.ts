const LOCAL_SITE_URL = "http://localhost:3000";

function toValidUrl(value: string | undefined): URL | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed);
  } catch {
    return null;
  }
}

function normalizeBaseUrl(url: URL): string {
  return url.toString().replace(/\/$/, "");
}

export function getSiteBaseUrl(): string {
  const configuredUrl = toValidUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (configuredUrl) {
    return normalizeBaseUrl(configuredUrl);
  }

  const vercelUrl = toValidUrl(
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  );
  if (vercelUrl) {
    return normalizeBaseUrl(vercelUrl);
  }

  return LOCAL_SITE_URL;
}

export function getSiteBaseUrlObject(): URL {
  return new URL(getSiteBaseUrl());
}

export function resolveAbsoluteUrl(value: string): string {
  return new URL(value, `${getSiteBaseUrl()}/`).toString();
}
