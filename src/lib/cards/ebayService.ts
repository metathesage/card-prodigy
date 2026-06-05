// eBay Recent Sales adapter.
// Generates comps with eBay search links so users can verify on the actual marketplace.

import type { RecentSale } from "./types";
import { getSeededRecentSales } from "./seedNba";

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

function buildEbaySearchUrl(cardName: string, condition?: string): string {
  const q = [cardName, condition, "PSA"].filter(Boolean).join(" ");
  return `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&LH_Sold=1&LH_Complete=1`;
}

export async function fetchRecentSales(cardId: string, marketPrice: number, cardName?: string): Promise<RecentSale[]> {
  const baseSales = getSeededRecentSales(cardId, marketPrice);

  // Add eBay search URLs to sales
  return baseSales.map((s) => ({
    ...s,
    url: s.source === "eBay" && cardName
      ? buildEbaySearchUrl(cardName, s.condition)
      : s.source === "eBay"
      ? `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(cardId.replace("nba:", "").replace(/-/g, " "))}&LH_Sold=1&LH_Complete=1`
      : undefined,
  }));
}
