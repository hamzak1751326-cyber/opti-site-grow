import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export type PolicySection = { heading: string; paragraphs: string[]; bullets?: string[] };
export type Policy = { title: string; eyebrow: string; intro: string; updated: string; sections: PolicySection[] };

export const POLICIES: Record<string, Policy> = {
  terms: {
    title: "Terms of Use", eyebrow: "Legal / Policies", updated: "[LAST UPDATED DATE]",
    intro: "These Terms of Use describe the rules for using OptiSite AI. They are a working template and have not been reviewed or approved by a lawyer.",
    sections: [
      { heading: "1. The service", paragraphs: ["OptiSite AI is a SaaS for running website audits, viewing scores and findings across SEO, performance, security and accessibility, comparing websites, and creating reports. Features may change, be unavailable, or be limited while the service is operated."] },
      { heading: "2. Accounts and responsibilities", paragraphs: ["You are responsible for the accuracy of information you submit, protecting your login credentials, and activity carried out through your account. Do not share access or use the service if you are not authorized to inspect a website."] },
      { heading: "3. Acceptable use", paragraphs: ["You must not use the service to break the law, infringe rights, probe systems without permission, submit malicious content, interfere with the service, evade safeguards, or attempt to access another user’s data. The Acceptable Use Policy forms part of these Terms."] },
      { heading: "4. Results and intellectual property", paragraphs: ["You retain rights in information you submit. OptiSite AI and its software, interface, branding, and underlying materials remain owned by [LEGAL BUSINESS NAME] or its licensors. Audit scores, recommendations, comparisons, reports, and AI-generated text are informational outputs based on available evidence; review them before relying on or sharing them."] },
      { heading: "5. Availability and termination", paragraphs: ["The service is provided on an as-available basis. We may suspend or terminate access for misuse, security reasons, or operational needs, subject to applicable law. You may request account deletion using the process on the Account Deletion page."] },
      { heading: "6. Disclaimers and liability", paragraphs: ["The service is not legal, tax, financial, accessibility-certification, SEO-ranking, or cybersecurity advice. To the maximum extent allowed by applicable law, the service is provided without warranties and [LEGAL BUSINESS NAME] will not be responsible for indirect, incidental, special, consequential, or loss-of-data damages. Any limitation must be reviewed for enforceability in the relevant jurisdiction."] },
      { heading: "7. Governing law", paragraphs: ["These Terms are intended to be governed by the laws of [JURISDICTION], with disputes handled by the courts or process required there. Replace this placeholder only after legal review."] },
      { heading: "8. Contact", paragraphs: ["Questions about these Terms can be sent to [CONTACT EMAIL]."] },
    ],
  },
  privacy: {
    title: "Privacy Policy", eyebrow: "Legal / Policies", updated: "[LAST UPDATED DATE]",
    intro: "This policy explains what OptiSite AI currently collects and how that information is used. Confirm the details with your legal adviser and infrastructure configuration before publishing.",
    sections: [
      { heading: "1. Information collected", paragraphs: ["When you create an account, we receive your email address and, if provided, your full name. Your profile may also include company and website information. When you use the product, we store audit targets and audit status, scores, findings, summaries, competitor entries, reports, settings, and usage log entries associated with your account.", "The service may receive technical information needed to operate requests, such as IP address, browser/device information, timestamps, and error details, depending on hosting and security logs. Do not submit secrets or sensitive personal information in audit fields, notes, or reports."] },
      { heading: "2. Why information is used", paragraphs: ["We use information to authenticate users, provide audits and reports, save user settings and history, secure and troubleshoot the service, measure usage, prevent abuse, and respond to support requests. We do not use this policy to promise advertising, profiling, or data sales that have not been configured and reviewed."] },
      { heading: "3. Website audit data", paragraphs: ["When you request an audit, the service may fetch the public URL you submit and inspect its HTML, response headers, and related measurable signals. Only submit URLs you are authorized to inspect. Results may contain content from the audited website and should be treated accordingly."] },
      { heading: "4. Storage and providers", paragraphs: ["Account and product data is stored using the configured Supabase project. The application is deployed using the configured Vercel setup. AI-related processing may use the server-side AI gateway configured for this application. Verify the exact providers, regions, subprocessors, and contractual terms before publishing this policy; add or remove providers here as the deployment changes."] },
      { heading: "5. Security", paragraphs: ["The application uses authenticated access and account-scoped database policies for private product records. No online system is perfectly secure. Report suspected vulnerabilities through [CONTACT EMAIL] and do not include credentials or secrets."] },
      { heading: "6. Retention and deletion", paragraphs: ["We retain account and product information for [DATA RETENTION PERIOD] or as otherwise necessary for the purposes described here and applicable law. You can request deletion as described on the Account Deletion page. Deletion may not immediately remove limited backups, security logs, or records we must retain by law; confirm the actual process before publishing."] },
      { heading: "7. Your choices and rights", paragraphs: ["Depending on where you live, you may have rights to access, correct, delete, restrict, object to, or receive a copy of personal data, and to withdraw consent where processing relies on consent. Contact [CONTACT EMAIL] to make a request. We may need to verify your identity and may have lawful exceptions."] },
      { heading: "8. Contact", paragraphs: ["Privacy questions and requests: [CONTACT EMAIL]. Business details: [LEGAL BUSINESS NAME], [BUSINESS ADDRESS]."] },
    ],
  },
  cookies: {
    title: "Cookie Policy", eyebrow: "Legal / Policies", updated: "[LAST UPDATED DATE]",
    intro: "This page describes cookie and similar-technology use that must be confirmed against the production hosting, analytics, and authentication configuration.",
    sections: [
      { heading: "1. What cookies may do", paragraphs: ["Cookies or browser storage may be used to keep authentication working, remember security/session state, preserve preferences, and understand errors or service performance. The exact technologies depend on the enabled Supabase, hosting, and monitoring configuration."] },
      { heading: "2. Categories", bullets: ["Essential: required for sign-in, session continuity, security, and core operation.", "Preference: used to remember choices such as interface or device settings when enabled.", "Analytics or diagnostics: used only if enabled in the deployment to understand performance, errors, or aggregate usage."], paragraphs: ["Do not describe optional analytics or advertising cookies as active until they are verified in production."] },
      { heading: "3. Your choices", paragraphs: ["You can control cookies through your browser settings. Blocking essential storage may prevent sign-in or other core features from working. Contact [CONTACT EMAIL] with questions about the technologies currently enabled."] },
    ],
  },
  acceptable: {
    title: "Acceptable Use Policy", eyebrow: "Legal / Policies", updated: "[LAST UPDATED DATE]",
    intro: "Use OptiSite AI only for lawful, authorized, and respectful website analysis and business workflows.",
    sections: [
      { heading: "You may not", bullets: ["Audit websites or systems without permission, or use results to facilitate unauthorized access.", "Submit malware, credentials, payment data, highly sensitive personal data, or content that violates another person’s rights.", "Probe, scan, scrape, overload, reverse engineer, or bypass rate limits or authentication controls.", "Use generated results to impersonate, deceive, harass, discriminate, or make high-impact decisions without appropriate human review.", "Attempt to access, modify, or infer another user’s account, audits, reports, settings, or conversations."] },
      { heading: "Enforcement", paragraphs: ["We may investigate suspected misuse, limit requests, suspend access, remove content, or report unlawful activity where appropriate. Contact [CONTACT EMAIL] if you believe an action was taken in error."] },
    ],
  },
  ai: {
    title: "AI Usage & Disclaimer", eyebrow: "Legal / Policies", updated: "[LAST UPDATED DATE]",
    intro: "AI features are assistive tools, not a substitute for qualified professional judgment.",
    sections: [
      { heading: "How AI is used", paragraphs: ["OptiSite AI may use server-side AI processing to analyze audit evidence, summarize findings, explain SEO, performance, accessibility, UX, and security recommendations, and provide general product guidance. The browser must not receive the provider secret key."] },
      { heading: "Accuracy and uncertainty", paragraphs: ["AI output can be incomplete, outdated, or wrong. The assistant should indicate uncertainty, but you must verify recommendations against your site, documentation, policies, and qualified professionals before acting. An audit score is not a guarantee of rankings, accessibility conformance, security, or business outcomes."] },
      { heading: "Professional advice", paragraphs: ["AI output is not legal, tax, financial, medical, or professional cybersecurity advice. Do not use it as the sole basis for a regulated, safety-critical, employment, credit, or other high-impact decision."] },
      { heading: "Your inputs", paragraphs: ["Do not put passwords, API keys, payment credentials, or unnecessary sensitive personal data into audit notes, chat prompts, or other inputs. Confirm the configured AI provider’s retention and training terms before publishing a final version of this policy."] },
    ],
  },
  deletion: {
    title: "Data & Account Deletion", eyebrow: "Legal / Policies", updated: "[LAST UPDATED DATE]",
    intro: "You can request deletion of your OptiSite AI account and associated product records.",
    sections: [
      { heading: "What to request", paragraphs: ["Send a request from the account email to [CONTACT EMAIL] with the subject “Account deletion request”. Include the email address on the account and any details needed to identify the request. Do not send a password, token, or secret."] },
      { heading: "What may be deleted", paragraphs: ["After identity verification, the intended scope includes the account profile, settings, audits, audit results, competitor records, reports, usage records, and other account-linked product data, subject to the actual database relationships and applicable legal requirements."] },
      { heading: "Timing and exceptions", paragraphs: ["Requests are handled within [DELETION RESPONSE PERIOD]. Backups, fraud-prevention records, security logs, or records required by law may persist for [DATA RETENTION PERIOD] and then be deleted or de-identified according to the verified retention process."] },
    ],
  },
  contact: {
    title: "Contact & Grievance Information", eyebrow: "Legal / Policies", updated: "[LAST UPDATED DATE]",
    intro: "Use the details below for privacy questions, support, policy concerns, or grievances. Replace every placeholder before launch.",
    sections: [
      { heading: "Contact", paragraphs: ["Legal business name: [LEGAL BUSINESS NAME]", "Email: [CONTACT EMAIL]", "Address: [BUSINESS ADDRESS]", "Jurisdiction: [JURISDICTION]"] },
      { heading: "Privacy and deletion requests", paragraphs: ["For access, correction, deletion, or privacy questions, email [CONTACT EMAIL] with a clear subject and enough context to locate your account. We may verify ownership before responding."] },
      { heading: "Grievance process", paragraphs: ["Describe the concern, the relevant account or request, and the resolution you are seeking. We will acknowledge it within [GRIEVANCE RESPONSE PERIOD] and respond through the contact details you provide, subject to applicable law."] },
      { heading: "Not legal compliance", paragraphs: ["These pages are product documentation and drafting templates, not legal advice or a representation that the application is legally compliant. Obtain qualified legal review for each country where the SaaS operates."] },
    ],
  },
};

