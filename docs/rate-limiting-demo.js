#!/usr/bin/env node

/**
 * Rate Limiting Demo Script
 * 
 * NOTE: This is a conceptual demo. To run it, you would need to:
 * 1. Compile the TypeScript files to JavaScript first
 * 2. Or use ts-node: npx ts-node docs/rate-limiting-demo.js
 * 
 * For now, this serves as documentation of the rate limiting behavior.
 */

console.log("🔒 Rate Limiting Conceptual Demo\n");
console.log("This demonstrates how the rate limiting works.\n");
console.log("To test the actual implementation, visit a product page");
console.log("and click the WhatsApp button 6+ times quickly.\n");

// Example output:
console.log("Configuration: 5 actions per 60 seconds\n");
console.log("Simulating user clicks:");
console.log("✅ Click 1: Allowed");
console.log("✅ Click 2: Allowed");
console.log("✅ Click 3: Allowed");
console.log("✅ Click 4: Allowed");
console.log("✅ Click 5: Allowed");
console.log("❌ Click 6: RATE LIMITED (Available in 60s)");
console.log("❌ Click 7: RATE LIMITED (Available in 59s)");
console.log("\n📊 After 60 seconds:");
console.log("✅ Click 8: Allowed (oldest timestamp expired)");

