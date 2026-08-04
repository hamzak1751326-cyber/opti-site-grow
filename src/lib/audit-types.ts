import { z } from "zod";

export const AUDIT_CATEGORIES = ["seo", "performance", "security", "accessibility"] as const;
export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<AuditCategory, string> = {
  seo: "SEO",
  performance: "Performance",
  security: "Security",
  accessibility: "Accessibility",
};

export const SEVERITIES = ["critical", "high", "medium", "low", "passed"] as const;
export type Severity = (typeof SEVERITIES)[number];

export const findingSchema = z.object({
  title: z.string(),
  severity: z.enum(SEVERITIES),
  impact: z.string(),
  recommendation: z.string(),
});
export type Finding = z.infer<typeof findingSchema>;

export const categoryAnalysisSchema = z.object({
  score: z.number(),
  summary: z.string(),
  findings: z.array(findingSchema),
});

export const auditAnalysisSchema = z.object({
  page_title: z.string(),
  summary: z.string(),
  seo: categoryAnalysisSchema,
  performance: categoryAnalysisSchema,
  security: categoryAnalysisSchema,
  accessibility: categoryAnalysisSchema,
});
export type AuditAnalysis = z.infer<typeof auditAnalysisSchema>;

export const urlSchema = z
  .string()
  .trim()
  .min(4, { message: "Enter a website URL" })
  .max(2048, { message: "URL is too long" })
  .transform((value) => (/^https?:\/\//i.test(value) ? value : `https://${value}`))
  .refine(
    (value) => {
      try {
        const parsed = new URL(value);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
        return parsed.hostname.includes(".") && !parsed.hostname.endsWith(".");
      } catch {
        return false;
      }
    },
    { message: "Enter a valid website URL, e.g. example.com" },
  );

export function severityWeight(severity: Severity): number {
  switch (severity) {
    case "critical":
      return 0;
    case "high":
      return 1;
    case "medium":
      return 2;
    case "low":
      return 3;
    case "passed":
      return 4;
  }
}

export function scoreTone(score: number | null | undefined): "success" | "warning" | "danger" {
  if (score === null || score === undefined) return "warning";
  if (score >= 80) return "success";
  if (score >= 55) return "warning";
  return "danger";
}

export function scoreLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) return "Not scored";
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 55) return "Needs work";
  if (score >= 35) return "Poor";
  return "Critical";
}
