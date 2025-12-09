'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../form/Button';
import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

/**
 * Hero Component
 * Main landing section with crypto-themed visual elements
 * Features animated gradient orbs and clear CTA
 */
const Hero: React.FC = () => {
  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const },
    },
  };

  // Stats data
  const stats = [
    { value: '50k+', label: 'Transactions' },
    { value: '<2s', label: 'Avg. Speed' },
    { value: '0.1%', label: 'Low Fees' },
  ];

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-20 pb-16 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="grid grid-cols-1 gap-12 lg:gap-8 items-center relative z-10">
        {/* Left Column - Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center justify-center text-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Powered by Starknet
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="font-syne text-4xl max-w-xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6"
          >
            Pay Bills with{' '}
            <span className="text-gradient">Crypto </span>
            Instantly
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-text-secondary max-w-2xl text-lg leading-relaxed mb-8"
          >
            Experience seamless utility payments on Starknet. Buy airtime, data, 
            pay for cable TV and electricity all with lightning fast blockchain 
            transactions and minimal fees.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-12">
            <Link href="/pay-bill">
              <Button size="lg" className="flex items-center gap-2 group">
                Launch App
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            variants={itemVariants}
            className="flex gap-8 lg:gap-12"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center lg:text-left">
                <div className="font-syne text-2xl lg:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-text-muted text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Column - SVG Illustration */}
        {/* <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="hidden lg:flex items-center justify-center"
        >
        
        </motion.div> */}
      </div>
    </section>
  );
};

export default Hero;
