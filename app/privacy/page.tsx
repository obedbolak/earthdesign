// app/privacy-policy/page.tsx
import { Metadata } from "next";
import PrivacyPolicyContent from "@/components/legal/PrivacyPolicyContent";

export const metadata: Metadata = {
  title: "Privacy Policy | Earth Design",
  description:
    "Learn how Earth Design collects, uses, and protects your personal information. Our commitment to your privacy and data security.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen">
      <PrivacyPolicyContent />
    </main>
  );
}
