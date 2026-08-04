import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, FileText, Printer } from "lucide-react";
import { toast } from "sonner";

import { FindingList } from "@/components/audit/finding-list";
import { ScoreBar, ScoreRing } from "@/components/audit/score-ring";
import { StatusBadge } from "@/components/audit/status";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AUDIT_CATEGORIES, CATEGORY_LABELS, findingSchema, type AuditCategory } from "@/lib/audit-types";
import { getAudit } from "@/lib/audits.functions";
import { createReport } from "@/lib/account.functions";

const auditQuery = (auditId: string) =>
  queryOptions({
    queryKey: ["audit", auditId],
    queryFn: () => getAudit({ data: { id: auditId } }),
  });

export const Route = createFileRoute("/_authenticated/audits_/$auditId")({
  head: () => ({
    meta: [
      { title: "Audit detail — OptiSite AI" },
      {
        name: "description",
        content: "Full AI audit breakdown with SEO, performance, security and accessibility findings.",
      },
      { property: "og:title", content: "Audit detail — OptiSite AI" },
      { property: "og:description", content: "Prioritized findings and fixes for your website." },
    ],
  }),
  loader: ({ context, params }) => context.queryClient.ensureQueryData(auditQuery(params.auditId)),
  component: AuditDetailPage,
});

function AuditDetailPage() {
  const { auditId } = Route.useParams();
  const { data } = useSuspenseQuery(auditQuery(auditId));
  const queryClient = useQueryClient();
  const save = useServerFn(createReport);
  const { audit, results, competitors } = data;

  const saveReport = useMutation({
    mutationFn: () =>
      save({
        data: {
          audit_id: audit.id,
          title: `${audit.page_title ?? audit.url} — growth report`,
          notes: audit.summary,
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Report saved to your Reports library");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const byCategory = new Map(results.map((result) => [result.category as AuditCategory, result]));

  return (
    <AppShell
      title={audit.page_title ?? audit.url}
      description={audit.url}
      actions={
        <div className="no-print flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" />
            Print / PDF
          </Button>
          <Button size="sm" disabled={saveReport.isPending} onClick={() => saveReport.mutate()}>
            <FileText className="size-4" aria-hidden="true" />
            Save report
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <div className="surface-panel flex flex-col items-center gap-5 rounded-2xl p-6">
            <StatusBadge status={audit.status} />
            <ScoreRing score={audit.overall_score} size={168} label="Overall" />
            <div className="w-full space-y-3">
              <ScoreBar label="SEO" score={audit.seo_score} />
              <ScoreBar label="Performance" score={audit.performance_score} />
              <ScoreBar label="Security" score={audit.security_score} />
              <ScoreBar label="Accessibility" score={audit.accessibility_score} />
            </div>
            <a
              href={audit.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-sm text-primary-glow underline-offset-4 hover:underline"
            >
              Visit site
              <ExternalLink className="size-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="surface-panel rounded-2xl p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Executive summary
            </h2>
            <p className="mt-3 text-sm leading-relaxed">
              {audit.summary ?? audit.error_message ?? "This audit has no summary yet."}
            </p>
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-4">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">Started</dt>
                <dd className="mt-1 text-sm">{new Date(audit.created_at).toLocaleString()}</dd>
              </div>
              <div className="rounded-xl border border-border p-4">
                <dt className="text-xs uppercase tracking-widest text-muted-foreground">
                  Completed
                </dt>
                <dd className="mt-1 text-sm">
                  {audit.completed_at ? new Date(audit.completed_at).toLocaleString() : "—"}
                </dd>
              </div>
            </dl>

            {competitors.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Competitors compared
                </h3>
                <ul className="mt-3 divide-y divide-border">
                  {competitors.map((competitor) => (
                    <li key={competitor.id} className="flex items-center justify-between py-2.5">
                      <span className="min-w-0 truncate text-sm">{competitor.name}</span>
                      <span className="text-sm font-semibold tabular-nums">
                        {competitor.overall_score ?? "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                <Link to="/competitors" className="underline underline-offset-4">
                  Compare a competitor
                </Link>{" "}
                to benchmark these scores.
              </p>
            )}
          </div>
        </section>

        <section className="surface-panel rounded-2xl p-5 sm:p-6">
          <Tabs defaultValue="seo">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              {AUDIT_CATEGORIES.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </TabsTrigger>
              ))}
            </TabsList>

            {AUDIT_CATEGORIES.map((category) => {
              const result = byCategory.get(category);
              const findings = findingSchema
                .array()
                .safeParse(result?.findings ?? []);

              return (
                <TabsContent key={category} value={category} className="mt-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold">{CATEGORY_LABELS[category]}</h2>
                    <span className="text-2xl font-semibold tabular-nums">
                      {result?.score ?? "—"}
                      <span className="text-sm text-muted-foreground">/100</span>
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {result?.summary ?? "This category has not been scored yet."}
                  </p>
                  <FindingList findings={findings.success ? findings.data : []} />
                </TabsContent>
              );
            })}
          </Tabs>
        </section>
      </div>
    </AppShell>
  );
}
