import { Button } from "@/components/ui/Button";

interface ContactFormActionsProps {
  buttonText: string;
  disabled: boolean;
  rateLimitMessage: string;
  isRateLimited: boolean;
  isContactAvailable: boolean;
  submitHelperText: string;
}

export function ContactFormActions({
  buttonText,
  disabled,
  rateLimitMessage,
  isRateLimited,
  isContactAvailable,
  submitHelperText,
}: ContactFormActionsProps) {
  const statusMessage =
    rateLimitMessage ||
    (!isContactAvailable
      ? "El formulario por email no está disponible en este momento."
      : isRateLimited
        ? "Límite de mensajes alcanzado. Esperá unos minutos."
        : null);
  const helperMessage = isContactAvailable
    ? submitHelperText
    : "Por ahora podés escribirnos desde los canales de contacto disponibles.";

  return (
    <>
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full group"
        disabled={disabled}
      >
        {buttonText}
      </Button>

      {statusMessage && (
        <p
          role="status"
          aria-live="polite"
          className="text-center text-sm text-orange-600 font-medium"
        >
          {statusMessage}
        </p>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {helperMessage}
      </p>
    </>
  );
}
