"use client";
import React from "react";
import { motion } from "framer-motion";
import Button from "../form/Button";

const providers = [
  { name: "MTN", logo: "/logos/mtn.jpg" },
  { name: "Glo", logo: "/logos/glo.svg" },
  { name: "Airtel", logo: "/logos/airtel.jpg" },
  { name: "9Mobile", logo: "/logos/9mobile.jpg" },
];

const textVariants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 1, ease: "easeOut" } },
};

const Networks = () => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="container mx-auto px-4 sm:px-10 md:px-8 lg:px-16 pt-[2em] lg:pt-[7em]"
    >
      <motion.div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-center">
        <motion.div variants={textVariants} className="md:col-span-3">
          <span className="text-primary uppercase tracking-widest text-sm">
            USE
          </span>
          <h2 className="text-white text-4xl font-bold mt-3">
            The StarkPay Ecosystem
          </h2>
          <p className="text-gray-400 mt-4">
            StarkPay leverages the power of StarkNet to offer seamless, low-fee,
            and instant airtime and data purchases. No banks, no delays – just
            fast and decentralized transactions using StarkNet tokens.
          </p>
          <p className="text-gray-400 my-4">
            Buy airtime and data from top Nigerian mobile networks effortlessly.
            Experience next-gen payments today!
          </p>
          <motion.div>
            <Button>Learn More →</Button>
          </motion.div>
        </motion.div>

        <div className="relative md:col-span-2 h-[300px] overflow-hidden">
          <motion.div
            animate={{ y: ["0%", "-100%"] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute w-full"
          >
            <div className="grid grid-cols-2 gap-6">
              {providers.concat(providers).map((provider, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.8, delay: index * 0.2 },
                  }}
                  whileHover={{ scale: 1.1, transition: { duration: 0.3 } }}
                  className="flex items-center justify-center bg-black/30 p-4 rounded-lg shadow-lg"
                >
                  <img
                    src={provider.logo}
                    alt={provider.name}
                    className="w-24 h-auto"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
};

export default Networks;
