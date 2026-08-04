import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Radar } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { runAudit } from "@/lib/audits.functions";
import { urlSchema } from "@/lib/audit-types";
import { cn } from "@/lib/utils";

export function AuditForm({ className }: { className?: string }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const run = useServerFn(runAudit);

  const mutation = useMutation({
    mutationFn: (value: string) => run({ data: { url: value } }),
    onSuccess: async (result) => {
      setUrl("");
      await queryClient.invalidateQueries();
      toast.success(`Audit complete — score ${result.overallScore}/100`);
      navigate({ to: "/audits/$auditId", params: { auditId: result.auditId } });
    },
    onError: (mutationError: Error) => {
      toast.error(mutationError.message);
    },
  });

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = urlSchema.safeParse(url);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Enter a valid URL";
      setError(message);
      return;
    }
    setError(null);
    mutation.mutate(parsed.data);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="audit-url" className="sr-only">
            Website URL to audit
          </label>
          <Input
            id="audit-url"
            name="url"
            inputMode="url"
            autoComplete="url"
            placeholder="yourdomain.com"
            value={url}
            maxLength={2048}
            onChange={(event) => {
              setUrl(event.target.value);
              if (error) setError(null);
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "audit-url-error" : undefined}
            className="h-12 bg-card/70 text-base"
            disabled={mutation.isPending}
          />
        </div>
        <Button type="submit" size="lg" className="h-12 px-6" disabled={mutation.isPending}>
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Auditing…
            </>
          ) : (
            <>
              <Radar className="size-4" aria-hidden="true" />
              Run AI audit
            </>
          )}
        </Button>
      </div>
      {error ? (
        <p id="audit-url-error" role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          We fetch the live page, then score SEO, performance, security and accessibility. Unlimited
          audits, always free.
        </p>
      )}
      {mutation.isPending ? (
        <p className="mt-2 text-xs text-primary-glow" role="status">
          Fetching the page and running the AI analysis — this usually takes 15-40 seconds.
        </p>
      ) : null}
    </form>
  );
}
