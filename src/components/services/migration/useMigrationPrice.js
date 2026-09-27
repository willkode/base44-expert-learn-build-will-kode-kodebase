import { useEffect, useState } from "react";

// Midnight CST at the end of September 27, 2026 (fixed UTC-6).
export const MIGRATION_SALE_END = Date.parse("2026-09-28T00:00:00-06:00");
export const MIGRATION_REGULAR_PRICE = 199;
export const migrationPriceAt = (now) => now < MIGRATION_SALE_END ? 99 : 199;

export default function useMigrationPrice() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return { price: migrationPriceAt(now), saleActive: now < MIGRATION_SALE_END };
}
