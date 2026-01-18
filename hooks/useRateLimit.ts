"use client";

import { useState, useEffect, useCallback } from "react";
import {
  checkRateLimit,
  recordAction as recordActionStorage,
  getTimeUntilReset,
} from "@/lib/storage/rate-limit";

interface UseRateLimitConfig {
  maxActions: number;
  windowMs: number;
  key: string;
}

interface UseRateLimitReturn {
  isRateLimited: boolean;
  recordAction: () => boolean;
  timeUntilReset: number;
}

/**
 * useRateLimit Hook
 * 
 * Manages rate limiting for user actions using localStorage
 * 
 * @param config - Configuration object
 * @param config.maxActions - Maximum number of actions allowed in the time window
 * @param config.windowMs - Time window in milliseconds
 * @param config.key - Unique key for storing rate limit data
 * 
 * @returns Object with isRateLimited, recordAction function, and timeUntilReset
 * 
 * @example
 * const { isRateLimited, recordAction, timeUntilReset } = useRateLimit({
 *   maxActions: 5,
 *   windowMs: 60000,
 *   key: "whatsapp_clicks"
 * });
 */
export function useRateLimit({
  maxActions,
  windowMs,
  key,
}: UseRateLimitConfig): UseRateLimitReturn {
  const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
  const [timeUntilReset, setTimeUntilReset] = useState<number>(0);

  // Check rate limit status
  const checkStatus = useCallback(() => {
    const limited = checkRateLimit(key, maxActions, windowMs);
    setIsRateLimited(limited);

    if (limited) {
      const resetTime = getTimeUntilReset(key, windowMs);
      setTimeUntilReset(resetTime);
    } else {
      setTimeUntilReset(0);
    }
  }, [key, maxActions, windowMs]);

  // Record an action and update state
  const recordAction = useCallback((): boolean => {
    // Check if currently rate limited
    if (checkRateLimit(key, maxActions, windowMs)) {
      setIsRateLimited(true);
      const resetTime = getTimeUntilReset(key, windowMs);
      setTimeUntilReset(resetTime);
      return false;
    }

    // Record the action
    const success = recordActionStorage(key, windowMs);

    // Update state
    checkStatus();

    return success;
  }, [key, maxActions, windowMs, checkStatus]);

  // Initial check and cleanup
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Update countdown timer
  useEffect(() => {
    if (!isRateLimited || timeUntilReset <= 0) {
      return;
    }

    const interval = setInterval(() => {
      const resetTime = getTimeUntilReset(key, windowMs);
      setTimeUntilReset(resetTime);

      // If time has expired, check status again
      if (resetTime <= 0) {
        checkStatus();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isRateLimited, timeUntilReset, key, windowMs, checkStatus]);

  return {
    isRateLimited,
    recordAction,
    timeUntilReset,
  };
}
