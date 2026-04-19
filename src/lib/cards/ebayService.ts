// eBay Recent Sales adapter — STUB
//
// To enable real eBay data:
// 1. Apply for an eBay developer app: https://developer.ebay.com/
// 2. Get production keys for the Marketplace Insights API (gated, requires approval)
// 3. Add EBAY_APP_ID, EBAY_CERT_ID, EBAY_DEV_ID via the secrets tool
// 4. Replace the body of `fetchRecentSales` below with a real Marketplace Insights call
//
// For now, we synthesize realistic comps from the card's market price.

import type { RecentSale } from "./types";
import { getSeededRecentSales } from "./seedNba";

export async function fetchRecentSales(cardId: string, marketPrice: number): Promise<RecentSale[]> {
  // Stub: deterministic comps so they look like real sales.
  // Swap with eBay Marketplace Insights when keys are wired.
  return getSeededRecentSales(cardId, marketPrice);
}
