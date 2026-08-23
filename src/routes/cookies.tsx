import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
export const Route = createFileRoute("/cookies")({ head: () => ({ meta: [{ title: "Cookie Policy — OptiSite AI" }] }), component: () => <LegalPage policyKey="cookies" /> });
