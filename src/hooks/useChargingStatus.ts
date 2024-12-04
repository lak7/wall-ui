// hooks/useChargingStatus.ts
import { useState, useEffect } from "react";
import { ref, set, onValue, off } from "firebase/database";
import { database } from "@/config/firebase";

interface ChargingStatus {
  isChargingInitialized: boolean;
  duration: {
    hours: number;
    minutes: number;
    endTime?: number;
  };
}

export const useChargingStatus = () => {
  const [status, setStatus] = useState<ChargingStatus>({
    isChargingInitialized: false,
    duration: {
      hours: 0,
      minutes: 0,
    },
  });

  useEffect(() => {
    const chargingRef = ref(database, "charging_status");

    // Listen for changes
    const unsubscribe = onValue(chargingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setStatus(data);

        // Check if charging should be stopped
        if (data.duration?.endTime && data.isChargingInitialized) {
          const now = Date.now();
          if (now >= data.duration.endTime) {
            resetChargingStatus();
          }
        }
      }
    });

    return () => off(chargingRef);
  }, []);

  const updateChargingStatus = async (
    isCharging: boolean,
    duration?: { hours: number; minutes: number; endTime?: number }
  ) => {
    try {
      const chargingRef = ref(database, "charging_status");
      const now = Date.now();

      const updatedStatus: ChargingStatus = {
        isChargingInitialized: isCharging,
        duration: {
          hours: duration?.hours || 0,
          minutes: duration?.minutes || 0,
          endTime:
            duration?.endTime ||
            (isCharging && duration
              ? now + (duration.hours * 3600000 + duration.minutes * 60000)
              : undefined),
        },
      };

      await set(chargingRef, updatedStatus);
      return true;
    } catch (error) {
      console.error("Error updating charging status:", error);
      return false;
    }
  };

  const resetChargingStatus = async () => {
    try {
      const chargingRef = ref(database, "charging_status");
      await set(chargingRef, {
        isChargingInitialized: false,
        duration: {
          hours: 0,
          minutes: 0,
          endTime: null,
        },
      });
      return true;
    } catch (error) {
      console.error("Error resetting charging status:", error);
      return false;
    }
  };

  return {
    status,
    updateChargingStatus,
    resetChargingStatus,
  };
};
