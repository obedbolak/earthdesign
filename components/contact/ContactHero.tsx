// components/contact/ContactHero.tsx
"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle } from "lucide-react";

export default function ContactHero() {
  const quickContacts = [
    {
      icon: Phone,
      label: "Call Us",
      value: "+237 233 42 XX XX",
      subtext: "Mon-Fri, 8AM-6PM",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Mail,
      label: "Email Us",
      value: "contact@earthdesignengineeringltd.com",
      subtext: "We reply within 24hrs",
      color: "from-teal-500 to-emerald-500",
    },
    {
      icon: MapPin,
      label: "Visit Us",
      value: "Carrefour T.K.C, Yaoundé, Cameroon",
      subtext: "Headquarters",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Clock,
      label: "Working Hours",
      value: "Mon - Fri: 8AM - 6PM",
      subtext: "Sat: 9AM - 1PM",
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920"
          alt="Contact Us"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/95 via-gray-900/85 to-gray-900/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-500 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-teal-300 text-sm font-medium mb-6"
          >
            <MessageCircle className="w-4 h-4" />
            <span>We'd Love to Hear From You</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Get in{" "}
            <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Touch
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Have questions about our properties or services? Our team is ready
            to assist you in finding your perfect property in Cameroon.
          </p>
        </motion.div>

        {/* Quick Contact Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {quickContacts.map((contact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="group"
            >
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 text-center">
                <div
                  className={`w-12 h-12 mx-auto bg-gradient-to-br ${contact.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <contact.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  {contact.label}
                </p>
                {/* Value with special handling for email display cause the email can be long i want it to wrap */}
                <p className="text-sm font-semibold text-white break-words mb-1">
                  {contact.value}
                </p>

                <p className="text-xs text-gray-500">{contact.subtext}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
