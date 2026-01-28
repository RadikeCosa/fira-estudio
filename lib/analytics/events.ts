/**
 * Analytics event constants
 * Centralized event definitions for Google Analytics tracking
 */

/**
 * WhatsApp button click event
 * Tracks when users click to consult via WhatsApp
 */
export const WHATSAPP_CLICK = {
  name: "whatsapp_click",
  category: "engagement",
} as const;

/**
 * Product detail view event
 * Tracks when users view a product detail page (GA4 recommended event)
 */
export const PRODUCT_VIEW = {
  name: "view_item",
  category: "ecommerce",
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
  category: "ecommerce",
} as const;

/**
 * Add to cart event
 * Tracks when users add a product to cart (GA4 recommended event)
 */
export const ADD_TO_CART = {
  name: "add_to_cart",
  category: "ecommerce",
} as const;

/**
 * Remove from cart event
 * Tracks when users remove a product from cart
 */
export const REMOVE_FROM_CART = {
  name: "remove_from_cart",
  category: "ecommerce",
} as const;

/**
 * View cart event
 * Tracks when users view their shopping cart
 */
export const VIEW_CART = {
  name: "view_cart",
  category: "ecommerce",
} as const;

/**
 * Begin checkout event
 * Tracks when users initiate checkout process (GA4 recommended event)
 */
export const BEGIN_CHECKOUT = {
  name: "begin_checkout",
  category: "ecommerce",
} as const;

/**
 * All analytics events grouped for easy access
 */
export const ANALYTICS_EVENTS = {
  WHATSAPP_CLICK,
  PRODUCT_VIEW,
  CATEGORY_FILTER,
  VARIATION_SELECT,
  ADD_TO_CART,
  REMOVE_FROM_CART,
  VIEW_CART,
  BEGIN_CHECKOUT,
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
