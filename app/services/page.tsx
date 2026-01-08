// File: app/services/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Home,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail,
  Clock,
  Award,
  Users,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Sparkles,
  ChevronRight,
  PlayCircle,
  Star,
  MessageSquare,
  FileText,
  Eye,
  ArrowUpRight,
} from "lucide-react";

const COLORS = {
  primary: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
    950: "#052e16",
  },
  emerald: {
    500: "#10b981",
    600: "#059669",
    700: "#047857",
    800: "#065f46",
    900: "#064e3b",
  },
  teal: {
    500: "#14b8a6",
    800: "#115e59",
  },
  gray: {
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  white: "#ffffff",
  yellow: {
    400: "#facc15",
  },
};

const GRADIENTS = {
  background: {
    hero: `linear-gradient(135deg, ${COLORS.primary[950]} 0%, ${COLORS.emerald[900]} 50%, ${COLORS.teal[800]} 100%)`,
    card: `linear-gradient(135deg, ${COLORS.primary[900]}99 0%, ${COLORS.emerald[900]}99 100%)`,
  },
  button: {
    primary: `linear-gradient(135deg, ${COLORS.primary[600]} 0%, ${COLORS.emerald[600]} 100%)`,
  },
  text: {
    primary: `linear-gradient(135deg, ${COLORS.primary[400]} 0%, ${COLORS.emerald[500]} 100%)`,
  },
};

const SHADOWS = {
  glow: `0 0 60px ${COLORS.primary[500]}80`,
  lg: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
};

// Services data - This matches the data in [id]/page.tsx
const services = [
  {
    id: "real-estate",
    icon: Home,
    title: "Real Estate Services",
    tagline: "Your Gateway to Prime Properties",
    description:
      "Comprehensive property sales and rentals across Cameroon with expert guidance and personalized service.",
    longDescription:
      "At Earth Design, we understand that buying, selling, or renting property is one of life's most significant decisions. Our real estate services combine local market expertise with international standards.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop&q=80",
    features: [
      "Property Sales & Acquisitions",
      "Rental & Leasing Services",
      "Property Management",
      "Investment Consulting",
      "Market Analysis & Valuation",
      "Legal Documentation Support",
    ],
    benefits: [
      "Access to exclusive listings",
      "Expert negotiation support",
      "Transparent pricing",
      "End-to-end assistance",
    ],
    stats: [
      { label: "Properties Sold", value: "500+" },
      { label: "Happy Clients", value: "1,200+" },
      { label: "Years Experience", value: "15+" },
    ],
    gradient: "from-green-500 to-emerald-500",
    color: COLORS.primary[500],
  },
  {
    id: "land-survey",
    icon: MapPin,
    title: "Land Survey Services",
    tagline: "Precision Mapping & Boundary Definition",
    description:
      "Professional topographic and cadastral surveys with state-of-the-art equipment and certified surveyors.",
    longDescription:
      "Our land survey services utilize cutting-edge GPS technology and employ certified professional surveyors to deliver accurate, reliable results.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=80",
    features: [
      "Boundary Surveys",
      "Topographic Mapping",
      "Construction Staking",
      "GPS & GIS Surveys",
      "Subdivision Planning",
      "Land Title Verification",
    ],
    benefits: [
      "Certified professional surveyors",
      "Advanced GPS technology",
      "Fast turnaround time",
      "Legal compliance guaranteed",
    ],
    stats: [
      { label: "Surveys Completed", value: "800+" },
      { label: "Hectares Mapped", value: "10,000+" },
      { label: "Accuracy Rate", value: "99.9%" },
    ],
    gradient: "from-blue-500 to-cyan-500",
    color: "#3b82f6",
  },
  {
    id: "construction",
    icon: Building2,
    title: "Construction Services",
    tagline: "Building Dreams Into Reality",
    description:
      "Complete construction services from foundation to finishing, delivered on time and within budget.",
    longDescription:
      "From residential homes to commercial buildings, our construction services deliver quality, durability, and aesthetic excellence.",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=800&fit=crop&q=80",
    features: [
      "Residential Construction",
      "Commercial Buildings",
      "Renovations & Remodeling",
      "Project Management",
      "Architectural Design",
      "Quality Inspection",
    ],
    benefits: [
      "Licensed contractors",
      "Quality materials",
      "Timely project delivery",
      "Warranty & support",
    ],
    stats: [
      { label: "Projects Completed", value: "300+" },
      { label: "Sq. Meters Built", value: "50,000+" },
      { label: "Client Satisfaction", value: "98%" },
    ],
    gradient: "from-orange-500 to-red-500",
    color: "#f97316",
  },
];

