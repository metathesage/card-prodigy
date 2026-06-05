import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchAllSets } from "@/lib/cards";
import type { CardCategory } from "@/lib/cards/types";
import { RELEASES_2026, type ReleaseEntry } from "@/lib/cards/releaseData";
import { Calendar, Star, Zap, ArrowRight, Globe, ListFilter as Filter } from "lucide-react";

export const Route = createFileRoute("/releases")({
  head: () => ({
    meta: [
      { title: "Release Calendar — VAULT" },
      { name: "description", content: "Upcoming and recent TCG releases for Pokemon and Yu-Gi-Oh, including Japanese sets." },
      { property: "og:title", content: "Release Calendar — VAULT" },
    ],
  }),
  component: ReleasesPage,
});

type Tab = "all" | "pokemon" | "yugioh" | "other";
type RegionFilter = "all" | "EN" | "JP";

function ReleasesPage() {
  const router = useRouter();
  const [apiSets, setApiSets] = useState<Array<{ name: string; code: string; category: CardCategory; releaseDate?: string }>>([]);
  const [tab, setTab] = useState<Tab>("all");
  const [region, setRegion] = useState<RegionFilter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSets()
      .then((data) => setApiSets(data.slice(0, 50)))
      .catch(() => setApiSets([]))
      .finally(() => setLoading(false));
  }, []);

  const allReleases = useMemo(() => {
    return RELEASES_2026;
  }, []);

  const filtered = useMemo(() => {
    let result = allReleases;
    if (tab !== "all") result = result.filter((r) => r.category === tab);
    if (region !== "all") result = result.filter((r) => r.region === region);
    return result.sort((a, b) => {
      const dA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dB - dA;
    });
  }, [allReleases, tab, region]);

  const upcoming = useMemo(
    () => filtered.filter((s) => s.releaseDate && new Date(s.releaseDate) >= new Date()),
    [filtered],
  );

  const recent = useMemo(
    () => filtered.filter((s) => s.releaseDate && new Date(s.releaseDate) < new Date()),
    [filtered],
  );

  const months = useMemo(() => {
    const map = new Map<string, ReleaseEntry[]>();
    upcoming.forEach((r) => {
      if (!r.releaseDate) return;
      const d = new Date(r.releaseDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(r);
    });
    return map;
  }, [upcoming]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <div className="hairline-b">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3 flex items-center gap-3">
            <span className="w-12 h-px bg-iris" />
            Section 03 — Calendar
          </div>
          <h1 className="font-mono text-4xl md:text-6xl tracking-tight mb-2">
            Release <span className="text-holo">Calendar</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mb-8">
            Upcoming and recent TCG releases across Pokemon and Yu-Gi-Oh — including Japanese OCG sets. Chase cards highlighted per drop.
          </p>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex gap-px bg-hairline">
              {(["all", "pokemon", "yugioh", "other"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-5 py-3 text-[10px] font-mono uppercase tracking-[0.25em] transition ${
                    tab === t
                      ? "bg-iris text-background"
                      : "surface-1 hover:bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "all" ? "All" : t === "pokemon" ? "Pokemon" : t === "yugioh" ? "Yu-Gi-Oh" : "Other"}
                </button>
              ))}
            </div>

            <div className="flex gap-px bg-hairline">
              {(["all", "EN", "JP"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={`px-4 py-3 text-[10px] font-mono uppercase tracking-[0.2em] transition flex items-center gap-1.5 ${
                    region === r
                      ? "bg-lavender/20 text-lavender"
                      : "surface-1 hover:bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r === "JP" && <Globe size={10} />}
                  {r === "all" ? "Global" : r}
                </button>
              ))}
            </div>

            <div className="ml-auto font-mono text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              {filtered.length} releases
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1400px] px-6 lg:px-10 py-12 flex-1 space-y-16">
        {/* Upcoming — Grouped by Month */}
        {months.size > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Calendar size={18} className="text-iris" />
              <h2 className="font-mono text-2xl md:text-3xl tracking-tight">Upcoming Releases</h2>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-iris bg-iris/10 px-2 py-0.5 animate-glow rounded">
                {upcoming.length}
              </span>
            </div>

            {Array.from(months.entries()).map(([monthLabel, releases]) => (
              <div key={monthLabel} className="mb-12">
                <h3 className="font-mono text-lg tracking-[0.1em] uppercase text-lavender mb-4 flex items-center gap-2">
                  <span className="w-8 h-px bg-iris" />
                  {monthLabel}
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
                  {releases.map((r) => (
                    <ReleaseCard key={`${r.name}-${r.region}`} release={r} />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Recently Released */}
        {recent.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <ArrowRight size={18} className="text-platinum" />
              <h2 className="font-mono text-2xl md:text-3xl tracking-tight">Recently Released</h2>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground bg-foreground/5 px-2 py-0.5 rounded">
                {recent.length}
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {recent.map((r) => (
                <ReleaseCard key={`${r.name}-${r.region}`} release={r} />
              ))}
            </div>
          </section>
        )}

        {/* API Sets from YGOPRODeck / Pokemon TCG API */}
        {!loading && apiSets.length > 0 && tab !== "pokemon" && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Filter size={16} className="text-muted-foreground" />
              <h2 className="font-mono text-2xl tracking-tight">All Sets in Database</h2>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                {apiSets.length}
              </span>
            </div>
            <div className="glass rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground border-b border-hairline">
                    <th className="text-left py-3 px-4 font-normal">Set</th>
                    <th className="text-left py-3 px-4 font-normal">Category</th>
                    <th className="text-left py-3 px-4 font-normal">Release Date</th>
                  </tr>
                </thead>
                <tbody>
                  {apiSets.slice(0, 30).map((s) => (
                    <tr key={`${s.category}-${s.code}`} className="border-b border-hairline hover:bg-surface-2/50 transition">
                      <td className="py-3 px-4">
                        <Link
                          to="/set/$code"
                          params={{ code: s.code }}
                          className="font-mono text-xs hover:text-iris transition"
                        >
                          {s.name}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded ${
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="glass p-16 text-center rounded-lg">
            <div className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground">
              No releases found for this filter combination
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ReleaseCard({ release }: { release: ReleaseEntry }) {
  const router = useRouter();
  const daysUntil = release.releaseDate
    ? Math.ceil((new Date(release.releaseDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isUpcoming = daysUntil !== null && daysUntil > 0;
  const slug = release.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");

  return (
    <button
      onClick={() => router.navigate({ to: "/set/$code", params: { code: slug } })}
      className="glass p-5 rounded-lg text-left hover:shadow-lg hover:ring-1 hover:ring-iris/30 transition-all duration-300 group animate-fade-up"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 rounded ${
              release.category === "pokemon"
                ? "text-iris bg-iris/10"
                : release.category === "yugioh"
                ? "text-bull bg-bull/10"
                : "text-platinum bg-platinum/10"
            }`}
          >
            {release.category === "yugioh" ? "YGO" : release.category}
          </span>
          {release.region === "JP" && (
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-lavender bg-lavender/10 px-2 py-0.5 rounded flex items-center gap-1">
              <Globe size={8} /> JP
            </span>
          )}
        </div>
        {isUpcoming && daysUntil !== null && (
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-chase bg-chase/10 px-2 py-0.5 rounded flex items-center gap-1">
            <Zap size={8} /> {daysUntil}d
          </span>
        )}
      </div>

      <h3 className="font-mono text-sm group-hover:text-iris transition mb-2 line-clamp-2 leading-snug">
        {release.name}
      </h3>

      {release.description && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {release.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {release.releaseDate
            ? new Date(release.releaseDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "TBD"}
        </span>
        {release.totalCards && (
          <span className="font-mono text-[10px] text-muted-foreground">
            {release.totalCards} cards
          </span>
        )}
      </div>

      {release.chaseCards && release.chaseCards.length > 0 && (
        <div className="mt-3 pt-3 border-t border-hairline">
          <div className="flex items-center gap-1.5 mb-2">
            <Star size={10} className="text-chase" />
            <span className="font-mono text-[8px] tracking-[0.2em] uppercase text-chase">Chase</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {release.chaseCards.slice(0, 3).map((cc, i) => (
              <span
                key={i}
                className="font-mono text-[9px] text-muted-foreground bg-surface-2 px-2 py-0.5 rounded line-clamp-1"
              >
                {cc}
              </span>
            ))}
            {release.chaseCards.length > 3 && (
              <span className="font-mono text-[9px] text-iris">+{release.chaseCards.length - 3} more</span>
            )}
          </div>
        </div>
      )}
    </button>
  );
}
