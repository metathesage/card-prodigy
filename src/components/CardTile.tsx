import { Link } from "@tanstack/react-router";
import type { UnifiedCard } from "@/lib/cards/types";

interface CardTileProps {
  card: UnifiedCard;
  rank?: number;
}

const FALLBACK_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400'><rect width='300' height='400' fill='%23202028'/><text x='50%25' y='50%25' fill='%23666' font-family='monospace' font-size='14' text-anchor='middle' dy='.3em'>NO IMAGE</text></svg>";

export function CardTile({ card, rank }: CardTileProps) {
  const up = card.changePct >= 0;
  const isPhoto = card.category === "nba"; // ESPN/NBA headshots — frame as slab
  return (
    <Link
      to="/card/$id"
      params={{ id: card.id }}
      className="group relative block surface-1 hairline-b border border-border/50 hover:border-iris/40 transition-all duration-300 overflow-hidden"
    >
      {/* dither corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 dither-fine text-iris opacity-20 pointer-events-none" />
      {rank !== undefined && (
        <div className="absolute top-3 left-3 z-10 font-mono text-[10px] tracking-[0.3em] text-muted-foreground bg-background/60 backdrop-blur px-2 py-1">
          {String(rank + 1).padStart(2, "0")}
        </div>
      )}
      <div className="absolute top-3 right-3 z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80 bg-background/40 backdrop-blur px-2 py-1">
        {card.category}
      </div>

      <div className={`aspect-[3/4] relative overflow-hidden ${isPhoto ? "bg-gradient-to-br from-surface-2 via-surface-1 to-surface-3" : "bg-surface-2"}`}>
        {card.imageUrl ? (
          <img
            src={card.imageUrl}
            alt={card.name}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
            }}
            className={`w-full h-full ${isPhoto ? "object-contain p-2" : "object-cover"} group-hover:scale-105 transition-transform duration-700 ease-out`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-xs">
            NO IMAGE
          </div>
        )}
        {/* Slab look for NBA player photos */}
        {isPhoto && (
          <>
            <div className="absolute inset-x-0 top-0 px-3 py-1.5 bg-background/80 backdrop-blur-sm flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.25em]">
              <span className="text-iris">{card.popGrade ?? "PSA 10"}</span>
              <span className="text-muted-foreground">{card.releaseYear ?? ""}</span>
            </div>
            <div className="absolute inset-x-0 bottom-0 px-3 py-1.5 bg-background/80 backdrop-blur-sm font-mono text-[8px] uppercase tracking-[0.25em] text-muted-foreground text-center line-clamp-1">
              {card.setName}
            </div>
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/0 to-transparent opacity-80 group-hover:opacity-60 transition" />
      </div>

      <div className="p-4 space-y-2">
        <h3 className="font-medium text-sm line-clamp-1 group-hover:text-iris transition-colors">
          {card.name}
        </h3>
        {card.subtitle && (
          <p className="text-[11px] text-muted-foreground line-clamp-1 font-mono tracking-wide">
            {card.subtitle}
          </p>
        )}
        <div className="flex items-end justify-between pt-2">
          <div>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
              Market
            </div>
            <div className="font-mono text-lg tabular-nums">
              ${card.marketPrice.toFixed(2)}
            </div>
          </div>
          <div
            className={`font-mono text-xs tabular-nums px-2 py-1 ${
              up ? "text-bull" : "text-bear"
            }`}
            style={{
              background: `color-mix(in oklab, ${up ? "var(--bull)" : "var(--bear)"} 12%, transparent)`,
            }}
          >
            {up ? "▲" : "▼"} {Math.abs(card.changePct).toFixed(2)}%
          </div>
        </div>
      </div>
    </Link>
  );
}
