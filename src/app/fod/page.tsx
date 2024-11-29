"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";

const ForeignObjectDetection = () => {
  const [hasForeignObject, setHasForeignObject] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Simulate foreign object detection
    const detectForeignObject = () => {
      setIsScanning(true);
      setTimeout(() => {
        setHasForeignObject(Math.random() > 0.5);
        setIsScanning(false);
      }, 3000);
    };

    detectForeignObject();
  }, []);

  return (
    <div
      className="w-[768px] h-[1024px] overflow-hidden bg-[#2A2D32] font-sans pt-7"
      style={{
        backgroundImage: "url(/main-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Hero Section */}
      <div className="flex justify-center items-center p-1 pt-20 w-full px-8">
        <motion.div
          className="text-left flex-col gap-2 mb-12 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-gray-200 text-4xl font-medium tracking-wide relative group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span className="relative inline-block">
              Foreign Object Detection
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Charging Pad */}
      <div className="w-full flex justify-center items-center mb-8">
        <div className="relative">
          <Image
            src="/charger-base.png"
            alt="Charging pad"
            width={300}
            height={300}
          />
          {isScanning && (
            <motion.div
              className="absolute top-0 left-0 w-full h-full bg-blue-500 opacity-30"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}
          {hasForeignObject && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/https://static.vecteezy.com/system/resources/thumbnails/015/734/136/small_2x/black-circle-icon-geometry-silhouette-png.png"
                alt="Foreign object"
                width={50}
                height={50}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Status Display */}
      <div className="w-full flex justify-center items-center">
        <motion.div
          className={`text-2xl font-bold ${
            isScanning
              ? "text-blue-400"
              : hasForeignObject
              ? "text-red-500"
              : "text-green-500"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {isScanning
            ? "Scanning for foreign objects..."
            : hasForeignObject
            ? "Foreign object detected!"
            : "Charging pad clear"}
        </motion.div>
      </div>

      {/* Animated Lines */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <svg
          width="768"
          height="1024"
          viewBox="0 0 768 1024"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.line
            x1="0"
            y1="0"
            x2="768"
            y2="0"
            stroke="url(#paint0_linear)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
          <motion.line
            x1="768"
            y1="0"
            x2="768"
            y2="1024"
            stroke="url(#paint1_linear)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
          />
          <motion.line
            x1="768"
            y1="1024"
            x2="0"
            y2="1024"
            stroke="url(#paint2_linear)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
          />
          <motion.line
            x1="0"
            y1="1024"
            x2="0"
            y2="0"
            stroke="url(#paint3_linear)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
          />
          <defs>
            <linearGradient id="paint0_linear" x1="0" y1="0" x2="768" y2="0">
              <stop stopColor="#2C78FA" />
              <stop offset="1" stopColor="#24D522" />
            </linearGradient>
            <linearGradient
              id="paint1_linear"
              x1="768"
              y1="0"
              x2="768"
              y2="1024"
            >
              <stop stopColor="#24D522" />
              <stop offset="1" stopColor="#24BEC7" />
            </linearGradient>
            <linearGradient
              id="paint2_linear"
              x1="768"
              y1="1024"
              x2="0"
              y2="1024"
            >
              <stop stopColor="#24BEC7" />
              <stop offset="1" stopColor="#2C78FA" />
            </linearGradient>
            <linearGradient id="paint3_linear" x1="0" y1="1024" x2="0" y2="0">
              <stop stopColor="#2C78FA" />
              <stop offset="1" stopColor="#24D522" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default ForeignObjectDetection;
