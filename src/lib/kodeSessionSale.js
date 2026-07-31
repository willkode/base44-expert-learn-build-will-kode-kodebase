// Kode Sessions 50% off — ends 08/07/2026 at 11:00 PM Central (04:00 UTC on 08/08).
export const KODE_SESSION_SALE_END = new Date("2026-08-08T04:00:00Z");

export const isKodeSessionSaleActive = () => new Date() < KODE_SESSION_SALE_END;

export const KODE_SESSION_SALE_LABEL = "50% off — ends Aug 7, 11 PM CT";