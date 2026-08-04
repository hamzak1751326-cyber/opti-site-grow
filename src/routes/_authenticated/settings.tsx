import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getAccount, updateSettings } from "@/lib/account.functions";

const accountQuery = queryOptions({ queryKey: ["account"], queryFn: () => getAccount() });

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — OptiSite AI" },
      { name: "description", content: "Control audit defaults, notifications and report automation." },
      { property: "og:title", content: "Settings — OptiSite AI" },
      { property: "og:description", content: "Audit defaults and notification preferences." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery),
  component: SettingsPage,
});

function SettingsPage() {
  const { data } = useSuspenseQuery(accountQuery);
  const queryClient = useQueryClient();
  const save = useServerFn(updateSettings);
  const [form, setForm] = useState({
    email_notifications: data.settings.email_notifications,
    weekly_digest: data.settings.weekly_digest,
    auto_generate_reports: data.settings.auto_generate_reports,
    default_device: data.settings.default_device,
  });

  const mutation = useMutation({
    mutationFn: () => save({ data: form }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Settings saved");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggles = [
    { key: "email_notifications" as const, label: "Email notifications", hint: "Get an email when an audit finishes." },
    { key: "weekly_digest" as const, label: "Weekly digest", hint: "A weekly summary of score changes." },
    { key: "auto_generate_reports" as const, label: "Auto-save reports", hint: "Save a report automatically after each audit." },
  ];

  return (
    <AppShell title="Settings" description="Audit defaults and notification preferences.">
      <form
        className="surface-panel max-w-2xl space-y-6 rounded-2xl p-6"
        onSubmit={(event) => {
          event.preventDefault();
          mutation.mutate();
        }}
      >
        {toggles.map((item) => (
          <div key={item.key} className="flex items-start justify-between gap-6">
            <div>
              <Label htmlFor={item.key}>{item.label}</Label>
              <p className="mt-1 text-sm text-muted-foreground">{item.hint}</p>
            </div>
            <Switch
              id={item.key}
              checked={form[item.key]}
              onCheckedChange={(checked) => setForm((prev) => ({ ...prev, [item.key]: checked }))}
            />
          </div>
        ))}

        <div className="space-y-2">
          <Label htmlFor="default-device">Default device profile</Label>
          <select
            id="default-device"
            value={form.default_device}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, default_device: event.target.value }))
            }
            className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
          </select>
        </div>

        <div className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
          OptiSite AI is completely free — unlimited audits, reports and competitor scans. There is
          nothing to upgrade.
        </div>

        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving…" : "Save settings"}
        </Button>
      </form>
    </AppShell>
  );
}
