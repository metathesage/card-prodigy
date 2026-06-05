import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CardTile } from "@/components/CardTile";
import { fetchTopCards, searchCards } from "@/lib/cards";
import type { UnifiedCard, CardCategory } from "@/lib/cards/types";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";

export const Route = createFileRoute("/browse")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: (search.tab as CardCategory | "all") || "all",
    query: (search.query as string) || "",
    sort: (search.sort as string) || "price_desc",
    priceMin: search.priceMin ? Number(search.priceMin) : undefined,
    priceMax: search.priceMax ? Number(search.priceMax) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Browse the Index — VAULT" },
      {
        name: "description",
        content:
          "Explore live prices for Pokemon, Yu-Gi-Oh, and NBA cards. Search, filter by category, and dive into individual card analytics.",
      },
      { property: "og:title", content: "Browse the Index — VAULT" },
      {
        property: "og:description",
        content: "Search live card prices across Pokemon, Yu-Gi-Oh, and NBA on VAULT.",
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

const SORT_OPTIONS = [
  { id: "price_desc", label: "Price: High to Low" },
  { id: "price_asc", label: "Price: Low to High" },
  { id: "change_desc", label: "24h Change: Up" },
  { id: "change_asc", label: "24h Change: Down" },
  { id: "name_asc", label: "Name: A-Z" },
];

function sortCards(cards: UnifiedCard[], sortId: string): UnifiedCard[] {
  const arr = [...cards];
  switch (sortId) {
    case "price_desc":
      return arr.sort((a, b) => b.marketPrice - a.marketPrice);
    case "price_asc":
      return arr.sort((a, b) => a.marketPrice - b.marketPrice);
    case "change_desc":
      return arr.sort((a, b) => b.changePct - a.changePct);
    case "change_asc":
      return arr.sort((a, b) => a.changePct - b.changePct);
    case "name_asc":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return arr;
  }
}

interface SearchParams {
  tab: CardCategory | "all";
  query: string;
  sort: string;
  priceMin?: number;
  priceMax?: number;
}

function BrowsePage() {
  const router = useRouter();
  const search = Route.useSearch();

  const [tab, setTab] = useState<CardCategory | "all">(search.tab);
  const [query, setQuery] = useState(search.query);
  const [sort, setSort] = useState(search.sort);
  const [priceMin, setPriceMin] = useState(search.priceMin ?? 0);
  const [priceMax, setPriceMax] = useState(search.priceMax ?? 0);
  const [cards, setCards] = useState<UnifiedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const updateSearch = (updates: Partial<SearchParams>) => {
    const t = updates.tab !== undefined ? updates.tab : tab;
    const q = updates.query !== undefined ? updates.query : query;
    const s = updates.sort !== undefined ? updates.sort : sort;
    setTab(t);
    setQuery(q);
    setSort(s);
    router.navigate({
      to: "/browse",
      search: {
        tab: t,
        query: q,
        sort: s,
        priceMin: priceMin > 0 ? priceMin : undefined,
        priceMax: priceMax > 0 ? priceMax : undefined,
      },
    });
  };

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
            fetchTopCards("pokemon", 24).catch(() => []),
            fetchTopCards("yugioh", 24).catch(() => []),
            fetchTopCards("nba", 8).catch(() => []),
          ]);
          setCards([...p, ...y, ...n]);
        } else {
          const out = await fetchTopCards(tab, 48);
          setCards(out);
        }
      } finally {
        setLoading(false);
      }
    };
    const t = setTimeout(load, query ? 350 : 0);
    return () => clearTimeout(t);
  }, [tab, query]);

  const filtered = useMemo(() => {
    let result = cards;
    if (priceMin > 0) result = result.filter((c) => c.marketPrice >= priceMin);
    if (priceMax > 0) result = result.filter((c) => c.marketPrice <= priceMax);
    return sortCards(result, sort);
  }, [cards, sort, priceMin, priceMax]);

  const hasFilters = priceMin > 0 || priceMax > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <div className="hairline-b">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
            Section 02 — Browse
          </div>
          <h1 className="font-mono text-4xl md:text-6xl tracking-tight mb-8">
            The <span className="text-holo">Index</span>
          </h1>

          <div className="flex flex-col gap-4 md:gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => updateSearch({ query: e.target.value })}
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
                    onClick={() => updateSearch({ tab: t.id })}
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

            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative inline-block">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="px-4 py-2.5 text-[10px] font-mono uppercase tracking-[0.2em] surface-1 hover:bg-surface-2 text-muted-foreground hover:text-foreground border border-border transition flex items-center gap-2"
                >
                  <span>{SORT_OPTIONS.find((s) => s.id === sort)?.label || "Sort"}</span>
                  <ChevronDown size={12} className={`transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                {sortOpen && (
                  <div className="absolute top-full left-0 mt-2 w-56 surface-1 border border-border z-50 shadow-lg">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          updateSearch({ sort: opt.id });
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-xs font-mono uppercase tracking-[0.1em] transition hover:bg-surface-2 ${
                          sort === opt.id ? "bg-iris/10 text-iris" : "text-muted-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className={`px-4 py-2.5 text-[10px] font-mono uppercase tracking-[0.2em] border border-border transition flex items-center gap-2 ${
                  hasFilters
                    ? "bg-iris/10 text-iris border-iris/30"
                    : "surface-1 hover:bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                <SlidersHorizontal size={12} />
                <span>Filters</span>
                {hasFilters && (
                  <span className="bg-iris text-background px-1.5 py-0.5 text-[8px] rounded-full">
                    {[priceMin > 0, priceMax > 0].filter(Boolean).length}
                  </span>
                )}
              </button>

              {hasFilters && (
                <button
                  onClick={() => {
                    setPriceMin(0);
                    setPriceMax(0);
                  }}
                  className="px-3 py-2 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition flex items-center gap-1.5"
                >
                  <X size={10} /> Clear
                </button>
              )}

              <div className="ml-auto font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
                {filtered.length} cards
              </div>
            </div>

            {filterOpen && (
              <div className="surface-1 border border-border p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground block mb-2">
                    Min Price ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={priceMin || ""}
                    onChange={(e) => setPriceMin(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full bg-transparent border border-border px-3 py-2 font-mono text-sm outline-none focus:border-iris transition"
                  />
                </div>
                <div>
                  <label className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground block mb-2">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={priceMax || ""}
                    onChange={(e) => setPriceMax(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="No limit"
                    className="w-full bg-transparent border border-border px-3 py-2 font-mono text-sm outline-none focus:border-iris transition"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1400px] px-6 lg:px-10 py-12 flex-1">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="surface-1 aspect-[3/4] animate-shimmer rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="surface-1 p-16 text-center">
            <div className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground">
              No results for "{query}"
              {hasFilters && " with current filters"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 stagger-children">
            {filtered.map((c) => (
              <CardTile key={c.id} card={c} />
            ))}
          </div>
        )}

        <div className="mt-16 hairline pt-8 text-center">
          <button
            onClick={() => router.history.back()}
            className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground hover:text-iris transition"
          >
            ← Back
          </button>
        </div>
      </main>
    </div>
  );
}
