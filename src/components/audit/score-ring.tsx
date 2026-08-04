import { cn } from "@/lib/utils";
import { scoreLabel, scoreTone } from "@/lib/audit-types";

const toneClass = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
} as const;

const toneStroke = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--destructive)",
} as const;

export function ScoreRing({
  score,
  size = 132,
  label,
  className,
}: {
  score: number | null | undefined;
  size?: number;
  label?: string;
  className?: string;
}) {
  const tone = scoreTone(score);
  const value = score ?? 0;
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div
      className={cn("relative grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ?? "Overall"} score ${score ?? "not available"} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={9}
          stroke="var(--muted)"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={9}
          strokeLinecap="round"
          stroke={toneStroke[tone]}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className={cn("text-3xl font-semibold tabular-nums", toneClass[tone])}>
          {score ?? "—"}
        </span>
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
          {label ?? scoreLabel(score)}
        </span>
      </div>
    </div>
  );
}

export function ScoreBar({
  score,
  label,
  className,
}: {
  score: number | null | undefined;
  label: string;
  className?: string;
}) {
  const tone = scoreTone(score);
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn("text-sm font-semibold tabular-nums", toneClass[tone])}>
          {score ?? "—"}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${score ?? 0}%`, background: toneStroke[tone] }}
        />
      </div>
    </div>
  );
}
