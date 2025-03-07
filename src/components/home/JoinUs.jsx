"use client";
import React, { useRef } from "react";
import { Parallax, useParallax } from "react-scroll-parallax";
import {
  useScroll,
  useMotionValueEvent,
  useTransform,
  motion,
} from "framer-motion";
import useWindowDimensions from "../hooks/useWindowSize";

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
  const targetRef = useRef(null);
  const { scrollY } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  const windowDimensions = useWindowDimensions();

  const cardTimeline = cards.map((_, i) => {
    const start = 1000 + i * windowDimensions?.height;
    const end = 1000 + (i + 1) * windowDimensions?.height;
    return [start, end];
  });

  const timeLine = [[0, 1000], ...cardTimeline];
  const animation = timeLine.map((data) => ({
    scale: useTransform(scrollY, data, [1, 0.9]),
    opacity: useTransform(scrollY, data, [1, 0]),
  }));

  console.log(windowDimensions);

  return (
    <div
      className={`py-[7em] container mx-auto px-4 sm:px-10 md:px-8 lg:px-16 relative`}
      ref={targetRef}
    >
      {cards.map((item, index) => {
        return (
          <motion.div
            style={{
              scale: animation[index + 1].scale,
              opacity: animation[index + 1].opacity,
            }}
            key={index}
            className="hero-card  border-[1px] w-full border-stroke rounded-lg backdrop-blur-lg flex flex-col justify-center items-center gap-5 p-10 lg:p-[5em] mx-auto sticky mb-2"
          >
            <div className="max-w-3xl flex flex-col gap-5 items-center">
              <motion.h4
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="font-orbitron text-white text-[1.6em] md:text-[2.2rem] font-bold text-center"
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
