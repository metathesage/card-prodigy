import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { LustreMark } from "@/components/LustreMark";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Lustre" },
      { name: "description", content: "Sign in to track your card portfolio on Lustre." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/portfolio",
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const { redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: redirect || "/portfolio" });
  }, [user, redirect, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/portfolio`,
            data: { display_name: displayName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox to confirm.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
    } catch (err) {
      const e = err as Error;
      toast.error(e.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 grid lg:grid-cols-2 relative overflow-hidden">
        {/* Left: brand */}
        <div className="hidden lg:flex relative items-center justify-center p-16 hairline-b border-r border-hairline overflow-hidden">
          <div className="absolute inset-0 dither-iris opacity-25 pointer-events-none" />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at center, oklch(0.78 0.16 220 / 30%), transparent 60%)" }}
          />
          <div className="relative space-y-8 max-w-md">
            <LustreMark className="w-16 h-16 animate-float" />
            <div>
              <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-muted-foreground mb-3">
                Vault Access
              </div>
              <h2 className="font-mono text-4xl tracking-tight leading-tight">
                Your collection.<br />
                <span className="text-iris">Tracked in real time.</span>
              </h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in to build a portfolio across Pokemon, Yu-Gi-Oh, and NBA cards. Track cost basis, P&L, and never miss a top mover.
            </p>
          </div>
        </div>

        {/* Right: form */}
        <div className="flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-sm space-y-8">
            <div>
              <div className="flex gap-px bg-hairline mb-8">
                <button
                  onClick={() => setMode("signin")}
                  className={`flex-1 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.25em] transition ${
                    mode === "signin" ? "bg-foreground text-background" : "surface-1 text-muted-foreground"
                  }`}
                >
                  Sign in
                </button>
                <button
                  onClick={() => setMode("signup")}
                  className={`flex-1 px-4 py-3 text-[10px] font-mono uppercase tracking-[0.25em] transition ${
                    mode === "signup" ? "bg-foreground text-background" : "surface-1 text-muted-foreground"
                  }`}
                >
                  Create
                </button>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-5">
              {mode === "signup" && (
                <Field label="Display Name">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    autoComplete="username"
                    className="w-full bg-transparent border-b border-border focus:border-iris outline-none py-3 text-sm font-mono transition-colors"
                  />
                </Field>
              )}
              <Field label="Email">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full bg-transparent border-b border-border focus:border-iris outline-none py-3 text-sm font-mono transition-colors"
                />
              </Field>
              <Field label="Password">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className="w-full bg-transparent border-b border-border focus:border-iris outline-none py-3 text-sm font-mono transition-colors"
                />
              </Field>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 px-6 py-4 text-[10px] font-mono uppercase tracking-[0.3em] bg-foreground text-background hover:opacity-90 transition disabled:opacity-50 relative overflow-hidden"
              >
                <span className="relative z-10">
                  {loading ? "Authenticating…" : mode === "signin" ? "Enter Vault" : "Create Account"}
                </span>
              </button>
            </form>

            <div className="text-center">
              <Link to="/" className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
