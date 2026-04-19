// Seeded NBA card dataset. Deterministic price movement so the UI feels alive
// without needing a paid card-price API. Replace with a real provider later.
import type { UnifiedCard, PriceHistoryPoint, RecentSale } from "./types";

interface SeedCard {
  id: string;
  name: string;
  subtitle: string;
  setName: string;
  number: string;
  rarity: string;
  imageUrl: string;
  basePrice: number;
  releaseYear: number;
}

const SEEDS: SeedCard[] = [
  {
    id: "nba:wemby-prizm-rc",
    name: "Victor Wembanyama",
    subtitle: "Prizm Rookie #136 PSA 10",
    setName: "2023-24 Panini Prizm",
    number: "#136",
    rarity: "Rookie",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80",
    basePrice: 1850,
    releaseYear: 2023,
  },
  {
    id: "nba:jordan-fleer-rc",
    name: "Michael Jordan",
    subtitle: "Fleer Rookie #57 PSA 9",
    setName: "1986 Fleer",
    number: "#57",
    rarity: "Rookie",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
    basePrice: 24500,
    releaseYear: 1986,
  },
  {
    id: "nba:lebron-topps-rc",
    name: "LeBron James",
    subtitle: "Topps Chrome Rookie #111 PSA 10",
    setName: "2003-04 Topps Chrome",
    number: "#111",
    rarity: "Rookie",
    imageUrl: "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=600&q=80",
    basePrice: 9800,
    releaseYear: 2003,
  },
  {
    id: "nba:luka-prizm-silver",
    name: "Luka Dončić",
    subtitle: "Prizm Silver Rookie PSA 10",
    setName: "2018-19 Panini Prizm",
    number: "#280",
    rarity: "Silver Prizm",
    imageUrl: "https://images.unsplash.com/photo-1518605780604-65a7e5d57e22?w=600&q=80",
    basePrice: 4200,
    releaseYear: 2018,
  },
  {
    id: "nba:kobe-topps-chrome",
    name: "Kobe Bryant",
    subtitle: "Topps Chrome Refractor #138",
    setName: "1996-97 Topps Chrome",
    number: "#138",
    rarity: "Refractor",
    imageUrl: "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&q=80",
    basePrice: 7200,
    releaseYear: 1996,
  },
  {
    id: "nba:edwards-prizm",
    name: "Anthony Edwards",
    subtitle: "Prizm Rookie #258 PSA 10",
    setName: "2020-21 Panini Prizm",
    number: "#258",
    rarity: "Rookie",
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80",
    basePrice: 680,
    releaseYear: 2020,
  },
  {
    id: "nba:jokic-prizm-rc",
    name: "Nikola Jokić",
    subtitle: "Prizm Rookie #335",
    setName: "2015-16 Panini Prizm",
    number: "#335",
    rarity: "Rookie",
    imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=80",
    basePrice: 1450,
    releaseYear: 2015,
  },
  {
    id: "nba:curry-topps-rc",
    name: "Stephen Curry",
    subtitle: "Topps Chrome Refractor RC PSA 10",
    setName: "2009-10 Topps Chrome",
    number: "#101",
    rarity: "Rookie",
    imageUrl: "https://images.unsplash.com/photo-1577471488278-16eec37ffcc2?w=600&q=80",
    basePrice: 5400,
    releaseYear: 2009,
  },
];

// Deterministic pseudo-random based on seed string + day
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 0xffffffff;
}

function dayBucket(): string {
  const d = new Date();
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

export function getSeededNbaCards(): UnifiedCard[] {
  const day = dayBucket();
  return SEEDS.map((s) => {
    // Daily volatility: ±18%
    const daySeed = hash(s.id + day);
    const volatility = (daySeed - 0.5) * 0.36; // -18%..+18%
    const market = Math.round(s.basePrice * (1 + volatility) * 100) / 100;

    // 24h ago: smaller delta
    const prevSeed = hash(s.id + day + "prev");
    const prevDelta = (prevSeed - 0.5) * 0.20; // -10%..+10%
    const prev = Math.round(s.basePrice * (1 + volatility - prevDelta) * 100) / 100;

    const changePct = ((market - prev) / prev) * 100;

    return {
      id: s.id,
      category: "nba" as const,
      name: s.name,
      subtitle: s.subtitle,
      imageUrl: s.imageUrl,
      rarity: s.rarity,
      setName: s.setName,
      number: s.number,
      marketPrice: market,
      prevPrice: prev,
      changePct,
      high: Math.round(market * 1.15 * 100) / 100,
      low: Math.round(market * 0.82 * 100) / 100,
      releaseYear: s.releaseYear,
    };
  });
}

export function getSeededNbaCard(id: string): UnifiedCard | null {
  return getSeededNbaCards().find((c) => c.id === id) ?? null;
}

// 90-day price history, deterministic
export function getSeededPriceHistory(cardId: string, basePrice: number): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  const days = 90;
  let price = basePrice * 0.85; // start lower
  for (let i = days; i >= 0; i--) {
    const seed = hash(cardId + ":" + i);
    const drift = (seed - 0.48) * 0.06; // small daily drift, slight upward bias
    price = price * (1 + drift);
    const d = new Date();
    d.setDate(d.getDate() - i);
    points.push({ date: d.toISOString().slice(0, 10), price: Math.round(price * 100) / 100 });
  }
  return points;
}

export function getSeededRecentSales(cardId: string, market: number): RecentSale[] {
  const conditions = ["PSA 10", "PSA 9", "BGS 9.5", "Raw NM", "PSA 10"];
  const sources = ["eBay", "PWCC", "Goldin", "eBay", "Heritage"];
  return Array.from({ length: 8 }).map((_, i) => {
    const seed = hash(cardId + ":sale:" + i);
    const variance = (seed - 0.5) * 0.20;
    const price = Math.round(market * (1 + variance) * 100) / 100;
    const d = new Date();
    d.setDate(d.getDate() - i * 2 - Math.floor(seed * 3));
    return {
      id: `${cardId}-sale-${i}`,
      date: d.toISOString().slice(0, 10),
      price,
      condition: conditions[i % conditions.length],
      grade: conditions[i % conditions.length],
      source: sources[i % sources.length],
    };
  });
}
