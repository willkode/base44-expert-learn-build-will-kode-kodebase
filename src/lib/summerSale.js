// $10 Flash Sale — every eligible product is $10, or $100 for all-access to
// everything. Replaces the previous 55%-off product sale.
//
// Export names are unchanged from the 55%-off sale so every existing call site
// keeps working; only the pricing rules inside changed.

export const SUMMER_SALE_END_LABEL = "Automatically applied at checkout";

// Flat price every eligible product drops to.
export const FLASH_SALE_PRICE_CENTS = 1000;

// The all-access tier: one purchase unlocks every product in the catalog.
export const ALL_ACCESS_SLUG = "complete-builder-bundle";
export const ALL_ACCESS_PRICE_CENTS = 10000;

// Multi-pack bundles sit the flash sale out at their regular price, so the
// all-access tier stays the cheapest way to get everything.
export const SALE_EXCLUDED_SLUGS = [
  "founder-stack-bundle",
  "kode-ai-marketing-team-bundle",
  "complete-base44-knowledge-kit",
];

// Services are hands-on work rather than a $10 download, so they keep the
// previous 55% off instead of the flat flash price.
export const SERVICE_SALE_SLUGS = ["hire-will-kode"];
export const SERVICE_DISCOUNT_PERCENT = 55;

export function isSummerSaleActive() {
  return true;
}

// The price actually charged for a product during the flash sale.
// Mirrored server-side in base44/functions/createSquareCheckoutLink — keep both
// in step, and treat the backend as authoritative.
export function getProductSalePriceCents(priceCents, slug) {
  const cents = Math.round(Number(priceCents) || 0);
  if (cents <= 0) return 0; // free products are claimed, never charged
  if (slug === ALL_ACCESS_SLUG) return ALL_ACCESS_PRICE_CENTS;
  if (SALE_EXCLUDED_SLUGS.includes(slug)) return cents;
  if (SERVICE_SALE_SLUGS.includes(slug)) {
    return Math.round((cents * (100 - SERVICE_DISCOUNT_PERCENT)) / 100);
  }
  return FLASH_SALE_PRICE_CENTS;
}

// Whether this product is genuinely discounted right now. Callers use it to
// decide whether to show a sale badge and a struck-through regular price —
// excluded bundles and free products must show neither.
export function isProductOnSale(priceCents, slug) {
  const cents = Math.round(Number(priceCents) || 0);
  return cents > 0 && getProductSalePriceCents(cents, slug) < cents;
}

// Short badge copy describing the offer on this product, or null when it has none.
export function getSaleBadgeLabel(priceCents, slug) {
  if (!isProductOnSale(priceCents, slug)) return null;
  if (slug === ALL_ACCESS_SLUG) return "All-Access Flash Deal";
  if (SERVICE_SALE_SLUGS.includes(slug)) return `${SERVICE_DISCOUNT_PERCENT}% off`;
  return "$10 Flash Sale";
}

// True percent off for this product, rounded; 0 when it isn't on sale.
// priceCents is required to be meaningful now that the sale is a flat price.
export function getSaleDiscountPercent(slug, priceCents) {
  const cents = Math.round(Number(priceCents) || 0);
  if (cents <= 0) return 0;
  const sale = getProductSalePriceCents(cents, slug);
  if (sale >= cents) return 0;
  return Math.round(((cents - sale) / cents) * 100);
}

export function formatUsd(cents) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
