import { useEffect, useState } from "react";
import { fetchAllTopCards } from "@/lib/cards";
import type { UnifiedCard } from "@/lib/cards/types";

export function MarketTicker() {
  const [items, setItems] = useState<UnifiedCard[]>([]);

  useEffect(() => {
    fetchAllTopCards()
      .then((cards) => setItems(cards.filter((c) => c.marketPrice > 0).slice(0, 30)))
      .catch(() => setItems([]));
  }, []);

  if (items.length === 0) {
    return (
      <div className="hairline-b h-10 bg-surface-1 flex items-center overflow-hidden">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground px-6">
          Loading market data…
        </div>
      </div>
    );
  }

  // Duplicate for seamless loop
  const loop = [...items, ...items];

  return (
    <div className="hairline-b bg-surface-1 overflow-hidden relative">
      <div className="flex animate-ticker whitespace-nowrap py-2.5">
        {loop.map((c, i) => {
          const up = c.changePct >= 0;
          return (
            <div key={`${c.id}-${i}`} className="flex items-center gap-3 px-6 font-mono text-[11px] tracking-wide border-r border-hairline">
              <span className="text-muted-foreground/60 uppercase text-[9px] tracking-[0.2em]">{c.category}</span>
              <span className="text-foreground">{c.name}</span>
              <span className="tabular-nums">${c.marketPrice.toFixed(2)}</span>
              <span className={`tabular-nums ${up ? "text-bull" : "text-bear"}`}>
                {up ? "▲" : "▼"} {Math.abs(c.changePct).toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
      {/* Edge fades */}
      <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  );
}
