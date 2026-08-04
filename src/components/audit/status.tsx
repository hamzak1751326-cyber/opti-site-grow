import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "border-success/50 bg-success/15 text-success",
    running: "border-warning/50 bg-warning/15 text-warning",
    pending: "border-border bg-muted text-muted-foreground",
    failed: "border-destructive/60 bg-destructive/15 text-destructive",
  };
  return (
    <Badge variant="outline" className={cn("capitalize", map[status] ?? map["pending"])}>
      {status}
    </Badge>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="surface-panel flex flex-col items-center gap-3 rounded-2xl px-6 py-14 text-center">
      <div className="grid size-12 place-items-center rounded-xl border border-border bg-muted text-primary-glow">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
