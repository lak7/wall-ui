"use client";
import WaveCharging from "@/components/WaveCharging";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Poppins } from "next/font/google";
import { useBMSData } from "@/hooks/useBMSData";
import { useChargingTimer } from "@/hooks/useChargingTimer";
import { useRouter } from "next/navigation";
import { useChargingStatus } from "@/hooks/useChargingStatus";
import { onValue, ref, set } from "firebase/database";
import { database } from "@/config/firebase";
import { stat } from "fs";
import ChargingPadWarning from "@/components/FodDialog";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500"],
});

const Charge = () => {
  const router = useRouter();
  const { voltage, current, SOC, isReceiverCoilDetected, loading, error } =
    useBMSData();
  const { status, resetChargingStatus } = useChargingStatus();
  const [isScootyParked, setIsScootyParked] = useState(true);
  const { timeLeft, pauseTimer, resumeTimer, pauseTimerOnly } =
    useChargingTimer(); // Updated to use pause features
  const [power, setPower] = React.useState<number>(0);
  const [isFodThere, setIsFodThere] = useState(false);
  const [energy, setEnergy] = React.useState<number>(0);
  const [isChargingInitialized, setIsChargingInitialized] =
    React.useState(false);

  // Format time helper function
  const formatTime = (value: number) => value.toString().padStart(2, "0");

  // Effect for Firebase listeners
  useEffect(() => {
    try {
      const coilRef = ref(database, "IsReceiverCoilDetected");
      const fodRef = ref(database, "Is_FOD_Present");

      let unsubscribeFod: (() => void) | undefined;

      const unsubscribeCoil = onValue(coilRef, (coilSnapshot) => {
        if (unsubscribeFod) {
          unsubscribeFod();
        }

        unsubscribeFod = onValue(fodRef, (fodSnapshot) => {
          const isCoilDetected = coilSnapshot.val();
          const isFodPresent = fodSnapshot.val();
          setIsScootyParked(isCoilDetected);
          setIsFodThere(isFodPresent);
        });
      });

      return () => {
        unsubscribeCoil();
        if (unsubscribeFod) {
          unsubscribeFod();
        }
      };
    } catch (error) {
      console.error("Error setting up Firebase listeners:", error);
    }
  }, []);

  // Effect for charging status
  // useEffect(() => {
  //   if (status.isChargingInitialized === false) {
  //     const navigationTimer = setTimeout(() => {
  //       router.push("/done");
  //     }, 1000);
  //     return () => clearTimeout(navigationTimer);
  //   }
  // }, [status.isChargingInitialized, router]);

  // Add an interval effect for energy calculations
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isScootyParked && !isFodThere && voltage && current) {
      intervalId = setInterval(() => {
        const calculatedPower = Number((voltage * current).toFixed(2));
        setPower(calculatedPower);

        const powerInKW = calculatedPower / 1000;
        // Energy accumulated per second (1/3600 of an hour)
        const calculatedEnergy = powerInKW / 3600;
        setEnergy((prev) => Number((prev + calculatedEnergy).toFixed(6)));
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isScootyParked, isFodThere, voltage, current]);

  // Remove energy calculations from the existing effect
  useEffect(() => {
    setPower(0);
    if (loading || error || !voltage || !current || SOC === undefined) {
      return;
    }

    if (current > 0.001) {
      status.isChargingInitialized = true;
      setIsChargingInitialized(true);
    } else {
      setPower(0);
    }
  }, [voltage, current, SOC, loading, error]);

  // Updated effect for parking status with timer pause
  useEffect(() => {
    if (isScootyParked === false || isFodThere === true) {
      pauseTimer(); // Pause the timer when scooter is not parked or FOD is detected
    } else if (current <= 0) {
      pauseTimerOnly();
    } else {
      // Only resume if there's no FOD and scooter is parked
      if (!isFodThere && isScootyParked) {
        resumeTimer();
      }
    }
  }, [
    isScootyParked,
    isFodThere,
    current,
    pauseTimer,
    resumeTimer,
    pauseTimerOnly,
  ]);

  if (loading) {
    return (
      <div className="w-[768px] h-[1024px] flex items-center justify-center bg-[#2A2D32]">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-[768px] h-[1024px] flex items-center justify-center bg-[#2A2D32]">
        Error: {error}
      </div>
    );
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
            <span
              className={`${poppins.className} relative ${
                isScootyParked ? "" : "text-white"
              }`}
            >
              {isScootyParked
                ? isChargingInitialized
                  ? current <= 0
                    ? "Charging Paused"
                    : "Charging"
                  : "Initializing Charging"
                : "Park your vehicle"}
            </span>
          </motion.div>
        </motion.div>
      </div>
      <ChargingPadWarning isFodThere={isFodThere} />
      <div className="flex flex-col items-center gap-6 mb-12 scale-150">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/5 shadow-lg shadow-cyan-500/10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <span className="text-white/90 text-sm font-medium">
            {SOC + "% "}Charged
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

      <WaveCharging isChargeInit={isChargingInitialized} percentage={SOC} />

      <div className="flex w-full justify-center items-center mb-4">
        <div className="flex-col justify-center items-center gap-36">
          <motion.div
            initial={{ x: 768 }}
            animate={{ x: 0 }}
            key={isScootyParked ? "parked" : "not-parked"}
            transition={{
              duration: 5,
              type: "spring",
              stiffness: 100,
              damping: 100,
              repeat: isScootyParked ? 0 : Infinity,
            }}
          >
            <Image
              src="/charge-bike.png"
              alt="Charger pad"
              width={500}
              height={300}
              className="drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            />
          </motion.div>
          <div className="flex w-full items-center justify-center">
            <Image
              src="/charge-pad.png"
              alt="Charger pad"
              width={200}
              height={100}
              className="drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]"
            />
          </div>
        </div>
      </div>

      <div className="w-full px-12 mt-7">
        <div className="grid grid-cols-2 gap-6">
          <motion.div
            className="group shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset] px-8 py-4 bg-black/20 backdrop-blur-sm rounded-lg text-gray-400 text-xl font-bold w-full text-center hover:shadow-[0_0_0_1px_rgba(6,182,212,0.2)_inset] transition-all duration-300 hover:bg-black/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
          >
            <span className="text-nowrap">Energy: </span>
            <span className="group-hover:text-cyan-400/90 transition-colors duration-300 text-nowrap">
              {energy.toFixed(5)} kWh
            </span>
          </motion.div>

          <motion.div
            className="group shadow-[0_0_0_1px_rgba(255,255,255,0.1)_inset] px-8 py-4 bg-black/20 backdrop-blur-sm rounded-lg text-gray-400 text-xl font-bold w-full text-center hover:shadow-[0_0_0_1px_rgba(6,182,212,0.2)_inset] transition-all duration-300 hover:bg-black/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
          >
            Time Remaining:{" "}
            <span className="group-hover:text-cyan-400/90 transition-colors duration-300">
              {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:
              {formatTime(timeLeft.seconds)}
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
              {current.toFixed(2)} A
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
