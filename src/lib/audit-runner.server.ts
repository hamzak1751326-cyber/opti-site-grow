import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/integrations/supabase/types";

import { analyzePage, AuditFetchError, fetchPage, overallScore } from "./audit.server";
import { AUDIT_CATEGORIES } from "./audit-types";

type Client = SupabaseClient<Database>;

export async function performAudit(supabase: Client, userId: string, url: string) {
  const insert = await supabase
    .from("audits")
    .insert({ user_id: userId, url, status: "running" })
    .select("id")
    .single();

  if (insert.error) throw new Error(insert.error.message);
  const auditId = insert.data.id;

  try {
    const signals = await fetchPage(url);
    const analysis = await analyzePage(signals);
    const overall = overallScore(analysis);

    const rows = AUDIT_CATEGORIES.map((category) => ({
      audit_id: auditId,
      user_id: userId,
      category,
      score: analysis[category].score,
      summary: analysis[category].summary,
      findings: analysis[category].findings,
    }));

    const resultsInsert = await supabase.from("audit_results").insert(rows);
    if (resultsInsert.error) throw new Error(resultsInsert.error.message);

    const update = await supabase
      .from("audits")
      .update({
        status: "completed",
        page_title: analysis.page_title,
        summary: analysis.summary,
        overall_score: overall,
        seo_score: analysis.seo.score,
        performance_score: analysis.performance.score,
        security_score: analysis.security.score,
        accessibility_score: analysis.accessibility.score,
        completed_at: new Date().toISOString(),
        error_message: null,
      })
      .eq("id", auditId);

    if (update.error) throw new Error(update.error.message);

    const settings = await supabase
      .from("user_settings")
      .select("auto_generate_reports")
      .eq("user_id", userId)
      .maybeSingle();

    if (settings.data?.auto_generate_reports !== false) {
      await supabase.from("reports").insert({
        user_id: userId,
        audit_id: auditId,
        title: `${analysis.page_title} — growth report`,
        notes: analysis.summary,
      });
    }

    await supabase.from("usage_logs").insert({
      user_id: userId,
      action: "audit.completed",
      metadata: { audit_id: auditId, url, overall_score: overall },
    });

    return { auditId, overallScore: overall };
  } catch (error) {
    const message =
      error instanceof AuditFetchError || error instanceof Error
        ? error.message
        : "The audit failed unexpectedly.";

    await supabase
      .from("audits")
      .update({ status: "failed", error_message: message, completed_at: new Date().toISOString() })
      .eq("id", auditId);

    await supabase.from("usage_logs").insert({
      user_id: userId,
      action: "audit.failed",
      metadata: { audit_id: auditId, url, message },
    });

    throw new Error(message);
  }
}

export async function performCompetitorScan(
  supabase: Client,
  userId: string,
  url: string,
  auditId: string | null,
) {
  const host = new URL(url).hostname.replace(/^www\./, "");
  const insert = await supabase
    .from("competitors")
    .insert({ user_id: userId, audit_id: auditId, url, name: host, status: "running" })
    .select("id")
    .single();

  if (insert.error) throw new Error(insert.error.message);
  const competitorId = insert.data.id;

  try {
    const signals = await fetchPage(url);
    const analysis = await analyzePage(signals);
    const overall = overallScore(analysis);

    const update = await supabase
      .from("competitors")
      .update({
        status: "completed",
        name: analysis.page_title || host,
        overall_score: overall,
        seo_score: analysis.seo.score,
        performance_score: analysis.performance.score,
        security_score: analysis.security.score,
        accessibility_score: analysis.accessibility.score,
        summary: analysis.summary,
      })
      .eq("id", competitorId);

    if (update.error) throw new Error(update.error.message);

    await supabase.from("usage_logs").insert({
      user_id: userId,
      action: "competitor.scanned",
      metadata: { competitor_id: competitorId, url, overall_score: overall },
    });

    return { competitorId, overallScore: overall };
  } catch (error) {
    const message = error instanceof Error ? error.message : "The competitor scan failed.";
    await supabase
      .from("competitors")
      .update({ status: "failed", summary: message })
      .eq("id", competitorId);
    throw new Error(message);
  }
}
