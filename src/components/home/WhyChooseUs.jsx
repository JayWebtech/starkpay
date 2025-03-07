"use client";
import React from "react";
import { motion } from "framer-motion";
import { Lock, TrendingUp, Eye, Link2 } from "lucide-react";

const features = [
  {
    title: "Low Fees",
    description: "No extra charges – you only pay for what you buy.",
    icon: <Link2 size={32} color="#fff" />,
    video: "/video/why-2.webm",
  },
  {
    title: "Instant Transactions",
    description:
      "Buy airtime or data in seconds with lightning-fast blockchain payments.",
    icon: <TrendingUp size={32} color="#fff" />,
    video: "/video/hero3.webm",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  hover: {
    scale: 1.05,
    rotate: 2,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const WhyChooseUs = () => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="container mx-auto px-4 sm:px-10 md:px-8 lg:px-16 pt-[2em] lg:pt-[5em]"
    >
      <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover="hover"
            className="relative rounded-xl overflow-hidden shadow-lg h-[20em]"
          >
            {feature.video && (
              <motion.video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-0 left-0 w-full h-full object-cover"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 2,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatType: "reverse",
                }}
              >
                <source src={feature.video} type="video/webm" />
              </motion.video>
            )}
            <motion.div
              className="absolute bottom-0 left-0 w-full bg-black/40 backdrop-blur-md p-6 rounded-b-xl flex flex-col gap-3"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: index * 0.2 }}
            >
              <h3 className="text-white text-lg font-semibold flex items-center gap-2">
                {feature.icon} {feature.title}
              </h3>
              <p className="text-white text-sm">{feature.description}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default WhyChooseUs;
