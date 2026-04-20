// Unified card model across Pokemon, Yu-Gi-Oh, NBA
export type CardCategory = "pokemon" | "yugioh" | "nba";

export type Signal = "buy" | "sell" | "hold";

export interface UnifiedCard {
  id: string;                // namespaced: "pokemon:base1-4"
  category: CardCategory;
  name: string;
  subtitle?: string;         // e.g. set name, team, rarity
  imageUrl: string;
  rarity?: string;
  setName?: string;
  number?: string;
  marketPrice: number;       // current USD
  prevPrice: number;         // 24h ago USD
  changePct: number;         // (market - prev) / prev * 100
  high?: number;
  low?: number;
  releaseYear?: number;
  // Premium analytics
  population?: number;       // PSA / BGS pop count where known
  popGrade?: string;         // e.g. "PSA 10"
  weeklyChange?: number;     // 7d % change
  monthlyChange?: number;    // 30d % change
}

export interface PriceHistoryPoint {
  date: string;              // ISO
  price: number;
}

export interface RecentSale {
  id: string;
  date: string;
  price: number;
  condition: string;
  grade?: string;
  source: string;
}
