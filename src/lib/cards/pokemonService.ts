// Pokemon TCG via pokemontcg.io — free, no key required (rate-limited but fine for our use)
import type { UnifiedCard } from "./types";

const BASE = "https://api.pokemontcg.io/v2";

interface PokemonApiCard {
  id: string;
  name: string;
  number?: string;
  rarity?: string;
  images: { small: string; large: string };
  set?: { name?: string; releaseDate?: string };
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
    prices?: Record<string, { market?: number; mid?: number; low?: number; high?: number }>;
  };
}

function pickPrice(c: PokemonApiCard): { market: number; prev: number; high?: number; low?: number } {
  // Prefer cardmarket, fallback tcgplayer holofoil/normal
  const cm = c.cardmarket?.prices;
  if (cm?.trendPrice && cm.trendPrice > 0) {
    const market = cm.trendPrice;
    const prev = cm.avg7 ?? market * 0.98;
    return { market, prev, low: cm.lowPrice };
  }
  const tp = c.tcgplayer?.prices;
  if (tp) {
    const variant = tp.holofoil ?? tp["1stEditionHolofoil"] ?? tp.normal ?? Object.values(tp)[0];
    if (variant?.market) {
      return {
        market: variant.market,
        prev: variant.mid ?? variant.market * 0.98,
        high: variant.high,
        low: variant.low,
      };
    }
  }
  return { market: 0, prev: 0 };
}

function toUnified(c: PokemonApiCard): UnifiedCard {
  const { market, prev, high, low } = pickPrice(c);
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
  };
}

export async function fetchPokemonCards(opts: { query?: string; pageSize?: number } = {}): Promise<UnifiedCard[]> {
  const params = new URLSearchParams();
  // High-value popular cards by default
  const q =
    opts.query ||
    'rarity:"Rare Holo" OR rarity:"Rare Holo VMAX" OR rarity:"Illustration Rare" OR rarity:"Special Illustration Rare"';
  params.set("q", q);
  params.set("pageSize", String(opts.pageSize ?? 24));
  params.set("orderBy", "-cardmarket.prices.trendPrice");
  const url = `${BASE}/cards?${params.toString()}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    console.error("[pokemon] fetch failed", res.status, await res.text().catch(() => ""));
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

export async function searchPokemonCards(query: string, pageSize = 24): Promise<UnifiedCard[]> {
  if (!query.trim()) return fetchPokemonCards({ pageSize });
  return fetchPokemonCards({ query: `name:"*${query}*"`, pageSize });
}
