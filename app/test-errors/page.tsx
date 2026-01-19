"use client";

import { useState } from "react";
import { ErrorDisplay } from "@/components/errors/ErrorDisplay";
import { NotFoundError } from "@/components/errors";

export default function TestErrorsPage() {
  const [selectedError, setSelectedError] = useState<string>("network");

  const handleRetry = () => {
    console.log("Retry clicked");
    alert("Retry button clicked!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-foreground">
          Error Boundaries Test Page
        </h1>

        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setSelectedError("network")}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              selectedError === "network"
                ? "bg-accent text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Network Error
          </button>
          <button
            onClick={() => setSelectedError("database")}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              selectedError === "database"
                ? "bg-accent text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Database Error
          </button>
          <button
            onClick={() => setSelectedError("notfound")}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              selectedError === "notfound"
                ? "bg-accent text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Not Found Error
          </button>
          <button
            onClick={() => setSelectedError("generic")}
            className={`rounded-lg px-4 py-2 font-medium transition-colors ${
              selectedError === "generic"
                ? "bg-accent text-white"
                : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            Generic Error
          </button>
        </div>

        {selectedError === "network" && (
          <ErrorDisplay type="network" onRetry={handleRetry} />
        )}
        {selectedError === "database" && (
          <ErrorDisplay type="database" onRetry={handleRetry} />
        )}
        {selectedError === "notfound" && (
          <NotFoundError message="Este es un mensaje personalizado de error" />
        )}
        {selectedError === "generic" && (
          <ErrorDisplay
            type="generic"
            onRetry={handleRetry}
            error={new Error("Example error message for testing")}
          />
        )}
      </div>
    </div>
  );
}
