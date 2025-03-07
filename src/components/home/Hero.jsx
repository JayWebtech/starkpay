"use client"
import React from "react";
import { motion } from "framer-motion";
import Button from "../form/Button";
import { Parallax } from "react-scroll-parallax";

const Hero = () => {
  return (
    <div className="container mx-auto px-4 sm:px-10 md:px-8 lg:px-16 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 auto-rows-auto items-start">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="hero-card border-[1px] border-stroke rounded-lg flex flex-col gap-6 p-8 backdrop-blur-xl"
        >
          <motion.h4
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="font-orbitron text-white text-[1.6em] md:text-[2.5rem] font-bold"
          >
            Seamless Airtime & Data Purchases with StarkNet 🚀
          </motion.h4>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            className="text-white text-lg"
          >
            Buy airtime and mobile data instantly using decentralized, fast, and
            low-cost transactions on StarkNet. No middlemen. No delays. Just
            pure efficiency.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          >
            <Button className="w-fit py-5 px-7">Launch app</Button>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="justify-center hidden md:flex"
        >
          <motion.video
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
            autoPlay
            loop
            muted
            playsInline
            className="w-auto h-auto object-cover rounded-lg"
          >
            <source src="/video/hero2.webm" type="video/webm" />
            Your browser does not support the video tag.
          </motion.video>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
