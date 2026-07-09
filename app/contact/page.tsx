// app/contact/page.tsx
import { Metadata } from "next";
import ContactHero from "@/components/contact/ContactHero";
import ContactForm from "@/components/contact/ContactForm";
import ContactInfo from "@/components/contact/ContactInfo";
import OfficeLocations from "@/components/contact/OfficeLocations";
import FAQSection from "@/components/contact/FAQSection";
import MapSection from "@/components/contact/MapSection";

export const metadata: Metadata = {
  title: "Contact Us | Earth Design - Get in Touch",
  description:
    "Contact Earth Design for all your real estate needs in Cameroon. Visit our offices in Douala, Yaoundé, and across the country. We're here to help you find your dream property.",
  keywords: [
    "contact Earth Design",
    "real estate Cameroon",
    "property inquiry",
    "Douala office",
    "Yaoundé office",
  ],
};

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <ContactHero />
      <div className="bg-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <ContactForm />
            </div>
            <div>
              <ContactInfo />
            </div>
          </div>
        </div>
      </div>
      <OfficeLocations />
      <MapSection />
      <FAQSection />
    </main>
  );
}
