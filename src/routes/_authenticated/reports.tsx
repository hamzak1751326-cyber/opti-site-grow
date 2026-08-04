import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { EmptyState } from "@/components/audit/status";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { deleteReport, listReports } from "@/lib/account.functions";

const reportsQuery = queryOptions({ queryKey: ["reports"], queryFn: () => listReports() });

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — OptiSite AI" },
      {
        name: "description",
        content: "Saved website growth reports you can revisit, print or share with clients.",
      },
      { property: "og:title", content: "Reports — OptiSite AI" },
      { property: "og:description", content: "Your saved audit reports library." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(reportsQuery),
  component: ReportsPage,
});

function ReportsPage() {
  const { data } = useSuspenseQuery(reportsQuery);
  const queryClient = useQueryClient();
  const remove = useServerFn(deleteReport);

  const removal = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Report deleted");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell title="Reports" description="Saved summaries generated from your audits.">
      {data.length === 0 ? (
        <EmptyState
          icon={<FileText className="size-5" aria-hidden="true" />}
          title="No reports saved"
          description="Open any completed audit and choose “Save report” to build your library."
        />
      ) : (
        <ul className="grid gap-3">
          {data.map((report) => (
            <li key={report.id} className="surface-panel rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold">{report.title}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(report.created_at).toLocaleString()}
                  </p>
                  {report.notes ? (
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{report.notes}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {report.audit_id ? (
                    <Button asChild size="sm" variant="outline">
                      <Link to="/audits/$auditId" params={{ auditId: report.audit_id }}>
                        Open audit
                      </Link>
                    </Button>
                  ) : null}
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Delete report ${report.title}`}
                    className="text-muted-foreground hover:text-destructive"
                    disabled={removal.isPending}
                    onClick={() => removal.mutate(report.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
