"use client";
import React from "react";
import { motion } from "framer-motion";
import { MoveUpRight, Twitter, Linkedin, Facebook } from "lucide-react";

const footerItems = [
  { name: "Home", icon: <MoveUpRight size={35} />, link: "/" },
  { name: "About Us", icon: <MoveUpRight size={35} />, link: "/about" },
  {
    name: "Terms and Conditions",
    icon: <MoveUpRight size={35} />,
    link: "/terms",
  },
  {
    name: "Join Our Community",
    icon: <MoveUpRight size={35} />,
    link: "/community",
  },
];

const socialMedia = [
  { name: "Twitter", icon: <Twitter size={35} />, link: "https://twitter.com" },
  {
    name: "LinkedIn",
    icon: <Linkedin size={35} />,
    link: "https://linkedin.com",
  },
  {
    name: "Facebook",
    icon: <Facebook size={35} />,
    link: "https://facebook.com",
  },
];

const Footer = () => {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      className="container mx-auto px-4 sm:px-10 md:px-8 lg:px-16 pt-[2em] lg:py-[4em]"
    >
      <div className="hero-card border-[1px] w-full border-stroke rounded-lg flex flex-col gap-5 p-5 py-6 lg:p-[5em] mx-auto sticky mb-2 backdrop-opacity-60 backdrop-blur-3xl">
        <nav className="flex flex-col gap-10 text-white">
          {footerItems.map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="flex items-center gap-2 text-[1em] lg:text-[2em] hover:text-primary transition"
            >
              {item.name}
              {item.icon}
            </a>
          ))}
        </nav>

        <div className="flex gap-4 mt-4">
          {socialMedia.map((social, index) => (
            <a
              key={index}
              href={social.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-primary transition"
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default Footer;
