import { useEffect } from "react";

/**
 * Custom hook to lock body scroll when active
 * Useful for modals, drawers, mobile menus
 * 
 * @param isLocked - Whether scroll should be locked
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    // Save original overflow value
    const originalStyle = window.getComputedStyle(document.body).overflow;
    
    // Lock scroll
    document.body.style.overflow = "hidden";

    // Cleanup: restore original overflow
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
}
