import { generateText, NoObjectGeneratedError, Output } from "ai";

import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import {
  auditAnalysisSchema,
  AUDIT_CATEGORIES,
  type AuditAnalysis,
  type AuditCategory,
} from "./audit-types";

export type PageSignals = {
  finalUrl: string;
  httpStatus: number;
  isHttps: boolean;
  responseTimeMs: number;
  htmlBytes: number;
  title: string | null;
  metaDescription: string | null;
  canonical: string | null;
  robotsMeta: string | null;
  langAttribute: string | null;
  viewportMeta: string | null;
  charset: string | null;
  headings: { level: number; text: string }[];
  h1Count: number;
  wordCount: number;
  linkCount: number;
  internalLinkCount: number;
  imageCount: number;
  imagesMissingAlt: number;
  scriptCount: number;
  inlineScriptCount: number;
  stylesheetCount: number;
  inlineStyleAttributes: number;
  iframeCount: number;
  formCount: number;
  inputsMissingLabel: number;
  buttonsWithoutText: number;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasStructuredData: boolean;
  hasFavicon: boolean;
  lazyLoadedImages: number;
  usesDeprecatedTags: string[];
  securityHeaders: Record<string, string | null>;
  cookieFlags: { total: number; secure: number; httpOnly: number };
  server: string | null;
  mixedContentCount: number;
};

const SECURITY_HEADER_NAMES = [
  "strict-transport-security",
  "content-security-policy",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
  "cross-origin-opener-policy",
];

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  if (!match) return null;
  return decodeEntities(match[2] ?? match[3] ?? match[4] ?? "").trim();
}

function metaContent(html: string, key: "name" | "property", value: string): string | null {
  const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const meta of metas) {
    if (attr(meta, key)?.toLowerCase() === value.toLowerCase()) {
      const content = attr(meta, "content");
      if (content) return content;
    }
  }
  return null;
}

