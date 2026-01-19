"use client";

import { classifyError, ErrorType } from "@/lib/errors/types";
import { ErrorDisplay } from "@/components/errors/ErrorDisplay";
import { NotFoundError } from "@/components/errors";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProductosError({ error, reset }: ErrorBoundaryProps) {
  const errorType = classifyError(error);

  switch (errorType) {
    case ErrorType.NETWORK:
      return <ErrorDisplay type="network" onRetry={reset} />;

    case ErrorType.DATABASE:
      return <ErrorDisplay type="database" onRetry={reset} />;

    case ErrorType.NOT_FOUND:
      return (
        <NotFoundError message="Los productos que buscás no están disponibles" />
      );

    case ErrorType.VALIDATION:
    case ErrorType.UNKNOWN:
    default:
      return <ErrorDisplay type="generic" onRetry={reset} error={error} />;
  }
}
