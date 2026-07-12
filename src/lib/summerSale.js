export const SUMMER_SALE_END_LABEL = "October 19 at 11:59 AM";

// Will's Birthday Sale — 86% off everything, ends October 19 at 11:59 AM local
// (Will's 40th birthday). Anchored to the current calendar year so the window
// is correct regardless of the runtime clock.
export function saleEndDate(now = new Date()) {
  const year = now.getFullYear();
  let end = new Date(year, 9, 19, 11, 59, 0, 0);
  // If we're already past this year's window, the sale targets next year's.
  if (now.getTime() >= end.getTime()) {
    end = new Date(year + 1, 9, 19, 11, 59, 0, 0);
  }
  return end;
}

export function isSummerSaleActive(now = new Date()) {
  // Active from now through Oct 19, 11:59 AM of the current year.
  const year = now.getFullYear();
  const end = new Date(year, 9, 19, 11, 59, 0, 0);
  return now.getTime() < end.getTime();
}

// Will's Birthday Sale: 86% off everything.
export function getSaleDiscountPercent(_slug) {
  return 86;
}

export function getProductSalePriceCents(priceCents, slug) {
  if (!isSummerSaleActive()) return priceCents;
  return Math.round(priceCents * (1 - getSaleDiscountPercent(slug) / 100));
}

export function formatUsd(cents) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}