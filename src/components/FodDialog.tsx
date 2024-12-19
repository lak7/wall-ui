"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { ref, set } from "firebase/database";
import { database } from "@/config/firebase";

interface ChargingPadWarningProps {
  isFodThere: boolean;
}

const ChargingPadWarning: React.FC<ChargingPadWarningProps> = ({
  isFodThere,
}) => {
  useEffect(() => {
    if (isFodThere) {
      set(ref(database, "charging_status/isChargingInitialized"), false);
    }
  }, [isFodThere]);
  return (
    <Dialog open={isFodThere}>
      <DialogContent className="max-w-[400px] bg-[#D9D9D9]/20 backdrop-blur-sm border-none">
        <div className="flex flex-col items-center gap-4 py-6">
          <DialogHeader className="text-center space-y-4">
            <DialogTitle className="text-2xl font-bold text-white text-center">
              FOD ALERT
            </DialogTitle>
            <div className="bg-white rounded-full  p-8">
              <Image
                src="/fod-base.png"
                alt="FOD Alert"
                width={500}
                height={500}
              />
            </div>
            <Image
              src="/fo.png"
              alt="FOD Alert"
              width={50}
              height={50}
              className="animate-pulse absolute top-48 left-36"
            />
          </DialogHeader>

          <div className="flex flex-col items-center gap-2 text-center">
            <DialogDescription className="text-xl font-semibold text-white">
              FOREIGN OBJECT DETECTED
            </DialogDescription>
            <DialogDescription className="text-lg text-white/90">
              Remove Foreign Object
              <br />
              From The Base Pad
            </DialogDescription>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChargingPadWarning;
