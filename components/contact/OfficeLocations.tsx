// components/contact/OfficeLocations.tsx
"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Building2,
} from "lucide-react";

const offices = [
  {
    city: "Douala",
    type: "Headquarters",
    address: "Rue de la Liberté, Bonanjo, Douala",
    phone: "+237 233 42 XX XX",
    email: "douala@earthdesignengineeringltd.com",
    hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-1PM",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600",
    coordinates: { lat: 4.0511, lng: 9.7679 },
    featured: true,
  },
  {
    city: "Yaoundé",
    type: "Regional Office",
    address: "Avenue Kennedy, Quartier Bastos, Yaoundé",
    phone: "+237 222 XX XX XX",
    email: "yaounde@earthdesignengineeringltd.com",
    hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-1PM",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600",
    coordinates: { lat: 3.848, lng: 11.5021 },
    featured: false,
  },
  {
    city: "Garoua",
    type: "Regional Office",
    address: "Rue Principale, Centre Ville, Garoua",
    phone: "+237 222 XX XX XX",
    email: "garoua@earthdesignengineeringltd.com",
    hours: "Mon-Fri: 8AM-5PM",
    image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=600",
    coordinates: { lat: 9.3, lng: 13.4 },
    featured: false,
  },
  {
    city: "Bafoussam",
    type: "Regional Office",
    address: "Avenue des Forces Armées, Bafoussam",
    phone: "+237 233 XX XX XX",
    email: "bafoussam@earthdesignengineeringltd.com",
    hours: "Mon-Fri: 8AM-5PM",
    image: "https://images.unsplash.com/photo-1497215842964-222b430dc094?w=600",
    coordinates: { lat: 5.4737, lng: 10.4179 },
    featured: false,
  },
];

export default function OfficeLocations() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

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
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>Our Offices</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Visit Us <span className="text-teal-600">Nationwide</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            With offices across Cameroon, we're always close to you. Visit any
            of our locations for personalized assistance.
          </p>
        </motion.div>

        {/* Office Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offices.map((office, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all ${
                office.featured ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={office.image}
                  alt={office.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                {office.featured && (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full">
                    Headquarters
                  </div>
                )}
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-xl font-bold text-white">
                    {office.city}
                  </h3>
                  <p className="text-sm text-gray-300">{office.type}</p>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-600">{office.address}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-teal-600" />
                  <a
                    href={`tel:${office.phone}`}
                    className="text-sm text-gray-600 hover:text-teal-600"
                  >
                    {office.phone}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-teal-600" />
                  <a
                    href={`mailto:${office.email}`}
                    className="text-sm text-gray-600 hover:text-teal-600"
                  >
                    {office.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <p className="text-sm text-gray-600">{office.hours}</p>
                </div>

                {/* Get Directions Button */}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${office.coordinates.lat},${office.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-teal-50 hover:text-teal-600 transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
