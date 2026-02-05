"use client";

import { X } from "lucide-react";
import { useState } from "react";
import {
  IS_MAINTENANCE_MODE,
  MAINTENANCE_MESSAGE,
} from "@/lib/config/features";

export function MaintenanceBanner() {
  const [isVisible, setIsVisible] = useState(true);

  // No mostrar si no estamos en mantenimiento
  if (!IS_MAINTENANCE_MODE || !isVisible) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-yellow-950 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm font-medium">
            <strong className="font-semibold">Modo Mantenimiento:</strong>{" "}
            {MAINTENANCE_MESSAGE}
          </p>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 p-1 hover:bg-yellow-600/20 rounded transition-colors"
          aria-label="Cerrar mensaje"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
