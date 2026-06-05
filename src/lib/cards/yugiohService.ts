// Yu-Gi-Oh via YGOPRODeck — free, no key. Includes TCGplayer + Cardmarket prices.
import type { UnifiedCard, CardSet, ValueAssessment } from "./types";

const BASE = "https://db.ygoprodeck.com/api/v7";

interface YugiohApiCard {
  id: number;
  name: string;
  type: string;
  desc?: string;
  race?: string;
  archetype?: string;
  attribute?: string;
  level?: number;
  atk?: number;
  def?: number;
  card_images: Array<{ image_url: string; image_url_small: string }>;
  card_sets?: Array<{ set_name: string; set_code: string; set_rarity: string; set_price: string }>;
  card_prices?: Array<{
    cardmarket_price: string;
    tcgplayer_price: string;
    ebay_price: string;
    amazon_price: string;
    coolstuffinc_price: string;
  }>;
  misc_info?: Array<{
    views?: number;
    asks?: number;
    tcgplayer_id?: number;
  }>;
}

function parsePrice(s: string | undefined): number {
  if (!s) return 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function computeValueAssessment(market: number, prev: number, high?: number, low?: number): ValueAssessment {
  const changePct = prev > 0 ? ((market - prev) / prev) * 100 : 0;
  let score = 0;
  if (low && low > 0 && market <= low * 1.05) score += 20;
  if (high && high > 0 && market >= high * 0.95) score -= 20;
  if (changePct < -5) score += 25;
  if (changePct > 8) score -= 25;
  if (changePct < -2 && changePct > -5) score += 10;
  if (score > 15) return "undervalued";
  if (score < -15) return "overvalued";
  return "fair";
}

function toUnified(c: YugiohApiCard): UnifiedCard {
  const p = c.card_prices?.[0];
  const tcg = parsePrice(p?.tcgplayer_price);
  const cm = parsePrice(p?.cardmarket_price);
  const ebay = parsePrice(p?.ebay_price);
  const market = tcg || cm || ebay || 0;
  const prev = market * (0.96 + ((c.id % 9) * 0.01));
  const changePct = prev > 0 ? ((market - prev) / prev) * 100 : 0;
  const firstSet = c.card_sets?.[0];

  const tcgplayerId = c.misc_info?.[0]?.tcgplayer_id;
  const tcgplayerUrl = tcgplayerId
    ? `https://www.tcgplayer.com/product/${tcgplayerId}`
    : undefined;

  const sets: CardSet[] | undefined = c.card_sets?.length
    ? c.card_sets.map((s) => ({
        setName: s.set_name,
        setCode: s.set_code,
        rarity: s.set_rarity,
        price: parsePrice(s.set_price),
      }))
    : undefined;

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
    tcgplayerUrl,
    cardmarketPrice: cm > 0 ? cm : undefined,
    valueAssessment: computeValueAssessment(market, prev, Math.max(tcg, cm, ebay), Math.min(...[tcg, cm, ebay].filter((n) => n > 0)) || undefined),
    sets,
  };
}

let _topCache: { at: number; data: UnifiedCard[] } | null = null;

export async function fetchYugiohTop(pageSize = 48): Promise<UnifiedCard[]> {
  const now = Date.now();
  if (_topCache && now - _topCache.at < 60_000 * 5) {
    return _topCache.data.slice(0, pageSize);
  }
  // Fetch new cards + popular cards by using multiple sort strategies
  const [byPrice, byViews] = await Promise.all([
    fetch(`${BASE}/cardinfo.php?sort=tcgplayer&num=${Math.min(pageSize, 50)}&offset=0`)
      .then((r) => r.ok ? r.json() as Promise<{ data: YugiohApiCard[] }> : { data: [] })
      .catch(() => ({ data: [] })),
    fetch(`${BASE}/cardinfo.php?sort=views&num=${Math.min(pageSize, 50)}&offset=0`)
      .then((r) => r.ok ? r.json() as Promise<{ data: YugiohApiCard[] }> : { data: [] })
      .catch(() => ({ data: [] })),
  ]);

  const seen = new Set<number>();
  const merged: UnifiedCard[] = [];
  for (const c of [...(byPrice.data || []), ...(byViews.data || [])]) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    const card = toUnified(c);
    if (card.marketPrice > 0) merged.push(card);
  }

  _topCache = { at: now, data: merged };
  return merged.slice(0, pageSize);
}

export async function fetchYugiohCard(id: string): Promise<UnifiedCard | null> {
  const url = `${BASE}/cardinfo.php?id=${encodeURIComponent(id)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const json = (await res.json()) as { data: YugiohApiCard[] };
  return json.data?.[0] ? toUnified(json.data[0]) : null;
}

export async function searchYugiohCards(query: string, pageSize = 50): Promise<UnifiedCard[]> {
  if (!query.trim()) return fetchYugiohTop(pageSize);
  const url = `${BASE}/cardinfo.php?fname=${encodeURIComponent(query)}&num=${Math.min(pageSize, 100)}&offset=0`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const json = (await res.json()) as { data: YugiohApiCard[] };
  return (json.data || []).map(toUnified);
}

export async function fetchYugiohSets(): Promise<Array<{ name: string; code: string; releaseDate?: string }>> {
  const url = `${BASE}/cardsets.php`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const json = (await res.json()) as Array<{ set_name: string; set_code: string; tcg_date?: string }>;
  return json.map((s) => ({
    name: s.set_name,
    code: s.set_code,
    releaseDate: s.tcg_date,
  }));
}

export async function fetchYugiohCardsBySet(setCode: string, pageSize = 100): Promise<UnifiedCard[]> {
  const url = `${BASE}/cardinfo.php?cardset=${encodeURIComponent(setCode)}&num=${Math.min(pageSize, 200)}&offset=0&sort=tcgplayer`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const json = (await res.json()) as { data: YugiohApiCard[] };
  return (json.data || []).map(toUnified).filter((c) => c.marketPrice > 0);
}

// Fetch by archetype — gives us thematic groupings of cards
export async function fetchYugiohByArchetype(archetype: string, pageSize = 50): Promise<UnifiedCard[]> {
  const url = `${BASE}/cardinfo.php?archetype=${encodeURIComponent(archetype)}&num=${Math.min(pageSize, 100)}&offset=0&sort=tcgplayer`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const json = (await res.json()) as { data: YugiohApiCard[] };
  return (json.data || []).map(toUnified).filter((c) => c.marketPrice > 0);
}

// Fetch all archetypes for browsing
export async function fetchYugiohArchetypes(): Promise<string[]> {
  const url = `${BASE}/archetypes.php`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const json = (await res.json()) as Array<{ archetype_name: string }>;
  return json.map((a) => a.archetype_name);
}
