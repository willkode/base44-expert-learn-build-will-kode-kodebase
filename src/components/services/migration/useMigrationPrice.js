import { useEffect, useState } from "react";

// 24-hour special: noon October 4–5, 2026, America/Chicago (CDT).
export const MIGRATION_SALE_START = Date.parse("2026-10-04T12:00:00-05:00");
export const MIGRATION_SALE_END = Date.parse("2026-10-05T12:00:00-05:00");
export const MIGRATION_SALE_LABEL = "Monday, October 5, 2026 at noon Central";
export const isMigrationSaleActive = (now) => now >= MIGRATION_SALE_START && now < MIGRATION_SALE_END;
export const MIGRATION_REGULAR_PRICE = 199;
export const migrationPriceAt = (now) => isMigrationSaleActive(now) ? 75 : MIGRATION_REGULAR_PRICE;

export default function useMigrationPrice() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return { price: migrationPriceAt(now), saleActive: isMigrationSaleActive(now) };
}
