import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
export const Route = createFileRoute("/account-deletion")({ head: () => ({ meta: [{ title: "Account Deletion — OptiSite AI" }] }), component: () => <LegalPage policyKey="deletion" /> });
