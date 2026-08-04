import { Link } from "@tanstack/react-router";
import { Radar } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className, to = "/" }: { className?: string; to?: string }) {
  return (
    <Link
      to={to}
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="OptiSite AI home"
    >
      <span className="relative grid size-9 place-items-center rounded-xl border border-border bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)]">
        <Radar className="size-5 text-primary-foreground" strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="text-base font-semibold tracking-tight">
        OptiSite<span className="text-gradient-primary"> AI</span>
      </span>
    </Link>
  );
}
