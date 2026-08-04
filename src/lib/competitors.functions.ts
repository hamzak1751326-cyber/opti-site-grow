import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { urlSchema } from "@/lib/audit-types";

export const listCompetitors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [competitors, audits] = await Promise.all([
      context.supabase
        .from("competitors")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      context.supabase
        .from("audits")
        .select(
          "id, url, page_title, overall_score, seo_score, performance_score, security_score, accessibility_score",
        )
        .eq("status", "completed")
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (competitors.error) throw new Error(competitors.error.message);
    if (audits.error) throw new Error(audits.error.message);

    return { competitors: competitors.data ?? [], audits: audits.data ?? [] };
  });

export const addCompetitor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({ url: urlSchema, auditId: z.string().uuid().nullable().default(null) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { performCompetitorScan } = await import("@/lib/audit-runner.server");
    return performCompetitorScan(context.supabase, context.userId, data.url, data.auditId);
  });

export const deleteCompetitor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("competitors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { id: data.id };
  });
