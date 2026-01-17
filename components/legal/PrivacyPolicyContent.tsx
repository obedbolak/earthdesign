// components/legal/PrivacyPolicyContent.tsx
"use client";

import { motion } from "framer-motion";
import {
  Shield,
  Eye,
  Lock,
  Database,
  Share2,
  Clock,
  UserCheck,
  Bell,
  FileText,
  Mail,
  ChevronRight,
  Printer,
  Download,
} from "lucide-react";
import Link from "next/link";

const sections = [
  { id: "introduction", title: "Introduction", icon: FileText },
  {
    id: "information-collection",
    title: "Information We Collect",
    icon: Database,
  },
  { id: "how-we-use", title: "How We Use Your Information", icon: Eye },
  { id: "information-sharing", title: "Information Sharing", icon: Share2 },
  { id: "data-security", title: "Data Security", icon: Lock },
  { id: "cookies", title: "Cookies & Tracking", icon: Bell },
  { id: "your-rights", title: "Your Rights", icon: UserCheck },
  { id: "data-retention", title: "Data Retention", icon: Clock },
  { id: "updates", title: "Policy Updates", icon: FileText },
  { id: "contact", title: "Contact Us", icon: Mail },
];

export default function PrivacyPolicyContent() {
  const lastUpdated = "January 15, 2024";

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, delay: 1 }}
            className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500 rounded-full blur-3xl"
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-teal-300 text-sm font-medium mb-6">
              <Shield className="w-4 h-4" />
              <span>Your Privacy Matters</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Privacy Policy
            </h1>

            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              At Earth Desgin, we are committed to protecting your privacy and
              ensuring the security of your personal information.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Last Updated: {lastUpdated}
              </span>
              <span className="hidden md:block">•</span>
              <span>Effective immediately</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Navigation */}
          <motion.aside
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:w-72 flex-shrink-0"
          >
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4">
                  Quick Navigation
                </h3>
                <nav className="space-y-1">
                  {sections.map((section, index) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all group"
                    >
                      <section.icon className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                      <span>{section.title}</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </nav>

                {/* Actions */}
                <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    Print Policy
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 min-w-0"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12">
              {/* Introduction */}
              <section id="introduction" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    1. Introduction
                  </h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed">
                    Welcome to Earth Desgin ("we," "our," or "us"). This Privacy
                    Policy explains how we collect, use, disclose, and safeguard
                    your information when you visit our website, use our mobile
                    application, or engage with our real estate services.
                  </p>
                  <p className="text-gray-600 leading-relaxed mt-4">
                    By accessing or using our services, you acknowledge that you
                    have read, understood, and agree to be bound by this Privacy
                    Policy. If you do not agree with the terms of this policy,
                    please do not access our services.
                  </p>
                  <div className="mt-6 p-4 bg-teal-50 border border-teal-100 rounded-xl">
                    <p className="text-sm text-teal-800">
                      <strong>Note:</strong> This policy applies to all users of
                      Earth Desgin services in Cameroon and internationally. We
                      comply with applicable data protection laws including
                      Cameroon's Law No. 2010/012 on Cybersecurity and
                      Cybercrime.
                    </p>
                  </div>
                </div>
              </section>

              {/* Information We Collect */}
              <section id="information-collection" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    2. Information We Collect
                  </h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We collect information in several ways to provide and
                    improve our services:
                  </p>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    2.1 Personal Information You Provide
                  </h3>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        <strong>Contact Information:</strong> Name, email
                        address, phone number, mailing address
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        <strong>Identity Information:</strong> National ID
                        number, passport details, tax identification number
                        (NIU)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        <strong>Financial Information:</strong> Bank account
                        details, payment history, income verification documents
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        <strong>Property Preferences:</strong> Desired location,
                        budget, property type, number of rooms
                      </span>
                    </li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    2.2 Automatically Collected Information
                  </h3>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        <strong>Device Information:</strong> IP address, browser
                        type, operating system, device identifiers
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        <strong>Usage Data:</strong> Pages visited, time spent,
                        click patterns, search queries
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span>
                        <strong>Location Data:</strong> Geographic location
                        (with your consent) for nearby property searches
                      </span>
                    </li>
                  </ul>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    2.3 Information from Third Parties
                  </h3>
                  <p className="text-gray-600">
                    We may receive information about you from our partners,
                    including banks and financial institutions (for mortgage
                    applications), government registries (for property
                    verification), and marketing partners (with your consent).
                  </p>
                </div>
              </section>

              {/* How We Use Your Information */}
              <section id="how-we-use" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Eye className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    3. How We Use Your Information
                  </h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We use the information we collect for various purposes:
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {[
                      {
                        title: "Service Delivery",
                        items: [
                          "Process property inquiries and applications",
                          "Facilitate property viewings and transactions",
                          "Provide customer support",
                        ],
                      },
                      {
                        title: "Communication",
                        items: [
                          "Send property recommendations",
                          "Provide transaction updates",
                          "Respond to your inquiries",
                        ],
                      },
                      {
                        title: "Improvement",
                        items: [
                          "Analyze usage patterns",
                          "Develop new features",
                          "Enhance user experience",
                        ],
                      },
                      {
                        title: "Legal Compliance",
                        items: [
                          "Comply with legal obligations",
                          "Prevent fraud and abuse",
                          "Enforce our terms of service",
                        ],
                      },
                    ].map((category, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {category.title}
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {category.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-gray-400 rounded-full mt-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Information Sharing */}
              <section id="information-sharing" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    4. Information Sharing
                  </h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We do not sell your personal information. We may share your
                    information in the following circumstances:
                  </p>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Service Providers
                      </h4>
                      <p className="text-sm text-gray-600">
                        We share information with trusted partners who help us
                        operate our business, including payment processors,
                        cloud hosting providers, and analytics services.
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Legal Requirements
                      </h4>
                      <p className="text-sm text-gray-600">
                        We may disclose information when required by law, court
                        order, or government authority, or to protect our rights
                        and safety.
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Business Transactions
                      </h4>
                      <p className="text-sm text-gray-600">
                        In the event of a merger, acquisition, or sale of
                        assets, your information may be transferred as part of
                        that transaction.
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        With Your Consent
                      </h4>
                      <p className="text-sm text-gray-600">
                        We may share your information with third parties when
                        you give us explicit consent to do so.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section id="data-security" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    5. Data Security
                  </h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We implement robust security measures to protect your
                    information:
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    {[
                      {
                        icon: "🔐",
                        title: "Encryption",
                        description:
                          "All data transmitted is encrypted using SSL/TLS protocols",
                      },
                      {
                        icon: "🛡️",
                        title: "Access Controls",
                        description:
                          "Strict access controls and authentication measures",
                      },
                      {
                        icon: "📊",
                        title: "Monitoring",
                        description:
                          "Continuous security monitoring and threat detection",
                      },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="text-center p-4 bg-green-50 rounded-xl border border-green-100"
                      >
                        <div className="text-3xl mb-2">{item.icon}</div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-800">
                      <strong>Important:</strong> While we strive to protect
                      your information, no method of transmission over the
                      Internet is 100% secure. We encourage you to use strong
                      passwords and protect your account credentials.
                    </p>
                  </div>
                </div>
              </section>

              {/* Cookies & Tracking */}
              <section id="cookies" className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    6. Cookies & Tracking Technologies
                  </h2>
                </div>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed mb-6">
                    We use cookies and similar tracking technologies to enhance
                    your experience:
                  </p>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        What Are Cookies?
                      </h4>
                      <p className="text-sm text-gray-600">
                        Cookies are small text files stored on your device that
                        help us recognize you and remember your preferences.
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        How We Use Cookies
                      </h4>
                      <p className="text-sm text-gray-600">
                        We use cookies for essential site functionality,
                        analytics, personalization, and marketing purposes.
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Your Choices
                      </h4>
                      <p className="text-sm text-gray-600">
                        You can manage cookie preferences through your browser
                        settings. Note that disabling cookies may affect site
                        functionality.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
