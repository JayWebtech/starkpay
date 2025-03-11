"use client";
import React from "react";
import {
  motion,
} from "framer-motion";

const cards = [
  {
    id: 1,
    title: "Instant Airtime & Data Purchases ⚡",
    description:
      "Buy airtime and mobile data instantly with decentralized transactions on StarkNet. Fast, low-cost, and secure—no middlemen, no delays!",
    button: "Buy Now",
  },
  {
    id: 2,
    title: "Powered by StarkNet 🚀",
    description:
      "Experience the future of payments with StarkNet's lightning-fast transactions. Decentralized, scalable, and built for efficiency.",
    button: "Learn More",
  },
  {
    id: 3,
    title: "Seamless & Secure Payments 🔐",
    description:
      "Enjoy hassle-free payments with blockchain security. Say goodbye to traditional banking delays and enjoy smooth, real-time transactions.",
    button: "Get Started",
  },
];

const JoinUs = () => {

  return (
    <div
      className={`pt-[2em] lg:pt-[4em] container mx-auto px-4 sm:px-10 md:px-8 lg:px-16 grid grid-cols-1 lg:grid-cols-3`}
    >
      {cards.map((item, index) => {
        return (
          <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
            key={index}
            className={`hero-card  border-[1px] w-full border-stroke backdrop-blur-lg flex flex-col justify-center items-center gap-5 p-5 lg:p-[2em] mx-auto sticky ${index == 0 ? 'rounded-t-lg lg:rounded-l-lg lg:rounded-t-none' : index == 2 ? 'rounded-b-lg lg:rounded-r-lg lg:rounded-bl-none' : ''}`}
          >
            <div className="flex flex-col gap-5 items-center">
              <motion.h4
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="font-orbitron text-white text-[1.5em] md:text-[2.2rem] font-bold text-center"
              >
                {item.title}
              </motion.h4>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                className="text-white text-lg text-center"
              >
                {item.description}
              </motion.p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default JoinUs;
