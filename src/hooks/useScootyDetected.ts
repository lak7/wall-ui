// hooks/useBMSData.ts
import { useState, useEffect } from "react";
import { ref, onValue, off } from "firebase/database";
import { database } from "../config/firebase"; // Changed from db to database

export const useScootyDetected = () => {
  const [isReceiverCoilDetected, setIsReceiverCoilDetected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const bmsRef = ref(database, "BMSData/IsReceiverCoilDetected"); // Changed from db to database

    const unsubscribe = onValue(
      bmsRef,
      (snapshot) => {
        setIsReceiverCoilDetected(snapshot.val());
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      off(bmsRef);
    };
  }, []);

  return { isReceiverCoilDetected, loading, error };
};
