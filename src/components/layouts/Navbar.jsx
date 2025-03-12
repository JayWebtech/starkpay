"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ConnectWalletButton from "../form/ConnectWalletButton";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="container mx-auto px-4 sm:px-10 md:px-8 lg:px-16 pt-6">
      <motion.div
        className="flex justify-between items-center backdrop-blur-xl py-4 px-7 rounded-lg border-[1px] border-stroke font-orbitron"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="logo"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Link href={"/"}>
            <h1 className="text-2xl font-bold text-white">
              $tark<span className="text-primary">Pay</span>
            </h1>
          </Link>
        </motion.div>
        <motion.div
          className="nav hidden md:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <ConnectWalletButton />
        </motion.div>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? "Close" : "Menu"}
          </button>
        </div>
      </motion.div>
      {isOpen && (
        <motion.div
          className="md:hidden mt-4 bg-transparent backdrop-blur-2xl p-4 border-[1px] border-stroke rounded-2xl"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <ul className="flex flex-col items-center space-y-4">
            <li>
              <a
                href="/"
                className="text-white hover:text-primary transition-all duration-200"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="/about"
                className="text-white hover:text-primary transition-all duration-200"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/dispute"
                className="text-white hover:text-primary transition-all duration-200"
              >
                Dispute
              </a>
            </li>
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default Navbar;
