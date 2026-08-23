import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
export const Route = createFileRoute("/ai-disclaimer")({ head: () => ({ meta: [{ title: "AI Usage & Disclaimer — OptiSite AI" }] }), component: () => <LegalPage policyKey="ai" /> });
