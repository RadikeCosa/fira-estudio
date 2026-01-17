#!/usr/bin/env node

/**
 * Rate Limiting Demo Script
 * 
 * Demonstrates how the rate limiting works in isolation
 * Run with: node docs/rate-limiting-demo.js
 */

// Mock localStorage for Node.js environment
const storage = {};
global.window = {
  localStorage: {
    getItem: (key) => storage[key] || null,
    setItem: (key, value) => { storage[key] = value; },
  }
};

// Import rate limiting functions (would need to transpile TypeScript in real demo)
const {
  getRateLimitData,
  setRateLimitData,
  checkRateLimit,
  recordAction,
  getTimeUntilReset,
} = require('../lib/storage/rate-limit.ts');

const KEY = "demo_clicks";
const MAX_ACTIONS = 5;
const WINDOW_MS = 60000; // 60 seconds

console.log("🔒 Rate Limiting Demo\n");
console.log(`Configuration: ${MAX_ACTIONS} actions per ${WINDOW_MS / 1000} seconds\n`);

// Simulate clicks
console.log("Simulating user clicks:");
for (let i = 1; i <= 7; i++) {
  const isLimited = checkRateLimit(KEY, MAX_ACTIONS, WINDOW_MS);
  
  if (!isLimited) {
    recordAction(KEY, WINDOW_MS);
    console.log(`✅ Click ${i}: Allowed`);
  } else {
    const timeLeft = getTimeUntilReset(KEY, WINDOW_MS);
    const secondsLeft = Math.ceil(timeLeft / 1000);
    console.log(`❌ Click ${i}: RATE LIMITED (Available in ${secondsLeft}s)`);
  }
}

console.log("\n📊 Final State:");
const timestamps = getRateLimitData(KEY);
console.log(`Total recorded clicks: ${timestamps.length}`);
console.log(`Currently rate limited: ${checkRateLimit(KEY, MAX_ACTIONS, WINDOW_MS)}`);

// Show what happens after time passes
console.log("\n⏰ Simulating time passing (61 seconds)...");
const futureTimestamps = timestamps.map(ts => ts - 61000);
setRateLimitData(KEY, futureTimestamps);
console.log(`Rate limited now: ${checkRateLimit(KEY, MAX_ACTIONS, WINDOW_MS)}`);
console.log(`Clicks available again: ${!checkRateLimit(KEY, MAX_ACTIONS, WINDOW_MS) ? '✅ YES' : '❌ NO'}`);
