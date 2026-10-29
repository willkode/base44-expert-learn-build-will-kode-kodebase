// Prompt Vault pricing in one place, so every surface that advertises the Vault
// shows the number checkout will actually charge.
import { getProductSalePriceCents, getSaleBadgeLabel, formatUsd } from "@/lib/summerSale";

export const VAULT_SLUG = "prompt-vault";
export const VAULT_PRODUCT_ID = "6a36c8c785752800bd7580be";

// Mirrors the catalog row's priceCents for the Prompt Vault product.
export const VAULT_LIST_CENTS = 1200;

export const VAULT_PRICE_CENTS = getProductSalePriceCents(VAULT_LIST_CENTS, VAULT_SLUG);
export const VAULT_PRICE = formatUsd(VAULT_PRICE_CENTS);
export const VAULT_LIST_PRICE = formatUsd(VAULT_LIST_CENTS);
export const VAULT_SALE_LABEL = getSaleBadgeLabel(VAULT_LIST_CENTS, VAULT_SLUG);
