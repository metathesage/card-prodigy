// AI signal helpers — derive Buy / Sell / Hold from market dynamics.
import type { UnifiedCard, Signal, ValueAssessment } from "./types";

export interface SignalRow {
  card: UnifiedCard;
  action: Signal;
  score: number;          // -100..+100, positive = buy bias
  reason: string;
  target: number;         // 90d price target
}

/**
 * Compute value assessment: undervalued / fair / overvalued
 * Uses a composite of momentum, mean-reversion, and price position relative to range.
 */
export function assessValue(card: UnifiedCard): ValueAssessment {
  const change = card.changePct;
  const w = card.weeklyChange ?? change * 1.4;
  const m = card.monthlyChange ?? change * 2.1;

  // Score: positive = undervalued, negative = overvalued
  let score = 0;

  // Price near 24h low suggests undervaluation
  if (card.low && card.marketPrice <= card.low * 1.05) score += 20;
  // Price near 24h high suggests overvaluation
  if (card.high && card.marketPrice >= card.high * 0.95) score -= 20;

  // Strong negative momentum + price still falling = oversold = undervalued
  if (change < -5 && m < -10) score += 30;
  if (change < -3 && w < 0) score += 15;

  // Strong positive momentum extended = overvalued
  if (change > 8 && m > 20) score -= 30;
  if (change > 5 && w > 15) score -= 20;

  // Mean reversion: recent pullback on otherwise stable card = buy
  if (change < -2 && m > -5 && card.marketPrice > 100) score += 15;

  // Extended run on low-liquidity card = risky
  if (change > 10 && card.marketPrice < 50) score -= 15;

  // Weekly flat but monthly positive = steady accumulation, slight undervalued
  if (Math.abs(w) < 3 && m > 5) score += 10;

  if (score > 15) return "undervalued";
  if (score < -15) return "overvalued";
  return "fair";
}

/**
 * Heuristic signal generator — works without any AI call.
 */
export function deriveSignal(card: UnifiedCard): SignalRow {
  const change = card.changePct;
  const w = card.weeklyChange ?? change * 1.4;
  const m = card.monthlyChange ?? change * 2.1;

  let score = 0;
  if (change < -3 && m > -8) score += 30;
  if (m < -15 && card.marketPrice > 500) score += 25;
  if (w > 20 && m > 35) score -= 40;
  if (change > 12) score -= 20;
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
