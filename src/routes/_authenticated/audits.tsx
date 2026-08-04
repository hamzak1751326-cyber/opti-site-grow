import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Gauge, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AuditForm } from "@/components/audit/audit-form";
import { EmptyState, StatusBadge } from "@/components/audit/status";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { deleteAudit, listAudits } from "@/lib/audits.functions";

const auditsQuery = queryOptions({ queryKey: ["audits"], queryFn: () => listAudits() });

export const Route = createFileRoute("/_authenticated/audits")({
  head: () => ({
    meta: [
      { title: "Website audits — OptiSite AI" },
      {
        name: "description",
        content: "Every website audit you have run, with SEO, performance, security and accessibility scores.",
      },
      { property: "og:title", content: "Website audits — OptiSite AI" },
      { property: "og:description", content: "Your full audit history and scores." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(auditsQuery),
  component: AuditsPage,
});

function AuditsPage() {
  const { data } = useSuspenseQuery(auditsQuery);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const remove = useServerFn(deleteAudit);

  const removal = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Audit deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell title="Audits" description="Every audit you have run, newest first.">
      <div className="space-y-6">
        <section className="surface-panel rounded-2xl p-5 sm:p-6">
          <AuditForm />
        </section>

        {data.length === 0 ? (
          <EmptyState
            icon={<Gauge className="size-5" aria-hidden="true" />}
            title="No audits yet"
            description="Run your first audit above to see scores, findings and prioritized fixes."
          />
        ) : (
          <ul className="grid gap-3">
            {data.map((audit) => (
              <li key={audit.id} className="surface-panel rounded-2xl p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-base font-semibold">
                        {audit.page_title ?? audit.url}
                      </h2>
                      <StatusBadge status={audit.status} />
                    </div>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{audit.url}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(audit.created_at).toLocaleString()}
                    </p>
                    {audit.error_message ? (
                      <p className="mt-2 text-sm text-destructive">{audit.error_message}</p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-4">
                    <ScoreChips audit={audit} />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate({ to: "/audits/$auditId", params: { auditId: audit.id } })}
                      >
                        View
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete audit for ${audit.url}`}
                        className="text-muted-foreground hover:text-destructive"
                        disabled={removal.isPending}
                        onClick={() => removal.mutate(audit.id)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Need a printable version? Open an audit and use{" "}
          <Link to="/reports" className="underline underline-offset-4">
            Reports
          </Link>
          .
        </p>
      </div>
    </AppShell>
  );
}

function ScoreChips({
  audit,
}: {
  audit: {
    overall_score: number | null;
    seo_score: number | null;
    performance_score: number | null;
    security_score: number | null;
    accessibility_score: number | null;
  };
}) {
  const chips = [
    { label: "Overall", value: audit.overall_score },
    { label: "SEO", value: audit.seo_score },
    { label: "Perf", value: audit.performance_score },
    { label: "Sec", value: audit.security_score },
    { label: "A11y", value: audit.accessibility_score },
  ];

  return (
    <dl className="hidden gap-3 sm:flex">
      {chips.map((chip) => (
        <div key={chip.label} className="rounded-lg border border-border px-3 py-1.5 text-center">
          <dd className="text-sm font-semibold tabular-nums">{chip.value ?? "—"}</dd>
          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{chip.label}</dt>
        </div>
      ))}
    </dl>
  );
}
