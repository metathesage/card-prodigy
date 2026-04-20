import { Link, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { VaultMark } from "./LustreMark";

const NAV = [
  { to: "/", label: "Index" },
  { to: "/browse", label: "Browse" },
  { to: "/portfolio", label: "Vault" },
];

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const loc = useLocation();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 hairline-b">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <VaultMark className="w-7 h-7" />
          <span className="font-mono text-sm tracking-[0.35em] uppercase">VAULT</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((n) => {
            const active = loc.pathname === n.to || (n.to !== "/" && loc.pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`px-4 py-2 text-xs font-mono uppercase tracking-[0.2em] transition-colors ${
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {n.label}
                {active && (
                  <span className="block h-px bg-iris mt-1 -mb-px" aria-hidden />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-xs font-mono text-muted-foreground tracking-wider">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] border border-border hover:bg-surface-2 transition"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-1.5 text-[10px] font-mono uppercase tracking-[0.2em] bg-foreground text-background hover:opacity-90 transition"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
