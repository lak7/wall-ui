// src/app/page.tsx
"use client";
import { ChargingPadWarning } from "@/components/FodDialog";
import { database } from "@/config/firebase";
import { useBMSData } from "@/hooks/useBMSData";
import { onValue, ref } from "firebase/database";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface ChargingOption {
  id: number;
  text: string;
}

const Select = () => {
  const router = useRouter();
  const [isScootyParked, setIsScootyParked] = useState(true);
  const { voltage, current, SOC, isReceiverCoilDetected, loading, error } =
    useBMSData();

  const handleSelect = async () => {
    try {
      router.push("/select-time");
    } catch (error) {
      console.error("Error initializing charging:", error);
    }
  };

  const options: ChargingOption[] = [
    { id: 1, text: "Charge by %" },
    { id: 2, text: "Charge by Time" },
    { id: 3, text: "Charge by ₹" },
  ];

  useEffect(() => {
    try {
      // Create references to both paths using the imported database instance
      const coilRef = ref(database, "IsReceiverCoilDetected");
      const fodRef = ref(database, "Is_FOD_Present");

      let unsubscribeFod: (() => void) | undefined;

      // Set up listeners for both values
      const unsubscribeCoil = onValue(coilRef, (coilSnapshot) => {
        if (unsubscribeFod) {
          unsubscribeFod(); // Clean up previous FOD listener if it exists
        }

        // Set up new FOD listener
        unsubscribeFod = onValue(fodRef, (fodSnapshot) => {
          const isCoilDetected = coilSnapshot.val();
          const isFodPresent = fodSnapshot.val();

          setIsScootyParked(isCoilDetected);

          console.log("Coil Detection:", isCoilDetected);
          console.log("FOD Present:", isFodPresent);

          // Update isParked based on both conditions
        });
      });

      // Clean up listeners on component unmount
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

  if (isScootyParked === false) {
    router.push("/park");
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
      <ChargingPadWarning />
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
              {options.map((option) => (
                <button
                  className="shadow-[inset_0_0_0_2px_#616467] text-black px-12 py-7 rounded-full tracking-widest uppercase font-bold bg-transparent hover:bg-[#616467] hover:text-white dark:text-neutral-200 transition duration-200 text-lg"
                  key={option.id}
                  onClick={handleSelect}
                >
                  <div className="w-full text-white flex justify-between">
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
