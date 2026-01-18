import { useEffect } from "react";

/**
 * Custom hook to handle ESC key press
 * Useful for closing modals, drawers, mobile menus
 * 
 * @param onEscape - Callback function when ESC is pressed
 * @param isActive - Whether the handler should be active
 */
export function useEscapeKey(
  onEscape: () => void,
  isActive: boolean = true
): void {
  useEffect(() => {
    if (!isActive) return;

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onEscape();
      }
    };

    document.addEventListener("keydown", handleEscape);

    // Cleanup: remove event listener
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onEscape, isActive]);
}
