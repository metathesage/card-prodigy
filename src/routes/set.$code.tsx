import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CardTile } from "@/components/CardTile";
import { fetchYugiohCardsBySet, fetchPokemonCards } from "@/lib/cards";
import type { UnifiedCard } from "@/lib/cards/types";
import { RELEASES_2026 } from "@/lib/cards/releaseData";
import { ArrowLeft, Star, Zap } from "lucide-react";

export const Route = createFileRoute("/set/$code")({
  head: ({ params }) => ({
    meta: [
      { title: `Set ${params.code} — VAULT` },
      { name: "description", content: "Set details, card list, chase cards, and prices." },
    ],
  }),
  component: SetDetailPage,
});

function SetDetailPage() {
  const router = useRouter();
  const { code } = Route.useParams();
  const [cards, setCards] = useState<UnifiedCard[]>([]);
  const [loading, setLoading] = useState(true);

  const release = RELEASES_2026.find(
    (r) => r.name.toLowerCase().replace(/[^a-z0-9]/g, "-") === code || r.name === decodeURIComponent(code),
  );

  useEffect(() => {
    setLoading(true);
    // Try loading cards for this set
    const load = async () => {
      try {
        // For Yu-Gi-Oh sets, use the set code to fetch cards
        const ygoCards = await fetchYugiohCardsBySet(decodeURIComponent(code), 48).catch(() => []);
        if (ygoCards.length > 0) {
          setCards(ygoCards);
          return;
        }
        // For Pokemon sets, try searching by set name
        const name = release?.name || decodeURIComponent(code);
        const pokeCards = await fetchPokemonCards({ query: `set.name:"${name}"`, pageSize: 48 }).catch(() => []);
        if (pokeCards.length > 0) {
          setCards(pokeCards);
          return;
        }
        setCards([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code, release?.name]);

  const regionLabel = release?.region === "JP" ? "Japanese" : "English";
  const isUpcoming = release?.releaseDate ? new Date(release.releaseDate) > new Date() : false;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] w-full px-6 lg:px-10 py-12 flex-1">
        <button
          onClick={() => router.history.back()}
          className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground hover:text-iris transition mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={12} /> Back
        </button>

        {/* Set Header */}
        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {release?.category && (
                <span
                  className={`font-mono text-[9px] tracking-[0.3em] uppercase px-2 py-0.5 ${
                    release.category === "pokemon"
                      ? "text-iris bg-iris/10"
                      : release.category === "yugioh"
                      ? "text-bull bg-bull/10"
                      : "text-platinum bg-platinum/10"
                  }`}
                >
                  {release.category}
                </span>
              )}
              {release?.region && (
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground bg-foreground/5 px-2 py-0.5">
                  {regionLabel}
                </span>
              )}
              {isUpcoming && (
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-chase bg-chase/10 px-2 py-0.5 flex items-center gap-1">
                  <Zap size={8} /> Upcoming
                </span>
              )}
            </div>

            <h1 className="font-mono text-3xl md:text-5xl tracking-tight mb-4">
              {release?.name || decodeURIComponent(code)}
            </h1>

            {release?.description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mb-6">
                {release.description}
              </p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline">
              {release?.releaseDate && (
                <div className="surface-1 p-4">
                  <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-1">Release</div>
                  <div className="font-mono text-sm">
                    {new Date(release.releaseDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              )}
              {release?.totalCards && (
                <div className="surface-1 p-4">
                  <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-1">Total Cards</div>
                  <div className="font-mono text-sm">{release.totalCards}</div>
                </div>
              )}
              <div className="surface-1 p-4">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-1">Cards Loaded</div>
                <div className="font-mono text-sm">{cards.length}</div>
              </div>
              <div className="surface-1 p-4">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-1">Region</div>
                <div className="font-mono text-sm">{regionLabel}</div>
              </div>
            </div>
          </div>

          {/* Chase Cards Sidebar */}
          {release?.chaseCards && release.chaseCards.length > 0 && (
            <div className="lg:col-span-4">
              <div className="glass p-6 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <Star size={14} className="text-chase" />
                  <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-chase">
                    Chase Cards
                  </div>
                </div>
                <h3 className="font-mono text-lg tracking-tight mb-4">Most Wanted</h3>
                <div className="space-y-3">
                  {release.chaseCards.map((cc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 surface-1 rounded-lg hover:bg-surface-2 transition animate-fade-up"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-chase/10 flex items-center justify-center flex-shrink-0">
                        <Star size={12} className="text-chase" />
                      </div>
                      <div className="font-mono text-xs line-clamp-2">{cc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card List */}
        <section className="mb-8">
          <div className="flex items-end justify-between mb-6">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                Card Gallery
              </div>
              <h2 className="font-mono text-2xl tracking-tight">All Cards in Set</h2>
            </div>
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
              {cards.length} cards
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-hairline">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="surface-1 aspect-[3/4] animate-shimmer" />
              ))}
            </div>
          ) : cards.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-hairline stagger-children">
              {cards.map((c) => (
                <CardTile key={c.id} card={c} />
              ))}
            </div>
          ) : (
            <div className="glass p-16 text-center rounded-lg">
              <div className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">
                {isUpcoming ? "Not yet released" : "No cards loaded"}
              </div>
              <p className="text-sm text-muted-foreground">
                {isUpcoming
                  ? "Card data will appear after the set releases."
                  : "Card data for this set is not yet available through the API."}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
