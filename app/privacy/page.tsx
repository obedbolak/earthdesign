// app/privacy/page.tsx
import { Metadata } from "next";
import PrivacyPolicyContent from "@/components/legal/PrivacyPolicyContent";

export const metadata: Metadata = {
  title: "Privacy Policy | Earth Design & EDE Connect",
  description:
    "How Earth Design Engineering Ltd collects, uses and protects your information on earthdesignengineeringltd.com and in the EDE Connect app, and how to delete your account.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen">
      <PrivacyPolicyContent />
    </main>
  );
}
