import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PriceChart } from "@/components/PriceChart";
import { fetchCardById, getPriceHistory } from "@/lib/cards";
import { fetchRecentSales } from "@/lib/cards/ebayService";
import type { UnifiedCard, RecentSale } from "@/lib/cards/types";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/card/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Card ${params.id} — Lustre` },
      { name: "description", content: "Live price chart, recent sales, and analytics for this card on Lustre." },
    ],
  }),
  component: CardDetailPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="font-mono text-xs tracking-[0.4em] uppercase text-bear mb-3">Error</div>
            <p className="text-sm text-muted-foreground mb-6">{error.message}</p>
            <button
              onClick={() => { router.invalidate(); reset(); }}
              className="px-6 py-2 text-[10px] font-mono uppercase tracking-[0.3em] border border-border hover:border-iris hover:text-iris transition"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="font-mono text-xs tracking-[0.4em] uppercase text-muted-foreground mb-3">404</div>
          <p className="text-sm">Card not found.</p>
          <Link to="/browse" className="mt-6 inline-block text-[10px] font-mono uppercase tracking-[0.3em] text-iris">
            ← Back to browse
          </Link>
        </div>
      </div>
    </div>
  ),
});

function CardDetailPage() {
  const { id } = Route.useParams();
  const [card, setCard] = useState<UnifiedCard | null>(null);
  const [sales, setSales] = useState<RecentSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<7 | 30 | 90>(90);

  useEffect(() => {
    setLoading(true);
    fetchCardById(id)
      .then(async (c) => {
        setCard(c);
        if (c) {
          const s = await fetchRecentSales(c.id, c.marketPrice);
          setSales(s);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="mx-auto max-w-[1400px] w-full px-6 lg:px-10 py-12 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 surface-1 aspect-[3/4] animate-shimmer" />
          <div className="lg:col-span-7 space-y-4">
            <div className="surface-1 h-12 animate-shimmer" />
            <div className="surface-1 h-64 animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm">Card not found.</p>
            <Link to="/browse" className="mt-4 inline-block text-[10px] font-mono uppercase tracking-[0.3em] text-iris">
              ← Browse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const allHistory = getPriceHistory(card);
  const history = allHistory.slice(-period);
  const up = card.changePct >= 0;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="mx-auto max-w-[1400px] w-full px-6 lg:px-10 py-12 flex-1">
        <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-6">
          <Link to="/browse" className="hover:text-iris transition">← Browse</Link>
          <span className="mx-2 text-foreground/30">/</span>
          {card.category}
          <span className="mx-2 text-foreground/30">/</span>
          {card.id.split(":")[1]}
        </div>

        <div className="grid lg:grid-cols-12 gap-8 mb-12">
          {/* Image */}
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-4 dither-iris opacity-20 pointer-events-none -z-0" />
            <div className="relative aspect-[3/4] surface-1 overflow-hidden">
              <img src={card.imageUrl} alt={card.name} className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-iris bg-iris/10 px-2 py-0.5">
                  {card.category}
                </span>
                {card.rarity && (
                  <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                    {card.rarity}
                  </span>
                )}
              </div>
              <h1 className="font-mono text-3xl md:text-5xl tracking-tight">{card.name}</h1>
              {card.subtitle && <p className="mt-2 text-sm text-muted-foreground font-mono">{card.subtitle}</p>}
            </div>

            <div className="surface-1 p-6 hairline">
              <div className="flex items-baseline justify-between flex-wrap gap-4">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                    Market Value
                  </div>
                  <div className="font-mono text-5xl tabular-nums">${card.marketPrice.toFixed(2)}</div>
                </div>
                <div className={`font-mono text-2xl tabular-nums ${up ? "text-bull" : "text-bear"}`}>
                  {up ? "▲" : "▼"} {Math.abs(card.changePct).toFixed(2)}%
                  <div className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-1">24h</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-px bg-hairline mt-6">
                <Stat label="24h Low" value={card.low ? `$${card.low.toFixed(2)}` : "—"} />
                <Stat label="24h High" value={card.high ? `$${card.high.toFixed(2)}` : "—"} />
                <Stat label="Released" value={card.releaseYear ? String(card.releaseYear) : "—"} />
              </div>
            </div>

            <AddToPortfolio card={card} />
          </div>
        </div>

        {/* Chart */}
        <section className="surface-1 p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                Price History
              </div>
              <h2 className="font-mono text-2xl tracking-tight">{period}d Performance</h2>
            </div>
            <div className="flex gap-px bg-hairline">
              {([7, 30, 90] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 text-[10px] font-mono uppercase tracking-[0.25em] transition ${
                    period === p ? "bg-foreground text-background" : "surface-2 hover:bg-surface-3 text-muted-foreground"
                  }`}
                >
                  {p}d
                </button>
              ))}
            </div>
          </div>
          <PriceChart data={history} height={300} tone={up ? "bull" : "bear"} />
        </section>

        {/* Recent Sales */}
        <section className="surface-1 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
                eBay · Recent Comps
              </div>
              <h2 className="font-mono text-2xl tracking-tight">Recent Sales</h2>
            </div>
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
              {sales.length} comps
            </span>
          </div>
          <div className="hairline">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
                  <th className="text-left py-3 font-normal">Date</th>
                  <th className="text-left py-3 font-normal">Condition</th>
                  <th className="text-left py-3 font-normal">Source</th>
                  <th className="text-right py-3 font-normal">Sale Price</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-t border-hairline hover:bg-surface-2 transition">
                    <td className="py-3 font-mono text-xs text-muted-foreground">{s.date}</td>
                    <td className="py-3 font-mono text-xs">{s.condition}</td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">{s.source}</td>
                    <td className="py-3 font-mono text-sm tabular-nums text-right">${s.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground">
            * eBay Marketplace Insights connection pending — comps shown are modeled from market value.
          </p>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-1 p-4">
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-1">{label}</div>
      <div className="font-mono text-base tabular-nums">{value}</div>
    </div>
  );
}

function AddToPortfolio({ card }: { card: UnifiedCard }) {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);

  const add = async () => {
    if (!user) return;
    setAdding(true);
    const { error } = await supabase.from("portfolio_items").insert({
      user_id: user.id,
      card_id: card.id,
      card_category: card.category,
      card_name: card.name,
      card_image_url: card.imageUrl,
      quantity: 1,
      purchase_price: card.marketPrice,
      purchase_date: new Date().toISOString().slice(0, 10),
    });
    setAdding(false);
    if (error) {
      toast.error(`Failed to add: ${error.message}`);
    } else {
      toast.success(`${card.name} added to portfolio`);
    }
  };

  if (!user) {
    return (
      <Link
        to="/auth"
        className="block text-center w-full px-6 py-4 text-[10px] font-mono uppercase tracking-[0.3em] border border-border hover:border-iris hover:text-iris transition"
      >
        Sign in to add to portfolio
      </Link>
    );
  }

  return (
    <button
      onClick={add}
      disabled={adding}
      className="w-full px-6 py-4 text-[10px] font-mono uppercase tracking-[0.3em] bg-foreground text-background hover:opacity-90 transition disabled:opacity-50"
    >
      {adding ? "Adding…" : "Add to Portfolio"}
    </button>
  );
}
