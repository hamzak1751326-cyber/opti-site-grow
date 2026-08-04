import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Accessibility,
  BarChart3,
  FileText,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Swords,
  User as UserIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Logo } from "@/components/brand/logo";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { displayName, initials, useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/audits", label: "Audits", Icon: Gauge },
  { to: "/competitors", label: "Competitors", Icon: Swords },
  { to: "/reports", label: "Reports", Icon: FileText },
  { to: "/profile", label: "Profile", Icon: UserIcon },
  { to: "/settings", label: "Settings", Icon: Settings },
  { to: "/help", label: "Help", Icon: HelpCircle },
] as const;

const PILLARS = [
  { label: "SEO", Icon: BarChart3 },
  { label: "Performance", Icon: Gauge },
  { label: "Security", Icon: ShieldCheck },
  { label: "Accessibility", Icon: Accessibility },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav className="flex flex-col gap-1" aria-label="Main">
      {NAV_ITEMS.map(({ to, label, Icon }) => {
        const active = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4.5 shrink-0" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const name = displayName(user);

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const sidebar = (
    <div className="flex h-full flex-col gap-6 p-4">
      <Logo to="/dashboard" />
      <NavLinks onNavigate={() => setMobileOpen(false)} />
      <div className="mt-auto space-y-4">
        <div className="rounded-xl border border-border bg-card/60 p-3">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Audit pillars
          </p>
          <ul className="mt-2 space-y-1.5">
            {PILLARS.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="size-3.5 text-primary-glow" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3">
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary/20 text-xs text-primary-glow">
              {initials(name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            aria-label="Sign out"
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-background">
      <div className="mx-auto flex w-full max-w-[1600px]">
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
          {sidebar}
        </aside>

        <div className="min-w-0 flex-1">
          <header className="glass-panel sticky top-0 z-30 flex items-center gap-3 border-x-0 border-t-0 px-4 py-3 lg:px-8">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-4" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                {sidebar}
              </SheetContent>
            </Sheet>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
              {description ? (
                <p className="truncate text-xs text-muted-foreground sm:text-sm">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
          </header>

          <main className="px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
