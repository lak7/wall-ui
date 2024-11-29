// hooks/useBMSData.ts
import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/config/firebase";

interface BMSData {
  voltage: number;
  current: number;
  SOC: number;
  loading: boolean;
  error: string | null;
}

export const useBMSData = () => {
  const [bmsData, setBMSData] = useState<BMSData>({
    voltage: 0,
    current: 0,
    SOC: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const bmsRef = ref(database, "BMSData/latest");

    const unsubscribe = onValue(
      bmsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setBMSData({
            ...data,
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
