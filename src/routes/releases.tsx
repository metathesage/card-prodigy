import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchAllSets } from "@/lib/cards";
import type { CardCategory } from "@/lib/cards/types";
import { Calendar, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/releases")({
  head: () => ({
    meta: [
      { title: "Release Calendar — VAULT" },
      {
        name: "description",
        content: "Upcoming and recent card set releases for Pokemon TCG and Yu-Gi-Oh.",
      },
      { property: "og:title", content: "Release Calendar — VAULT" },
    ],
  }),
  component: ReleasesPage,
});

type SetInfo = {
  name: string;
  code: string;
  category: CardCategory;
  releaseDate?: string;
  totalCards?: number;
};

function ReleasesPage() {
  const router = useRouter();
  const [sets, setSets] = useState<SetInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<CardCategory | "all">("all");

  useEffect(() => {
    fetchAllSets()
      .then((data) => setSets(data))
      .catch(() => setSets([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = sets;
    if (tab !== "all") result = result.filter((s) => s.category === tab);
    return result.sort((a, b) => {
      const dA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dB - dA;
    });
  }, [sets, tab]);

  const upcoming = useMemo(
    () => filtered.filter((s) => s.releaseDate && new Date(s.releaseDate) >= new Date()),
    [filtered],
  );

  const recent = useMemo(
    () => filtered.filter((s) => s.releaseDate && new Date(s.releaseDate) < new Date()),
    [filtered],
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <div className="hairline-b">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
            Section 03 — Calendar
          </div>
          <h1 className="font-mono text-4xl md:text-6xl tracking-tight mb-8">
            Release <span className="text-iris">Calendar</span>
          </h1>

          <div className="flex gap-px bg-hairline">
            {(["all", "pokemon", "yugioh"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-3 text-[10px] font-mono uppercase tracking-[0.25em] transition ${
                  tab === t
                    ? "bg-foreground text-background"
                    : "surface-1 hover:bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "all" ? "All" : t === "pokemon" ? "Pokemon" : "Yu-Gi-Oh"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1400px] px-6 lg:px-10 py-12 flex-1">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="surface-1 h-20 animate-shimmer" />
            ))}
          </div>
        ) : (
          <div className="space-y-16">
            {upcoming.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <Calendar size={16} className="text-iris" />
                  <h2 className="font-mono text-2xl md:text-3xl tracking-tight">Upcoming Releases</h2>
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-iris bg-iris/10 px-2 py-0.5">
                    {upcoming.length}
                  </span>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-hairline">
                  {upcoming.map((s) => (
                    <SetCard key={`${s.category}-${s.code}`} set={s} variant="upcoming" />
                  ))}
                </div>
              </section>
            )}

            {recent.length > 0 && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <ChevronRight size={16} className="text-muted-foreground" />
                  <h2 className="font-mono text-2xl md:text-3xl tracking-tight">Recent Releases</h2>
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground bg-foreground/5 px-2 py-0.5">
                    {recent.length}
                  </span>
                </div>
                <div className="surface-1 hairline overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground border-b border-hairline">
                        <th className="text-left py-3 px-4 font-normal">Set</th>
                        <th className="text-left py-3 px-4 font-normal">Category</th>
                        <th className="text-left py-3 px-4 font-normal">Release Date</th>
                        <th className="text-right py-3 px-4 font-normal">Cards</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.slice(0, 30).map((s) => (
                        <tr
                          key={`${s.category}-${s.code}`}
                          className="border-b border-hairline hover:bg-surface-2 transition"
                        >
                          <td className="py-3 px-4">
                            <button
                              onClick={() =>
                                router.navigate({
                                  to: "/browse",
                                  search: {
                                    tab: s.category,
                                    query: s.name,
                                    sort: "price_desc",
                                  },
                                })
                              }
                              className="font-mono text-xs hover:text-iris transition text-left"
                            >
                              {s.name}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 ${
                                s.category === "pokemon"
                                  ? "text-iris bg-iris/10"
                                  : "text-bull bg-bull/10"
                              }`}
                            >
                              {s.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-muted-foreground">
                            {s.releaseDate
                              ? new Date(s.releaseDate).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "TBD"}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs text-right text-muted-foreground">
                            {s.totalCards ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {filtered.length === 0 && (
              <div className="surface-1 p-16 text-center">
                <div className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground">
                  No sets found for this category
                </div>
              </div>
            )}
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

function SetCard({ set, variant }: { set: SetInfo; variant: "upcoming" | "recent" }) {
  const router = useRouter();
  const daysUntil = set.releaseDate
    ? Math.ceil((new Date(set.releaseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <button
      onClick={() =>
        router.navigate({
          to: "/browse",
          search: { tab: set.category, query: set.name, sort: "price_desc" },
        })
      }
      className="surface-1 p-6 text-left hover:bg-surface-2 transition group"
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 ${
            set.category === "pokemon"
              ? "text-iris bg-iris/10"
              : "text-bull bg-bull/10"
          }`}
        >
          {set.category}
        </span>
        {variant === "upcoming" && daysUntil !== null && daysUntil > 0 && (
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-iris">
            {daysUntil}d
          </span>
        )}
      </div>
      <h3 className="font-mono text-base group-hover:text-iris transition mb-2 line-clamp-2">
        {set.name}
      </h3>
      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {set.releaseDate
          ? new Date(set.releaseDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })
          : "Date TBD"}
      </div>
      {set.totalCards && (
        <div className="font-mono text-[10px] text-muted-foreground mt-1">
          {set.totalCards} cards
        </div>
      )}
    </button>
  );
}
