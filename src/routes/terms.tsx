import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
export const Route = createFileRoute("/terms")({ head: () => ({ meta: [{ title: "Terms of Use — OptiSite AI" }] }), component: () => <LegalPage policyKey="terms" /> });
