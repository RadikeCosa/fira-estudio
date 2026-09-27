import { validateWhatsAppBuild } from "./whatsapp-build-gate.mjs";

const result = validateWhatsAppBuild(
  process.env.VERCEL_ENV,
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
);

if (!result.valid) {
  console.error(
    "Build detenido: configurá NEXT_PUBLIC_WHATSAPP_NUMBER con 10 a 15 dígitos, sin espacios, signos ni guiones, para Preview o Production.",
  );
  process.exit(1);
}
