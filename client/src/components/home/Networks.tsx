'use client';
import React from 'react';
import { motion } from 'framer-motion';
import Button from '../form/Button';
import { ArrowRight, Smartphone, Wifi, Tv, Lightbulb } from 'lucide-react';
import Link from 'next/link';

/**
 * Service card data
 */
interface Service {
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const services: Service[] = [
  {
    name: 'Airtime',
    description: 'Top up any Nigerian mobile network instantly',
    icon: <Smartphone className="w-6 h-6" />,
    color: 'from-primary to-primary-dark',
  },
  {
    name: 'Data',
    description: 'Purchase data bundles for all networks',
    icon: <Wifi className="w-6 h-6" />,
    color: 'from-[#00A8E8] to-[#0088CC]',
  },
  {
    name: 'Cable TV',
    description: 'Pay DStv, GOtv, and Startimes subscriptions',
    icon: <Tv className="w-6 h-6" />,
    color: 'from-accent to-[#D4880F]',
  },
  {
    name: 'Electricity',
    description: 'Buy prepaid and postpaid electricity tokens',
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'from-[#8B5CF6] to-[#6D28D9]',
  },
];

/**
 * Networks/Services Component
 * Displays available services and the ecosystem overview
 */
const Networks: React.FC = () => {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative">
      {/* Background Accent */}
      <div className="absolute left-0 top-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">
        {/* Left - Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-primary text-sm font-medium tracking-wider uppercase mb-4">
            Services
          </span>
          <h2 className="font-syne text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            The Paystrata
            <br />
            <span className="text-gradient">Ecosystem</span>
          </h2>
          <p className="text-text-secondary text-lg leading-relaxed mb-6">
            Paystrata leverages the power of Starknet to offer seamless, low-fee, 
            and instant utility payments. No banks, no delays, just fast and 
            decentralized transactions.
          </p>
          <p className="text-text-secondary mb-8">
            Buy airtime and data from top Nigerian mobile networks, pay your 
            cable TV subscriptions, and settle electricity bills effortlessly. 
            Experience next-gen payments today!
          </p>
          
          <Link href="/pay-bill">
            <Button className="flex items-center gap-2 group">
              Start Paying Bills
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Right - Service Cards Grid */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="group"
            >
              <div className="glass-card rounded-2xl p-5 h-full hover:border-primary/30 transition-all duration-300">
                {/* Icon */}
                <div className={`
                  w-12 h-12 rounded-xl bg-gradient-to-br ${service.color}
                  flex items-center justify-center mb-4 text-white
                  group-hover:scale-110 transition-transform duration-300
                  shadow-lg
                `}>
                  {service.icon}
                </div>

                {/* Content */}
                <h3 className="font-syne text-lg font-semibold text-white mb-2">
                  {service.name}
                </h3>
                <p className="text-text-muted text-sm">
                  {service.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Networks;
