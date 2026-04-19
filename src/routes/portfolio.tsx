import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { fetchCardById } from "@/lib/cards";
import type { UnifiedCard } from "@/lib/cards/types";
import { toast } from "sonner";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — Lustre" },
      { name: "description", content: "Track the value of your card collection in real time." },
      { property: "og:title", content: "Portfolio — Lustre" },
      { property: "og:description", content: "Real-time portfolio analytics for your card collection." },
    ],
  }),
  component: PortfolioPage,
});

interface PortfolioRow {
  id: string;
  card_id: string;
  card_category: string;
  card_name: string;
  card_image_url: string | null;
  quantity: number;
  purchase_price: number | null;
  purchase_date: string | null;
}

interface ValuedRow extends PortfolioRow {
  current?: UnifiedCard | null;
}

function PortfolioPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [rows, setRows] = useState<ValuedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/portfolio" } });
      return;
    }
    loadPortfolio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const loadPortfolio = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("portfolio_items")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const items = (data ?? []) as PortfolioRow[];
    // Look up current prices in parallel
    const valued = await Promise.all(
      items.map(async (r) => ({
        ...r,
        current: await fetchCardById(r.card_id).catch(() => null),
      }))
    );
    setRows(valued);
    setLoading(false);
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("portfolio_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Removed");
      setRows((r) => r.filter((x) => x.id !== id));
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col">
        <SiteHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="font-mono text-xs tracking-[0.4em] uppercase text-muted-foreground">
            Loading…
          </div>
        </div>
      </div>
    );
  }

  const totalCost = rows.reduce((s, r) => s + (r.purchase_price ?? 0) * r.quantity, 0);
  const totalValue = rows.reduce(
    (s, r) => s + (r.current?.marketPrice ?? r.purchase_price ?? 0) * r.quantity,
    0
  );
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const up = pnl >= 0;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <div className="hairline-b">
        <div className="mx-auto max-w-[1400px] w-full px-6 lg:px-10 py-12">
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
            Vault — Portfolio
          </div>
          <h1 className="font-mono text-4xl md:text-6xl tracking-tight">
            Your <span className="text-iris">collection</span>
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] w-full px-6 lg:px-10 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline mb-8">
          <SummaryStat label="Items" value={String(rows.reduce((s, r) => s + r.quantity, 0))} />
          <SummaryStat label="Cost Basis" value={`$${totalCost.toFixed(2)}`} />
          <SummaryStat label="Market Value" value={`$${totalValue.toFixed(2)}`} tone="iris" />
          <SummaryStat
            label="Unrealized P&L"
            value={`${up ? "+" : ""}$${pnl.toFixed(2)} · ${up ? "+" : ""}${pnlPct.toFixed(2)}%`}
            tone={up ? "bull" : "bear"}
          />
        </div>

        {loading ? (
          <div className="space-y-px bg-hairline">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="surface-1 h-24 animate-shimmer" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="surface-1 p-16 text-center">
            <div className="font-mono text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Empty vault
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Browse the index and add your first card.
            </p>
            <Link
              to="/browse"
              className="inline-block px-6 py-3 text-[10px] font-mono uppercase tracking-[0.3em] bg-foreground text-background hover:opacity-90 transition"
            >
              Browse cards
            </Link>
          </div>
        ) : (
          <div className="hairline">
            <div className="hidden md:grid grid-cols-12 gap-4 py-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground border-b border-hairline">
              <div className="col-span-5">Card</div>
              <div className="col-span-1 text-right">Qty</div>
              <div className="col-span-2 text-right">Cost</div>
              <div className="col-span-2 text-right">Market</div>
              <div className="col-span-1 text-right">P&L</div>
              <div className="col-span-1" />
            </div>
            {rows.map((r) => {
              const market = r.current?.marketPrice ?? r.purchase_price ?? 0;
              const cost = r.purchase_price ?? 0;
              const pnlRow = (market - cost) * r.quantity;
              const upRow = pnlRow >= 0;
              return (
                <div
                  key={r.id}
                  className="grid grid-cols-2 md:grid-cols-12 gap-4 items-center py-4 border-b border-hairline hover:bg-surface-2/40 transition"
                >
                  <div className="col-span-2 md:col-span-5 flex items-center gap-4">
                    {r.card_image_url && (
                      <img src={r.card_image_url} alt={r.card_name} className="w-12 h-16 object-cover bg-surface-2" />
                    )}
                    <div className="min-w-0">
                      <Link
                        to="/card/$id"
                        params={{ id: r.card_id }}
                        className="font-medium text-sm hover:text-iris transition line-clamp-1"
                      >
                        {r.card_name}
                      </Link>
                      <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                        {r.card_category}
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-1 text-right font-mono tabular-nums text-sm">×{r.quantity}</div>
                  <div className="md:col-span-2 text-right font-mono tabular-nums text-sm text-muted-foreground">
                    ${cost.toFixed(2)}
                  </div>
                  <div className="md:col-span-2 text-right font-mono tabular-nums text-sm">
                    ${market.toFixed(2)}
                  </div>
                  <div className={`md:col-span-1 text-right font-mono tabular-nums text-sm ${upRow ? "text-bull" : "text-bear"}`}>
                    {upRow ? "+" : ""}${pnlRow.toFixed(2)}
                  </div>
                  <div className="md:col-span-1 text-right">
                    <button
                      onClick={() => remove(r.id)}
                      className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-bear transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryStat({ label, value, tone }: { label: string; value: string; tone?: "iris" | "bull" | "bear" }) {
  const color = tone === "iris" ? "text-iris" : tone === "bull" ? "text-bull" : tone === "bear" ? "text-bear" : "";
  return (
    <div className="surface-1 p-5">
      <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-2">{label}</div>
      <div className={`font-mono text-2xl tabular-nums ${color}`}>{value}</div>
    </div>
  );
}
