'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingDown, Shield, Clock } from 'lucide-react';

/**
 * Feature card data structure
 */
interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  iconBg: string;
}

/**
 * Features showcase data
 */
const features: Feature[] = [
  {
    title: 'Lightning Fast',
    description:
      'Transactions complete in under 2 seconds. No waiting, no delays, just instant payments.',
    icon: <Zap className="w-6 h-6" />,
    gradient: 'from-primary/20 to-primary/5',
    iconBg: 'bg-primary/20 text-primary',
  },
  {
    title: 'Ultra Low Fees',
    description:
      'Pay only 0.1% transaction fees. Keep more of your money where it belongs, with you.',
    icon: <TrendingDown className="w-6 h-6" />,
    gradient: 'from-[#00A8E8]/20 to-[#00A8E8]/5',
    iconBg: 'bg-[#00A8E8]/20 text-[#00A8E8]',
  },
  {
    title: 'Fully Secure',
    description:
      'Built on Starknet with STARK proofs. Your transactions are secured by mathematics.',
    icon: <Shield className="w-6 h-6" />,
    gradient: 'from-accent/20 to-accent/5',
    iconBg: 'bg-accent/20 text-accent',
  },
  {
    title: '24/7 Available',
    description: 'No bank hours, no holidays. Pay your bills anytime, anywhere in the world.',
    icon: <Clock className="w-6 h-6" />,
    gradient: 'from-[#8B5CF6]/20 to-[#8B5CF6]/5',
    iconBg: 'bg-[#8B5CF6]/20 text-[#8B5CF6]',
  },
];

/**
 * Animation variants
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

/**
 * WhyChooseUs Component
 * Showcases key features/benefits with animated cards
 */
const WhyChooseUs: React.FC = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 lg:mb-16"
      >
        <span className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-4">
          Why Paystrata
        </span>
        <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
          Built for the Future
        </h2>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Experience the next generation of utility payments with blockchain technology
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {features.map((feature, index) => (
          <motion.div key={index} variants={cardVariants} className="group">
            <div
              className={`
              relative h-full p-6 rounded-2xl
              bg-gradient-to-b ${feature.gradient}
              border border-surface-border
              transition-all duration-300
            `}
            >
              {/* Icon */}
              <div
                className={`
                w-12 h-12 rounded-xl ${feature.iconBg}
                flex items-center justify-center mb-4
                group-hover:scale-110 transition-transform duration-300
              `}
              >
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="font-syne text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default WhyChooseUs;
