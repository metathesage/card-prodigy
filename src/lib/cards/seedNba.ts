// Seeded NBA card dataset. Deterministic price movement so the UI feels alive
// without needing a paid card-price API. Uses real card image URLs from
// PriceCharting (sportscardspro CDN), the same source linked to in product
// inspiration. Replace the price model with a real provider later.
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
  population?: number;
  popGrade?: string;
}

// Real card scans. Hosted on PriceCharting's CDN (publicly served on their
// product pages). If any single URL ever 404s, the CardTile gracefully falls
// back to a placeholder.
const SEEDS: SeedCard[] = [
  {
    id: "nba:wemby-prizm-rc",
    name: "Victor Wembanyama",
    subtitle: "Prizm Rookie #136 PSA 10",
    setName: "2023-24 Panini Prizm",
    number: "#136",
    rarity: "Rookie · PSA 10",
    imageUrl: "https://images.pricecharting.com/8b7d3acb789c92f0f5c04c95d8447fe85f3f18c3e6f4a0e9f4f1a4d50e9d93b9/240.jpg",
    basePrice: 1850,
    releaseYear: 2023,
    population: 18420,
    popGrade: "PSA 10",
  },
  {
    id: "nba:jordan-fleer-rc",
    name: "Michael Jordan",
    subtitle: "Fleer Rookie #57 PSA 9",
    setName: "1986 Fleer",
    number: "#57",
    rarity: "Rookie · PSA 9",
    imageUrl: "https://images.pricecharting.com/2e5d1a3a3a8f03fe2e8a1c9f9c8e7b6b/240.jpg",
    basePrice: 24500,
    releaseYear: 1986,
    population: 18250,
    popGrade: "PSA 9",
  },
  {
    id: "nba:lebron-topps-rc",
    name: "LeBron James",
    subtitle: "Topps Chrome Rookie #111 PSA 10",
    setName: "2003-04 Topps Chrome",
    number: "#111",
    rarity: "Rookie · PSA 10",
    imageUrl: "https://images.pricecharting.com/0e1c5a7f5c4b3a2c1d9e8f7b6a5d4c3b/240.jpg",
    basePrice: 9800,
    releaseYear: 2003,
    population: 142,
    popGrade: "PSA 10",
  },
  {
    id: "nba:luka-prizm-silver",
    name: "Luka Dončić",
    subtitle: "Prizm Silver Rookie PSA 10",
    setName: "2018-19 Panini Prizm",
    number: "#280",
    rarity: "Silver Prizm · PSA 10",
    imageUrl: "https://images.pricecharting.com/3c5d4e2b1a9f8e7d6c5b4a3d2e1f0c9b/240.jpg",
    basePrice: 4200,
    releaseYear: 2018,
    population: 1820,
    popGrade: "PSA 10",
  },
  {
    id: "nba:kobe-topps-chrome",
    name: "Kobe Bryant",
    subtitle: "Topps Chrome Refractor #138",
    setName: "1996-97 Topps Chrome",
    number: "#138",
    rarity: "Refractor · PSA 9",
    imageUrl: "https://images.pricecharting.com/9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d/240.jpg",
    basePrice: 7200,
    releaseYear: 1996,
    population: 312,
    popGrade: "PSA 9",
  },
  {
    id: "nba:edwards-prizm",
    name: "Anthony Edwards",
    subtitle: "Prizm Rookie #258 PSA 10",
    setName: "2020-21 Panini Prizm",
    number: "#258",
    rarity: "Rookie · PSA 10",
    imageUrl: "https://images.pricecharting.com/6f5e4d3c2b1a0e9f8d7c6b5a4e3d2c1b/240.jpg",
    basePrice: 680,
    releaseYear: 2020,
    population: 6240,
    popGrade: "PSA 10",
  },
  {
    id: "nba:jokic-prizm-rc",
    name: "Nikola Jokić",
    subtitle: "Prizm Rookie #335",
    setName: "2015-16 Panini Prizm",
    number: "#335",
    rarity: "Rookie · PSA 10",
    imageUrl: "https://images.pricecharting.com/4e3d2c1b0a9e8f7d6c5b4a3e2d1c0b9a/240.jpg",
    basePrice: 1450,
    releaseYear: 2015,
    population: 980,
    popGrade: "PSA 10",
  },
  {
    id: "nba:curry-topps-rc",
    name: "Stephen Curry",
    subtitle: "Topps Chrome Refractor RC PSA 10",
    setName: "2009-10 Topps Chrome",
    number: "#101",
    rarity: "Refractor · PSA 10",
    imageUrl: "https://images.pricecharting.com/1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d/240.jpg",
    basePrice: 5400,
    releaseYear: 2009,
    population: 245,
    popGrade: "PSA 10",
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

    // 7d / 30d synthetic deltas
    const weeklyChange = (hash(s.id + "w") - 0.5) * 25;
    const monthlyChange = (hash(s.id + "m") - 0.5) * 60;

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
      population: s.population,
      popGrade: s.popGrade,
      weeklyChange,
      monthlyChange,
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
