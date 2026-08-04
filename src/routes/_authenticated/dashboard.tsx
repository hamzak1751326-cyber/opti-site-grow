import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Activity, ArrowUpRight, FileText, Gauge, Swords } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AuditForm } from "@/components/audit/audit-form";
import { ScoreBar, ScoreRing } from "@/components/audit/score-ring";
import { EmptyState, StatusBadge } from "@/components/audit/status";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { getDashboard } from "@/lib/audits.functions";

const dashboardQuery = queryOptions({
  queryKey: ["dashboard"],
  queryFn: () => getDashboard(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — OptiSite AI" },
      {
        name: "description",
        content: "Track website audit scores, trends and recent activity across all your sites.",
      },
      { property: "og:title", content: "Dashboard — OptiSite AI" },
      { property: "og:description", content: "Your website growth scores at a glance." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(dashboardQuery),
  component: DashboardPage,
});

function DashboardPage() {
  const { data } = useSuspenseQuery(dashboardQuery);
  const latest = data.audits.find((audit) => audit.overall_score !== null) ?? null;

  const trend = [...data.audits]
    .filter((audit) => audit.overall_score !== null)
    .slice(0, 12)
    .reverse()
    .map((audit) => ({
      label: new Date(audit.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      score: audit.overall_score ?? 0,
    }));

  return (
    <AppShell
      title="Dashboard"
      description="Run an audit, then watch every pillar improve."
      actions={
        <Button asChild variant="outline" size="sm">
          <Link to="/audits">
            All audits
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      }
    >
      <div className="space-y-6">
        <section className="surface-panel rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            New audit
          </h2>
          <AuditForm className="mt-4" />
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Audits run"
            value={String(data.totals.audits)}
            Icon={Gauge}
            to="/audits"
          />
          <StatCard
            label="Average score"
            value={data.totals.averageScore === null ? "—" : `${data.totals.averageScore}`}
            Icon={Activity}
            to="/audits"
          />
          <StatCard
            label="Reports"
            value={String(data.totals.reports)}
            Icon={FileText}
            to="/reports"
          />
          <StatCard
            label="Competitors"
            value={String(data.totals.competitors)}
            Icon={Swords}
            to="/competitors"
          />
        </section>

        {latest ? (
          <section className="grid gap-4 lg:grid-cols-[380px_1fr]">
            <div className="surface-panel flex flex-col items-center gap-5 rounded-2xl p-6">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Latest audit
                </p>
                <p className="mt-1 truncate text-sm font-medium">{latest.page_title ?? latest.url}</p>
              </div>
              <ScoreRing score={latest.overall_score} size={160} label="Overall" />
              <div className="w-full space-y-3">
                <ScoreBar label="SEO" score={latest.seo_score} />
                <ScoreBar label="Performance" score={latest.performance_score} />
                <ScoreBar label="Security" score={latest.security_score} />
                <ScoreBar label="Accessibility" score={latest.accessibility_score} />
              </div>
              <Button asChild className="w-full">
                <Link to="/audits/$auditId" params={{ auditId: latest.id }}>
                  Open full audit
                </Link>
              </Button>
            </div>

            <div className="surface-panel rounded-2xl p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Score trend
              </h2>
              {trend.length > 1 ? (
                <div className="mt-6 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 6, right: 12, left: -18, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        stroke="var(--muted-foreground)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--popover)",
                          border: "1px solid var(--border)",
                          borderRadius: 12,
                          color: "var(--popover-foreground)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--primary-glow)"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "var(--primary-glow)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted-foreground">
                  Run at least two audits to see your score trend over time.
                </p>
              )}

              <h3 className="mt-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Recent activity
              </h3>
              <ul className="mt-3 divide-y divide-border">
                {data.audits.slice(0, 6).map((audit) => (
                  <li key={audit.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <Link
                        to="/audits/$auditId"
                        params={{ auditId: audit.id }}
                        className="block truncate text-sm font-medium underline-offset-4 hover:underline"
                      >
                        {audit.page_title ?? audit.url}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{audit.url}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <StatusBadge status={audit.status} />
                      <span className="w-8 text-right text-sm font-semibold tabular-nums">
                        {audit.overall_score ?? "—"}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : (
          <EmptyState
            icon={<Gauge className="size-5" aria-hidden="true" />}
            title="No audits yet"
            description="Paste a URL above to run your first AI audit. It takes under a minute and covers SEO, performance, security and accessibility."
          />
        )}
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  Icon,
  to,
}: {
  label: string;
  value: string;
  Icon: typeof Gauge;
  to: "/audits" | "/reports" | "/competitors";
}) {
  return (
    <Link
      to={to}
      className="surface-panel group rounded-2xl p-5 transition-shadow hover:shadow-[var(--shadow-glow)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className="size-4 text-primary-glow" aria-hidden="true" />
      </div>
      <p className="mt-3 text-3xl font-semibold tabular-nums">{value}</p>
    </Link>
  );
}
