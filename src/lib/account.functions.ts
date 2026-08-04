import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profile, settings, usage] = await Promise.all([
      context.supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, company, website, created_at")
        .eq("id", context.userId)
        .maybeSingle(),
      context.supabase
        .from("user_settings")
        .select("email_notifications, weekly_digest, default_device, auto_generate_reports")
        .eq("user_id", context.userId)
        .maybeSingle(),
      context.supabase
        .from("usage_logs")
        .select("id, action, metadata, created_at")
        .order("created_at", { ascending: false })
        .limit(15),
    ]);

    if (profile.error) throw new Error(profile.error.message);
    if (settings.error) throw new Error(settings.error.message);

    return {
      profile: profile.data ?? {
        id: context.userId,
        email: (context.claims["email"] as string | undefined) ?? null,
        full_name: null,
        avatar_url: null,
        company: null,
        website: null,
        created_at: new Date().toISOString(),
      },
      settings:
        settings.data ?? {
          email_notifications: true,
          weekly_digest: false,
          default_device: "desktop",
          auto_generate_reports: true,
        },
      usage: usage.data ?? [],
    };
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        full_name: z.string().trim().max(120).nullable(),
        company: z.string().trim().max(120).nullable(),
        website: z.string().trim().max(300).nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("profiles")
      .upsert({ id: context.userId, ...data }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        email_notifications: z.boolean(),
        weekly_digest: z.boolean(),
        default_device: z.enum(["desktop", "mobile"]),
        auto_generate_reports: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("user_settings")
      .upsert({ user_id: context.userId, ...data }, { onConflict: "user_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("reports")
      .select(
        "id, title, notes, created_at, audit_id, audits(url, page_title, overall_score, status)",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        audit_id: z.string().uuid(),
        title: z.string().trim().min(1).max(160),
        notes: z.string().trim().max(2000).nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: report, error } = await context.supabase
      .from("reports")
      .insert({ ...data, user_id: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return report;
  });

export const deleteReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("reports").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { id: data.id };
  });
