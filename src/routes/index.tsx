import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { MarketTicker } from "@/components/MarketTicker";
import { CardTile } from "@/components/CardTile";
import { LustreMark } from "@/components/LustreMark";
import { fetchAllTopCards, rankByChange } from "@/lib/cards";
import type { UnifiedCard } from "@/lib/cards/types";
import { getAiPicks, type AiPick } from "@/lib/aiPicks.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lustre — Real-time card prices, AI picks, portfolio analytics" },
      {
        name: "description",
        content:
          "Track Pokemon, Yu-Gi-Oh, and NBA card markets. Top movers, AI-curated investment picks, and portfolio tools — all in one luxury dashboard.",
      },
      { property: "og:title", content: "Lustre — Real-time card prices & AI picks" },
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

        <AiPicksSection picks={aiPicks} loading={aiLoading} />

        <Section
          eyebrow="06 — Index"
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
      {/* dithered iridescent bg */}
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
              The luxury<br />
              <span className="text-iris">card market</span><br />
              <span className="text-chrome">in real time.</span>
            </h1>

            <p className="max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
              Live prices, AI-driven investment picks, and portfolio analytics across
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
                Build a portfolio
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

        {/* Decorative diamond mark */}
        <div className="absolute right-6 lg:right-10 top-10 opacity-30 animate-float">
          <LustreMark className="w-24 h-24" />
        </div>
      </div>

      {/* fade to next section */}
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
      {cards.map((c, i) => (
        <Link
          key={c.id}
          to="/card/$id"
          params={{ id: c.id }}
          className="group surface-1 p-4 hover:bg-surface-2 transition relative overflow-hidden block"
        >
          <div className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground mb-3">
            {String(i + 1).padStart(2, "0")} / {c.category.toUpperCase()}
          </div>
          <div className="aspect-[3/4] mb-3 overflow-hidden bg-surface-2">
            <img
              src={c.imageUrl}
              alt={c.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
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
      ))}
    </div>
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
              05 — Signal
              <span className="inline-block w-2 h-2 rounded-full bg-iris animate-pulse-iris" />
            </div>
            <h2 className="font-mono text-3xl md:text-5xl tracking-tight">
              AI Picks <span className="text-iris">·</span> Undervalued
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl">
              Lustre's market analyst (Gemini 2.5) reviews the live cross-category snapshot to surface overlooked or mispriced cards.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="surface-1 h-80 animate-shimmer" />
            ))}
          </div>
        ) : picks && picks.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline">
            {picks.map((p, i) => (
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
                <div className="aspect-[3/4] mb-4 overflow-hidden bg-surface-2">
                  <img
                    src={p.imageUrl}
                    alt={p.cardName}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-sm font-medium line-clamp-1 group-hover:text-iris transition">
                  {p.cardName}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground line-clamp-3 flex-1">{p.thesis}</p>
                <div className="hairline mt-4 pt-3 flex items-center justify-between font-mono text-[11px]">
                  <span className="tabular-nums">${p.marketPrice.toFixed(2)}</span>
                  <span className="text-iris">{p.upside}</span>
                </div>
              </Link>
            ))}
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
          <LustreMark className="w-6 h-6" />
          <span className="font-mono text-xs tracking-[0.3em] uppercase">Lustre</span>
        </div>
        <p className="text-xs text-muted-foreground font-mono leading-relaxed">
          Pokemon TCG and Yu-Gi-Oh prices via public APIs. NBA prices currently
          modeled from a seeded dataset. eBay sales adapter ready for keys.
        </p>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground md:text-right">
          © 2025 · Built with Lovable
        </p>
      </div>
    </footer>
  );
}