// Process steps
const processSteps = [
  {
    step: "01",
    title: "Initial Consultation",
    description:
      "We discuss your needs, budget, and timeline to understand your vision",
    icon: Users,
  },
  {
    step: "02",
    title: "Site Assessment",
    description:
      "Professional evaluation and feasibility study of your property",
    icon: Target,
  },
  {
    step: "03",
    title: "Proposal & Planning",
    description:
      "Detailed proposal with transparent pricing and project timeline",
    icon: FileText,
  },
  {
    step: "04",
    title: "Execution & Delivery",
    description:
      "Expert implementation with regular updates and quality assurance",
    icon: Zap,
  },
];

// Why choose us
const whyChooseUs = [
  {
    icon: Award,
    title: "Industry Expertise",
    description: "Over 15 years of experience in Cameroon real estate market",
  },
  {
    icon: Shield,
    title: "Trusted Service",
    description: "Licensed, insured, and committed to excellence",
  },
  {
    icon: TrendingUp,
    title: "Proven Results",
    description: "Track record of successful projects and satisfied clients",
  },
  {
    icon: Sparkles,
    title: "Innovation",
    description: "Using latest technology and best practices",
  },
];

// Testimonials
const testimonials = [
  {
    name: "Marie Kouam",
    role: "Property Investor",
    content:
      "Earth Design helped me build a profitable rental property portfolio. Their market insights are invaluable.",
    rating: 5,
    service: "Real Estate",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&q=80",
  },
  {
    name: "Paul Ngono",
    role: "Land Developer",
    content:
      "The most accurate survey team I've worked with. Their reports are detailed and legally sound.",
    rating: 5,
    service: "Land Survey",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80",
  },
  {
    name: "Dr. Emmanuel Tabi",
    role: "Homeowner",
    content:
      "They built our dream home exactly as envisioned. The quality of work is outstanding.",
    rating: 5,
    service: "Construction",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80",
  },
];

