"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState } from "react";

const Navbar = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Animation variants for the settings icon
  const settingsIconVariants = {
    hover: {
      rotate: 90,
      scale: 1.1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  // Pulse animation for the notification dot
  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.8, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <nav className="w-full relative z-10 flex justify-end items-center">
      {/* Header with logo */}
      <motion.div
        className="absolute top-8 left-8 flex items-center space-x-4 group"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="h-10 w-10 relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Image
            src="/dash-logo.png"
            alt="Logo"
            width={100}
            height={100}
            className="drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          />
        </motion.div>
        <div>
          <motion.h1
            className="text-white text-2xl font-bold tracking-tight"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Dash Dynamic
            </span>
          </motion.h1>
          <motion.p
            className="text-gray-400 text-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            Technology Curator
          </motion.p>
        </div>
      </motion.div>

      {/* Settings Button with enhanced effects */}
      <motion.div
        className="absolute top-8 right-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          className="relative group"
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          whileHover="hover"
          variants={settingsIconVariants}
        >
          {/* Glow effect background */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white opacity-0 blur-xl group-hover:opacity-20 transition-opacity duration-300"
            animate={{
              scale: isHovered ? 1.2 : 1,
            }}
          />

          {/* Settings icon with gradient stroke */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="1.5"
            className="w-6 h-6 relative z-10 transform transition-transform duration-300"
          >
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>

          {/* Ripple effect on click */}
          <motion.span
            className="absolute inset-0 rounded-full border border-white/40"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={
              isHovered
                ? {
                    scale: 1.2,
                    opacity: [0, 0.2, 0],
                    transition: {
                      duration: 1,
                      repeat: Infinity,
                    },
                  }
                : { scale: 0.8, opacity: 0 }
            }
          />
        </motion.button>
      </motion.div>
    </nav>
  );
};

export default Navbar;