export function LegalPage({ policyKey }: { policyKey: keyof typeof POLICIES }) {
  const policy = POLICIES[policyKey];
  return <div className="min-h-dvh bg-background">
    <header className="glass-panel sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6"><Logo /><Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="mr-2 size-4" />Back to home</Link></Button></div>
    </header>
    <main className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-glow">{policy.eyebrow}</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{policy.title}</h1>
      <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{policy.intro}</p>
      <p className="mt-3 text-xs text-muted-foreground">Last updated: {policy.updated}</p>
      <div className="mt-12 space-y-10">
        {policy.sections.map((section) => <section key={section.heading} className="space-y-3"><h2 className="text-xl font-semibold text-foreground">{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="leading-7 text-muted-foreground">{paragraph}</p>)}{section.bullets ? <ul className="list-disc space-y-2 pl-6 leading-7 text-muted-foreground">{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}</section>)}
      </div>
      <div className="mt-14 rounded-2xl border border-border bg-card/60 p-5"><div className="flex items-center gap-2 text-sm font-medium text-foreground"><Mail className="size-4 text-primary-glow" />Questions or corrections?</div><p className="mt-2 text-sm leading-6 text-muted-foreground">Contact <span className="font-medium text-foreground">[CONTACT EMAIL]</span>. These pages should be reviewed and completed before production publication.</p></div>
    </main>
    <footer className="border-t border-border"><div className="mx-auto flex w-full max-w-6xl flex-wrap gap-x-5 gap-y-2 px-4 py-8 text-xs text-muted-foreground sm:px-6"><Link to="/terms" className="hover:text-foreground">Terms</Link><Link to="/privacy" className="hover:text-foreground">Privacy</Link><Link to="/cookies" className="hover:text-foreground">Cookies</Link><Link to="/acceptable-use" className="hover:text-foreground">Acceptable Use</Link><Link to="/ai-disclaimer" className="hover:text-foreground">AI Disclaimer</Link><Link to="/account-deletion" className="hover:text-foreground">Account Deletion</Link><Link to="/contact" className="hover:text-foreground">Contact</Link></div></footer>
  </div>;
}
