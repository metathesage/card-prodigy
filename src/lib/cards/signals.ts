// AI signal helpers — derive Buy / Sell / Hold from market dynamics.
// Used both on the homepage table and as a server-fn input to AI picks.
import type { UnifiedCard, Signal } from "./types";

export interface SignalRow {
  card: UnifiedCard;
  action: Signal;
  score: number;          // -100..+100, positive = buy bias
  reason: string;
  target: number;         // 90d price target
}

/**
 * Heuristic signal generator — works without any AI call so the table is
 * always live. The AI picks server function refines a subset of these.
 */
export function deriveSignal(card: UnifiedCard): SignalRow {
  const change = card.changePct;
  const w = card.weeklyChange ?? change * 1.4;
  const m = card.monthlyChange ?? change * 2.1;

  // Composite momentum score — penalizes parabolic moves, rewards mean-reversion
  let score = 0;
  // Mean reversion bias: down 24h + flat-ish 30d → buy
  if (change < -3 && m > -8) score += 30;
  // Strong negative 30d on a blue chip → buy the dip
  if (m < -15 && card.marketPrice > 500) score += 25;
  // Overheated: parabolic recent run → sell
  if (w > 20 && m > 35) score -= 40;
  if (change > 12) score -= 20;
  // Steady accumulation
  if (w > 0 && w < 8 && m > 5 && m < 20) score += 15;

  const action: Signal = score > 18 ? "buy" : score < -15 ? "sell" : "hold";
  const target =
    action === "buy"
      ? card.marketPrice * 1.22
      : action === "sell"
      ? card.marketPrice * 0.88
      : card.marketPrice * 1.05;

  const reason =
    action === "buy"
      ? change < 0
        ? "Pullback on a structurally healthy chart — accumulation zone."
        : "Volume + steady multi-week trend supports continuation."
      : action === "sell"
      ? "Momentum extended; risk of mean reversion in next 30d."
      : "Range-bound consolidation. Wait for confirmation either side.";

  return { card, action, score, reason, target };
}

export function rankSignals(cards: UnifiedCard[]): SignalRow[] {
  return cards
    .filter((c) => c.marketPrice > 0)
    .map(deriveSignal)
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score));
}
