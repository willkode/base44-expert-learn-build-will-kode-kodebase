// Product sale remains active until explicitly changed; no deadline was specified.
export const SUMMER_SALE_END_LABEL = "Automatically applied at checkout";
export const SALE_EXCLUDED_SLUGS = [];
export function isSummerSaleActive() { return true; }
export function getSaleDiscountPercent() { return 55; }
export function getProductSalePriceCents(priceCents, slug) {
  return Math.round(priceCents * 45 / 100);
}

export function formatUsd(cents) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}