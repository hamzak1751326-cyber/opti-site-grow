import { AlertTriangle, CheckCircle2, CircleAlert, Info, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { severityWeight, type Finding, type Severity } from "@/lib/audit-types";

const severityStyle: Record<Severity, { label: string; className: string; Icon: typeof Info }> = {
  critical: {
    label: "Critical",
    className: "border-destructive/60 bg-destructive/15 text-destructive",
    Icon: ShieldAlert,
  },
  high: {
    label: "High",
    className: "border-maroon/70 bg-maroon/25 text-maroon-foreground",
    Icon: AlertTriangle,
  },
  medium: {
    label: "Medium",
    className: "border-warning/50 bg-warning/15 text-warning",
    Icon: CircleAlert,
  },
  low: {
    label: "Low",
    className: "border-border bg-muted text-muted-foreground",
    Icon: Info,
  },
  passed: {
    label: "Passed",
    className: "border-success/50 bg-success/15 text-success",
    Icon: CheckCircle2,
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const style = severityStyle[severity];
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium", style.className)}>
      <style.Icon className="size-3.5" aria-hidden="true" />
      {style.label}
    </Badge>
  );
}

export function FindingList({ findings }: { findings: Finding[] }) {
  const sorted = [...findings].sort(
    (a, b) => severityWeight(a.severity) - severityWeight(b.severity),
  );

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground">No findings recorded for this category.</p>;
  }

  return (
    <ul className="space-y-3">
      {sorted.map((finding, index) => (
        <li
          key={`${finding.title}-${index}`}
          className="rounded-xl border border-border bg-card/60 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h4 className="text-sm font-semibold leading-snug">{finding.title}</h4>
            <SeverityBadge severity={finding.severity} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{finding.impact}</p>
          <p className="mt-2 text-sm">
            <span className="font-medium text-primary-glow">Fix: </span>
            {finding.recommendation}
          </p>
        </li>
      ))}
    </ul>
  );
}
