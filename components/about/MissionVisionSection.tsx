// components/about/MissionVisionSection.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Target, Eye, Compass, Heart } from "lucide-react";

export default function MissionVisionSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const cards = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To provide accessible, quality housing solutions and develop sustainable urban infrastructure that enhances the quality of life for all Cameroonians, while fostering economic growth and community development.",
      color: "from-teal-500 to-emerald-500",
      bgColor: "from-teal-50 to-emerald-50",
    },
    {
      icon: Eye,
      title: "Our Vision",
      description:
        "To be Africa's leading real estate development organization, recognized for innovation, sustainability, and our unwavering commitment to transforming lives through exceptional property development and urban planning.",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
    },
    {
      icon: Compass,
      title: "Our Purpose",
      description:
        "To bridge the housing gap in Cameroon by creating diverse, inclusive communities where families can thrive, businesses can prosper, and generations can build lasting legacies.",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
    },
    {
      icon: Heart,
      title: "Our Promise",
      description:
        "To uphold the highest standards of integrity, transparency, and excellence in every project we undertake, ensuring that every client's trust in us is rewarded with exceptional value and service.",
      color: "from-orange-500 to-red-500",
      bgColor: "from-orange-50 to-red-50",
    },
  ];

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
            <Compass className="w-4 h-4 text-teal-600" />
            <span>What Drives Us</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Mission, Vision &{" "}
            <span className="text-teal-600">Core Purpose</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Every decision we make is guided by our commitment to excellence and
            our dedication to improving the lives of Cameroonians through
            quality real estate development.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div
                className={`h-full bg-gradient-to-br ${card.bgColor} rounded-3xl p-8 border border-white shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                {/* Icon */}
                <div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${card.color} shadow-lg mb-6`}
                >
                  <card.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {card.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {card.description}
                </p>

                {/* Decorative Line */}
                <div
                  className={`mt-6 h-1 w-16 rounded-full bg-gradient-to-r ${card.color} group-hover:w-24 transition-all duration-300`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
