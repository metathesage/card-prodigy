// Pokemon TCG via pokemontcg.io — free, no key required (rate-limited but fine for our use)
import type { UnifiedCard, ValueAssessment } from "./types";

const BASE = "https://api.pokemontcg.io/v2";

interface PokemonApiCard {
  id: string;
  name: string;
  number?: string;
  rarity?: string;
  images: { small: string; large: string };
  set?: { name?: string; releaseDate?: string; id?: string };
  cardmarket?: {
    prices?: {
      averageSellPrice?: number;
      avg7?: number;
      avg30?: number;
      trendPrice?: number;
      lowPrice?: number;
    };
    updatedAt?: string;
  };
  tcgplayer?: {
    url?: string;
    prices?: Record<string, { market?: number; mid?: number; low?: number; high?: number }>;
  };
}

function pickPrice(c: PokemonApiCard): { market: number; prev: number; high?: number; low?: number; tcgUrl?: string; cmPrice?: number } {
  const cm = c.cardmarket?.prices;
  const cmPrice = cm?.trendPrice && cm.trendPrice > 0 ? cm.trendPrice : undefined;
  const tp = c.tcgplayer?.prices;
  const tcgUrl = c.tcgplayer?.url;

  if (cm?.trendPrice && cm.trendPrice > 0) {
    const market = cm.trendPrice;
    const prev = cm.avg7 ?? market * 0.98;
    return { market, prev, low: cm.lowPrice, tcgUrl, cmPrice };
  }
  if (tp) {
    const variant = tp.holofoil ?? tp["1stEditionHolofoil"] ?? tp.normal ?? tp.reverseHolofoil ?? Object.values(tp)[0];
    if (variant?.market) {
      return {
        market: variant.market,
        prev: variant.mid ?? variant.market * 0.98,
        high: variant.high,
        low: variant.low,
        tcgUrl,
        cmPrice,
      };
    }
  }
  return { market: 0, prev: 0 };
}

function computeValueAssessment(market: number, prev: number, high?: number, low?: number): ValueAssessment {
  const changePct = prev > 0 ? ((market - prev) / prev) * 100 : 0;
  let score = 0;
  if (low && market <= low * 1.05) score += 20;
  if (high && market >= high * 0.95) score -= 20;
  if (changePct < -5) score += 25;
  if (changePct > 8) score -= 25;
  if (changePct < -2 && changePct > -5) score += 10;
  if (score > 15) return "undervalued";
  if (score < -15) return "overvalued";
  return "fair";
}

function toUnified(c: PokemonApiCard): UnifiedCard {
  const { market, prev, high, low, tcgUrl, cmPrice } = pickPrice(c);
  const changePct = prev > 0 ? ((market - prev) / prev) * 100 : 0;
  return {
    id: `pokemon:${c.id}`,
    category: "pokemon",
    name: c.name,
    subtitle: [c.set?.name, c.number ? `#${c.number}` : null].filter(Boolean).join(" · "),
    imageUrl: c.images.large || c.images.small,
    rarity: c.rarity,
    setName: c.set?.name,
    number: c.number,
    marketPrice: market,
    prevPrice: prev,
    changePct,
    high,
    low,
    releaseYear: c.set?.releaseDate ? Number(c.set.releaseDate.slice(0, 4)) : undefined,
    tcgplayerUrl: tcgUrl,
    cardmarketPrice: cmPrice,
    valueAssessment: computeValueAssessment(market, prev, high, low),
  };
}

// Default queries that surface the most valuable/interesting cards
const DEFAULT_QUERIES = [
  'rarity:"Illustration Rare" OR rarity:"Special Illustration Rare"',
  'rarity:"Rare Holo VMAX" OR rarity:"Rare Holo VSTAR"',
  'rarity:"Rare Holo V" OR rarity:"Ultra Rare"',
  'rarity:"Rare Holo" OR rarity:"Rare"',
];

export async function fetchPokemonCards(opts: { query?: string; pageSize?: number } = {}): Promise<UnifiedCard[]> {
  if (opts.query) {
    return fetchPokemonCardsByQuery(opts.query, opts.pageSize ?? 48);
  }

  // Fetch from multiple rarity tiers to get a rich variety
  const perQuery = Math.ceil((opts.pageSize ?? 48) / DEFAULT_QUERIES.length);
  const results = await Promise.all(
    DEFAULT_QUERIES.map((q) => fetchPokemonCardsByQuery(q, perQuery).catch(() => [] as UnifiedCard[]))
  );

  // Merge and deduplicate
  const seen = new Set<string>();
  const merged: UnifiedCard[] = [];
  for (const batch of results) {
    for (const card of batch) {
      if (seen.has(card.id) || card.marketPrice <= 0) continue;
      seen.add(card.id);
      merged.push(card);
    }
  }
  return merged.sort((a, b) => b.marketPrice - a.marketPrice).slice(0, opts.pageSize ?? 48);
}

async function fetchPokemonCardsByQuery(query: string, pageSize: number): Promise<UnifiedCard[]> {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("pageSize", String(Math.min(pageSize, 100)));
  params.set("orderBy", "-cardmarket.prices.trendPrice");
  const url = `${BASE}/cards?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    console.error("[pokemon] fetch failed", res.status);
    return [];
  }
  const json = (await res.json()) as { data: PokemonApiCard[] };
  return (json.data || []).map(toUnified).filter((c) => c.marketPrice > 0);
}

export async function fetchPokemonCard(id: string): Promise<UnifiedCard | null> {
  const url = `${BASE}/cards/${encodeURIComponent(id)}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  const json = (await res.json()) as { data: PokemonApiCard };
  return json.data ? toUnified(json.data) : null;
}

export async function searchPokemonCards(query: string, pageSize = 48): Promise<UnifiedCard[]> {
  if (!query.trim()) return fetchPokemonCards({ pageSize });
  return fetchPokemonCardsByQuery(`name:"*${query}*"`, pageSize);
}

export async function fetchPokemonSets(): Promise<Array<{ name: string; id: string; releaseDate?: string; totalCards?: number }>> {
  const url = `${BASE}/sets?orderBy=-releaseDate`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const json = (await res.json()) as { data: Array<{ name: string; id: string; releaseDate?: string; total?: number }> };
  return json.data.map((s) => ({
    name: s.name,
    id: s.id,
    releaseDate: s.releaseDate,
    totalCards: s.total,
  }));
}
