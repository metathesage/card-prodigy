import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CardTile } from "@/components/CardTile";
import { fetchTopCards, searchCards } from "@/lib/cards";
import type { UnifiedCard, CardCategory } from "@/lib/cards/types";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse the Card Index — Lustre" },
      {
        name: "description",
        content:
          "Explore live prices for Pokemon, Yu-Gi-Oh, and NBA cards. Search, filter by category, and dive into individual card analytics.",
      },
      { property: "og:title", content: "Browse the Card Index — Lustre" },
      {
        property: "og:description",
        content: "Search live card prices across Pokemon, Yu-Gi-Oh, and NBA on Lustre.",
      },
    ],
  }),
  component: BrowsePage,
});

const TABS: { id: CardCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pokemon", label: "Pokemon" },
  { id: "yugioh", label: "Yu-Gi-Oh" },
  { id: "nba", label: "NBA" },
];

function BrowsePage() {
  const [tab, setTab] = useState<CardCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [cards, setCards] = useState<UnifiedCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      try {
        if (query.trim()) {
          const cat = tab === "all" ? undefined : tab;
          const out = await searchCards(query, cat);
          setCards(out);
        } else if (tab === "all") {
          const [p, y, n] = await Promise.all([
            fetchTopCards("pokemon", 16).catch(() => []),
            fetchTopCards("yugioh", 16).catch(() => []),
            fetchTopCards("nba").catch(() => []),
          ]);
          setCards([...p, ...y, ...n]);
        } else {
          setCards(await fetchTopCards(tab, 36));
        }
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(load, query ? 350 : 0);
    return () => clearTimeout(t);
  }, [tab, query]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <div className="hairline-b">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
            Section 02 — Browse
          </div>
          <h1 className="font-mono text-4xl md:text-6xl tracking-tight mb-8">
            The <span className="text-iris">Index</span>
          </h1>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by card name…"
                className="w-full bg-transparent border border-border focus:border-iris outline-none px-4 py-3 text-sm font-mono placeholder:text-muted-foreground/60 transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
                ⌘K
              </span>
            </div>

            <div className="flex gap-px bg-hairline">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-5 py-3 text-[10px] font-mono uppercase tracking-[0.25em] transition ${
                    tab === t.id
                      ? "bg-foreground text-background"
                      : "surface-1 hover:bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1400px] px-6 lg:px-10 py-12 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-hairline">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="surface-1 aspect-[3/4] animate-shimmer" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="surface-1 p-16 text-center">
            <div className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground">
              No results for "{query}"
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-hairline">
            {cards.map((c) => (
              <CardTile key={c.id} card={c} />
            ))}
          </div>
        )}

        <div className="mt-16 hairline pt-8 text-center">
          <Link
            to="/"
            className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground hover:text-iris transition"
          >
            ← Back to Index
          </Link>
        </div>
      </main>
    </div>
  );
}