export function extractSignals(
  html: string,
  response: { url: string; status: number; headers: Headers },
  responseTimeMs: number,
): PageSignals {
  const headTags = html.match(/<meta\b[^>]*>/gi) ?? [];
  const imgTags = html.match(/<img\b[^>]*>/gi) ?? [];
  const inputTags = html.match(/<(input|select|textarea)\b[^>]*>/gi) ?? [];
  const scriptTags = html.match(/<script\b[^>]*>/gi) ?? [];
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];
  const anchorTags = html.match(/<a\b[^>]*>/gi) ?? [];
  const labelTags = html.match(/<label\b[^>]*>/gi) ?? [];
  const buttonBlocks = html.match(/<button\b[^>]*>[\s\S]*?<\/button>/gi) ?? [];

  const labelledIds = new Set(
    labelTags.map((tag) => attr(tag, "for")).filter((value): value is string => Boolean(value)),
  );

  const headings: { level: number; text: string }[] = [];
  const headingRegex = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let headingMatch = headingRegex.exec(html);
  while (headingMatch && headings.length < 40) {
    headings.push({
      level: Number(headingMatch[1] ?? "0"),
      text: stripTags(headingMatch[2] ?? "").slice(0, 140),
    });
    headingMatch = headingRegex.exec(html);
  }

  const origin = new URL(response.url).origin;
  const internalLinks = anchorTags.filter((tag) => {
    const href = attr(tag, "href");
    if (!href) return false;
    return href.startsWith("/") || href.startsWith("#") || href.startsWith(origin);
  }).length;

  const setCookies = response.headers.getSetCookie?.() ?? [];
  const deprecated = ["<center", "<font", "<marquee", "<blink", "<big"].filter((tag) =>
    html.toLowerCase().includes(tag),
  );

  const htmlTagMatch = html.match(/<html\b[^>]*>/i);
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);

  return {
    finalUrl: response.url,
    httpStatus: response.status,
    isHttps: response.url.startsWith("https://"),
    responseTimeMs,
    htmlBytes: new TextEncoder().encode(html).length,
    title: titleMatch ? decodeEntities(stripTags(titleMatch[1] ?? "")) : null,
    metaDescription: metaContent(html, "name", "description"),
    canonical:
      linkTags.find((tag) => attr(tag, "rel")?.toLowerCase() === "canonical")?.match(/./)
        ? attr(linkTags.find((tag) => attr(tag, "rel")?.toLowerCase() === "canonical")!, "href")
        : null,
    robotsMeta: metaContent(html, "name", "robots"),
    langAttribute: htmlTagMatch ? attr(htmlTagMatch[0], "lang") : null,
    viewportMeta: metaContent(html, "name", "viewport"),
    charset:
      headTags.find((tag) => /charset/i.test(tag))?.match(/charset\s*=\s*"?([\w-]+)/i)?.[1] ?? null,
    headings,
    h1Count: (html.match(/<h1\b/gi) ?? []).length,
    wordCount: stripTags(html).split(/\s+/).filter(Boolean).length,
    linkCount: anchorTags.length,
    internalLinkCount: internalLinks,
    imageCount: imgTags.length,
    imagesMissingAlt: imgTags.filter((tag) => attr(tag, "alt") === null).length,
    scriptCount: scriptTags.length,
    inlineScriptCount: scriptTags.filter((tag) => attr(tag, "src") === null).length,
    stylesheetCount: linkTags.filter((tag) => attr(tag, "rel")?.toLowerCase() === "stylesheet")
      .length,
    inlineStyleAttributes: (html.match(/\sstyle\s*=/gi) ?? []).length,
    iframeCount: (html.match(/<iframe\b/gi) ?? []).length,
    formCount: (html.match(/<form\b/gi) ?? []).length,
    inputsMissingLabel: inputTags.filter((tag) => {
      const type = attr(tag, "type")?.toLowerCase();
      if (type === "hidden" || type === "submit" || type === "button") return false;
      if (attr(tag, "aria-label") || attr(tag, "aria-labelledby") || attr(tag, "title")) {
        return false;
      }
      const id = attr(tag, "id");
      return !id || !labelledIds.has(id);
    }).length,
    buttonsWithoutText: buttonBlocks.filter((block) => {
      const openTag = block.match(/<button\b[^>]*>/i)?.[0] ?? "";
      if (attr(openTag, "aria-label") || attr(openTag, "title")) return false;
      return stripTags(block).length === 0;
    }).length,
    hasOpenGraph: Boolean(metaContent(html, "property", "og:title")),
    hasTwitterCard: Boolean(metaContent(html, "name", "twitter:card")),
    hasStructuredData: /application\/ld\+json/i.test(html),
    hasFavicon: linkTags.some((tag) => (attr(tag, "rel") ?? "").toLowerCase().includes("icon")),
    lazyLoadedImages: imgTags.filter((tag) => attr(tag, "loading")?.toLowerCase() === "lazy").length,
    usesDeprecatedTags: deprecated,
    securityHeaders: Object.fromEntries(
      SECURITY_HEADER_NAMES.map((name) => [name, response.headers.get(name)]),
    ),
    cookieFlags: {
      total: setCookies.length,
      secure: setCookies.filter((cookie) => /;\s*secure/i.test(cookie)).length,
      httpOnly: setCookies.filter((cookie) => /;\s*httponly/i.test(cookie)).length,
    },
    server: response.headers.get("server"),
    mixedContentCount: response.url.startsWith("https://")
      ? (html.match(/(src|href)\s*=\s*["']http:\/\//gi) ?? []).length
      : 0,
  };
}

export class AuditFetchError extends Error {}

export async function fetchPage(url: string): Promise<PageSignals> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  const startedAt = Date.now();

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "OptiSiteAI-Auditor/1.0 (+https://optisite.ai)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    const responseTimeMs = Date.now() - startedAt;
    const contentType = response.headers.get("content-type") ?? "";

    if (!response.ok && response.status >= 400) {
      throw new AuditFetchError(
        `The site responded with HTTP ${response.status}. Check that the URL is publicly reachable.`,
      );
    }
    if (contentType && !/text\/html|application\/xhtml/i.test(contentType)) {
      throw new AuditFetchError(
        `That URL returned ${contentType.split(";")[0]} instead of a web page.`,
      );
    }

    const html = (await response.text()).slice(0, 400_000);
    return extractSignals(html, response, responseTimeMs);
  } catch (error) {
    if (error instanceof AuditFetchError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new AuditFetchError("The site took longer than 20 seconds to respond.");
    }
    throw new AuditFetchError(
      "We could not reach that site. Check the URL is public and try again.",
    );
  }
}

const SYSTEM_PROMPT = `You are the audit engine for OptiSite AI, a website growth platform.
You receive real signals extracted from a live page fetch and produce a rigorous audit.
Rules:
- Score each category 0-100 using the evidence only. Never invent metrics that are not in the signals.
- Be strict: missing meta description, missing HSTS/CSP, images without alt text, and heavy inline script all lower scores.
- Every category returns between 4 and 7 findings, ordered most severe first, and always includes at least one "passed" finding when something is genuinely done well.
- "impact" explains the business consequence in one sentence. "recommendation" is a concrete, implementable fix in one or two sentences.
- Keep every string under 240 characters. Use plain professional English, no markdown, no emoji.
- page_title is the human-readable name of the page (fall back to the hostname). summary is a two-sentence executive overview.`;

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function fallbackAnalysis(signals: PageSignals, reason: string): AuditAnalysis {
  const host = new URL(signals.finalUrl).hostname;
  const heuristics: Record<AuditCategory, number> = {
    seo: clampScore(
      55 +
        (signals.title ? 12 : -20) +
        (signals.metaDescription ? 12 : -15) +
        (signals.h1Count === 1 ? 8 : -8) +
        (signals.canonical ? 5 : -3) +
        (signals.hasStructuredData ? 6 : 0),
    ),
    performance: clampScore(
      90 -
        Math.min(35, signals.responseTimeMs / 60) -
        Math.min(20, signals.scriptCount * 1.2) -
        Math.min(15, signals.htmlBytes / 40_000),
    ),
    security: clampScore(
      (signals.isHttps ? 45 : 5) +
        Object.values(signals.securityHeaders).filter(Boolean).length * 7 -
        signals.mixedContentCount * 3,
    ),
    accessibility: clampScore(
      85 -
        signals.imagesMissingAlt * 4 -
        signals.inputsMissingLabel * 5 -
        (signals.langAttribute ? 0 : 10) -
        (signals.viewportMeta ? 0 : 8),
    ),
  };

  const build = (category: AuditCategory) => ({
    score: heuristics[category],
    summary: `Scored from the live page signals. AI commentary was unavailable (${reason}).`,
    findings: [
      {
        title: "Scored from raw page signals",
        severity: "medium" as const,
        impact: "Detailed AI commentary was unavailable for this run, so only measured signals were used.",
        recommendation: "Re-run the audit to get the full AI breakdown for this category.",
      },
    ],
  });

  return {
    page_title: signals.title ?? host,
    summary: `Audit of ${host} completed using measured page signals. Re-run for the full AI breakdown.`,
    seo: build("seo"),
    performance: build("performance"),
    security: build("security"),
    accessibility: build("accessibility"),
  };
}

export async function analyzePage(signals: PageSignals): Promise<AuditAnalysis> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    return fallbackAnalysis(signals, "AI is not configured");
  }

  const gateway = createLovableAiGatewayProvider(apiKey, undefined, { structuredOutputs: true });

  try {
    const { output } = await generateText({
      model: gateway("openai/gpt-5.6-sol"),
      system: SYSTEM_PROMPT,
      prompt: `Audit these live page signals and return the structured audit.\n\n${JSON.stringify(
        signals,
        null,
        1,
      ).slice(0, 60_000)}`,
      output: Output.object({ schema: auditAnalysisSchema }),
      providerOptions: { lovable: { reasoningEffort: "none" } },
    });

    return normalizeAnalysis(output, signals);
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) {
      return fallbackAnalysis(signals, "the model returned an unusable response");
    }
    const message = error instanceof Error ? error.message : "unknown error";
    if (/429|rate limit/i.test(message)) {
      throw new Error("AI rate limit reached. Wait a moment and run the audit again.");
    }
    if (/402|credit/i.test(message)) {
      throw new Error("AI credits are exhausted for this workspace. Add credits to keep auditing.");
    }
    console.error("[audit] AI analysis failed:", message);
    return fallbackAnalysis(signals, "the AI service was unavailable");
  }
}

function normalizeAnalysis(analysis: AuditAnalysis, signals: PageSignals): AuditAnalysis {
  const host = new URL(signals.finalUrl).hostname;
  const normalized = { ...analysis };
  normalized.page_title = (analysis.page_title || signals.title || host).slice(0, 200);
  normalized.summary = analysis.summary.slice(0, 800);

  for (const category of AUDIT_CATEGORIES) {
    const value = analysis[category];
    normalized[category] = {
      score: clampScore(value.score),
      summary: value.summary.slice(0, 600),
      findings: value.findings.slice(0, 8).map((finding) => ({
        title: finding.title.slice(0, 160),
        severity: finding.severity,
        impact: finding.impact.slice(0, 400),
        recommendation: finding.recommendation.slice(0, 400),
      })),
    };
  }

  return normalized;
}

export function overallScore(analysis: AuditAnalysis): number {
  const weights: Record<AuditCategory, number> = {
    seo: 0.3,
    performance: 0.3,
    security: 0.2,
    accessibility: 0.2,
  };
  return clampScore(
    AUDIT_CATEGORIES.reduce((total, category) => total + analysis[category].score * weights[category], 0),
  );
}
