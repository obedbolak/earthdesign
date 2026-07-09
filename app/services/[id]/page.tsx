"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Building2,
  Home,
  CheckCircle,
  ArrowLeft,
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
  PlayCircle,
  Star,
  Calendar,
  FileText,
} from "lucide-react";

const COLORS = {
  primary: {
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    900: "#14532d",
    950: "#052e16",
  },
  emerald: {
    600: "#059669",
    900: "#064e3b",
  },
  teal: {
    800: "#115e59",
  },
  gray: {
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    600: "#4b5563",
  },
  white: "#ffffff",
};

const GRADIENTS = {
  background: {
    hero: `linear-gradient(135deg, ${COLORS.primary[950]} 0%, ${COLORS.emerald[900]} 50%, ${COLORS.teal[800]} 100%)`,
  },
  button: {
    primary: `linear-gradient(135deg, ${COLORS.primary[600]} 0%, ${COLORS.emerald[600]} 100%)`,
  },
  text: {
    primary: `linear-gradient(135deg, ${COLORS.primary[400]} 0%, #10b981 100%)`,
  },
};

const SHADOWS = {
  glow: `0 0 60px ${COLORS.primary[500]}80`,
  lg: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
};

// Services data
const servicesData = {
  "real-estate": {
    id: "real-estate",
    icon: Home,
    title: "Real Estate Services",
    tagline: "Your Gateway to Prime Properties",
    description:
      "Comprehensive property sales and rentals across Cameroon with expert guidance and personalized service.",
    longDescription:
      "At Earth Design, we understand that buying, selling, or renting property is one of life's most significant decisions. Our real estate services combine local market expertise with international standards to deliver exceptional results. Whether you're a first-time buyer, seasoned investor, or looking for your dream home, our dedicated team provides end-to-end support throughout your real estate journey.",
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=800&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop&q=80",
    ],
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
    process: [
      {
        step: "01",
        title: "Initial Consultation",
        description:
          "We discuss your property requirements, budget, and timeline to understand your needs",
        icon: Users,
      },
      {
        step: "02",
        title: "Property Search",
        description:
          "Access our exclusive listings and schedule viewings of properties that match your criteria",
        icon: Target,
      },
      {
        step: "03",
        title: "Negotiation & Offer",
        description:
          "Expert negotiation to secure the best terms and pricing for your transaction",
        icon: FileText,
      },
      {
        step: "04",
        title: "Closing & Support",
        description:
          "Complete legal documentation and handover with ongoing support",
        icon: CheckCircle,
      },
    ],
    testimonials: [
      {
        name: "Marie Kouam",
        role: "Property Investor",
        content:
          "Earth Design helped me build a profitable rental property portfolio. Their market insights are invaluable.",
        rating: 5,
      },
      {
        name: "Jean-Paul Essomba",
        role: "First-time Buyer",
        content:
          "The team made buying my first home stress-free. They guided me through every step with patience and expertise.",
        rating: 5,
      },
    ],
    faqs: [
      {
        question: "What areas do you cover?",
        answer:
          "We provide real estate services across major cities in Cameroon including Yaoundé, Douala, Bamenda, and Bafoussam.",
      },
      {
        question: "Do you charge buyers a fee?",
        answer:
          "Our commission structure is transparent and competitive. For buyers, fees are typically included in the property price. Contact us for specific details.",
      },
      {
        question: "Can you help with property financing?",
        answer:
          "Yes, we work with leading banks and financial institutions to help you secure competitive mortgage rates and financing options.",
      },
    ],
  },
  "land-survey": {
    id: "land-survey",
    icon: MapPin,
    title: "Land Survey Services",
    tagline: "Precision Mapping & Boundary Definition",
    description:
      "Professional topographic and cadastral surveys with state-of-the-art equipment and certified surveyors.",
    longDescription:
      "Our land survey services utilize cutting-edge GPS technology and employ certified professional surveyors to deliver accurate, reliable results. From boundary surveys to complex topographic mapping, we ensure legal compliance and provide detailed documentation for all your land-related needs. Trust our 15+ years of experience in the Cameroonian terrain.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80",
    ],
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
    process: [
      {
        step: "01",
        title: "Site Assessment",
        description:
          "Initial visit to understand terrain, access requirements, and project scope",
        icon: Target,
      },
      {
        step: "02",
        title: "Field Survey",
        description:
          "Professional surveying using GPS and total station equipment",
        icon: MapPin,
      },
      {
        step: "03",
        title: "Data Processing",
        description:
          "Advanced software processing to create accurate maps and reports",
        icon: Zap,
      },
      {
        step: "04",
        title: "Delivery & Certification",
        description:
          "Certified survey documents with official stamps and signatures",
        icon: CheckCircle,
      },
    ],
    testimonials: [
      {
        name: "Paul Ngono",
        role: "Land Developer",
        content:
          "The most accurate survey team I've worked with. Their reports are detailed and legally sound.",
        rating: 5,
      },
      {
        name: "Grace Fomukong",
        role: "Property Owner",
        content:
          "Resolved a boundary dispute thanks to their precise measurements. Highly professional service.",
        rating: 5,
      },
    ],
    faqs: [
      {
        question: "How long does a survey take?",
        answer:
          "Most surveys are completed within 3-7 days depending on property size and terrain complexity.",
      },
      {
        question: "Are your surveyors certified?",
        answer:
          "Yes, all our surveyors are licensed professionals certified by the National Order of Surveyors in Cameroon.",
      },
      {
        question: "Do you provide legal documentation?",
        answer:
          "Absolutely. We provide certified survey reports that are legally recognized for property transactions and disputes.",
      },
    ],
  },
  construction: {
    id: "construction",
    icon: Building2,
    title: "Construction Services",
    tagline: "Building Dreams Into Reality",
    description:
      "Complete construction services from foundation to finishing, delivered on time and within budget.",
    longDescription:
      "From residential homes to commercial buildings, our construction services deliver quality, durability, and aesthetic excellence. Our experienced team manages every phase of construction with meticulous attention to detail, ensuring your project is completed on schedule and within budget. We use only premium materials and employ skilled craftsmen who take pride in their work.",
    image:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=800&fit=crop&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=600&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590725175376-f0521c9e5ac2?w=800&h=600&fit=crop&q=80",
    ],
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
    process: [
      {
        step: "01",
        title: "Design & Planning",
        description:
          "Architectural design and detailed project planning with cost estimates",
        icon: FileText,
      },
      {
        step: "02",
        title: "Foundation & Structure",
        description:
          "Quality foundation work and structural construction with regular inspections",
        icon: Building2,
      },
      {
        step: "03",
        title: "Finishing Works",
        description:
          "Interior and exterior finishing, electrical, and plumbing installations",
        icon: Zap,
      },
      {
        step: "04",
        title: "Handover & Warranty",
        description:
          "Final inspection, key handover, and comprehensive warranty coverage",
        icon: CheckCircle,
      },
    ],
    testimonials: [
      {
        name: "Dr. Emmanuel Tabi",
        role: "Homeowner",
        content:
          "They built our dream home exactly as envisioned. The quality of work is outstanding and the team was professional throughout.",
        rating: 5,
      },
      {
        name: "Sandra Mbah",
        role: "Business Owner",
        content:
          "Our office building was completed ahead of schedule with no compromise on quality. Excellent project management!",
        rating: 5,
      },
    ],
    faqs: [
      {
        question: "Do you provide design services?",
        answer:
          "Yes, we offer comprehensive architectural design services or can work with your preferred architect.",
      },
      {
        question: "What warranty do you provide?",
        answer:
          "We provide a 2-year warranty on workmanship and up to 10 years on structural elements, depending on the project type.",
      },
      {
        question: "Can I make changes during construction?",
        answer:
          "Yes, change orders can be accommodated. We'll provide revised timelines and cost adjustments for your approval.",
      },
    ],
  },
};

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [service, setService] = useState(servicesData["real-estate"]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const serviceId = resolvedParams?.id || "real-estate";
    const serviceData = servicesData[serviceId as keyof typeof servicesData];
    if (serviceData) {
      setService(serviceData);
    }
  }, [resolvedParams]);

  const ServiceIcon = service.icon;

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

      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -5 }}
        className="fixed top-8 left-8 z-50 px-6 py-3 rounded-xl font-semibold transition flex items-center gap-2"
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          color: COLORS.white,
        }}
        onClick={() => window.history.back()}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Services
      </motion.button>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.6 }}
                className={`inline-flex w-20 h-20 rounded-2xl bg-gradient-to-br ${service.gradient} items-center justify-center mb-6`}
                style={{ boxShadow: SHADOWS.glow }}
              >
                <ServiceIcon className="w-10 h-10 text-white" />
              </motion.div>

              <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4">
                {service.title}
              </h1>

              <p
                className="text-2xl font-semibold mb-6"
                style={{ color: COLORS.primary[400] }}
              >
                {service.tagline}
              </p>

              <p
                className="text-lg leading-relaxed mb-8"
                style={{ color: COLORS.gray[300] }}
              >
                {service.longDescription}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                {service.stats.map((stat, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="text-center"
                  >
                    <p
                      className="text-4xl font-bold mb-2"
                      style={{ color: COLORS.primary[400] }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-sm" style={{ color: COLORS.gray[400] }}>
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl font-bold transition flex items-center gap-2"
                  style={{
                    background: GRADIENTS.button.primary,
                    color: COLORS.white,
                    boxShadow: SHADOWS.lg,
                  }}
                >
                  <Phone className="w-5 h-5" />
                  Request Quote
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-xl font-bold border-2 transition flex items-center gap-2"
                  style={{
                    borderColor: COLORS.primary[500],
                    color: COLORS.white,
                    background: "rgba(255, 255, 255, 0.05)",
                  }}
                >
                  <Calendar className="w-5 h-5" />
                  Schedule Consultation
                </motion.button>
              </div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                    <PlayCircle className="w-10 h-10 text-white" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {service.gallery.map((img, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="relative h-64 rounded-2xl overflow-hidden shadow-lg cursor-pointer"
              >
                <img
                  src={img}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="relative z-10 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
            {["overview", "process", "testimonials", "faqs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-semibold transition whitespace-nowrap ${
                  activeTab === tab ? "text-white" : "text-gray-400"
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
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Features */}
                  <div
                    className="backdrop-blur-lg rounded-3xl p-8 border"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-6">
                      What We Offer
                    </h3>
                    <div className="space-y-4">
                      {service.features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3 p-4 rounded-xl transition hover:bg-white/5"
                        >
                          <CheckCircle
                            className="w-6 h-6 flex-shrink-0 mt-0.5"
                            style={{ color: COLORS.primary[400] }}
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
                  </div>

                  {/* Benefits */}
                  <div
                    className="backdrop-blur-lg rounded-3xl p-8 border"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <h3 className="text-2xl font-bold text-white mb-6">
                      Why Choose Us
                    </h3>
                    <div className="space-y-4">
                      {service.benefits.map((benefit, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-4 p-6 rounded-2xl"
                          style={{ background: "rgba(34, 197, 94, 0.1)" }}
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
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "process" && (
              <motion.div
                key="process"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="backdrop-blur-lg rounded-3xl p-8 border"
                style={{
                  background: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.1)",
                }}
              >
                <h3 className="text-3xl font-bold text-white mb-12 text-center">
                  Our Process
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {service.process.map((step, idx) => {
                    const StepIcon = step.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.15 }}
                        className="relative text-center"
                      >
                        {idx < service.process.length - 1 && (
                          <div
                            className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5"
                            style={{
                              background: `linear-gradient(to right, ${COLORS.primary[500]}, transparent)`,
                            }}
                          />
                        )}
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 360 }}
                          transition={{ duration: 0.6 }}
                          className="relative z-10 mx-auto mb-4 w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                          style={{
                            background: GRADIENTS.button.primary,
                            boxShadow: SHADOWS.glow,
                          }}
                        >
                          {step.step}
                        </motion.div>
                        <div
                          className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                          style={{ background: "rgba(34, 197, 94, 0.2)" }}
                        >
                          <StepIcon
                            className="w-6 h-6"
                            style={{ color: COLORS.primary[400] }}
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
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === "testimonials" && (
              <motion.div
                key="testimonials"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {service.testimonials.map((testimonial, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="backdrop-blur-lg rounded-3xl p-8 border"
                      style={{
                        background: "rgba(255, 255, 255, 0.05)",
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-current"
                            style={{ color: "#facc15" }}
                          />
                        ))}
                      </div>
                      <p
                        className="text-lg mb-6 leading-relaxed"
                        style={{ color: COLORS.gray[200] }}
                      >
                        "{testimonial.content}"
                      </p>
                      <div>
                        <p className="font-bold text-white">
                          {testimonial.name}
                        </p>
                        <p
                          className="text-sm"
                          style={{ color: COLORS.primary[400] }}
                        >
                          {testimonial.role}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "faqs" && (
              <motion.div
                key="faqs"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {service.faqs.map((faq, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="backdrop-blur-lg rounded-2xl p-6 border"
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <h4 className="text-lg font-bold text-white mb-2">
                      {faq.question}
                    </h4>
                    <p
                      className="text     
-sm"
                      style={{ color: COLORS.gray[400] }}
                    >
                      {faq.answer}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
