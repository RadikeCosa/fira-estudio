"use client";

import { COMPONENTS } from "@/lib/design/tokens";

type ErrorType = 'network' | 'database' | 'generic';

interface ErrorConfig {
  icon: React.ReactNode;
  title: string;
  message: string;
}

interface ErrorDisplayProps {
  type: ErrorType;
  onRetry: () => void;
  error?: Error;
}

const ERROR_CONFIGS: Record<ErrorType, ErrorConfig> = {
  network: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
        <line x1="2" y1="22" x2="22" y2="2" strokeWidth={2.5} strokeLinecap="round" className="text-destructive" />
      </svg>
    ),
    title: "Error de conexión",
    message: "Verificá tu conexión a internet e intentá nuevamente.",
  },
  database: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6" strokeWidth={2.5} className="text-destructive" />
      </svg>
    ),
    title: "Error al cargar datos",
    message: "Estamos trabajando en solucionarlo. Por favor, intentá nuevamente en unos momentos.",
  },
  generic: {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
    title: "Algo salió mal",
    message: "Ocurrió un error inesperado. Por favor, intentá nuevamente.",
  },
};

export function ErrorDisplay({ type, onRetry, error }: ErrorDisplayProps) {
  const config = ERROR_CONFIGS[type];
  
  return (
    <div className={COMPONENTS.errorContainer.wrapper}>
      <div className={COMPONENTS.errorContainer.content}>
        <div className={COMPONENTS.errorContainer.icon}>
          {config.icon}
        </div>
        
        <div className="space-y-2">
          <h2 className={COMPONENTS.errorContainer.title}>
            {config.title}
          </h2>
          <p className={COMPONENTS.errorContainer.message}>
            {config.message}
          </p>
          {error && process.env.NODE_ENV === 'development' && (
            <p className="text-xs text-muted-foreground mt-4">
              {error.message}
            </p>
          )}
        </div>
        
        <button onClick={onRetry} className={COMPONENTS.errorContainer.button}>
          Reintentar
        </button>
      </div>
    </div>
  );
}
