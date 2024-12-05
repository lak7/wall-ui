"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { database } from "@/config/firebase";
import { ref, onValue } from "firebase/database";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();
  const [isScootyParked, setIsScootyParked] = useState(true);
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
          if (isCoilDetected === false) {
            router.push("/");
          }
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

  return (
    <div
      className="w-[768px] h-[1024px] overflow-hidden bg-[#2A2D32] font-sans pt-7"
      style={{
        backgroundImage: "url(/main-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col justify-center items-center p-1 pt-24 w-full px-8 gap-6">
        <div className="flex justify-center items-center w-32 h-32 bg-green-500 rounded-full drop-shadow-[0_0_15px_rgba(34,197,94,0.7)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="text-green-500 text-5xl font-bold tracking-wider drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">
          THANKS FOR CHARGING
        </div>
        <div className="text-green-400/80 text-xl mt-2">
          Your vehicle is ready to go!
        </div>
        <div className="pt-12">
          <Image
            src="/charge-bike.png"
            alt="Charger pad"
            width={700}
            height={500}
            className="drop-shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
