// components/about/StatsSection.tsx
"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Building2,
  Users,
  MapPin,
  Award,
  TrendingUp,
  Home,
  Briefcase,
  Globe,
} from "lucide-react";

function AnimatedCounter({
  value,
  suffix = "",
  duration = 2,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const incrementTime = (duration * 1000) / end;
      const timer = setInterval(() => {
        start += Math.ceil(end / 50);
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(start);
        }
      }, incrementTime);
      return () => clearInterval(timer);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={ref}>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    {
      icon: Building2,
      value: 500,
      suffix: "+",
      label: "Projects Completed",
      description: "Residential, commercial & industrial",
    },
    {
      icon: Users,
      value: 50000,
      suffix: "+",
      label: "Happy Families",
      description: "Homeowners across Cameroon",
    },
    {
      icon: MapPin,
      value: 10,
      suffix: "",
      label: "Regions Covered",
      description: "Nationwide presence",
    },
    {
      icon: Award,
      value: 45,
      suffix: "+",
      label: "Years of Excellence",
      description: "Since 1977",
    },
    {
      icon: Home,
      value: 25000,
      suffix: "+",
      label: "Housing Units Built",
      description: "Quality homes delivered",
    },
    {
      icon: Briefcase,
      value: 1200,
      suffix: "+",
      label: "Team Members",
      description: "Dedicated professionals",
    },
    {
      icon: TrendingUp,
      value: 98,
      suffix: "%",
      label: "Client Satisfaction",
      description: "Excellent service rating",
    },
    {
      icon: Globe,
      value: 150,
      suffix: "+",
      label: "Hectares Developed",
      description: "Urban transformation",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-20 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-teal-300 text-sm font-medium mb-6">
            <TrendingUp className="w-4 h-4" />
            <span>Our Impact</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Numbers That Speak{" "}
            <span className="text-teal-400">For Themselves</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Our track record reflects our commitment to excellence and the trust
            that thousands of Cameroonians have placed in us.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 h-full">
                {/* Icon */}
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>

                {/* Value */}
                <p className="text-3xl lg:text-4xl font-bold text-white mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>

                {/* Label */}
                <p className="text-teal-400 font-semibold mb-1">{stat.label}</p>

                {/* Description */}
                <p className="text-sm text-gray-500">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
