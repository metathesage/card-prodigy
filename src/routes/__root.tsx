import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { AuthProvider } from "@/lib/auth";
import { SiteHeader } from "@/components/SiteHeader";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-6">
          <div className="font-mono text-xs tracking-[0.4em] text-muted-foreground uppercase">
            Error · 404
          </div>
          <h1 className="text-6xl font-mono tracking-tight text-iris">Not Found</h1>
          <p className="text-sm text-muted-foreground">
            This card isn't in the index. It may have been moved or never minted.
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-2.5 text-[10px] font-mono uppercase tracking-[0.3em] bg-foreground text-background hover:opacity-90 transition"
          >
            Return to Index
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VAULT — Real-time Card Tracking" },
      {
        name: "description",
        content:
          "Real-time price tracking, AI-driven investment picks and portfolio analytics for Pokemon, Yu-Gi-Oh, and NBA cards.",
      },
      { name: "author", content: "VAULT" },
      { property: "og:title", content: "VAULT — Real-time Card Tracking" },
      {
        property: "og:description",
        content:
          "Real-time prices, AI picks and portfolio analytics for Pokemon, Yu-Gi-Oh, and NBA collectible cards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&family=Geist:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="grain">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}
