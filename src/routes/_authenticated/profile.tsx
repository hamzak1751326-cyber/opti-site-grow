import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";

import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAccount, updateProfile } from "@/lib/account.functions";

const accountQuery = queryOptions({ queryKey: ["account"], queryFn: () => getAccount() });

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — OptiSite AI" },
      { name: "description", content: "Manage your OptiSite AI profile details and recent activity." },
      { property: "og:title", content: "Profile — OptiSite AI" },
      { property: "og:description", content: "Your account details and activity log." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(accountQuery),
  component: ProfilePage,
});

function ProfilePage() {
  const { data } = useSuspenseQuery(accountQuery);
  const queryClient = useQueryClient();
  const save = useServerFn(updateProfile);
  const [fullName, setFullName] = useState(data.profile.full_name ?? "");
  const [company, setCompany] = useState(data.profile.company ?? "");
  const [website, setWebsite] = useState(data.profile.website ?? "");

  const mutation = useMutation({
    mutationFn: () =>
      save({
        data: {
          full_name: fullName.trim() === "" ? null : fullName.trim(),
          company: company.trim() === "" ? null : company.trim(),
          website: website.trim() === "" ? null : website.trim(),
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      toast.success("Profile updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <AppShell title="Profile" description="Your account details and recent activity.">
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <form
          className="surface-panel space-y-5 rounded-2xl p-6"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={data.profile.email ?? ""} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="full-name">Full name</Label>
            <Input
              id="full-name"
              maxLength={120}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Ada Lovelace"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              maxLength={120}
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Acme Inc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              maxLength={300}
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://acme.com"
            />
          </div>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving…" : "Save profile"}
          </Button>
        </form>

        <section className="surface-panel rounded-2xl p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Recent activity
          </h2>
          {data.usage.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No activity recorded yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {data.usage.map((entry) => (
                <li key={entry.id} className="py-2.5">
                  <p className="text-sm font-medium">{entry.action.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(entry.created_at).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </AppShell>
  );
}
