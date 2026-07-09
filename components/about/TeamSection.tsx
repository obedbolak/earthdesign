// components/about/TeamSection.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Users, Linkedin, Twitter, Mail } from "lucide-react";

const teamMembers = [
  {
    name: "Cleytus Jumcoda Rifor",
    role: "Chief Executive Officer",
    color: "from-blue-600 to-indigo-700",
    bio: "Visionary leader steering Earth Design toward excellence in real estate development.",
    linkedin: "#",
    twitter: "#",
    email: "jumcoda.rifor@earthdesign.cm",
  },
  {
    name: "Doris Enongene",
    role: "Chief Operations Officer",
    color: "from-emerald-500 to-teal-600",
    bio: "Operations expert ensuring seamless project delivery and client satisfaction.",
    linkedin: "#",
    twitter: "#",
    email: "doris.enongene@earthdesign.cm",
  },
  {
    name: "Obed Bolak",
    role: "IT Engineer",
    color: "from-purple-500 to-pink-600",
    bio: "Technology specialist driving digital innovation across the organization.",
    linkedin: "#",
    twitter: "#",
    email: "obed.bolak@earthdesign.cm",
  },
];

export default function TeamSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
            <Users className="w-4 h-4 text-teal-600" />
            <span>Leadership Team</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Meet the People{" "}
            <span className="text-teal-600">Behind Earth Design</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our leadership team brings together decades of experience in real
            estate, urban planning, finance, and engineering to drive Earth
            Design's success.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group"
            >
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                {/* Image */}
                <div className="relative h-72 overflow-hidden">
                  <div
                    className={`w-full h-full bg-gradient-to-br ${member.color} flex items-center justify-center`}
                  >
                    <span className="text-6xl font-bold text-white/90">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />

                  {/* Social Links Overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: hoveredIndex === index ? 1 : 0,
                      y: hoveredIndex === index ? 0 : 20,
                    }}
                    className="absolute bottom-4 left-4 right-4 flex justify-center gap-3"
                  >
                    <a
                      href={member.linkedin}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-teal-500 hover:text-white transition-all"
                    >
                      <Linkedin className="w-5 h-5" />
                    </a>
                    <a
                      href={member.twitter}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-teal-500 hover:text-white transition-all"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                    <a
                      href={`mailto:${member.email}`}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-teal-500 hover:text-white transition-all"
                    >
                      <Mail className="w-5 h-5" />
                    </a>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-teal-600 font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Join Team CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100">
            <div className="text-left">
              <p className="font-semibold text-gray-900">
                Want to join our team?
              </p>
              <p className="text-sm text-gray-600">
                We're always looking for talented individuals.
              </p>
            </div>
            <a
              href="/careers"
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              View Open Positions
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
