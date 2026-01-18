# Rate Limiting Implementation for WhatsApp Button

## Overview
This implementation adds client-side rate limiting to prevent spam clicks on the WhatsApp button. The limit is set to **5 clicks per minute**.

## Components

### 1. Storage Layer (`lib/storage/rate-limit.ts`)
Handles localStorage operations with graceful degradation:

- **getRateLimitData(key)**: Retrieves timestamp array from localStorage
- **setRateLimitData(key, timestamps)**: Stores timestamp array
- **checkRateLimit(key, maxActions, windowMs)**: Checks if action should be rate limited
- **recordAction(key, windowMs)**: Records new action and cleans up old timestamps
- **getTimeUntilReset(key, windowMs)**: Calculates time until rate limit resets

**Graceful Degradation:**
- Returns empty array if localStorage unavailable (incognito mode)
- Never throws errors - logs warnings to console
- "Fail open" approach: allows action if error occurs

### 2. Hook Layer (`hooks/useRateLimit.ts`)
React hook that manages rate limiting state:

```typescript
const { isRateLimited, recordAction, timeUntilReset } = useRateLimit({
  maxActions: 5,
  windowMs: 60000,
  key: "whatsapp_clicks"
});
```

**Features:**
- Auto-updates countdown timer every second
- Automatically cleans up old timestamps
- Returns boolean flag for rate limited state
- Provides function to record new actions
- Returns milliseconds until rate limit resets

### 3. UI Layer (`components/productos/WhatsAppButton.tsx`)
Enhanced WhatsApp button with rate limiting:

**Visual Feedback:**
- Button changes to gray when rate limited
- Shows countdown: "Disponible en Xs"
- Cursor changes to `not-allowed`
- Removes hover effects when disabled

**User Feedback:**
- Alert dialog when clicking while rate limited
- Shows exact seconds until available
- Prevents navigation to WhatsApp when limited

## Behavior

### Normal Flow
1. User clicks WhatsApp button
2. Action is recorded in localStorage
3. WhatsApp link opens in new tab
4. Click count increments

### Rate Limited Flow
1. User reaches 5 clicks in 60 seconds
2. Button becomes disabled (gray)
3. Text changes to "Disponible en Xs"
4. Clicking shows alert with countdown
5. Navigation to WhatsApp is prevented
6. After oldest click expires, button re-enables

### Countdown Timer
- Updates every second
- Shows remaining seconds until available
- Automatically re-enables button when time expires
- Format: "Disponible en 45s"

## Testing

Comprehensive test suite (`lib/storage/rate-limit.test.ts`):
- ✅ 21 tests, all passing
- Tests localStorage operations
- Tests rate limit logic
- Tests graceful degradation
- Tests countdown calculations
- Tests edge cases (invalid JSON, missing localStorage, etc.)

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (localStorage supported)
- Firefox (localStorage supported)
- Safari (localStorage supported)
- Incognito/Private mode (graceful degradation - no rate limiting)

## Implementation Details

### Why localStorage?
- Client-side only (no server required)
- Persists across page reloads
- Simple to implement
- Good enough for spam prevention

### Why "Fail Open"?
- If localStorage fails, allow the action
- Better UX than breaking functionality
- Security is not critical (just spam prevention)
- User can still use WhatsApp

### Why 5 clicks per minute?
- Prevents rapid spam clicking
- Allows legitimate use cases (multiple products)
- Not too restrictive for real users
- Easy to adjust if needed

### Why Alert Instead of Toast?
- No dependencies needed (zero new packages)
- Works immediately out of the box
- Clear, consistent user feedback
- Can be upgraded later to toast library for better UX and accessibility
- Current implementation prioritizes reliability and maintainability

**Note:** Alert dialogs are intentionally used for simplicity. In a future enhancement, consider replacing with a toast notification library (e.g., react-hot-toast) for better UX, accessibility, and non-blocking notifications.

## Configuration

To change rate limit settings, modify `WhatsAppButton.tsx`:

```typescript
const { isRateLimited, recordAction, timeUntilReset } = useRateLimit({
  maxActions: 10,      // Change to allow 10 clicks
  windowMs: 120000,    // Change to 2 minutes (120000ms)
  key: "whatsapp_clicks"
});
```

## Future Enhancements

Potential improvements:
- Replace alert() with toast notifications (e.g., react-hot-toast) for better UX and accessibility
- Add visual progress indicator showing clicks remaining
- Add analytics tracking for rate limit hits
- Make limits configurable per user or per product
- Add server-side rate limiting for extra protection
- Add inline message instead of modal dialog
- Add ARIA live region announcements for screen readers
