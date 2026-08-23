import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
export const Route = createFileRoute("/privacy")({ head: () => ({ meta: [{ title: "Privacy Policy — OptiSite AI" }] }), component: () => <LegalPage policyKey="privacy" /> });
