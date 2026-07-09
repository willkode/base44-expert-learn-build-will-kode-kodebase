export const SUMMER_SALE_END_LABEL = "July 31";

// The Summer Special runs through July 31. We anchor the deadline to the
// current calendar year so the window is correct regardless of the runtime clock.
function summerSaleEndAt(now = new Date()) {
  const year = now.getFullYear();
  // Aug 1, 00:00 local — i.e. end of July 31.
  let end = new Date(year, 7, 1, 0, 0, 0, 0).getTime();
  // If we're already in Aug–Dec, the sale targets next year's window.
  if (now.getMonth() > 6) {
    end = new Date(year + 1, 7, 1, 0, 0, 0, 0).getTime();
  }
  return end;
}

export function isSummerSaleActive(now = new Date()) {
  return now.getTime() < summerSaleEndAt(now);
}

// The Complete Builder Bundle gets a deeper 86% discount; everything else is 50%.
const BUNDLE_SLUG = "complete-builder-bundle";

export function getSaleDiscountPercent(slug) {
  return slug === BUNDLE_SLUG ? 86 : 50;
}

export function getProductSalePriceCents(priceCents, slug) {
  if (!isSummerSaleActive()) return priceCents;
  return Math.round(priceCents * (1 - getSaleDiscountPercent(slug) / 100));
}

export function formatUsd(cents) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}