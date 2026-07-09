// components/about/HeroSection.tsx
"use client";

import { motion } from "framer-motion";
import { Building2, Users, Award, Globe } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920"
          alt="Modern Building"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/80 to-gray-900/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-teal-300 text-sm font-medium mb-6"
          >
            <Building2 className="w-4 h-4" />
            <span>Established Since 1977</span>
          </motion.div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-6">
            Building Dreams,
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Creating Futures
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Earth Design is Cameroon's premier real estate development company,
            dedicated to transforming landscapes and improving lives through
            innovative urban development and sustainable housing solutions.
          </p>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto">
            {[
              { icon: Building2, value: "500+", label: "Projects Completed" },
              { icon: Users, value: "50,000+", label: "Happy Families" },
              { icon: Globe, value: "10", label: "Regions Covered" },
              { icon: Award, value: "45+", label: "Years of Excellence" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6"
              >
                <stat.icon className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                <p className="text-2xl md:text-3xl font-bold text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}
