// components/about/PartnersSection.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Handshake, Building, Landmark, Globe2 } from "lucide-react";

const partners = [
  {
    name: "Ministry of Housing",
    logo: "https://via.placeholder.com/200x80?text=MINHDU",
    category: "Government",
  },
  {
    name: "African Development Bank",
    logo: "https://via.placeholder.com/200x80?text=AfDB",
    category: "Financial",
  },
  {
    name: "World Bank",
    logo: "https://via.placeholder.com/200x80?text=World+Bank",
    category: "International",
  },
  {
    name: "UN-Habitat",
    logo: "https://via.placeholder.com/200x80?text=UN-Habitat",
    category: "International",
  },
  {
    name: "Société Générale Cameroun",
    logo: "https://via.placeholder.com/200x80?text=SG",
    category: "Financial",
  },
  {
    name: "ENEO Cameroon",
    logo: "https://via.placeholder.com/200x80?text=ENEO",
    category: "Utility",
  },
  {
    name: "Camwater",
    logo: "https://via.placeholder.com/200x80?text=Camwater",
    category: "Utility",
  },
  {
    name: "MTN Cameroon",
    logo: "https://via.placeholder.com/200x80?text=MTN",
    category: "Technology",
  },
];

export default function PartnersSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-gray-600 text-sm font-medium mb-6 shadow-sm">
            <Handshake className="w-4 h-4 text-teal-600" />
            <span>Strategic Partners</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Trusted by Leading{" "}
            <span className="text-teal-600">Organizations</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We collaborate with government bodies, financial institutions, and
            international organizations to deliver exceptional results.
          </p>
        </motion.div>

        {/* Partner Categories */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: Landmark,
              title: "Government Partners",
              description:
                "Working closely with ministries and local authorities",
              color: "from-blue-500 to-indigo-500",
            },
            {
              icon: Building,
              title: "Financial Institutions",
              description: "Partnering with banks for accessible financing",
              color: "from-teal-500 to-emerald-500",
            },
            {
              icon: Globe2,
              title: "International Bodies",
              description: "Collaborating with global development agencies",
              color: "from-purple-500 to-pink-500",
            },
          ].map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg text-center"
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
              >
                <category.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {category.title}
              </h3>
              <p className="text-gray-600 text-sm">{category.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Partner Logos Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {partners.map((partner, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                className="group flex flex-col items-center justify-center p-4 rounded-xl hover:bg-gray-50 transition-all"
              >
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-12 object-contain grayscale group-hover:grayscale-0 transition-all opacity-60 group-hover:opacity-100"
                />
                <p className="mt-2 text-xs text-gray-500">{partner.category}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
