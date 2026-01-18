"use client";

import { classifyError, ErrorType } from "@/lib/errors/types";
import { NetworkError } from "@/components/errors/NetworkError";
import { DatabaseError } from "@/components/errors/DatabaseError";
import { NotFoundError } from "@/components/errors/NotFoundError";
import { GenericError } from "@/components/errors/GenericError";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductosError({ error, reset }: ErrorBoundaryProps) {
  const errorType = classifyError(error);

  switch (errorType) {
    case ErrorType.NETWORK:
      return <NetworkError onRetry={reset} />;

    case ErrorType.DATABASE:
      return <DatabaseError onRetry={reset} />;

    case ErrorType.NOT_FOUND:
      return (
        <NotFoundError message="Los productos que buscás no están disponibles" />
      );

    case ErrorType.VALIDATION:
    case ErrorType.UNKNOWN:
    default:
      return <GenericError onRetry={reset} error={error} />;
  }
}
