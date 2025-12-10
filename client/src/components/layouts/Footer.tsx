'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Twitter, Github, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Footer navigation links
 */
interface FooterLink {
  name: string;
  href: string;
}

const footerLinks: FooterLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Pay Bills', href: '/pay-bill' },
  { name: 'About', href: '/about' },
  { name: 'Terms', href: '/terms' },
];

/**
 * Social media links
 */
interface SocialLink {
  name: string;
  icon: React.ReactNode;
  href: string;
}

const socialLinks: SocialLink[] = [
  { 
    name: 'Twitter', 
    icon: <Twitter className="w-5 h-5" />, 
    href: 'https://twitter.com/Paystrata' 
  },
];

/**
 * Footer Component
 * Modern minimal footer with navigation, social links, and branding
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="glass-card rounded-3xl p-8 lg:p-12"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              
              <h2 className="font-syne text-xl font-bold text-white">
                Pay<span className="text-gradient">strata</span>
              </h2>
            </Link>
            
            <p className="text-text-secondary max-w-sm mb-6">
              The future of utility payments, hotel bookings, and flights. Fast, secure, and decentralized 
              payments powered by Starknet blockchain technology.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-primary border border-surface-border flex items-center justify-center text-black transition-all duration-200"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-syne text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href}
                    className="text-text-secondary hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-syne text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="https://starknet.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                >
                  Starknet
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                </a>
              </li>
              <li>
                <a 
                  href="https://docs.starknet.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-text-secondary hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                >
                  Documentation
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-text-secondary hover:text-primary transition-colors duration-200 flex items-center gap-1 group"
                >
                  Support
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-surface-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-text-muted text-sm">
            © {currentYear} Paystrata. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-text-muted text-sm">
            <span>Built on</span>
            <span className="text-primary font-medium">Starknet</span>
          </div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;
