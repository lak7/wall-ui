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
import EmergencyStop from "@/components/EmergencyStop";
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
  const {
    timeLeft,
    setTimeLeft,
    pauseTimer,
    resumeTimer,
    pauseTimerOnly,
    isPaused,
    setPausedTimeLeft,
    setPauseTimestamp,
  } = useChargingTimer(); // Updated to use pause features
  const [power, setPower] = React.useState<number>(0);
  const [isFodThere, setIsFodThere] = useState(false);
  const [energy, setEnergy] = React.useState<number>(0);
  const [isChargingInitialized, setIsChargingInitialized] =
    React.useState(false);
  const [unparkStartTime, setUnparkStartTime] = useState<number | null>(null);
  const [parkCountdown, setParkCountdown] = useState<number>(60); // 60 seconds
  const [isEmergencyStop, setIsEmergencyStop] = useState(false);

  // Format time helper function
  const formatTime = (value: number) => value.toString().padStart(2, "0");

  console.log("Emergency: ", isEmergencyStop);

  // Effect for Firebase listeners
  useEffect(() => {
    try {
      const coilRef = ref(database, "IsReceiverCoilDetected");
      const fodRef = ref(database, "Is_FOD_Present");
      const emergencyStopRef = ref(database, "emergencyStop");

      // Separate listeners for better cleanup and independence
      const unsubscribeCoil = onValue(coilRef, (coilSnapshot) => {
        const isCoilDetected = coilSnapshot.val();
        setIsScootyParked(isCoilDetected);
      });

      const unsubscribeFod = onValue(fodRef, (fodSnapshot) => {
        const isFodPresent = fodSnapshot.val();
        setIsFodThere(isFodPresent);
      });

      const unsubscribeEmergency = onValue(
        emergencyStopRef,
        (emergencySnapshot) => {
          const emergencyValue = emergencySnapshot.val();
          console.log("Emergency value from Firebase:", emergencyValue);
          setIsEmergencyStop(emergencyValue);
        }
      );

      // Cleanup all listeners
      return () => {
        unsubscribeCoil();
        unsubscribeFod();
        unsubscribeEmergency();
      };
    } catch (error) {
      console.error("Error setting up Firebase listeners:", error);
    }
  }, []); // Empty dependency array since we want this to run once on mount

  // Updated effect for timer and energy calculation
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      status?.isChargingInitialized &&
      status?.duration?.endTime &&
      !isPaused
    ) {
      interval = setInterval(() => {
        const now = Date.now();
        const endTime = status.duration.endTime!;
        const difference = endTime - now;

        if (difference <= 0) {
          clearInterval(interval);
          resetChargingStatus();
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          setPausedTimeLeft(null);
          setPauseTimestamp(null);
          router.push("/done");
          return;
        }

        // Convert milliseconds to hours, minutes, seconds
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });

        // Calculate and update energy only if charging is active
        if (isChargingInitialized && !isFodThere && current > 0) {
          const calculatedPower = Number((voltage * current).toFixed(2));
          const powerInKW = calculatedPower / 1000;
          // Energy accumulated per second (1/3600 of an hour)
          const calculatedEnergy = powerInKW / 3600;
          setEnergy((prev) => Number((prev + calculatedEnergy).toFixed(6)));
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    status?.isChargingInitialized,
    status?.duration?.endTime,
    resetChargingStatus,
    isPaused,
    isChargingInitialized,
    isFodThere,
    current,
    voltage,
  ]);

  // Remove or modify the existing useEffect that was calculating power and energy
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

    try {
      const calculatedPower = Number((voltage * current).toFixed(2));
      setPower(calculatedPower);
    } catch (err) {
      console.error("Calculation error:", err);
      setPower(0);
    }
  }, [voltage, current, SOC, loading, error]);

  // Updated effect for parking status with timer pause
  useEffect(() => {
    if (isScootyParked === false || isFodThere === true) {
      set(ref(database, "charging_status/isChargingInitialized"), false);
      pauseTimer(); // Pause the timer when scooter is not parked
      // router.push("/park");
    } else if (current <= 0) {
      // set(ref(database, "charging_status/isChargingInitialized"), true);
      pauseTimerOnly();
    } else {
      // set(ref(database, "charging_status/isChargingInitialized"), true);
      resumeTimer();
    }
  }, [isScootyParked, router, pauseTimer, resumeTimer]);

  // Add this new effect to handle unpark timing and countdown
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;

    if (!isScootyParked) {
      // Set the initial unpark time if not already set
      if (!unparkStartTime) {
        setUnparkStartTime(Date.now());
      }

      // Start countdown timer
      countdownInterval = setInterval(() => {
        setParkCountdown((prev) => {
          if (prev <= 1) {
            // Reset everything and redirect
            resetChargingStatus();
            setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
            setPausedTimeLeft(null);
            setPauseTimestamp(null);
            setIsChargingInitialized(false);
            setEnergy(0);
            router.push("/");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      // Reset the unpark timer and countdown when scooter is parked
      setUnparkStartTime(null);
      setParkCountdown(60);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, [isScootyParked, unparkStartTime, resetChargingStatus, router]);

  useEffect(() => {
    console.log("Emergency Stop State Changed:", isEmergencyStop);
  }, [isEmergencyStop]);

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
              {isScootyParked ? (
                isChargingInitialized ? (
                  current <= 0 ? (
                    "Charging Paused"
                  ) : (
                    "Charging"
                  )
                ) : (
                  "Initializing Charging"
                )
              ) : (
                <div className="flex items-center gap-3">
                  <span>Park your vehicle</span>
                  <span className="text-red-400 font-mono bg-red-500/10 px-3 py-0.5 rounded-md border border-red-500/20">
                    {Math.floor(parkCountdown / 60)}:
                    {(parkCountdown % 60).toString().padStart(2, "0")}
                  </span>
                </div>
              )}
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
      {isEmergencyStop && <EmergencyStop isEmergencyStop={isEmergencyStop} />}
    </div>
  );
};

export default Charge;
