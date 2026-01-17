// components/about/StorySection.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote, BookOpen } from "lucide-react";

export default function StorySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Side */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              {/* Main Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
                  alt="Earth Design Headquarters"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
              </div>

              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-xl p-6 max-w-xs"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Founded</p>
                    <p className="text-teal-600 font-semibold">1977</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Over four decades of excellence in urban development and real
                  estate.
                </p>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl -z-10" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full -z-10" />
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Section Label */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              <span>Our Story</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              A Legacy of
              <span className="block text-teal-600">
                Excellence & Innovation
              </span>
            </h2>

            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p className="text-lg">
                <span className="font-semibold text-gray-900">
                  Earth Design
                </span>{" "}
                (Mission d'Aménagement et d'Equipement des Terrains Urbains et
                Ruraux) was established in 1977 with a bold vision: to transform
                Cameroon's urban landscape and provide quality housing for all.
              </p>

              <p>
                What began as a government initiative has evolved into the
                nation's leading real estate development authority. From our
                first housing project in Douala to our current nationwide
                presence, we have remained committed to our founding principles
                of quality, accessibility, and sustainable development.
              </p>

              <p>
                Today, Earth Design stands as a symbol of trust and reliability
                in Cameroon's real estate sector. We have developed over 500
                projects, created countless communities, and helped more than
                50,000 families achieve their dream of homeownership.
              </p>
            </div>

            {/* Quote */}
            <div className="mt-8 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border-l-4 border-teal-500">
              <Quote className="w-8 h-8 text-teal-500 mb-3" />
              <p className="text-gray-700 italic text-lg mb-4">
                "Our mission has always been to build more than just houses – we
                build communities, we build dreams, we build the future of
                Cameroon."
              </p>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
                  alt="Founder"
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-900">
                    Jean-Pierre Kamga
                  </p>
                  <p className="text-sm text-gray-500">
                    Founding Director, 1977
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
