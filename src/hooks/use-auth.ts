import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ session: null, user: null, loading: true });

  useEffect(() => {
    let active = true;

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      setState({ session, user: session?.user ?? null, loading: false });
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setState({ session: data.session, user: data.session?.user ?? null, loading: false });
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export function displayName(user: User | null): string {
  if (!user) return "Guest";
  const meta = user.user_metadata as { full_name?: string; name?: string } | undefined;
  return meta?.full_name ?? meta?.name ?? user.email?.split("@")[0] ?? "Account";
}

export function initials(name: string): string {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
