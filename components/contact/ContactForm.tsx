// components/contact/ContactForm.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Send,
  User,
  Mail,
  Phone,
  MessageSquare,
  Building2,
  CheckCircle,
  Loader2,
  Home,
  Briefcase,
  MapPin,
  HelpCircle,
} from "lucide-react";

const inquiryTypes = [
  { value: "buying", label: "Buying a Property", icon: Home },
  { value: "renting", label: "Renting a Property", icon: Building2 },
  { value: "selling", label: "Selling a Property", icon: MapPin },
  { value: "commercial", label: "Commercial Inquiry", icon: Briefcase },
  { value: "partnership", label: "Partnership", icon: HelpCircle },
  { value: "other", label: "Other", icon: MessageSquare },
];

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    inquiryType: "",
    propertyType: "",
    budget: "",
    location: "",
    message: "",
    newsletter: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.inquiryType) {
      newErrors.inquiryType = "Please select an inquiry type";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        inquiryType: "",
        propertyType: "",
        budget: "",
        location: "",
        message: "",
        newsletter: false,
      });
    }, 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-3xl p-12 text-center border border-teal-100"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="w-20 h-20 mx-auto bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center mb-6"
        >
          <CheckCircle className="w-10 h-10 text-white" />
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          Message Sent Successfully!
        </h3>
        <p className="text-gray-600 mb-6">
          Thank you for contacting us. Our team will get back to you within 24
          hours.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm text-gray-600 border border-gray-200">
          <Mail className="w-4 h-4 text-teal-600" />
          <span>Confirmation sent to {formData.email}</span>
        </div>
      </motion.div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-100 rounded-full text-teal-700 text-sm font-medium mb-4">
          <MessageSquare className="w-4 h-4" />
          <span>Send us a Message</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          How Can We <span className="text-teal-600">Help You?</span>
        </h2>
        <p className="text-gray-600">
          Fill out the form below and our team will respond to your inquiry as
          soon as possible.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`text-gray-500 w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                  errors.firstName ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="Enter First Name"
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`text-gray-500 w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                  errors.lastName ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="Doe"
              />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`text-gray-500 w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                  errors.email ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="john@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`text-gray-500 w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all ${
                  errors.phone ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="+237 6XX XXX XXX"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Inquiry Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What are you interested in? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {inquiryTypes.map((type) => (
              <label
                key={type.value}
                className={` relative flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                  formData.inquiryType === type.value
                    ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500"
                    : "border-gray-200 bg-gray-50 hover:border-teal-300"
                }`}
              >
                <input
                  type="radio"
                  name="inquiryType"
                  value={type.value}
                  checked={formData.inquiryType === type.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <type.icon
                  className={`w-5 h-5 ${
                    formData.inquiryType === type.value
                      ? "text-teal-600"
                      : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    formData.inquiryType === type.value
                      ? "text-teal-700"
                      : "text-gray-600"
                  }`}
                >
                  {type.label}
                </span>
              </label>
            ))}
          </div>
          {errors.inquiryType && (
            <p className="mt-2 text-sm text-red-500">{errors.inquiryType}</p>
          )}
        </div>

        {/* Property Details (Conditional) */}
        {(formData.inquiryType === "buying" ||
          formData.inquiryType === "renting") && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="grid md:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleChange}
                className="text-gray-500 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="">Select type</option>
                <option value="villa">Villa</option>
                <option value="apartment">Apartment</option>
                <option value="duplex">Duplex</option>
                <option value="land">Land</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="text-gray-500 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="">Select budget</option>
                <option value="0-50m">Under 50M XAF</option>
                <option value="50m-100m">50M - 100M XAF</option>
                <option value="100m-250m">100M - 250M XAF</option>
                <option value="250m-500m">250M - 500M XAF</option>
                <option value="500m+">Above 500M XAF</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="text-gray-500 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              >
                <option value="">Select location</option>
                <option value="douala">Douala</option>
                <option value="yaounde">Yaoundé</option>
                <option value="garoua">Garoua</option>
                <option value="bafoussam">Bafoussam</option>
                <option value="other">Other</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Message <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className={`text-gray-500 w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none ${
                errors.message ? "border-red-300" : "border-gray-200"
              }`}
              placeholder="Tell us more about what you're looking for..."
            />
          </div>
          {errors.message && (
            <p className="mt-1 text-sm text-red-500">{errors.message}</p>
          )}
        </div>

        {/* Newsletter Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            name="newsletter"
            id="newsletter"
            checked={formData.newsletter}
            onChange={handleChange}
            className="mt-1 w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
          />
          <label htmlFor="newsletter" className="text-sm text-gray-600">
            I'd like to receive newsletters about new properties, market
            insights, and exclusive offers from Earth Design.
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending Message...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Message
            </>
          )}
        </button>

        {/* Privacy Note */}
        <p className="text-xs text-gray-500 text-center">
          By submitting this form, you agree to our{" "}
          <a href="/privacy-policy" className="text-teal-600 hover:underline">
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href="/terms" className="text-teal-600 hover:underline">
            Terms of Service
          </a>
          .
        </p>
      </form>
    </div>
  );
}
