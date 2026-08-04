import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Swords, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ScoreBar } from "@/components/audit/score-ring";
import { EmptyState } from "@/components/audit/status";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addCompetitor, deleteCompetitor, listCompetitors } from "@/lib/competitors.functions";

const competitorsQuery = queryOptions({
  queryKey: ["competitors"],
  queryFn: () => listCompetitors(),
});

export const Route = createFileRoute("/_authenticated/competitors")({
  head: () => ({
    meta: [
      { title: "Competitor comparison — OptiSite AI" },
      {
        name: "description",
        content: "Scan competitor websites and benchmark their SEO, performance, security and accessibility scores against yours.",
      },
      { property: "og:title", content: "Competitor comparison — OptiSite AI" },
      { property: "og:description", content: "Benchmark your site against rivals, score by score." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(competitorsQuery),
  component: CompetitorsPage,
});

function CompetitorsPage() {
  const { data } = useSuspenseQuery(competitorsQuery);
  const queryClient = useQueryClient();
  const add = useServerFn(addCompetitor);
  const remove = useServerFn(deleteCompetitor);
  const [url, setUrl] = useState("");
  const [auditId, setAuditId] = useState<string>("");

  const scan = useMutation({
    mutationFn: () => add({ data: { url, auditId: auditId === "" ? null : auditId } }),
    onSuccess: async () => {
      setUrl("");
      await queryClient.invalidateQueries();
      toast.success("Competitor scanned");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const removal = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Competitor removed");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell
      title="Competitors"
      description="Scan a rival's page and compare it against one of your audits."
    >
      <div className="space-y-6">
        <section className="surface-panel rounded-2xl p-5 sm:p-6">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              if (url.trim() === "") {
                toast.error("Enter a competitor URL");
                return;
              }
              scan.mutate();
            }}
          >
            <div className="flex-1">
              <label htmlFor="competitor-url" className="sr-only">
                Competitor URL
              </label>
              <Input
                id="competitor-url"
                inputMode="url"
                maxLength={2048}
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="competitor.com"
                className="h-11"
              />
            </div>
            <div>
              <label htmlFor="competitor-audit" className="sr-only">
                Compare against audit
              </label>
              <select
                id="competitor-audit"
                value={auditId}
                onChange={(event) => setAuditId(event.target.value)}
                className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm sm:w-64"
              >
                <option value="">No linked audit</option>
                {data.audits.map((audit) => (
                  <option key={audit.id} value={audit.id}>
                    {audit.page_title ?? audit.url}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" size="lg" className="h-11" disabled={scan.isPending}>
              {scan.isPending ? "Scanning…" : "Scan competitor"}
            </Button>
          </form>
        </section>

        {data.competitors.length === 0 ? (
          <EmptyState
            icon={<Swords className="size-5" aria-hidden="true" />}
            title="No competitors scanned"
            description="Add a competitor URL above to benchmark their scores against your own audits."
          />
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {data.competitors.map((competitor) => (
              <li key={competitor.id} className="surface-panel rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">{competitor.name}</h2>
                    <p className="truncate text-sm text-muted-foreground">{competitor.url}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-semibold tabular-nums">
                      {competitor.overall_score ?? "—"}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Remove ${competitor.name}`}
                      className="text-muted-foreground hover:text-destructive"
                      disabled={removal.isPending}
                      onClick={() => removal.mutate(competitor.id)}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <ScoreBar label="SEO" score={competitor.seo_score} />
                  <ScoreBar label="Performance" score={competitor.performance_score} />
                  <ScoreBar label="Security" score={competitor.security_score} />
                  <ScoreBar label="Accessibility" score={competitor.accessibility_score} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
