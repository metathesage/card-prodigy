import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { PriceChart } from "@/components/PriceChart";
import { fetchCardById, getPriceHistory } from "@/lib/cards";
import { fetchRecentSales } from "@/lib/cards/ebayService";
import { deriveSignal } from "@/lib/cards/signals";
import type { UnifiedCard, RecentSale } from "@/lib/cards/types";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/card/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Card ${params.id} — VAULT` },
      { name: "description", content: "Live price chart, recent sales, and analytics for this card on VAULT." },
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
  const signal = deriveSignal(card);
  const isPhoto = card.category === "nba";

  // Grade premium estimate
  const gradePremium = {
    "PSA 10": 1.0,
    "PSA 9": 0.42,
    "BGS 9.5": 0.78,
    "Raw NM": 0.18,
  };

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
            <div className={`relative aspect-[3/4] surface-1 overflow-hidden ${isPhoto ? "p-6" : ""}`}>
              {isPhoto && (
                <div className="absolute inset-x-0 top-0 px-4 py-2 bg-background/90 backdrop-blur-sm flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] z-10">
                  <span className="text-iris">{card.popGrade ?? "PSA 10"}</span>
                  <span className="text-muted-foreground">{card.releaseYear}</span>
                </div>
              )}
              <img src={card.imageUrl} alt={card.name} className={`w-full h-full ${isPhoto ? "object-contain" : "object-contain"}`} />
              {isPhoto && (
                <div className="absolute inset-x-0 bottom-0 px-4 py-2 bg-background/90 backdrop-blur-sm font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground text-center z-10">
                  {card.setName}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-iris bg-iris/10 px-2 py-0.5">
                  {card.category}
                </span>
                {card.rarity && (
                  <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                    {card.rarity}
                  </span>
                )}
                {card.number && (
                  <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground">
                    {card.number}
                  </span>
                )}
                <SignalChip action={signal.action} />
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline mt-6">
                <Stat label="24h Low" value={card.low ? `$${card.low.toFixed(2)}` : "—"} />
                <Stat label="24h High" value={card.high ? `$${card.high.toFixed(2)}` : "—"} />
                <Stat label="7d" value={card.weeklyChange != null ? `${card.weeklyChange >= 0 ? "+" : ""}${card.weeklyChange.toFixed(1)}%` : "—"} tone={(card.weeklyChange ?? 0) >= 0 ? "bull" : "bear"} />
                <Stat label="30d" value={card.monthlyChange != null ? `${card.monthlyChange >= 0 ? "+" : ""}${card.monthlyChange.toFixed(1)}%` : "—"} tone={(card.monthlyChange ?? 0) >= 0 ? "bull" : "bear"} />
              </div>
            </div>

            {/* AI Signal */}
            <div className="surface-1 p-6 hairline relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 dither-fine text-iris opacity-10 pointer-events-none" />
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-iris mb-2">VAULT Signal · 90d</div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-3xl uppercase tracking-tight">{signal.action}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                      Score {signal.score >= 0 ? "+" : ""}{signal.score}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{signal.reason}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-1">Target</div>
                  <div className="font-mono text-2xl tabular-nums text-iris">${signal.target.toFixed(2)}</div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.3em] mt-1 text-muted-foreground">
                    {(((signal.target - card.marketPrice) / card.marketPrice) * 100).toFixed(1)}% upside
                  </div>
                </div>
              </div>
            </div>

            <AddToPortfolio card={card} />
          </div>
        </div>

        {/* Set / Premium details */}
        <section className="grid md:grid-cols-3 gap-px bg-hairline mb-8">
          <DetailCard label="Set" value={card.setName ?? "—"} />
          <DetailCard label="Card Number" value={card.number ?? "—"} />
          <DetailCard label="Release Year" value={card.releaseYear ? String(card.releaseYear) : "—"} />
          <DetailCard label="Rarity" value={card.rarity ?? "—"} />
          <DetailCard label="Population" value={card.population ? card.population.toLocaleString() : "—"} sub={card.popGrade} />
          <DetailCard label="Category" value={card.category.toUpperCase()} />
        </section>

        {/* Grade Premiums */}
        {card.population != null && (
          <section className="surface-1 p-6 md:p-8 mb-8">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
              Grade Premium Matrix
            </div>
            <h2 className="font-mono text-2xl tracking-tight mb-6">Estimated value by grade</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline">
              {Object.entries(gradePremium).map(([grade, mult]) => {
                const value = card.marketPrice * mult;
                const isCurrent = card.popGrade === grade;
                return (
                  <div key={grade} className={`p-5 ${isCurrent ? "bg-iris/5 border border-iris/40" : "surface-1"}`}>
                    <div className={`font-mono text-[10px] tracking-[0.3em] uppercase mb-2 ${isCurrent ? "text-iris" : "text-muted-foreground"}`}>
                      {grade} {isCurrent && "· current"}
                    </div>
                    <div className="font-mono text-2xl tabular-nums">${value.toFixed(2)}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

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
            * eBay Marketplace Insights connection pending — comps modeled from market value.
          </p>
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "bull" | "bear" }) {
  const color = tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : "";
  return (
    <div className="surface-1 p-4">
      <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground mb-1">{label}</div>
      <div className={`font-mono text-base tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function DetailCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="surface-1 p-5">
      <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">{label}</div>
      <div className="font-mono text-base">{value}</div>
      {sub && <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-iris mt-1">{sub}</div>}
    </div>
  );
}

