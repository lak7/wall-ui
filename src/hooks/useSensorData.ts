// hooks/useSensorData.js
import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "@/config/firebase";

export const useSensorData = () => {
  const [sensorData, setSensorData] = useState({
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
