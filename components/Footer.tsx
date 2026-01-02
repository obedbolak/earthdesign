// File: components/Footer.tsx
'use client';

import { motion } from 'framer-motion';
import { 
  Home, 
  MapPin, 
  Phone, 
  Mail, 
  Clock,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ArrowRight,
  Send,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { COLORS, GRADIENTS } from '@/lib/constants/colors';

const footerLinks = {
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Team', href: '/team' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press & Media', href: '/press' },
    { name: 'Contact Us', href: '/contact' },
  ],
  properties: [
    { name: 'For Sale', href: '/properties?status=sale' },
    { name: 'For Rent', href: '/properties?status=rent' },
    { name: 'New Developments', href: '/properties?type=new' },
    { name: 'Commercial', href: '/properties?type=commercial' },
    { name: 'Land & Plots', href: '/properties?type=land' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'FAQs', href: '/faqs' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Sitemap', href: '/sitemap' },
  ],
};

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://facebook.com', color: '#1877F2' },
  { name: 'Twitter', icon: Twitter, href: 'https://twitter.com', color: '#1DA1F2' },
  { name: 'Instagram', icon: Instagram, href: 'https://instagram.com', color: '#E4405F' },
  { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com', color: '#0A66C2' },
  { name: 'YouTube', icon: Youtube, href: 'https://youtube.com', color: '#FF0000' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-20">
      {/* Newsletter Section */}
      <div 
        className="border-b"
        style={{
          background: `linear-gradient(135deg, ${COLORS.primary[800]} 0%, ${COLORS.primary[900]} 100%)`,
          borderColor: `${COLORS.primary[700]}50`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <motion.h3 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl sm:text-3xl font-bold text-white mb-2"
              >
                Subscribe to Our Newsletter
              </motion.h3>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="opacity-80 text-white"
              >
                Get the latest properties and real estate news delivered to your inbox
              </motion.p>
            </div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="w-full lg:w-auto"
            >
              <form className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:w-80">
                  <Mail 
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: COLORS.gray[400] }}
                  />
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-4 transition"
                    style={{
                      background: COLORS.white,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-8 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition shadow-lg"
                  style={{ 
                    background: GRADIENTS.button.primary,
                  }}
                >
                  Subscribe
                  <Send className="w-5 h-5" />
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div 
        style={{
          background: GRADIENTS.background.hero,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            
            {/* Column 1: Brand & About */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-4"
            >
              <Link href="/" className="inline-block mb-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-4"
                >
                 
                  {/* Logo Image */}
                  <div
                    className="relative w-42 h-22 flex items-center justify-center"
                    style={{ borderColor: `${COLORS.primary[400]}60` }}
                  >
                    <img
                      src="/logo.png"
                      alt="earth design Logo"
                      className="w-full h-60 object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                </motion.div>
              </Link>
              
              <p 
                className="mb-6 leading-relaxed"
                style={{ color: COLORS.gray[300] }}
              >
                Your trusted partner for luxury villas, modern apartments, commercial 
                developments, and prime land across Cameroon. We bring your property 
                dreams to life with excellence and integrity.
              </p>

              {/* Contact Info */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${COLORS.primary[500]}20` }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Office Address</p>
                    <p style={{ color: COLORS.gray[400] }} className="text-sm">
                      123 Independence Avenue, Yaoundé, Cameroon
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${COLORS.primary[500]}20` }}
                  >
                    <Phone className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Phone Number</p>
                    <p style={{ color: COLORS.gray[400] }} className="text-sm">
                      +237 677212279
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${COLORS.primary[500]}20` }}
                  >
                    <Mail className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Email Address</p>
                    <p style={{ color: COLORS.gray[400] }} className="text-sm">
                      commercial@earthdesignengineeringltd.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${COLORS.primary[500]}20` }}
                  >
                    <Clock className="w-5 h-5" style={{ color: COLORS.primary[400] }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">Working Hours</p>
                    <p style={{ color: COLORS.gray[400] }} className="text-sm">
                      Mon - Sat: 8:00 AM - 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Column 2: Quick Links */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2"
            >
              <h4 
                className="text-lg font-bold text-white mb-6 pb-2 border-b inline-block"
                style={{ borderColor: COLORS.primary[500] }}
              >
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="group flex items-center gap-2 transition-colors"
                      style={{ color: COLORS.gray[400] }}
                    >
                      <ChevronRight 
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        style={{ color: COLORS.primary[500] }}
                      />
                      <span className="group-hover:text-white transition-colors">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 3: Properties */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <h4 
                className="text-lg font-bold text-white mb-6 pb-2 border-b inline-block"
                style={{ borderColor: COLORS.primary[500] }}
              >
                Properties
              </h4>
              <ul className="space-y-3">
                {footerLinks.properties.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="group flex items-center gap-2 transition-colors"
                      style={{ color: COLORS.gray[400] }}
                    >
                      <ChevronRight 
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        style={{ color: COLORS.primary[500] }}
                      />
                      <span className="group-hover:text-white transition-colors">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 4: Support */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              <h4 
                className="text-lg font-bold text-white mb-6 pb-2 border-b inline-block"
                style={{ borderColor: COLORS.primary[500] }}
              >
                Support
              </h4>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="group flex items-center gap-2 transition-colors"
                      style={{ color: COLORS.gray[400] }}
                    >
                      <ChevronRight 
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        style={{ color: COLORS.primary[500] }}
                      />
                      <span className="group-hover:text-white transition-colors">
                        {link.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Column 5: Connect */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2"
            >
              <h4 
                className="text-lg font-bold text-white mb-6 pb-2 border-b inline-block"
                style={{ borderColor: COLORS.primary[500] }}
              >
                Connect With Us
              </h4>
              
              <p className="mb-4 text-sm" style={{ color: COLORS.gray[400] }}>
                Follow us on social media for updates and exclusive listings
              </p>

              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-11 h-11 rounded-xl flex items-center justify-center transition-all group"
                    style={{ 
                      background: `${COLORS.primary[500]}20`,
                    }}
                    title={social.name}
                  >
                    <social.icon 
                      className="w-5 h-5 transition-colors"
                      style={{ color: COLORS.gray[400] }}
                    />
                  </motion.a>
                ))}
              </div>

              {/* App Download (Optional) */}
              <div className="mt-8">
                <p className="text-sm font-semibold text-white mb-3">Download Our App</p>
                <div className="flex flex-col gap-2">
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition"
                    style={{ background: `${COLORS.primary[500]}20` }}
                  >
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <div>
                      <p className="text-[10px]" style={{ color: COLORS.gray[400] }}>Download on the</p>
                      <p className="text-sm font-semibold text-white -mt-0.5">App Store</p>
                    </div>
                  </motion.a>
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition"
                    style={{ background: `${COLORS.primary[500]}20` }}
                  >
                    <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                    </svg>
                    <div>
                      <p className="text-[10px]" style={{ color: COLORS.gray[400] }}>Get it on</p>
                      <p className="text-sm font-semibold text-white -mt-0.5">Google Play</p>
                    </div>
                  </motion.a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div 
          className="border-t"
          style={{ borderColor: `${COLORS.primary[700]}50` }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-sm text-center md:text-left"
                style={{ color: COLORS.gray[400] }}
              >
                © {currentYear} Earth Design Real Estate. All rights reserved.
              </motion.p>

              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm"
                style={{ color: COLORS.gray[400] }}
              >
                <Link 
                  href="/privacy" 
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
                <span className="hidden md:inline">•</span>
                <Link 
                  href="/terms" 
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
                <span className="hidden md:inline">•</span>
                <Link 
                  href="/cookies" 
                  className="hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </motion.div>

              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-sm hidden lg:flex items-center gap-2"
                style={{ color: COLORS.gray[500] }}
              >
                Made with 
                <span className="text-red-500">❤️</span> 
                in Cameroon
              </motion.p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}