"use client";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const Select = () => {
  const [isParked, setIsParked] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  const buttonVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    hover: {
      scale: 1.02,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
  };

  const options = [
    { id: 1, text: "Charge by %" },
    { id: 2, text: "Charge by Time" },
    { id: 3, text: "Charge by ₹" },
  ];

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
      <div className="flex justify-center items-center p-1 pt-40 w-full px-8">
        <motion.div
          className="text-left flex-col gap-2 mb-24 relative w-full max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-gray-200 text-5xl font-medium tracking-wide relative group mb-16"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span className="relative inline-block">Charge your EV by</span>
          </motion.div>

          {/* Charging Options */}
          <div className="flex justify-center items-center w-full">
            <div className="flex flex-col gap-10 w-80">
              {options.map((option, index) => (
                <button
                  className="shadow-[inset_0_0_0_2px_#616467] text-black px-12 py-7 rounded-full tracking-widest uppercase font-bold bg-transparent hover:bg-[#616467] hover:text-white dark:text-neutral-200 transition duration-200 text-lg "
                  key={index}
                >
                  <div className="w-full flex justify-between">
                    {option.text}
                    <div className="">
                      <Zap className="text-cyan-300 w-7 h-7" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Select;
