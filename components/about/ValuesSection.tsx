// components/about/ValuesSection.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield,
  Heart,
  Lightbulb,
  Users,
  Leaf,
  Gem,
  Handshake,
  Zap,
} from "lucide-react";

export default function ValuesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const values = [
    {
      icon: Shield,
      title: "Integrity",
      description:
        "We conduct all our business with the highest ethical standards, ensuring transparency and honesty in every transaction.",
      color: "bg-blue-500",
    },
    {
      icon: Gem,
      title: "Excellence",
      description:
        "We strive for excellence in everything we do, from construction quality to customer service and community development.",
      color: "bg-purple-500",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description:
        "We embrace new technologies and creative solutions to deliver modern, efficient, and sustainable developments.",
      color: "bg-amber-500",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "We build more than properties – we create thriving communities where people connect, grow, and prosper together.",
      color: "bg-teal-500",
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description:
        "We are committed to environmentally responsible development that preserves resources for future generations.",
      color: "bg-green-500",
    },
    {
      icon: Handshake,
      title: "Trust",
      description:
        "We build lasting relationships based on mutual respect, reliability, and our unwavering commitment to our promises.",
      color: "bg-indigo-500",
    },
    {
      icon: Heart,
      title: "Compassion",
      description:
        "We care deeply about the well-being of our clients, employees, and the communities we serve across Cameroon.",
      color: "bg-rose-500",
    },
    {
      icon: Zap,
      title: "Efficiency",
      description:
        "We deliver projects on time and within budget, maximizing value while minimizing waste and environmental impact.",
      color: "bg-orange-500",
    },
  ];

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            <span>Our Core Values</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            The Principles That <span className="text-teal-600">Guide Us</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our values are the foundation of everything we do. They shape our
            culture, guide our decisions, and define our relationships with
            clients and communities.
          </p>
        </motion.div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="h-full bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-teal-200 transition-all duration-300 hover:-translate-y-1">
                {/* Icon */}
                <div
                  className={`w-14 h-14 ${value.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <value.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {value.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
