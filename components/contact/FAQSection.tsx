// components/contact/FAQSection.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { HelpCircle, ChevronDown, MessageCircle } from "lucide-react";

const faqs = [
  {
    question: "How do I schedule a property viewing?",
    answer:
      "You can schedule a property viewing by filling out the contact form above, calling our office directly, or using the 'Schedule Viewing' button on any property listing. Our team will contact you within 24 hours to confirm your appointment.",
  },
  {
    question: "What documents do I need to buy a property?",
    answer:
      "For property purchases, you typically need: valid ID (national ID or passport), proof of income or bank statements, proof of address, and tax identification number (NIU). Our team will guide you through the specific requirements for your purchase.",
  },
  {
    question: "Do you offer financing options?",
    answer:
      "Yes, Earth Design partners with several banks and financial institutions to offer competitive financing options. We can help you secure mortgage loans with favorable terms. Contact us to discuss your financing needs.",
  },
  {
    question: "How long does the property purchase process take?",
    answer:
      "The timeline varies depending on the property type and payment method. Cash purchases can be completed in 2-4 weeks, while financed purchases typically take 4-8 weeks. Our team ensures a smooth and efficient process.",
  },
  {
    question: "Can I visit multiple properties in one day?",
    answer:
      "Absolutely! We can arrange multiple property viewings in a single day based on your schedule and preferences. Just let us know your requirements, and we'll create a personalized viewing itinerary.",
  },
  {
    question: "What are the payment options available?",
    answer:
      "We accept various payment methods including bank transfers, certified checks, and can facilitate mortgage arrangements. For certain properties, we also offer flexible payment plans. Contact us for details.",
  },
];

export default function FAQSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-600 text-sm font-medium mb-6 shadow-sm">
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Common <span className="text-teal-600">Questions</span>
          </h2>
          <p className="text-gray-600">
            Find quick answers to the most common questions about our services
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                  openIndex === index
                    ? "border-teal-200 shadow-lg"
                    : "border-gray-100 shadow-sm"
                }`}
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full flex items-center justify-between p-6 text-left"
                >
                  <span className="font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? "auto" : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-gray-600">{faq.answer}</div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Still Have Questions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-semibold text-gray-900">
                Still have questions?
              </p>
              <p className="text-sm text-gray-600">
                Our team is here to help you
              </p>
            </div>
            <a
              href="#contact-form"
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Contact Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
