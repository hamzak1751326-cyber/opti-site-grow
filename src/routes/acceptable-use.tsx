import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
export const Route = createFileRoute("/acceptable-use")({ head: () => ({ meta: [{ title: "Acceptable Use Policy — OptiSite AI" }] }), component: () => <LegalPage policyKey="acceptable" /> });
