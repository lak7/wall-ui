// hooks/useChargingTimer.ts
import { useState, useEffect } from "react";
import { useChargingStatus } from "./useChargingStatus";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export const useChargingTimer = () => {
  const { status, resetChargingStatus } = useChargingStatus();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status?.isChargingInitialized && status?.duration?.endTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const endTime = status.duration.endTime!;
        const difference = endTime - now;

        if (difference <= 0) {
          clearInterval(interval);
          resetChargingStatus();
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          return;
        }

        // Convert milliseconds to hours, minutes, seconds
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      }, 1000);
    } else {
      setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [
    status?.isChargingInitialized,
    status?.duration?.endTime,
    resetChargingStatus,
  ]);

  return timeLeft;
};
