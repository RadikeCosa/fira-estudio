/**
 * Analytics event constants
 * Centralized event definitions for Google Analytics tracking
 */

/**
 * Product inquiry event.
 * Tracks intent to contact about a product without sending message contents.
 */
export const PRODUCT_INQUIRY = {
  name: "product_inquiry",
  category: "engagement",
} as const;

/**
 * Product detail view event
 * Tracks when users view a product detail page (GA4 recommended event)
 */
export const PRODUCT_VIEW = {
  name: "view_item",
  category: "catalog",
} as const;

/**
 * Category filter event
 * Tracks when users filter products by category
 */
export const CATEGORY_FILTER = {
  name: "filter_products",
  category: "navigation",
} as const;

/**
 * Variation selection event
 * Tracks when users select a product variation (size/color)
 */
export const VARIATION_SELECT = {
  name: "select_item",
  category: "catalog",
} as const;

/**
 * All analytics events grouped for easy access
 */
export const ANALYTICS_EVENTS = {
  PRODUCT_INQUIRY,
  PRODUCT_VIEW,
  CATEGORY_FILTER,
  VARIATION_SELECT,
} as const;

/**
 * Type for a single analytics event
 */
export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/**
 * Valid event names for type checking
 */
export type AnalyticsEventName = AnalyticsEvent["name"];

/**
 * Valid event categories for type checking
 */
export type AnalyticsEventCategory = AnalyticsEvent["category"];
