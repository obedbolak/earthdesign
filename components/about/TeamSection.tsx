// components/about/TeamSection.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Users,
  Linkedin,
  Twitter,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const teamMembers = [
  {
    name: "Dr. Emmanuel Nkodo",
    role: "Chief Executive Officer",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400",
    bio: "25+ years in real estate development. Former Director of Urban Planning at Ministry of Housing.",
    linkedin: "#",
    twitter: "#",
    email: "emmanuel.nkodo@Earth Design.cm",
  },
  {
    name: "Marie-Claire Fouda",
    role: "Chief Operations Officer",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400",
    bio: "Expert in project management with 18 years of experience leading major infrastructure projects.",
    linkedin: "#",
    twitter: "#",
    email: "marie.fouda@Earth Design.cm",
  },
  {
    name: "Jean-Baptiste Mbarga",
    role: "Chief Financial Officer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    bio: "Former banking executive with expertise in real estate financing and investment strategies.",
    linkedin: "#",
    twitter: "#",
    email: "jb.mbarga@Earth Design.cm",
  },
  {
    name: "Aminatou Djibril",
    role: "Director of Development",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400",
    bio: "Architect and urban planner specializing in sustainable and affordable housing solutions.",
    linkedin: "#",
    twitter: "#",
    email: "aminatou.djibril@Earth Design.cm",
  },
  {
    name: "Pierre Essomba",
    role: "Director of Engineering",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    bio: "Civil engineer with 20 years of experience in large-scale construction and infrastructure.",
    linkedin: "#",
    twitter: "#",
    email: "pierre.essomba@Earth Design.cm",
  },
  {
    name: "Sophie Atangana",
    role: "Director of Marketing",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
    bio: "Marketing strategist with deep expertise in real estate branding and customer experience.",
    linkedin: "#",
    twitter: "#",
    email: "sophie.atangana@Earth Design.cm",
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
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
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
