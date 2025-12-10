'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Layers, Lock } from 'lucide-react';

/**
 * Card data interface
 */
interface Card {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

/**
 * Feature cards data
 */
const cards: Card[] = [
  {
    id: 1,
    title: 'Instant Payments',
    description:
      'Buy airtime and mobile data, book hotels and flights instantly with decentralized transactions on Starknet. Fast, low-cost, and secure.',
    icon: <Zap className="w-7 h-7" />,
    accent: 'primary',
  },
  {
    id: 2,
    title: 'Powered by Starknet',
    description:
      "Experience the future of payments with Starknet's lightning-fast transactions. Decentralized, scalable, and efficient.",
    icon: <Layers className="w-7 h-7" />,
    accent: '[#00A8E8]',
  },
  {
    id: 3,
    title: 'Secure & Seamless',
    description:
      'Enjoy hassle-free payments with blockchain security. Say goodbye to traditional banking delays.',
    icon: <Lock className="w-7 h-7" />,
    accent: 'accent',
  },
];

/**
 * JoinUs Component
 * CTA section with feature highlights in a horizontal card layout
 */
const JoinUs: React.FC = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="font-syne text-3xl sm:text-4xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Join thousands of users making seamless crypto payments for everyday utilities
        </p>
      </motion.div>

      {/* Cards Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 max-w-5xl mx-auto">
        {cards.map((item, index) => {
          // Dynamic border radius for connected card effect
          const borderRadius = index === 0 
            ? 'rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none' 
            : index === 2 
              ? 'rounded-b-2xl lg:rounded-r-2xl lg:rounded-bl-none' 
              : '';
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`
                relative group
                glass-card ${borderRadius}
                border-surface-border
                ${index !== 2 ? 'lg:border-r-0' : ''}
                ${index !== 0 ? 'border-t-0 lg:border-t' : ''}
                p-8 lg:p-10
                hover:bg-surface-light/50 transition-colors duration-300
              `}
            >
              {/* Icon */}
              <div className={`
                w-14 h-14 rounded-xl
                bg-${item.accent}/15
                text-${item.accent}
                flex items-center justify-center mb-5
                group-hover:scale-110 transition-transform duration-300
              `}
              style={{
                backgroundColor: item.accent === 'primary' 
                  ? 'rgba(0, 212, 170, 0.15)' 
                  : item.accent === '[#00A8E8]' 
                    ? 'rgba(0, 168, 232, 0.15)' 
                    : 'rgba(245, 166, 35, 0.15)',
                color: item.accent === 'primary' 
                  ? '#00D4AA' 
                  : item.accent === '[#00A8E8]' 
                    ? '#00A8E8' 
                    : '#F5A623',
              }}
              >
                {item.icon}
              </div>

              {/* Content */}
              <h3 className="font-syne text-xl font-bold text-white mb-3">
                {item.title}
              </h3>
              <p className="text-text-secondary leading-relaxed">
                {item.description}
              </p>

              {/* Decorative Number */}
              <div className="absolute top-6 right-6 font-syne text-6xl font-bold text-white/[0.03]">
                0{item.id}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default JoinUs;
