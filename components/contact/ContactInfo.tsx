// components/contact/ContactInfo.tsx
"use client";

import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
} from "lucide-react";

export default function ContactInfo() {
  const contactMethods = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+237 233 42 XX XX", "+237 699 XX XX XX"],
      action: "Call now",
      href: "tel:+23723342XXXX",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Mail,
      title: "Email",
      details: [
        "contact@earthdesignengineeringltd.com",
        "info@earthdesignengineeringltd.com",
      ],
      action: "Send email",
      href: "mailto:contact@earthdesignengineeringltd.com",
      color: "from-teal-500 to-emerald-500",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      details: ["+237 699 XX XX XX"],
      action: "Chat now",
      href: "https://wa.me/237699XXXXXX",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" },
  ];

  return (
    <div className="space-y-6">
      {/* Contact Methods */}
      {contactMethods.map((method, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all group"
        >
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${method.color} rounded-xl flex items-center justify-center flex-shrink-0`}
            >
              <method.icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {method.title}
              </h3>
              {method.details.map((detail, i) => (
                <p key={i} className="text-gray-600 text-sm">
                  {detail}
                </p>
              ))}
              <a
                href={method.href}
                className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-teal-600 hover:text-teal-700 group-hover:gap-2 transition-all"
              >
                {method.action}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Working Hours */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900">Working Hours</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Monday - Friday</span>
            <span className="font-medium text-gray-900">8:00 AM - 6:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Saturday</span>
            <span className="font-medium text-gray-900">9:00 AM - 1:00 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Sunday</span>
            <span className="font-medium text-red-500">Closed</span>
          </div>
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 rounded-2xl p-6 border border-gray-100"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Follow Us</h3>
        <div className="flex items-center gap-3">
          {socialLinks.map((social, index) => (
            <a
              key={index}
              href={social.href}
              aria-label={social.label}
              className="w-10 h-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-teal-500 hover:border-teal-500 hover:text-white transition-all"
            >
              <social.icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </motion.div>

      {/* Emergency Contact */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100"
      >
        <h3 className="font-semibold text-gray-900 mb-2">
          🚨 Emergency Contact
        </h3>
        <p className="text-sm text-gray-600 mb-3">
          For urgent property-related emergencies outside office hours:
        </p>
        <a
          href="tel:+237699XXXXXX"
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-all"
        >
          <Phone className="w-4 h-4" />
          +237 699 XX XX XX
        </a>
      </motion.div>
    </div>
  );
}
