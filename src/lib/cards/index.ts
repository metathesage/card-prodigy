// Unified card service that dispatches to the right backend by category.
import type { UnifiedCard, CardCategory, PriceHistoryPoint } from "./types";
import { fetchPokemonCards, fetchPokemonCard, searchPokemonCards, fetchPokemonSets } from "./pokemonService";
import { fetchYugiohTop, fetchYugiohCard, searchYugiohCards, fetchYugiohSets, fetchYugiohCardsBySet, fetchYugiohByArchetype, fetchYugiohArchetypes } from "./yugiohService";
import { getSeededNbaCards, getSeededNbaCard, getSeededPriceHistory } from "./seedNba";

export type { UnifiedCard, CardCategory, PriceHistoryPoint, RecentSale, CardSet } from "./types";

export async function fetchTopCards(category: CardCategory, pageSize = 48): Promise<UnifiedCard[]> {
  if (category === "pokemon") return fetchPokemonCards({ pageSize });
  if (category === "yugioh") return fetchYugiohTop(pageSize);
  return getSeededNbaCards();
}

export async function fetchAllTopCards(): Promise<UnifiedCard[]> {
  const [p, y, n] = await Promise.all([
    fetchPokemonCards({ pageSize: 30 }).catch(() => []),
    fetchYugiohTop(30).catch(() => []),
    Promise.resolve(getSeededNbaCards()),
  ]);
  return [...p, ...y, ...n];
}

export async function fetchCardById(id: string): Promise<UnifiedCard | null> {
  const [prefix, ...rest] = id.split(":");
  const realId = rest.join(":");
  if (prefix === "pokemon") return fetchPokemonCard(realId);
  if (prefix === "yugioh") return fetchYugiohCard(realId);
  if (prefix === "nba") return getSeededNbaCard(id);
  return null;
}

export async function searchCards(query: string, category?: CardCategory): Promise<UnifiedCard[]> {
  if (!category) {
    const [p, y] = await Promise.all([
      searchPokemonCards(query, 24).catch(() => []),
      searchYugiohCards(query, 24).catch(() => []),
    ]);
    const nba = getSeededNbaCards().filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
    return [...p, ...y, ...nba];
  }
  if (category === "pokemon") return searchPokemonCards(query);
  if (category === "yugioh") return searchYugiohCards(query);
  return getSeededNbaCards().filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
}

export function getPriceHistory(card: UnifiedCard): PriceHistoryPoint[] {
  return getSeededPriceHistory(card.id, card.marketPrice || 10);
}

export function rankByChange(cards: UnifiedCard[], direction: "up" | "down" = "up", limit = 6): UnifiedCard[] {
  const sorted = [...cards]
    .filter((c) => Number.isFinite(c.changePct) && c.marketPrice > 0)
    .sort((a, b) => (direction === "up" ? b.changePct - a.changePct : a.changePct - b.changePct));
  return sorted.slice(0, limit);
}

export async function fetchAllSets(): Promise<Array<{ name: string; code: string; category: CardCategory; releaseDate?: string; totalCards?: number }>> {
  const [pokeSets, ygoSets] = await Promise.all([
    fetchPokemonSets().catch(() => []),
    fetchYugiohSets().catch(() => []),
  ]);
  const pokeMapped = pokeSets.map((s) => ({
    name: s.name,
    code: s.id,
    category: "pokemon" as CardCategory,
    releaseDate: s.releaseDate,
    totalCards: s.totalCards,
  }));
  const ygoMapped = ygoSets.map((s) => ({
    name: s.name,
    code: s.code,
    category: "yugioh" as CardCategory,
    releaseDate: s.releaseDate,
  }));
  return [...pokeMapped, ...ygoMapped];
}

export { fetchYugiohCardsBySet, fetchPokemonSets, fetchYugiohSets, fetchPokemonCards, fetchYugiohByArchetype, fetchYugiohArchetypes };
