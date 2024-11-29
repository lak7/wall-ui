"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { ref, onValue, set } from "firebase/database";
import { database } from "@/config/firebase";
import { useRouter } from "next/navigation";

const Park = () => {
  const router = useRouter();
  const [isParked, setIsParked] = useState(false);
  const [isScootyParked, setIsScootyParked] = useState(false);
  const [isFodPresent, setIsFodPresent] = useState(false);

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
          setIsFodPresent(isFodPresent);
          setIsScootyParked(isCoilDetected);

          console.log("Coil Detection:", isCoilDetected);
          console.log("FOD Present:", isFodPresent);

          // Update isParked based on both conditions
          setIsParked(isCoilDetected === true && isFodPresent === false);
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
  }, []); // Empty dependency array means this effect runs once on mount

  if (isParked && !isFodPresent) {
    // Redirect to the next page
    router.push("/select");
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
      {/* Hero Section */}
      <div className="flex justify-center items-center p-1 pt-40 w-full px-8">
        <motion.div
          className="text-left flex-col gap-2  mb-24 relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className={`"text-gray-200 ${
              isScootyParked && "text-green-500"
            } text-5xl font-medium tracking-wide relative group"`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <span className="relative inline-block">
              {isScootyParked ? "Vehicle Parked" : "Park your vehicle"}
            </span>
          </motion.div>
          <div className="w-full"></div>
          <span className="text-red-500 text-3xl text-center font-medium w-full">
            {isFodPresent && "remove foreign object"}
          </span>
        </motion.div>
      </div>
      <div className="absolute w-full flex justify-center items-center">
        <svg
          width="346"
          height="509"
          viewBox="0 0 346 509"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line
            y1="-3"
            x2="509"
            y2="-3"
            transform="matrix(-4.37114e-08 -1 -1 4.37114e-08 340 509)"
            stroke="url(#paint0_linear_0_1)"
            strokeWidth="6"
          >
            <animate
              attributeName="stroke-dasharray"
              from="0, 509"
              to="509, 0"
              dur="2s"
              fill="freeze"
            />
          </line>
          <line
            y1="-3"
            x2="509"
            y2="-3"
            transform="matrix(-4.37114e-08 -1 -1 4.37114e-08 0 509)"
            stroke="url(#paint1_linear_0_1)"
            strokeWidth="6"
          >
            <animate
              attributeName="stroke-dasharray"
              from="0, 509"
              to="509, 0"
              dur="2s"
              fill="freeze"
            />
          </line>
          <defs>
            <linearGradient
              id="paint0_linear_0_1"
              x1="0"
              y1="0.5"
              x2="509"
              y2="0.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#2C78FA" />
              <stop offset="0.312404" stopColor="#24BEC7" />
              <stop offset="0.661947" stopColor="#27C72C" />
              <stop offset="1" stopColor="#24D522" />
            </linearGradient>
            <linearGradient
              id="paint1_linear_0_1"
              x1="0"
              y1="0.5"
              x2="509"
              y2="0.5"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#2C78FA" />
              <stop offset="0.312404" stopColor="#24BEC7" />
              <stop offset="0.661947" stopColor="#27C72C" />
              <stop offset="1" stopColor="#24D522" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="w-full flex justify-center items-center">
        <div className="flex-col justify-center items-center">
          <motion.div
            className="w-full flex justify-center items-center pb-2 relative"
            initial="initial"
            style={{ opacity: 1 }}
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Outer Glow Effect */}
            <motion.div
              className="absolute w-16 h-16 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)",
              }}
            />

            {/* Inner Green Glow */}
            <motion.div
              className="absolute w-14 h-14 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(42,248,4,0.3) 0%, rgba(42,248,4,0) 60%)",
              }}
            />

            <motion.svg
              width="36"
              height="31"
              viewBox="0 0 36 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter: "drop-shadow(0 0 8px rgba(255,255,255,0.3))",
              }}
            >
              <path
                d="M17.9089 0L0.185966 30.697H35.6318L17.9089 0Z"
                fill="white"
              />
              <path
                d="M17.9088 5.22461L4.71089 28.0841H31.1067L17.9088 5.22461Z"
                fill="#2AF804"
                style={{
                  filter: "drop-shadow(0 0 3px rgba(42,248,4,0.5))",
                }}
              />
            </motion.svg>
          </motion.div>

          <Image
            src="/charger-base.png"
            alt="Charger pad"
            width={250}
            height={250}
          />
        </div>
      </div>
      <div className="flex w-full justify-center items-center">
        <motion.div
          initial={{ y: 450 }}
          animate={isParked ? { y: -250 } : { y: [450, -250, -250] }}
          transition={{
            duration: 3,
            times: [0, 0.66, 1],
            repeat: isParked ? 0 : Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        >
          <Image
            src="/park-scooty.png"
            alt="Charger pad"
            width={300}
            height={300}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Park;
