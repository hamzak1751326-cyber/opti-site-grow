import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
export const Route = createFileRoute("/contact")({ head: () => ({ meta: [{ title: "Contact & Grievance — OptiSite AI" }] }), component: () => <LegalPage policyKey="contact" /> });
