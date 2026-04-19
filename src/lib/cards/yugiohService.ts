// Yu-Gi-Oh via YGOPRODeck — free, no key. Includes TCGplayer + Cardmarket prices.
import type { UnifiedCard } from "./types";

const BASE = "https://db.ygoprodeck.com/api/v7";

interface YugiohApiCard {
  id: number;
  name: string;
  type: string;
  desc?: string;
  race?: string;
  archetype?: string;
  card_images: Array<{ image_url: string; image_url_small: string }>;
  card_sets?: Array<{ set_name: string; set_code: string; set_rarity: string; set_price: string }>;
  card_prices?: Array<{
    cardmarket_price: string;
    tcgplayer_price: string;
    ebay_price: string;
    amazon_price: string;
    coolstuffinc_price: string;
  }>;
}

function parsePrice(s: string | undefined): number {
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function toUnified(c: YugiohApiCard): UnifiedCard {
  const p = c.card_prices?.[0];
  const tcg = parsePrice(p?.tcgplayer_price);
  const cm = parsePrice(p?.cardmarket_price);
  const ebay = parsePrice(p?.ebay_price);
  const market = tcg || cm || ebay || 0;
  // Synthesize a 24h prev using small deterministic-ish offset
  const prev = market * (0.96 + ((c.id % 9) * 0.01));
  const changePct = prev > 0 ? ((market - prev) / prev) * 100 : 0;
  const firstSet = c.card_sets?.[0];
  return {
    id: `yugioh:${c.id}`,
    category: "yugioh",
    name: c.name,
    subtitle: firstSet ? `${firstSet.set_name} · ${firstSet.set_rarity}` : c.type,
    imageUrl: c.card_images[0]?.image_url ?? c.card_images[0]?.image_url_small,
    rarity: firstSet?.set_rarity ?? c.type,
    setName: firstSet?.set_name,
    marketPrice: market,
    prevPrice: prev,
    changePct,
    high: Math.max(tcg, cm, ebay),
    low: Math.min(...[tcg, cm, ebay].filter((n) => n > 0)),
  };
}

// Cache so we don't pound the API on every page nav
let _topCache: { at: number; data: UnifiedCard[] } | null = null;

export async function fetchYugiohTop(pageSize = 24): Promise<UnifiedCard[]> {
  const now = Date.now();
  if (_topCache && now - _topCache.at < 60_000 * 5) {
    return _topCache.data.slice(0, pageSize);
  }
  // Sort by tcgplayer descending — gives us the chase cards
  const url = `${BASE}/cardinfo.php?sort=tcgplayer&num=${pageSize}&offset=0`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    console.error("[yugioh] fetch failed", res.status);
    return [];
  }
  const json = (await res.json()) as { data: YugiohApiCard[] };
  const out = (json.data || []).map(toUnified).filter((c) => c.marketPrice > 0);
  _topCache = { at: now, data: out };
  return out;
}

export async function fetchYugiohCard(id: string): Promise<UnifiedCard | null> {
  const url = `${BASE}/cardinfo.php?id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const json = (await res.json()) as { data: YugiohApiCard[] };
  return json.data?.[0] ? toUnified(json.data[0]) : null;
}

export async function searchYugiohCards(query: string, pageSize = 24): Promise<UnifiedCard[]> {
  if (!query.trim()) return fetchYugiohTop(pageSize);
  const url = `${BASE}/cardinfo.php?fname=${encodeURIComponent(query)}&num=${pageSize}&offset=0`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const json = (await res.json()) as { data: YugiohApiCard[] };
  return (json.data || []).map(toUnified);
}
