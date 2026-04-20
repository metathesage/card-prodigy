import { createServerFn } from "@tanstack/react-start";
import { fetchAllTopCards, rankByChange } from "@/lib/cards";
import type { UnifiedCard } from "@/lib/cards/types";

export interface AiPick {
  cardId: string;
  cardName: string;
  category: string;
  imageUrl: string;
  marketPrice: number;
  setName?: string;
  rarity?: string;
  releaseYear?: number;
  thesis: string;     // 1-2 sentence reasoning
  signal: "strong" | "medium" | "watch";
  upside: string;     // e.g. "+25-40% / 90d"
}

interface AiPicksResult {
  picks: AiPick[];
  generatedAt: string;
  error: string | null;
}

/**
 * Uses Lovable AI Gateway to analyze the current market snapshot and surface
 * undervalued cards. Falls back to a heuristic if the AI call fails.
 */
export const getAiPicks = createServerFn({ method: "GET" }).handler(async (): Promise<AiPicksResult> => {
  let cards: UnifiedCard[] = [];
  try {
    cards = await fetchAllTopCards();
  } catch (err) {
    console.error("[ai-picks] failed to load cards", err);
    return { picks: [], generatedAt: new Date().toISOString(), error: "Could not load market data" };
  }

  // Candidate pool: down or flat in last 24h, but real market price > $5
  const candidates = cards
    .filter((c) => c.marketPrice >= 5 && c.changePct < 5)
    .slice(0, 30);

  if (candidates.length === 0) {
    return { picks: [], generatedAt: new Date().toISOString(), error: null };
  }

  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) {
    console.warn("[ai-picks] LOVABLE_API_KEY missing, using heuristic fallback");
    return { picks: heuristicPicks(candidates), generatedAt: new Date().toISOString(), error: null };
  }

  const prompt = `You are an expert TCG and sports card market analyst. Below is a snapshot of cards across Pokemon, Yu-Gi-Oh, and NBA categories with current market prices and 24h price changes.

Identify 4 cards from this list that look UNDERVALUED or are good investment opportunities right now (overlooked or mispriced relative to long-term value, not necessarily today's biggest movers). Provide a 1-sentence thesis and a signal level.

Cards:
${candidates
  .map(
    (c, i) =>
      `${i + 1}. id=${c.id} | ${c.category.toUpperCase()} | ${c.name} | market=$${c.marketPrice.toFixed(2)} | 24h=${c.changePct.toFixed(2)}% | rarity=${c.rarity ?? "n/a"}`
  )
  .join("\n")}

Respond ONLY with valid JSON in this exact shape:
{"picks":[{"cardId":"<id from list>","thesis":"<one sentence>","signal":"strong|medium|watch","upside":"<e.g. +20-35% / 90d>"}]}`;

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert card market analyst. Output only valid JSON." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      console.error("[ai-picks] gateway error", res.status, await res.text().catch(() => ""));
      return { picks: heuristicPicks(candidates), generatedAt: new Date().toISOString(), error: null };
    }

    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(content) as { picks?: Array<{ cardId: string; thesis: string; signal: string; upside: string }> };

    const picks: AiPick[] = (parsed.picks || [])
      .reduce<AiPick[]>((acc, p) => {
        const card = candidates.find((c) => c.id === p.cardId);
        if (!card) return acc;
        acc.push({
          cardId: card.id,
          cardName: card.name,
          category: card.category,
          imageUrl: card.imageUrl,
          marketPrice: card.marketPrice,
          setName: card.setName,
          rarity: card.rarity,
          releaseYear: card.releaseYear,
          thesis: p.thesis,
          signal: (["strong", "medium", "watch"].includes(p.signal) ? p.signal : "medium") as AiPick["signal"],
          upside: p.upside,
        });
        return acc;
      }, [])
      .slice(0, 4);

    if (picks.length === 0) {
      return { picks: heuristicPicks(candidates), generatedAt: new Date().toISOString(), error: null };
    }

    return { picks, generatedAt: new Date().toISOString(), error: null };
  } catch (err) {
    console.error("[ai-picks] exception", err);
    return { picks: heuristicPicks(candidates), generatedAt: new Date().toISOString(), error: null };
  }
});

function heuristicPicks(cards: UnifiedCard[]): AiPick[] {
  const down = rankByChange(cards, "down", 4);
  return down.map((c) => ({
    cardId: c.id,
    cardName: c.name,
    category: c.category,
    imageUrl: c.imageUrl,
    marketPrice: c.marketPrice,
    setName: c.setName,
    rarity: c.rarity,
    releaseYear: c.releaseYear,
    thesis: `Currently down ${Math.abs(c.changePct).toFixed(1)}% in 24h — potential mean-reversion entry on a historically liquid card.`,
    signal: "medium",
    upside: "+15-30% / 90d",
  }));
}
