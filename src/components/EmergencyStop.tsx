"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Power } from "lucide-react";
import { useChargingTimer } from "@/hooks/useChargingTimer";
import { useChargingStatus } from "@/hooks/useChargingStatus";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ref, set } from "firebase/database";
import { database } from "@/config/firebase";

interface EmergencyStopProps {
  isEmergencyStop: boolean;
}

const EmergencyStop: React.FC<EmergencyStopProps> = ({ isEmergencyStop }) => {
  const router = useRouter();
  const { resetChargingStatus } = useChargingStatus();
  const { setTimeLeft, setPausedTimeLeft, setPauseTimestamp } =
    useChargingTimer();
  const hasReset = useRef(false);
  const [countdown, setCountdown] = useState(10);
  const [shouldStartCountdown, setShouldStartCountdown] = useState(false);

  // Handle emergency stop
  useEffect(() => {
    if (isEmergencyStop && !hasReset.current) {
      hasReset.current = true;

      // Reset all charging states
      resetChargingStatus();
      set(ref(database, "charging_status/isChargingInitialized"), false);
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      setPausedTimeLeft(null);
      setPauseTimestamp(null);

      // Start countdown
      setCountdown(10);
      setShouldStartCountdown(true);
    } else if (!isEmergencyStop) {
      hasReset.current = false;
      setShouldStartCountdown(false);
      setCountdown(10);
    }
  }, [
    isEmergencyStop,
    resetChargingStatus,
    setTimeLeft,
    setPausedTimeLeft,
    setPauseTimestamp,
  ]);

  // Handle countdown
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (shouldStartCountdown && countdown > 0) {
      intervalId = setInterval(() => {
        setCountdown((prev) => {
          console.log("Countdown:", prev);
          if (prev <= 1) {
            // Reset emergency stop in database before redirecting
            set(ref(database, "charging_status/isChargingInitialized"), false);
            set(ref(database, "emergencyStop"), false)
              .then(() => {
                window.location.href = "/";
              })
              .catch((error) => {
                console.error("Error resetting emergency stop:", error);
                window.location.href = "/";
              });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [shouldStartCountdown, countdown]);

  return (
    <Dialog open={isEmergencyStop}>
      <DialogContent className="max-w-[400px] bg-[#D9D9D9]/20 backdrop-blur-sm border-none shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="flex flex-col items-center gap-6 py-8">
          <DialogHeader className="text-center space-y-6">
            <DialogTitle className="text-3xl font-bold text-white text-center tracking-tight">
              Emergency Stopped
            </DialogTitle>
            <div className="bg-white rounded-full p-8 flex items-center justify-center ">
              <Power className="w-36 h-36 text-red-500" />
            </div>
          </DialogHeader>

          <div className="flex flex-col items-center gap-3 text-center bg-black/20 rounded-lg p-6 w-full">
            <DialogDescription className="text-xl text-white/90 font-medium leading-relaxed">
              Charging has been stopped
              <br />
              due to an emergency.
            </DialogDescription>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyStop;
