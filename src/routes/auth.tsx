import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const credentialsSchema = z.object({
  email: z.string().trim().email({ message: "Enter a valid email address" }).max(255),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }).max(72),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: search["mode"] === "signup" ? ("signup" as const) : ("signin" as const),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — OptiSite AI" },
      {
        name: "description",
        content:
          "Sign in to OptiSite AI to run unlimited AI website audits and track SEO, performance, security and accessibility scores.",
      },
      { property: "og:title", content: "Sign in — OptiSite AI" },
      {
        property: "og:description",
        content: "Access your OptiSite AI dashboard and run unlimited website audits.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [tab, setTab] = useState<"signin" | "signup">(mode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [pending, setPending] = useState<"password" | "reset" | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  function validate() {
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your details");
      return null;
    }
    return parsed.data;
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    const values = validate();
    if (!values) return;
    setPending("password");

    try {
      if (tab === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() || null },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setConfirmSent(true);
          toast.success("Check your email to confirm your account.");
          return;
        }
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setPending(null);
    }
  }

  async function handleReset() {
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) {
      toast.error("Enter your email address first, then click reset.");
      return;
    }
    setPending("reset");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent. Check your inbox.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send reset email");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="hero-aura grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="text-2xl font-semibold">
            {tab === "signup" ? "Create your free account" : "Welcome back"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Unlimited AI website audits, reports and competitor comparisons — no card, no limits.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          {confirmSent ? (
            <div className="space-y-4 text-center">
              <Mail className="mx-auto size-8 text-primary-glow" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Confirm your email</h2>
              <p className="text-sm text-muted-foreground">
                We sent a confirmation link to <span className="font-medium">{email}</span>. Click it
                to activate your account, then sign in.
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setConfirmSent(false);
                  setTab("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <Tabs value={tab} onValueChange={(value) => setTab(value as "signin" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-4" noValidate>
                <TabsContent value="signup" className="m-0 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full-name">Full name</Label>
                    <Input
                      id="full-name"
                      autoComplete="name"
                      maxLength={120}
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Ada Lovelace"
                    />
                  </div>
                </TabsContent>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={255}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {tab === "signin" ? (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs text-primary-glow underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </button>
                    ) : null}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete={tab === "signup" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={pending !== null}>
                  {pending === "password" ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : null}
                  {tab === "signup" ? "Create free account" : "Sign in"}
                </Button>
              </form>
            </Tabs>
          )}
        </div>

        <p className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Your data is isolated per account with row-level security.
        </p>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">
            Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
}

