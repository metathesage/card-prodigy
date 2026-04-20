import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { MarketTicker } from "@/components/MarketTicker";
import { CardTile } from "@/components/CardTile";
import { VaultMark } from "@/components/LustreMark";
import { fetchAllTopCards, rankByChange } from "@/lib/cards";
import { rankSignals } from "@/lib/cards/signals";
import type { UnifiedCard } from "@/lib/cards/types";
import { getAiPicks, type AiPick } from "@/lib/aiPicks.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VAULT — Real-time card prices, AI signals, portfolio analytics" },
      {
        name: "description",
        content:
          "Track Pokemon, Yu-Gi-Oh, and NBA card markets. Top movers, AI buy/sell/hold signals, and portfolio tools — engineered for serious collectors.",
      },
      { property: "og:title", content: "VAULT — Real-time card prices & AI signals" },
      {
        property: "og:description",
        content: "Live market data, top movers, AI investment picks, and portfolio analytics for Pokemon, Yu-Gi-Oh, and NBA cards.",
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const [cards, setCards] = useState<UnifiedCard[]>([]);
  const [aiPicks, setAiPicks] = useState<AiPick[] | null>(null);
  const [aiLoading, setAiLoading] = useState(true);

  useEffect(() => {
    fetchAllTopCards().then(setCards).catch(() => setCards([]));
    getAiPicks()
      .then((res) => setAiPicks(res.picks))
      .catch(() => setAiPicks([]))
      .finally(() => setAiLoading(false));
  }, []);

  const movers = rankByChange(cards, "up", 6);
  const losers = rankByChange(cards, "down", 6);
  const featured = cards.slice(0, 8);
  const signals = useMemo(() => rankSignals(cards).slice(0, 10), [cards]);

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <MarketTicker />

      <main className="flex-1">
        <Hero />

        <Section
          eyebrow="03 — Velocity"
          title="Top Movers · 24h"
          subtitle="Cards leading the market right now."
          right={
            <Link to="/browse" className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition">
              See all →
            </Link>
          }
        >
          <MoverGrid cards={movers} tone="bull" />
        </Section>

        <Section
          eyebrow="04 — Drawdown"
          title="Top Losers · 24h"
          subtitle="Potential entry points or names to avoid — your call."
        >
          <MoverGrid cards={losers} tone="bear" />
        </Section>

        <SignalsSection signals={signals} />

        <AiPicksSection picks={aiPicks} loading={aiLoading} />

        <Section
          eyebrow="07 — Index"
          title="Featured Cards"
          subtitle="Across Pokemon, Yu-Gi-Oh, and NBA."
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-hairline">
            {featured.map((c) => (
              <CardTile key={c.id} card={c} />
            ))}
          </div>
        </Section>

        <Footer />
      </main>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 dither-iris opacity-30 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 70% 20%, oklch(0.78 0.16 220 / 25%), transparent 60%)" }}
      />
      <div className="absolute inset-0 dither-noise opacity-[0.04] pointer-events-none" />

      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-24 md:py-36 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8 space-y-8">
            <div className="flex items-center gap-4 font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground">
              <span className="w-12 h-px bg-iris" />
              <span>Index 01 / Q4·2025</span>
            </div>

            <h1 className="font-mono text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
              The card market<br />
              <span className="text-iris">decoded</span><br />
              <span className="text-chrome">in real time.</span>
            </h1>

            <p className="max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
              Live prices, AI buy/sell/hold signals, and portfolio analytics across
              Pokemon, Yu-Gi-Oh, and NBA cards — engineered for serious collectors.
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              <Link
                to="/browse"
                className="group relative px-8 py-4 text-[10px] font-mono uppercase tracking-[0.3em] bg-foreground text-background overflow-hidden hover:opacity-95 transition"
              >
                <span className="relative z-10">Explore the index</span>
                <span className="absolute inset-0 dither-fine text-background/30 opacity-50" />
              </Link>
              <Link
                to="/portfolio"
                className="px-8 py-4 text-[10px] font-mono uppercase tracking-[0.3em] border border-border hover:border-iris/50 hover:text-iris transition"
              >
                Open your vault
              </Link>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-px hidden lg:block">
            <StatLine label="Tracked Cards" value="12,400+" tone="iris" />
            <StatLine label="Categories" value="Pokemon · YGO · NBA" />
            <StatLine label="AI Model" value="Gemini 2.5 Flash" tone="iris" />
            <StatLine label="Update Cadence" value="Real-time · 24h" />
          </div>
        </div>

        <div className="absolute right-6 lg:right-10 top-10 opacity-30 animate-float">
          <VaultMark className="w-24 h-24" />
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />
    </section>
  );
}

