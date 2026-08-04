import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { urlSchema } from "@/lib/audit-types";

export const listAudits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("audits")
      .select(
        "id, url, page_title, status, error_message, overall_score, seo_score, performance_score, security_score, accessibility_score, summary, created_at, completed_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [auditsResult, reportsResult, competitorsResult] = await Promise.all([
      context.supabase
        .from("audits")
        .select(
          "id, url, page_title, status, overall_score, seo_score, performance_score, security_score, accessibility_score, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(30),
      context.supabase.from("reports").select("id", { count: "exact", head: true }),
      context.supabase.from("competitors").select("id", { count: "exact", head: true }),
    ]);

    if (auditsResult.error) throw new Error(auditsResult.error.message);

    const audits = auditsResult.data ?? [];
    const scored = audits.filter((audit) => audit.overall_score !== null);

    return {
      audits,
      totals: {
        audits: audits.length,
        reports: reportsResult.count ?? 0,
        competitors: competitorsResult.count ?? 0,
        averageScore: scored.length
          ? Math.round(
              scored.reduce((sum, audit) => sum + (audit.overall_score ?? 0), 0) / scored.length,
            )
          : null,
      },
    };
  });

export const getAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const [auditResult, resultsResult, competitorsResult] = await Promise.all([
      context.supabase.from("audits").select("*").eq("id", data.id).maybeSingle(),
      context.supabase
        .from("audit_results")
        .select("id, category, score, summary, findings")
        .eq("audit_id", data.id),
      context.supabase
        .from("competitors")
        .select("*")
        .eq("audit_id", data.id)
        .order("created_at", { ascending: false }),
    ]);

    if (auditResult.error) throw new Error(auditResult.error.message);
    if (!auditResult.data) throw new Error("Audit not found");
    if (resultsResult.error) throw new Error(resultsResult.error.message);

    return {
      audit: auditResult.data,
      results: resultsResult.data ?? [],
      competitors: competitorsResult.data ?? [],
    };
  });

export const runAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ url: urlSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const { performAudit } = await import("@/lib/audit-runner.server");
    return performAudit(context.supabase, context.userId, data.url);
  });

export const deleteAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("audits").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { id: data.id };
  });