// Company stats
const companyStats = [
  { value: "15+", label: "Years Experience", icon: Clock },
  { value: "1,500+", label: "Happy Clients", icon: Users },
  { value: "2,000+", label: "Projects Completed", icon: CheckCircle },
  { value: "99%", label: "Client Satisfaction", icon: Star },
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState(services[0]);
  const [activeTab, setActiveTab] = useState("features");
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const router = useRouter();

  const handleViewDetails = (serviceId: string) => {
    router.push(`/services/${serviceId}`);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden relative">
      {/* Background */}
      <div className="fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, ${COLORS.gray[600]}2e 1px, transparent 1px), linear-gradient(to bottom, ${COLORS.gray[600]}2e 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: GRADIENTS.background.hero }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: "rgba(34, 197, 94, 0.1)" }}
            >
              <Sparkles
                className="w-4 h-4"
                style={{ color: COLORS.primary[400] }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: COLORS.primary[400] }}
              >
                Our Services
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white mb-6">
              Comprehensive Real Estate
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: GRADIENTS.text.primary }}
              >
                Solutions
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From land surveys to construction and property management, we
              provide end-to-end services for all your real estate needs in
              Cameroon
            </p>
          </motion.div>

          {/* Quick Stats Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12"
          >
            {companyStats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="backdrop-blur-lg rounded-2xl p-4 border"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <stat.icon
                  className="w-6 h-6 mx-auto mb-2"
                  style={{ color: COLORS.primary[400] }}
                />
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm" style={{ color: COLORS.gray[400] }}>
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Service Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mt-12"
          >
            {services.map((service) => (
              <motion.button
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  document
                    .getElementById("services-detail")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-full font-semibold transition flex items-center gap-2 ${
                  selectedService.id === service.id
                    ? "text-white shadow-lg"
                    : "text-white bg-white/10 hover:bg-white/20"
                }`}
                style={
                  selectedService.id === service.id
                    ? {
                        background: GRADIENTS.button.primary,
                        boxShadow: SHADOWS.glow,
                      }
                    : {}
                }
              >
                <service.icon className="w-5 h-5" />
                {service.title.split(" ")[0]}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Grid Overview */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Explore Our Services
            </h2>
            <p className="text-lg" style={{ color: COLORS.gray[300] }}>
              Click on any service to learn more or view full details
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -12, scale: 1.02 }}
                onHoverStart={() => setHoveredService(service.id)}
                onHoverEnd={() => setHoveredService(null)}
                onClick={() => {
                  setSelectedService(service);
                  document
                    .getElementById("services-detail")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group backdrop-blur-lg rounded-3xl overflow-hidden border-2 transition-all duration-500 cursor-pointer"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor:
                    selectedService.id === service.id
                      ? service.color
                      : hoveredService === service.id
                      ? `${service.color}80`
                      : "rgba(255, 255, 255, 0.1)",
                  boxShadow:
                    hoveredService === service.id
                      ? `0 0 40px ${service.color}40`
                      : "none",
                }}
              >
                {/* Image */}
                <div className="relative h-64 overflow-hidden">
                  <motion.img
                    animate={{
                      scale: hoveredService === service.id ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.6 }}
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Icon Badge */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`absolute top-6 left-6 w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-2xl`}
                  >
                    <service.icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* View Details Button - appears on hover */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: hoveredService === service.id ? 1 : 0,
                      y: hoveredService === service.id ? 0 : 20,
                    }}
                    className="absolute bottom-6 right-6"
                  >
                    <Link href={`/services/${service.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 backdrop-blur-md"
                        style={{
                          background: "rgba(255, 255, 255, 0.9)",
                          color: COLORS.gray[900],
                        }}
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                        <ArrowUpRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>

                {/* Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition">
                    {service.title}
                  </h3>
                  <p
                    className="text-sm font-semibold mb-4"
                    style={{ color: service.color }}
                  >
                    {service.tagline}
                  </p>
                  <p
                    className="text-base mb-6 leading-relaxed"
                    style={{ color: COLORS.gray[300] }}
                  >
                    {service.description}
                  </p>

                  {/* Features Preview */}
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-3 py-1 rounded-full"
                          style={{
                            background: `${service.color}20`,
                            color: service.color,
                          }}
                        >
                          {feature}
                        </span>
                      ))}
                      {service.features.length > 3 && (
                        <span
                          className="text-xs px-3 py-1 rounded-full"
                          style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            color: COLORS.gray[400],
                          }}
                        >
                          +{service.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div
                    className="grid grid-cols-3 gap-4 mb-6 pt-6 border-t"
                    style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
                  >
                    {service.stats.map((stat, idx) => (
                      <div key={idx} className="text-center">
                        <p
                          className="text-2xl font-bold"
                          style={{ color: service.color }}
                        >
                          {stat.value}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: COLORS.gray[400] }}
                        >
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                        document
                          .getElementById("services-detail")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="flex-1 px-4 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                      style={{
                        background:
                          selectedService.id === service.id
                            ? GRADIENTS.button.primary
                            : "rgba(255, 255, 255, 0.1)",
                        color: COLORS.white,
                      }}
                    >
                      Quick View
                    </motion.button>
                    <Link href={`/services/${service.id}`} className="flex-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-4 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 border-2"
                        style={{
                          borderColor: service.color,
                          color: COLORS.white,
                          background: "transparent",
                        }}
                      >
                        Full Details
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Service View */}
      <section
        id="services-detail"
        className="relative z-10 py-20 px-4 bg-gradient-to-b from-black/30 to-transparent"
      >
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedService.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                <div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className={`inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br ${selectedService.gradient} items-center justify-center mb-6 shadow-2xl`}
                  >
                    <selectedService.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
                    {selectedService.title}
                  </h2>
                  <p
                    className="text-xl font-semibold mb-6"
                    style={{ color: selectedService.color }}
                  >
                    {selectedService.tagline}
                  </p>
                  <p
                    className="text-lg leading-relaxed mb-8"
                    style={{ color: COLORS.gray[300] }}
                  >
                    {selectedService.longDescription}
                  </p>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-8 py-4 rounded-xl font-bold transition flex items-center gap-2"
                      style={{
                        background: GRADIENTS.button.primary,
                        color: COLORS.white,
                        boxShadow: SHADOWS.glow,
                      }}
                    >
                      <Phone className="w-5 h-5" />
                      Request Quote
                    </motion.button>
                    <Link href={`/services/${selectedService.id}`}>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-4 rounded-xl font-bold border-2 transition flex items-center gap-2"
                        style={{
                          borderColor: selectedService.color,
                          color: COLORS.white,
                          background: "rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        View Full Details
                        <ArrowRight className="w-5 h-5" />
                      </motion.button>
                    </Link>
                  </div>
                </div>

                {/* Image with Play Button */}
                <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl group">
                  <img
                    src={selectedService.image}
                    alt={selectedService.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-pointer hover:bg-white/30 transition">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </div>
                  </motion.div>

                  {/* Stats Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="grid grid-cols-3 gap-4">
                      {selectedService.stats.map((stat, idx) => (
                        <div
                          key={idx}
                          className="text-center backdrop-blur-md rounded-xl p-3"
                          style={{ background: "rgba(0, 0, 0, 0.4)" }}
                        >
                          <p
                            className="text-xl font-bold"
                            style={{ color: selectedService.color }}
                          >
                            {stat.value}
                          </p>
                          <p className="text-xs text-white/80">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {["features", "benefits", "process"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap ${
                      activeTab === tab
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                    style={
                      activeTab === tab
                        ? { background: GRADIENTS.button.primary }
                        : { background: "rgba(255, 255, 255, 0.1)" }
                    }
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === "features" && (
                  <motion.div
                    key="features"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="backdrop-blur-lg rounded-3xl p-8 border"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-6">
                      What We Offer
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedService.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 p-4 rounded-xl transition hover:bg-white/5"
                        >
                          <CheckCircle
                            className="w-6 h-6 flex-shrink-0 mt-0.5"
                            style={{ color: selectedService.color }}
                          />
                          <span
                            className="text-lg"
                            style={{ color: COLORS.gray[200] }}
                          >
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* View More Link */}
                    <div className="mt-8 text-center">
                      <Link href={`/services/${selectedService.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-6 py-3 rounded-xl font-semibold inline-flex items-center gap-2"
                          style={{
                            background: `${selectedService.color}20`,
                            color: selectedService.color,
                          }}
                        >
                          See All Features & Details
                          <ArrowRight className="w-4 h-4" />
                        </motion.button>
                      </Link>
                    </div>
                  </motion.div>
                )}

                {activeTab === "benefits" && (
                  <motion.div
                    key="benefits"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="backdrop-blur-lg rounded-3xl p-8 border"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-6">
                      Why Choose Us
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedService.benefits.map((benefit, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-4 p-6 rounded-2xl"
                          style={{ background: `${selectedService.color}15` }}
                        >
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ background: GRADIENTS.button.primary }}
                          >
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-lg font-semibold text-white">
                            {benefit}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === "process" && (
                  <motion.div
                    key="process"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="backdrop-blur-lg rounded-3xl p-8 border"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-8">
                      Our Process
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {processSteps.map((step, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.15 }}
                          className="relative text-center"
                        >
                          {idx < processSteps.length - 1 && (
                            <div
                              className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5"
                              style={{
                                background: `linear-gradient(to right, ${selectedService.color}, transparent)`,
                              }}
                            />
                          )}
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 360 }}
                            transition={{ duration: 0.6 }}
                            className="relative z-10 mx-auto mb-4 w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                            style={{
                              background: GRADIENTS.button.primary,
                              boxShadow: `0 0 30px ${selectedService.color}60`,
                            }}
                          >
                            {step.step}
                          </motion.div>
                          <div
                            className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                            style={{ background: `${selectedService.color}20` }}
                          >
                            <step.icon
                              className="w-6 h-6"
                              style={{ color: selectedService.color }}
                            />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2">
                            {step.title}
                          </h4>
                          <p
                            className="text-sm"
                            style={{ color: COLORS.gray[400] }}
                          >
                            {step.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg" style={{ color: COLORS.gray[300] }}>
              Real stories from satisfied customers
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="backdrop-blur-lg rounded-2xl p-6 border"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-current"
                      style={{ color: COLORS.yellow[400] }}
                    />
                  ))}
                </div>

                {/* Service Badge */}
                <span
                  className="inline-block text-xs px-3 py-1 rounded-full mb-4"
                  style={{
                    background: `${COLORS.primary[500]}20`,
                    color: COLORS.primary[400],
                  }}
                >
                  {testimonial.service}
                </span>

                {/* Content */}
                <p
                  className="text-base mb-6 leading-relaxed"
                  style={{ color: COLORS.gray[200] }}
                >
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-white">{testimonial.name}</p>
                    <p className="text-sm" style={{ color: COLORS.gray[400] }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4">
              Why Choose Earth Design
            </h2>
            <p className="text-xl" style={{ color: COLORS.gray[300] }}>
              Your trusted partner in real estate excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="backdrop-blur-lg rounded-2xl p-6 border text-center"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                  style={{ background: GRADIENTS.button.primary }}
                >
                  <item.icon className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p style={{ color: COLORS.gray[300] }}>{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="backdrop-blur-lg rounded-3xl p-12 text-center border-2"
            style={{
              background: GRADIENTS.background.card,
              borderColor: COLORS.primary[500],
              boxShadow: SHADOWS.glow,
            }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl mb-8" style={{ color: COLORS.gray[300] }}>
              Contact us today for a free consultation and let's discuss your
              project
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-bold transition flex items-center justify-center gap-2"
                style={{
                  background: GRADIENTS.button.primary,
                  color: COLORS.white,
                  boxShadow: SHADOWS.lg,
                }}
              >
                <Phone className="w-5 h-5" />
                Call Us Now
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 rounded-xl font-bold border-2 transition flex items-center justify-center gap-2"
                style={{
                  borderColor: COLORS.primary[500],
                  color: COLORS.white,
                  background: "rgba(255, 255, 255, 0.05)",
                }}
              >
                <Mail className="w-5 h-5" />
                Send Email
              </motion.button>
            </div>
            <div
              className="mt-8 pt-8 border-t flex flex-wrap justify-center gap-8"
              style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <div className="flex items-center gap-2">
                <Clock
                  className="w-5 h-5"
                  style={{ color: COLORS.primary[400] }}
                />
                <span style={{ color: COLORS.gray[300] }}>
                  Mon-Sat: 8AM-6PM
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone
                  className="w-5 h-5"
                  style={{ color: COLORS.primary[400] }}
                />
                <span style={{ color: COLORS.gray[300] }}>
                  +237 677 212 279
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail
                  className="w-5 h-5"
                  style={{ color: COLORS.primary[400] }}
                />
                <span style={{ color: COLORS.gray[300] }}>
                  info@earthdesign.cm
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