function SignalChip({ action }: { action: "buy" | "sell" | "hold" }) {
  const styles = {
    buy: "text-bull bg-bull/10 border-bull/30",
    sell: "text-bear bg-bear/10 border-bear/30",
    hold: "text-muted-foreground bg-foreground/5 border-foreground/20",
  } as const;
  return (
    <span className={`font-mono text-[9px] tracking-[0.3em] uppercase px-2 py-0.5 border ${styles[action]}`}>
      {action}
    </span>
  );
}

function AddToPortfolio({ card }: { card: UnifiedCard }) {
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState(card.marketPrice);

  const add = async () => {
    if (!user) return;
    setAdding(true);
    const { error } = await supabase.from("portfolio_items").insert({
      user_id: user.id,
      card_id: card.id,
      card_category: card.category,
      card_name: card.name,
      card_image_url: card.imageUrl,
      quantity: qty,
      purchase_price: price,
      purchase_date: new Date().toISOString().slice(0, 10),
    });
    setAdding(false);
    if (error) {
      toast.error(`Failed to add: ${error.message}`);
    } else {
      toast.success(`${qty}× ${card.name} added to vault`);
    }
  };

  if (!user) {
    return (
      <Link
        to="/auth"
        className="block text-center w-full px-6 py-4 text-[10px] font-mono uppercase tracking-[0.3em] border border-border hover:border-iris hover:text-iris transition"
      >
        Sign in to add to vault
      </Link>
    );
  }

  return (
    <div className="surface-1 p-6 hairline space-y-4">
      <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">Add to Vault</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground block mb-1.5">Quantity</label>
          <div className="flex items-stretch border border-border">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="px-3 surface-2 hover:bg-surface-3 font-mono text-sm transition"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 bg-transparent text-center font-mono tabular-nums outline-none text-sm py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              className="px-3 surface-2 hover:bg-surface-3 font-mono text-sm transition"
            >
              +
            </button>
          </div>
        </div>
        <div>
          <label className="font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground block mb-1.5">Cost / unit ($)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={price}
            onChange={(e) => setPrice(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full bg-transparent border border-border px-3 py-2 font-mono tabular-nums text-sm outline-none focus:border-iris transition"
          />
        </div>
      </div>
      <div className="flex items-center justify-between font-mono text-xs pt-1">
        <span className="text-muted-foreground tracking-[0.2em] uppercase text-[9px]">Total Cost Basis</span>
        <span className="tabular-nums text-iris">${(qty * price).toFixed(2)}</span>
      </div>
      <button
        onClick={add}
        disabled={adding}
        className="w-full px-6 py-4 text-[10px] font-mono uppercase tracking-[0.3em] bg-foreground text-background hover:opacity-90 transition disabled:opacity-50"
      >
        {adding ? "Adding…" : `Add ${qty} to Vault`}
      </button>
    </div>
  );
}
