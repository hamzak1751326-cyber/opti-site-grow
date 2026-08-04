import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Accessibility,
  ArrowRight,
  BarChart3,
  FileText,
  Gauge,
  Infinity as InfinityIcon,
  Radar,
  ShieldCheck,
  Sparkles,
  Swords,
} from "lucide-react";
import { motion } from "motion/react";

import heroImage from "@/assets/hero-dashboard.jpg";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OptiSite AI — Free AI Website Audits & Growth Reports" },
      {
        name: "description",
        content:
          "OptiSite AI fetches your live site and scores SEO, performance, security and accessibility, then hands you prioritized fixes, competitor comparisons and shareable reports. Free and unlimited.",
      },
      { property: "og:title", content: "OptiSite AI — Free AI Website Audits" },
      {
        property: "og:description",
        content:
          "Audit any website with AI: SEO, performance, security and accessibility scores with prioritized fixes and reports. Completely free.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const PILLARS = [
  {
    Icon: BarChart3,
    title: "SEO",
    body: "Titles, meta, canonicals, heading structure, structured data and crawlability, scored against what actually moves rankings.",
  },
  {
    Icon: Gauge,
    title: "Performance",
    body: "Response time, payload weight, script and stylesheet load, render-blocking patterns and lazy-loading coverage.",
  },
  {
    Icon: ShieldCheck,
    title: "Security",
    body: "HTTPS, HSTS, CSP, frame and referrer policy, cookie flags and mixed content, graded header by header.",
  },
  {
    Icon: Accessibility,
    title: "Accessibility",
    body: "Alt text, form labels, language and viewport declarations, button names and semantic heading order.",
  },
];

const STEPS = [
  {
    title: "Paste a URL",
    body: "Any public page. We validate it, then fetch the live HTML and response headers.",
  },
  {
    title: "AI reads the evidence",
    body: "Every measured signal is analysed and scored 0-100 per pillar with prioritized findings.",
  },
  {
    title: "Fix and share",
    body: "Work the ranked fix list, compare competitors, then export a clean printable report.",
  },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");

  function handleStart(event: React.FormEvent) {
    event.preventDefault();
    if (user) {
      navigate({ to: "/dashboard" });
      return;
    }
    navigate({ to: "/auth", search: { mode: "signup" } });
  }

  return (
    <div className="min-h-dvh">
      <header className="glass-panel sticky top-0 z-40 border-x-0 border-t-0">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#pillars" className="transition-colors hover:text-foreground">
              What we audit
            </a>
            <a href="#how" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#free" className="transition-colors hover:text-foreground">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {loading ? null : user ? (
              <Button asChild size="sm">
                <Link to="/dashboard">
                  Dashboard
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth" search={{ mode: "signin" }}>
                    Sign in
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth" search={{ mode: "signup" }}>
                    Start free
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="hero-aura relative overflow-hidden">
          <div className="grid-noise absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pt-24">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-primary-glow" aria-hidden="true" />
                AI website growth platform — free forever
              </span>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
                Know exactly why your site
                <span className="text-gradient-primary"> isn't growing</span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                OptiSite AI fetches your live page, measures every SEO, performance, security and
                accessibility signal, then returns scores and a ranked list of fixes you can ship
                today.
              </p>

              <form onSubmit={handleStart} className="mt-8 max-w-lg">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label htmlFor="landing-url" className="sr-only">
                    Your website URL
                  </label>
                  <Input
                    id="landing-url"
                    inputMode="url"
                    value={url}
                    maxLength={2048}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="yourdomain.com"
                    className="h-12 bg-card/70 text-base"
                  />
                  <Button type="submit" size="lg" className="h-12 px-6">
                    <Radar className="size-4" aria-hidden="true" />
                    Audit my site
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Create a free account to run the audit. No card, no trial, no feature gates.
                </p>
              </form>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4">
                {[
                  { term: "Audit pillars", detail: "4" },
                  { term: "Audits included", detail: "∞" },
                  { term: "Price", detail: "$0" },
                ].map((item) => (
                  <div key={item.term} className="surface-panel rounded-xl px-4 py-3">
                    <dd className="text-2xl font-semibold text-gradient-primary">{item.detail}</dd>
                    <dt className="text-xs text-muted-foreground">{item.term}</dt>
                  </div>
                ))}
              </dl>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
              className="glass-panel overflow-hidden rounded-3xl p-2"
            >
              <img
                src={heroImage}
                alt="OptiSite AI dashboard showing website audit score rings and trend charts"
                width={1536}
                height={1024}
                className="h-full w-full rounded-2xl object-cover"
              />
            </motion.div>
          </div>
        </section>

        <section id="pillars" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <h2 className="text-3xl font-semibold sm:text-4xl">Four pillars, one score</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Every audit grades the same four dimensions so you can track progress release over
            release — and see which pillar is dragging your growth down.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {PILLARS.map(({ Icon, title, body }) => (
              <article key={title} className="surface-panel rounded-2xl p-6">
                <div className="grid size-11 place-items-center rounded-xl border border-border bg-muted text-primary-glow">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="how" className="border-y border-border bg-card/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
            <h2 className="text-3xl font-semibold sm:text-4xl">How an audit runs</h2>
            <ol className="mt-10 grid gap-4 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="surface-panel rounded-2xl p-6">
                  <span className="font-mono text-sm text-primary-glow">
                    0{index + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { Icon: Swords, label: "Competitor comparison", body: "Scan rivals and benchmark score by score." },
                { Icon: FileText, label: "Shareable reports", body: "Printable, client-ready summaries of every audit." },
                { Icon: InfinityIcon, label: "No feature gates", body: "Every module is open to every account." },
              ].map(({ Icon, label, body }) => (
                <div key={label} className="flex gap-3 rounded-xl border border-border p-4">
                  <Icon className="size-5 shrink-0 text-primary-glow" aria-hidden="true" />
                  <div>
                    <h3 className="text-sm font-semibold">{label}</h3>
                    <p className="text-sm text-muted-foreground">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="free" className="mx-auto w-full max-w-4xl px-4 py-24 text-center sm:px-6">
          <h2 className="text-3xl font-semibold sm:text-4xl">
            Completely free. <span className="text-gradient-primary">No plans, no limits.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            There is no billing in OptiSite AI. Unlimited audits, unlimited reports, unlimited
            competitor scans — the whole platform, for every account.
          </p>
          <Button asChild size="lg" className="mt-8 h-12 px-8">
            <Link to="/auth" search={{ mode: "signup" }}>
              Create your free account
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Logo />
          <p>© {new Date().getFullYear()} OptiSite AI. Free AI website audits.</p>
        </div>
      </footer>
    </div>
  );
}
