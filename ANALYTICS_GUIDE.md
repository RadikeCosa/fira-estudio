# Google Analytics Integration Guide

## Overview

Muma Estudio uses Google Analytics 4 (GA4) for tracking user interactions and gathering insights about product performance and user behavior.

## Setup Instructions

### 1. Create a Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com)
2. Create a new GA4 property or select an existing one
3. Navigate to **Admin** → **Data Streams** → **Web**
4. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### 2. Configure Environment Variable

Add the Measurement ID to your `.env.local` file:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. Deploy to Production

Google Analytics only loads in production (`NODE_ENV=production`). This means:
- **Development (`npm run dev`)**: Analytics will NOT load
- **Production (`npm run build && npm run start`)**: Analytics will load

## Tracked Events

### 1. WhatsApp Click (`whatsapp_click`)

Triggered when a user clicks the "Consultar por WhatsApp" button.

**Parameters:**
- `event_category`: "engagement"
- `event_label`: Product name
- `producto_id`: Product UUID
- `producto_nombre`: Product name
- `producto_slug`: Product URL slug
- `variacion_tamanio`: Selected size (if any)
- `variacion_color`: Selected color (if any)
- `variacion_precio`: Selected variation price (if any)
- `value`: Price value (for conversion tracking)

**Usage in GA4:**
- Measure engagement with WhatsApp contact
- Track which products generate most inquiries
- Understand price points that convert

### 2. Product View (`view_item`)

Triggered automatically when a product detail page loads.

**Parameters:**
- `event_category`: "ecommerce"
- `event_label`: Product name
- `producto_id`: Product UUID
- `producto_nombre`: Product name
- `producto_slug`: Product URL slug
- `categoria_id`: Category UUID
- `precio_desde`: Starting price
- `value`: Price value

**Usage in GA4:**
- Track most viewed products
- Measure engagement funnel
- Identify popular categories

### 3. Category Filter (`filter_products`)

Triggered when a user clicks on a category filter.

**Parameters:**
- `event_category`: "navigation"
- `event_label`: Category name
- `filter_type`: "category"
- `filter_value`: Category slug

**Usage in GA4:**
- Understand navigation patterns
- Identify popular categories
- Optimize category organization

### 4. Variation Select (`select_item`)

Triggered when a user selects a product variation (size/color).

**Parameters:**
- `event_category`: "ecommerce"
- `event_label`: Full variation description
- `producto_id`: Product UUID
- `variacion_id`: Variation UUID
- `variacion_tamanio`: Size
- `variacion_color`: Color
- `variacion_precio`: Price
- `value`: Price value

**Usage in GA4:**
- Track most popular variations
- Understand size/color preferences
- Optimize inventory

## Custom Reports in GA4

### Recommended Reports

1. **Top Products by Views**
   - Metric: `view_item` events
   - Dimension: `event_label` (product name)
   - Sort by event count descending

2. **WhatsApp Conversion Rate**
   - Metric 1: `view_item` events
   - Metric 2: `whatsapp_click` events
   - Calculate: `whatsapp_click / view_item`

3. **Popular Categories**
   - Metric: `filter_products` events
   - Dimension: `event_label` (category name)
   - Sort by event count descending

4. **Variation Preferences**
   - Metric: `select_item` events
   - Dimensions: `variacion_tamanio`, `variacion_color`
   - Group by: Size and Color

### Setting Up Custom Reports

1. Go to **Explore** in GA4
2. Create a new **Free form exploration**
3. Add dimensions and metrics as specified above
4. Apply filters as needed
5. Save the report for future use

## Debugging Analytics

### Check if Analytics is Working

1. **In Production:**
   - Open Chrome DevTools
   - Go to **Network** tab
   - Filter by "google-analytics" or "gtag"
   - Trigger an event (click WhatsApp button, filter category)
   - Look for requests to `www.google-analytics.com`

2. **Using GA4 DebugView:**
   - Install [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger)
   - Enable the extension
   - Navigate your site
   - Go to GA4 → **Configure** → **DebugView**
   - See events in real-time

### Common Issues

**Analytics not loading:**
- ✅ Check `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set correctly
- ✅ Verify you're running in production mode
- ✅ Check browser console for errors
- ✅ Ensure ad blockers are disabled for testing

**Events not firing:**
- ✅ Check browser console for `gtag` errors
- ✅ Verify `window.gtag` exists in console
- ✅ Check Network tab for blocked requests
- ✅ Test in incognito mode (some extensions block tracking)

## Data Privacy & GDPR

### Current Implementation

The current implementation loads Google Analytics automatically. For GDPR compliance in European markets, consider:

1. **Cookie Consent Banner**
   - Add a consent management platform (CMP)
   - Only load GA after user consent
   - Examples: CookieBot, OneTrust, or custom solution

2. **Anonymize IP**
   - GA4 automatically anonymizes IP addresses
   - No additional configuration needed

3. **Data Retention**
   - Configure in GA4 admin panel
   - Recommended: 14 months for e-commerce

### Future Improvements

For full GDPR compliance, implement:

```typescript
// Example: Conditional GA loading
if (userConsent) {
  loadGoogleAnalytics();
}
```

## Technical Implementation

### Architecture

```
app/layout.tsx
  └─ <GoogleAnalytics /> from @next/third-parties/google

components/productos/WhatsAppButton.tsx
  └─ trackWhatsAppClick() on click

app/productos/[slug]/page.tsx
  └─ trackProductView() on mount (via useEffect in future)

components/productos/CategoryFilter.tsx
  └─ trackCategoryFilter() on category click
```

### Key Files

- `lib/analytics/gtag.ts` - Event tracking functions
- `app/layout.tsx` - GA initialization
- `components/productos/WhatsAppButton.tsx` - WhatsApp tracking
- `components/productos/CategoryFilter.tsx` - Category tracking

### Adding New Events

To add a new custom event:

1. **Define the event in `lib/analytics/gtag.ts`:**

```typescript
export function trackNewEvent(
  param1: string,
  param2: number
): void {
  if (!canTrack()) return;

  window.gtag!("event", "new_event_name", {
    event_category: "category",
    event_label: param1,
    custom_param: param2,
  });
}
```

2. **Call the function where needed:**

```typescript
import { trackNewEvent } from "@/lib/analytics/gtag";

// In your component
const handleAction = () => {
  trackNewEvent("value", 123);
  // ... rest of your logic
};
```

3. **Verify in GA4 DebugView:**
   - Trigger the event
   - Check DebugView for the new event
   - Wait 24-48 hours for it to appear in standard reports

## Performance Considerations

### Loading Strategy

Google Analytics uses `@next/third-parties/google` which implements:
- Async script loading
- Deferred execution
- No blocking of page render
- Automatic optimization by Next.js

### Impact on Core Web Vitals

- **LCP (Largest Contentful Paint)**: No impact
- **FID (First Input Delay)**: Minimal (<5ms)
- **CLS (Cumulative Layout Shift)**: None

GA4 is loaded after page interactive, ensuring no negative impact on user experience.

## Support & Resources

- [Google Analytics 4 Documentation](https://support.google.com/analytics/answer/10089681)
- [GA4 Events Reference](https://support.google.com/analytics/answer/9322688)
- [Next.js Third-Party Scripts](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries)
- [@next/third-parties Package](https://www.npmjs.com/package/@next/third-parties)

---

**Last Updated:** January 2025
**Version:** 1.0
