import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/app-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({
    meta: [
      { title: "Help & FAQ — OptiSite AI" },
      {
        name: "description",
        content: "How OptiSite AI audits work, what each score means, and how to fix findings fast.",
      },
      { property: "og:title", content: "Help & FAQ — OptiSite AI" },
      { property: "og:description", content: "Understand your audit scores and findings." },
    ],
  }),
  component: HelpPage,
});

const FAQ = [
  {
    q: "How does an audit work?",
    a: "We fetch your page server-side, read the HTML and response headers, measure concrete signals (meta tags, headings, alt text, scripts, security headers, response time) and pass that evidence to AI for scoring and prioritized findings.",
  },
  {
    q: "What do the scores mean?",
    a: "Each pillar is scored 0-100. Above 90 is strong, 70-89 has clear wins available, below 70 means issues are actively holding growth back. The overall score is the average of the four pillars.",
  },
  {
    q: "Why did my audit fail?",
    a: "The most common causes are a URL that isn't publicly reachable, a site that blocks server-side requests, or a redirect loop. Check the error message on the audit and retry with the final canonical URL.",
  },
  {
    q: "How do I export a report?",
    a: "Open any audit, choose Save report to keep it in your library, then use Print / PDF to produce a shareable file.",
  },
  {
    q: "Is anything paid?",
    a: "No. OptiSite AI has no billing, plans or feature gates. Audits, reports and competitor scans are unlimited for every account.",
  },
];

function HelpPage() {
  return (
    <AppShell title="Help" description="Everything about audits, scores and reports.">
      <div className="surface-panel max-w-3xl rounded-2xl p-6">
        <Accordion type="single" collapsible className="w-full">
          {FAQ.map((item, index) => (
            <AccordionItem key={item.q} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-6 text-sm text-muted-foreground">
          Ready to run one?{" "}
          <Link to="/dashboard" className="underline underline-offset-4">
            Go to the dashboard
          </Link>
          .
        </p>
      </div>
    </AppShell>
  );
}
