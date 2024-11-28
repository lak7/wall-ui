// src/hooks/useChargingStatus.ts
import { ref, set, onValue } from "firebase/database";
import { database } from "@/config/firebase";
import { useEffect, useState } from "react";

interface ChargingStatus {
  isChargingInitialized: boolean;
}

export const useChargingStatus = () => {
  const [status, setStatus] = useState<ChargingStatus>({
    isChargingInitialized: false,
  });

  const chargingRef = ref(database, "charging_status");

  useEffect(() => {
    // Listen for changes
    const unsubscribe = onValue(chargingRef, (snapshot) => {
      if (snapshot.exists()) {
        setStatus(snapshot.val());
      }
    });

    // Set initial value
    set(chargingRef, {
      isChargingInitialized: false,
    });

    return () => unsubscribe();
  }, []);

  const updateChargingStatus = async (isCharging: boolean) => {
    try {
      await set(chargingRef, {
        isChargingInitialized: isCharging,
      });
      return true;
    } catch (error) {
      console.error("Error updating charging status:", error);
      return false;
    }
  };

  return {
    status,
    updateChargingStatus,
  };
};
