/**
 * Rate Limiting Storage Utilities
 * 
 * Manages rate limiting data in localStorage with graceful degradation
 * for browsers where localStorage is unavailable (incognito mode, disabled, etc.)
 */

/**
 * Get rate limit data from localStorage
 * @param key - Storage key for the rate limit data
 * @returns Array of timestamps (in milliseconds) or empty array if unavailable
 */
export function getRateLimitData(key: string): number[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }

    const data = window.localStorage.getItem(key);
    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    // localStorage unavailable (incognito mode, disabled, quota exceeded)
    console.warn(`Failed to read rate limit data for key "${key}":`, error);
    return [];
  }
}

/**
 * Set rate limit data in localStorage
 * @param key - Storage key for the rate limit data
 * @param timestamps - Array of timestamps to store
 */
export function setRateLimitData(key: string, timestamps: number[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    window.localStorage.setItem(key, JSON.stringify(timestamps));
  } catch (error) {
    // localStorage unavailable or quota exceeded
    console.warn(`Failed to write rate limit data for key "${key}":`, error);
  }
}

/**
 * Check if an action should be rate limited
 * @param key - Storage key for the rate limit data
 * @param maxActions - Maximum number of actions allowed in the time window
 * @param windowMs - Time window in milliseconds
 * @returns true if rate limited, false if action is allowed
 */
export function checkRateLimit(
  key: string,
  maxActions: number,
  windowMs: number
): boolean {
  try {
    const now = Date.now();
    const timestamps = getRateLimitData(key);

    // Filter out timestamps outside the time window
    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );

    // Check if we've exceeded the limit
    return recentTimestamps.length >= maxActions;
  } catch (error) {
    // If something goes wrong, allow the action (fail open)
    console.warn(`Error checking rate limit for key "${key}":`, error);
    return false;
  }
}

/**
 * Record a new action timestamp
 * @param key - Storage key for the rate limit data
 * @param windowMs - Time window in milliseconds (for cleanup)
 * @returns true if action was recorded successfully
 */
export function recordAction(key: string, windowMs: number): boolean {
  try {
    const now = Date.now();
    const timestamps = getRateLimitData(key);

    // Filter out old timestamps and add the new one
    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );
    recentTimestamps.push(now);

    setRateLimitData(key, recentTimestamps);
    return true;
  } catch (error) {
    console.warn(`Error recording action for key "${key}":`, error);
    return false;
  }
}

/**
 * Get time until rate limit resets (in milliseconds)
 * @param key - Storage key for the rate limit data
 * @param windowMs - Time window in milliseconds
 * @returns Milliseconds until oldest timestamp expires, or 0 if not rate limited
 */
export function getTimeUntilReset(key: string, windowMs: number): number {
  try {
    const now = Date.now();
    const timestamps = getRateLimitData(key);

    if (timestamps.length === 0) {
      return 0;
    }

    // Filter out timestamps outside the time window
    const recentTimestamps = timestamps.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (recentTimestamps.length === 0) {
      return 0;
    }

    // Find the oldest timestamp
    const oldestTimestamp = Math.min(...recentTimestamps);
    const timeUntilReset = windowMs - (now - oldestTimestamp);

    return Math.max(0, timeUntilReset);
  } catch (error) {
    console.warn(`Error getting time until reset for key "${key}":`, error);
    return 0;
  }
}