function StatLine({ label, value, tone }: { label: string; value: string; tone?: "iris" }) {
  return (
    <div className="surface-1 hairline-b px-5 py-4 flex items-baseline justify-between">
      <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground">{label}</span>
      <span className={`font-mono text-sm ${tone === "iris" ? "text-iris" : ""}`}>{value}</span>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  subtitle,
  right,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 md:py-24">
      <div className="flex items-end justify-between mb-10 gap-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
            {eyebrow}
          </div>
          <h2 className="font-mono text-3xl md:text-5xl tracking-tight">{title}</h2>
          {subtitle && <p className="mt-3 text-sm text-muted-foreground max-w-xl">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function MoverGrid({ cards, tone }: { cards: UnifiedCard[]; tone: "bull" | "bear" }) {
  if (cards.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-hairline">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="surface-1 aspect-[3/4] animate-shimmer" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px bg-hairline">
      {cards.map((c, i) => {
        const isPhoto = c.category === "nba";
        return (
          <Link
            key={c.id}
            to="/card/$id"
            params={{ id: c.id }}
            className="group surface-1 p-4 hover:bg-surface-2 transition relative overflow-hidden block"
          >
            <div className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground mb-3">
              {String(i + 1).padStart(2, "0")} / {c.category.toUpperCase()}
            </div>
            <div className={`aspect-[3/4] mb-3 overflow-hidden ${isPhoto ? "bg-gradient-to-br from-surface-2 to-surface-3" : "bg-surface-2"}`}>
              <img
                src={c.imageUrl}
                alt={c.name}
                loading="lazy"
                className={`w-full h-full ${isPhoto ? "object-contain p-1.5" : "object-cover"} group-hover:scale-105 transition-transform duration-500`}
              />
            </div>
            <div className="text-xs line-clamp-2 mb-1.5 group-hover:text-iris transition-colors">{c.name}</div>
            <div className="flex items-center justify-between font-mono text-[11px] tabular-nums">
              <span>${c.marketPrice.toFixed(2)}</span>
              <span className={tone === "bull" ? "text-bull" : "text-bear"}>
                {tone === "bull" ? "▲" : "▼"} {Math.abs(c.changePct).toFixed(1)}%
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function SignalsSection({ signals }: { signals: ReturnType<typeof rankSignals> }) {
  return (
    <section className="mx-auto max-w-[1400px] px-6 lg:px-10 py-16 md:py-24">
      <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
        <div>
          <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3 flex items-center gap-3">
            <span className="w-12 h-px bg-iris" />
            05 — Action
          </div>
          <h2 className="font-mono text-3xl md:text-5xl tracking-tight">
            Buy <span className="text-iris">/</span> Sell <span className="text-iris">/</span> Hold
          </h2>
          <p className="mt-3 text-sm text-muted-foreground max-w-xl">
            Composite momentum scores translated into a clear action — refreshed each load.
          </p>
        </div>
      </div>
      {signals.length === 0 ? (
        <div className="grid grid-cols-1 gap-px bg-hairline">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface-1 h-14 animate-shimmer" />
          ))}
        </div>
      ) : (
        <div className="surface-1 hairline overflow-hidden">
          <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[10px] font-mono uppercase tracking-[0.25em] text-muted-foreground border-b border-hairline">
            <div className="col-span-1">#</div>
            <div className="col-span-4">Card</div>
            <div className="col-span-1 text-right">Price</div>
            <div className="col-span-1 text-right">24h</div>
            <div className="col-span-1 text-right">7d</div>
            <div className="col-span-1 text-right">30d</div>
            <div className="col-span-1 text-right">Target</div>
            <div className="col-span-2 text-right">Action</div>
          </div>
          {signals.map((s, i) => {
            const c = s.card;
            const upDay = c.changePct >= 0;
            const w = c.weeklyChange ?? 0;
            const m = c.monthlyChange ?? 0;
            const isPhoto = c.category === "nba";
            return (
              <Link
                key={c.id}
                to="/card/$id"
                params={{ id: c.id }}
                className="grid grid-cols-2 md:grid-cols-12 gap-4 items-center px-4 md:px-6 py-3 border-b border-hairline last:border-b-0 hover:bg-surface-2/40 transition group"
              >
                <div className="hidden md:block col-span-1 font-mono text-[10px] text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="col-span-2 md:col-span-4 flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-14 flex-shrink-0 overflow-hidden ${isPhoto ? "bg-gradient-to-br from-surface-2 to-surface-3" : "bg-surface-2"}`}>
                    <img
                      src={c.imageUrl}
                      alt=""
                      loading="lazy"
                      className={`w-full h-full ${isPhoto ? "object-contain" : "object-cover"}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm group-hover:text-iris transition line-clamp-1">{c.name}</div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] line-clamp-1">
                      {c.category} · {c.setName ?? c.subtitle}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-1 text-right font-mono text-sm tabular-nums">${c.marketPrice.toFixed(2)}</div>
                <div className={`md:col-span-1 text-right font-mono text-xs tabular-nums ${upDay ? "text-bull" : "text-bear"}`}>
                  {upDay ? "+" : ""}{c.changePct.toFixed(1)}%
                </div>
                <div className={`hidden md:block md:col-span-1 text-right font-mono text-xs tabular-nums ${w >= 0 ? "text-bull" : "text-bear"}`}>
                  {w >= 0 ? "+" : ""}{w.toFixed(1)}%
                </div>
                <div className={`hidden md:block md:col-span-1 text-right font-mono text-xs tabular-nums ${m >= 0 ? "text-bull" : "text-bear"}`}>
                  {m >= 0 ? "+" : ""}{m.toFixed(1)}%
                </div>
                <div className="hidden md:block md:col-span-1 text-right font-mono text-xs tabular-nums text-iris">
                  ${s.target.toFixed(0)}
                </div>
                <div className="md:col-span-2 text-right">
                  <ActionPill action={s.action} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ActionPill({ action }: { action: "buy" | "sell" | "hold" }) {
  const styles = {
    buy: "text-bull bg-bull/10 border-bull/30",
    sell: "text-bear bg-bear/10 border-bear/30",
    hold: "text-muted-foreground bg-foreground/5 border-foreground/15",
  } as const;
  return (
    <span className={`font-mono text-[10px] tracking-[0.3em] uppercase px-3 py-1 border ${styles[action]}`}>
      {action}
    </span>
  );
}

function AiPicksSection({ picks, loading }: { picks: AiPick[] | null; loading: boolean }) {
  return (
    <section className="relative overflow-hidden mx-auto max-w-[1400px] px-6 lg:px-10 py-16 md:py-24">
      <div className="absolute -inset-x-10 inset-y-0 dither-iris opacity-10 pointer-events-none" />
      <div className="relative">
        <div className="flex items-end justify-between mb-10 gap-6 flex-wrap">
          <div>
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-iris mb-3 flex items-center gap-3">
              <span className="w-8 h-px bg-iris" />
              06 — Signal
              <span className="inline-block w-2 h-2 rounded-full bg-iris animate-pulse-iris" />
            </div>
            <h2 className="font-mono text-3xl md:text-5xl tracking-tight">
              AI Picks <span className="text-iris">·</span> Undervalued
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl">
              VAULT's market analyst (Gemini 2.5) reviews the live cross-category snapshot to surface overlooked or mispriced cards.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="surface-1 h-[480px] animate-shimmer" />
            ))}
          </div>
        ) : picks && picks.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline">
            {picks.map((p, i) => {
              const isPhoto = p.category === "nba";
              return (
                <Link
                  key={p.cardId}
                  to="/card/$id"
                  params={{ id: p.cardId }}
                  className="group surface-1 p-6 hover:bg-surface-2 transition relative overflow-hidden flex flex-col"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 dither-fine text-iris opacity-30" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground">
                      PICK {String(i + 1).padStart(2, "0")} / {p.category.toUpperCase()}
                    </span>
                    <SignalBadge signal={p.signal} />
                  </div>
                  <div className={`aspect-[3/4] mb-4 overflow-hidden ${isPhoto ? "bg-gradient-to-br from-surface-2 to-surface-3" : "bg-surface-2"}`}>
                    <img
                      src={p.imageUrl}
                      alt={p.cardName}
                      loading="lazy"
                      className={`w-full h-full ${isPhoto ? "object-contain p-2" : "object-cover"} group-hover:scale-105 transition-transform duration-500`}
                    />
                  </div>
                  <h3 className="text-sm font-medium line-clamp-2 group-hover:text-iris transition">
                    {p.cardName}
                  </h3>
                  {p.setName && (
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground line-clamp-1">
                      {p.setName}
                      {p.rarity && ` · ${p.rarity}`}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted-foreground line-clamp-3 flex-1">{p.thesis}</p>
                  <div className="hairline mt-4 pt-3 space-y-2">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground tracking-[0.2em] uppercase text-[9px]">Market</span>
                      <span className="tabular-nums">${p.marketPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="text-muted-foreground tracking-[0.2em] uppercase text-[9px]">Upside</span>
                      <span className="text-iris">{p.upside}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="surface-1 p-12 text-center text-muted-foreground text-sm">
            No AI picks available right now.
          </div>
        )}
      </div>
    </section>
  );
}

function SignalBadge({ signal }: { signal: AiPick["signal"] }) {
  const styles = {
    strong: "text-bull bg-bull/10",
    medium: "text-iris bg-iris/10",
    watch: "text-muted-foreground bg-foreground/5",
  } as const;
  return (
    <span className={`font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-0.5 ${styles[signal]}`}>
      {signal}
    </span>
  );
}

function Footer() {
  return (
    <footer className="hairline-b mt-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 py-12 grid md:grid-cols-3 gap-8 items-end">
        <div className="flex items-center gap-3">
          <VaultMark className="w-6 h-6" />
          <span className="font-mono text-xs tracking-[0.35em] uppercase">VAULT</span>
        </div>
        <p className="text-xs text-muted-foreground font-mono leading-relaxed">
          Pokemon TCG and Yu-Gi-Oh prices via public APIs. NBA prices currently
          modeled from a curated dataset. eBay sales adapter ready for keys.
        </p>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground md:text-right">
          © 2025 · Built with Lovable
        </p>
      </div>
    </footer>
  );
}
