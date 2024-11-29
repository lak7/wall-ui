// hooks/useBMSData.ts
import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/config/firebase";

interface BMSData {
  voltage: number;
  current: number;
  SOC: number;
  isReceiverCoilDetected: boolean;
  loading: boolean;
  error: string | null;
}

export const useBMSData = () => {
  const [bmsData, setBMSData] = useState<BMSData>({
    voltage: 0,
    current: 0,
    SOC: 0,
    isReceiverCoilDetected: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Changed reference path to read from root BMSData
    const bmsRef = ref(database, "BMSData");

    const unsubscribe = onValue(
      bmsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setBMSData({
            voltage: data.latest?.voltage ?? 0,
            current: data.latest?.current ?? 0,
            SOC: data.latest?.SOC ?? 0,
            isReceiverCoilDetected: data.IsReceiverCoilDetected ?? false,
            loading: false,
            error: null,
          });
        } else {
          setBMSData((prev) => ({
            ...prev,
            loading: false,
            error: "No data available",
          }));
        }
      },
      (error) => {
        setBMSData((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    );

    // Cleanup subscription
    return () => {
      off(bmsRef);
    };
  }, []);

  return bmsData;
};
