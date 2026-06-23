export const SUMMER_SALE_END_LABEL = "July 31";
const SUMMER_SALE_END_AT = new Date("2026-08-01T04:59:59Z").getTime();

export function isSummerSaleActive(now = Date.now()) {
  return now <= SUMMER_SALE_END_AT;
}

export function getProductSalePriceCents(priceCents) {
  return isSummerSaleActive() ? Math.round(priceCents * 0.5) : priceCents;
}

export function formatUsd(cents) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}