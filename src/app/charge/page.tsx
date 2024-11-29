"use client";
import WaveCharging from "@/components/WaveCharging";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { useBMSData } from "@/hooks/useBMSData";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500"],
});

const Charge = () => {
  const { voltage, current, SOC, loading, error } = useBMSData();
  const [power, setPower] = useState<number>(0);
  const [timeLeftToCharge, setTimeLeftToCharge] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(0);

  useEffect(() => {
    // Avoid calculations if data isn't loaded or there are errors
    if (loading || error || !voltage || !current || SOC === undefined) {
      return;
    }

    try {
      // Calculate power in Watts (W)
      const calculatedPower = Number((voltage * current).toFixed(2));
      setPower(calculatedPower);

      // Calculate time left to charge
      // Assuming battery capacity is 2.3 kWh (2300 Wh)
      const batteryCapacityWh = 2300;
      const remainingCapacity = (batteryCapacityWh * (100 - SOC)) / 100;
      const powerInKW = calculatedPower / 1000;

      // Time in hours = remaining capacity / power
      const timeInHours = remainingCapacity / (calculatedPower || 1); // Avoid division by zero

      // Convert hours to minutes
      const timeInMinutes = timeInHours * 60;
      setTimeLeftToCharge(Number(timeInMinutes.toFixed(2)));

      // Calculate energy in kWh
      const calculatedEnergy = Number((powerInKW * timeInHours).toFixed(2));
      setEnergy(calculatedEnergy);
    } catch (err) {
      console.error("Calculation error:", err);
      // Set default values in case of error
      setPower(0);
      setTimeLeftToCharge(0);
      setEnergy(0);
    }
  }, [voltage, current, SOC, loading, error]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div
      className="w-[768px] h-[1024px] overflow-hidden bg-[#2A2D32] font-sans pt-7"
      style={{
        backgroundImage: "url(/main-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex justify-center items-center p-1 pt-20 w-full px-8">
        <motion.div
          className="text-left flex-col gap-2 mb-12 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-white/90 text-5xl font-medium tracking-wider relative group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span className={`${poppins.className} relative`}>Charging</span>
          </motion.div>
        </motion.div>
      </div>

      <div className="flex flex-col items-center gap-6 mb-12 scale-150">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/5 shadow-lg shadow-cyan-500/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <span className="text-white/90 text-sm font-medium">
            {SOC}% Charging completed
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-cyan-400"
          >
            <path
              d="M13 2L4.09347 12.6879C3.74466 13.1064 3.57026 13.3157 3.56759 13.4925C3.56526 13.6461 3.63373 13.7923 3.75326 13.8889C3.89075 14 4.16318 14 4.70803 14H12L11 22L19.9065 11.3121C20.2553 10.8936 20.4297 10.6843 20.4324 10.5075C20.4347 10.3539 20.3663 10.2077 20.2467 10.1111C20.1092 10 19.8368 10 19.292 10H12L13 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>

      <WaveCharging percentage={SOC} />

      <div className="flex w-full justify-center items-center mb-8">
        <Image
          src="/charging-scooty.png"
          alt="Charger pad"
          width={500}
          height={300}
          className="drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]"
        />
      </div>

      <div className="w-full px-12 mt-12">
        <div className="grid grid-cols-2 gap-6">
          <motion.div
            className="group shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset] px-8 py-4 bg-black/20 backdrop-blur-sm rounded-lg text-gray-400 text-xl font-bold w-full text-center hover:shadow-[0_0_0_1px_rgba(6,182,212,0.2)_inset] transition-all duration-300 hover:bg-black/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <span className="text-nowrap">Energy: </span>
            <span className="group-hover:text-cyan-400/90 transition-colors duration-300 text-nowrap">
              {energy} kWh
            </span>
          </motion.div>

          <motion.div
            className="group shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset] px-8 py-4 bg-black/20 backdrop-blur-sm rounded-lg text-gray-400 text-xl font-bold w-full text-center hover:shadow-[0_0_0_1px_rgba(6,182,212,0.2)_inset] transition-all duration-300 hover:bg-black/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            Time Left:{" "}
            <span className="group-hover:text-cyan-400/90 transition-colors duration-300">
              {timeLeftToCharge} min
            </span>
          </motion.div>

          <motion.div
            className="group shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset] px-8 py-4 bg-black/20 backdrop-blur-sm rounded-lg text-gray-400 text-xl font-bold w-full text-center hover:shadow-[0_0_0_1px_rgba(6,182,212,0.2)_inset] transition-all duration-300 hover:bg-black/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            Charging Current:{" "}
            <span className="group-hover:text-cyan-400/90 transition-colors duration-300">
              {current} A
            </span>
          </motion.div>

          <motion.div
            className="group shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset] px-8 py-4 bg-black/20 backdrop-blur-sm rounded-lg text-gray-400 text-xl font-bold w-full text-center hover:shadow-[0_0_0_1px_rgba(6,182,212,0.2)_inset] transition-all duration-300 hover:bg-black/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            Power:{" "}
            <span className="group-hover:text-cyan-400/90 transition-colors duration-300">
              {power} W
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Charge;
