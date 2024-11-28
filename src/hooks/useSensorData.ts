// hooks/useSensorData.ts
import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/config/firebase";

interface SensorData {
  thermal: number;
  current: number;
  voltage: number;
  timestamp: number;
  loading: boolean;
  error: string | null;
}

export const useSensorData = () => {
  const [sensorData, setSensorData] = useState<SensorData>({
    thermal: 0,
    current: 0,
    voltage: 0,
    timestamp: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const sensorRef = ref(database, "sensor_readings/latest");

    const unsubscribe = onValue(
      sensorRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setSensorData({
            ...data,
            loading: false,
            error: null,
          });
        } else {
          setSensorData((prev) => ({
            ...prev,
            loading: false,
            error: "No data available",
          }));
        }
      },
      (error) => {
        setSensorData((prev) => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    );

    // Cleanup subscription
    return () => {
      off(sensorRef);
    };
  }, []);

  return sensorData;
};
