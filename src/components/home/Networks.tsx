"use client";
import React from "react";
import { motion } from "framer-motion";
import Button from "../form/Button";

interface Provider {
  name: string;
  logo: string;
}

const providers: Provider[] = [
  { name: "MTN", logo: "/logos/mtn.jpg" },
  { name: "Glo", logo: "/logos/glo.svg" },
  { name: "Airtel", logo: "/logos/airtel.jpg" },
  { name: "9Mobile", logo: "/logos/9mobile.jpg" },
];

const textVariants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 1, ease: "easeOut" } },
};

const Networks: React.FC = () => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="container mx-auto px-4 sm:px-10 md:px-8 lg:px-16 pt-[5em] lg:pt-[8em]"
    >
      <motion.div className="">
        <motion.div variants={textVariants} className="md:col-span-3">
          <span className="text-primary uppercase tracking-widest text-sm">
            USE
          </span>
          <h2 className="text-white text-4xl font-bold mt-3">
            The StarkPay Ecosystem
          </h2>
          <p className="text-white mt-4">
            StarkPay leverages the power of StarkNet to offer seamless, low-fee,
            and instant airtime and data purchases.<br></br> No banks, no delays – just
            fast and decentralized transactions using StarkNet tokens.
          </p>
          <p className="text-white my-4">
            Buy airtime and data from top Nigerian mobile networks effortlessly.
            Experience next-gen payments today!
          </p>
          <motion.div>
            <Button>Learn More →</Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

export default Networks;
