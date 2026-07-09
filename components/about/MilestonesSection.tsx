// components/about/MilestonesSection.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Calendar,
  Building2,
  Award,
  Users,
  Globe,
  Rocket,
  Flag,
  Star,
} from "lucide-react";

const milestones = [
  {
    year: "1977",
    title: "Foundation",
    description:
      "Earth Design was established by the Cameroonian government to address urban development challenges.",
    icon: Flag,
    color: "from-blue-500 to-indigo-500",
  },
  {
    year: "1985",
    title: "First Major Project",
    description:
      "Completed our first large-scale housing development in Douala with 500 units.",
    icon: Building2,
    color: "from-teal-500 to-emerald-500",
  },
  {
    year: "1995",
    title: "Nationwide Expansion",
    description:
      "Extended operations to all 10 regions of Cameroon, establishing regional offices.",
    icon: Globe,
    color: "from-purple-500 to-pink-500",
  },
  {
    year: "2005",
    title: "10,000 Homes Milestone",
    description:
      "Celebrated delivering 10,000 housing units to Cameroonian families.",
    icon: Users,
    color: "from-orange-500 to-red-500",
  },
  {
    year: "2015",
    title: "Excellence Award",
    description:
      "Received the African Real Estate Development Excellence Award for sustainable practices.",
    icon: Award,
    color: "from-amber-500 to-yellow-500",
  },
  {
    year: "2020",
    title: "Digital Transformation",
    description:
      "Launched digital platforms for property search, virtual tours, and online transactions.",
    icon: Rocket,
    color: "from-cyan-500 to-blue-500",
  },
  {
    year: "2024",
    title: "50,000+ Families Served",
    description:
      "Reached the milestone of helping over 50,000 families achieve homeownership.",
    icon: Star,
    color: "from-emerald-500 to-teal-500",
  },
];

export default function MilestonesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-sm font-medium mb-6">
            <Calendar className="w-4 h-4" />
            <span>Our Journey</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Key Milestones in <span className="text-teal-600">Our History</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            From our founding in 1977 to today, every milestone represents our
            commitment to building a better Cameroon.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-teal-500 via-emerald-500 to-cyan-500 rounded-full hidden lg:block" />

          {/* Milestones */}
          <div className="space-y-12 lg:space-y-0">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className={`relative lg:flex lg:items-center ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content Card */}
                <div
                  className={`lg:w-1/2 ${
                    index % 2 === 0 ? "lg:pr-16" : "lg:pl-16"
                  }`}
                >
                  <div
                    className={`bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 ${
                      index % 2 === 0 ? "lg:text-right" : "lg:text-left"
                    }`}
                  >
                    {/* Year Badge */}
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r ${milestone.color} rounded-full text-white text-sm font-bold mb-4`}
                    >
                      <milestone.icon className="w-4 h-4" />
                      {milestone.year}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>

                {/* Center Circle (Desktop) */}
                <div className="absolute left-1/2 transform -translate-x-1/2 hidden lg:block">
                  <div
                    className={`w-12 h-12 bg-gradient-to-br ${milestone.color} rounded-full flex items-center justify-center shadow-lg`}
                  >
                    <milestone.icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Empty Space for Opposite Side */}
                <div className="hidden lg:block lg:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
