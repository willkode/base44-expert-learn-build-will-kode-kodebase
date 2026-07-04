// July 4th Flash Sale — celebrating America's 250th birthday. All paid
// products are $2.50 for today only, ending 11:59pm Central Time.
export const FLASH_SALE_PRICE_CENTS = 250;
export const FLASH_SALE_LABEL = "America's 250th Birthday Flash Sale";
export const FLASH_SALE_END_LABEL = "11:59pm CST tonight";

const FLASH_SALE_END_AT = new Date("2026-07-04T23:59:00-05:00").getTime();

export function isFlashSaleActive(now = new Date()) {
  return now.getTime() < FLASH_SALE_END_AT;
}

export function getFlashSaleEndAt() {
  return FLASH_SALE_END_AT;
}

// Flash sale overrides all other pricing (summer sale, Pro discount) for paid products.
export function getFlashSalePriceCents(priceCents) {
  return isFlashSaleActive() && (priceCents || 0) > 0 ? FLASH_SALE_PRICE_CENTS : priceCents;
}