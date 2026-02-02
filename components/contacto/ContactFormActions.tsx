import { Button } from "@/components/ui/Button";

interface ContactFormActionsProps {
  buttonText: string;
  disabled: boolean;
  rateLimitMessage: string;
  isRateLimited: boolean;
  submitHelperText: string;
}

export function ContactFormActions({
  buttonText,
  disabled,
  rateLimitMessage,
  isRateLimited,
  submitHelperText,
}: ContactFormActionsProps) {
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

      {rateLimitMessage && (
        <p className="text-center text-sm text-orange-600 font-medium">
          {rateLimitMessage}
        </p>
      )}

      {isRateLimited && !rateLimitMessage && (
        <p className="text-center text-sm text-orange-600 font-medium">
          Límite de mensajes alcanzado. Esperá unos minutos.
        </p>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {submitHelperText}
      </p>
    </>
  );
}
