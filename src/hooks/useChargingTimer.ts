// hooks/useChargingTimer.ts
import { useState, useEffect } from "react";
import { useChargingStatus } from "./useChargingStatus";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

interface ChargingTimerReturn {
  timeLeft: TimeLeft;
  isPaused: boolean;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
}

export const useChargingTimer = (): ChargingTimerReturn => {
  const { status, resetChargingStatus } = useChargingStatus();
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTimeLeft, setPausedTimeLeft] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      status?.isChargingInitialized &&
      status?.duration?.endTime &&
      !isPaused
    ) {
      interval = setInterval(() => {
        const now = Date.now();
        const endTime = pausedTimeLeft || status.duration.endTime!;
        const difference = endTime - now;

        if (difference <= 0) {
          clearInterval(interval);
          resetChargingStatus();
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          setPausedTimeLeft(null);
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
    isPaused,
    pausedTimeLeft,
  ]);

  const pauseTimer = () => {
    if (!isPaused && status?.duration?.endTime) {
      setIsPaused(true);
      status.isChargingInitialized = false;
      // Store the remaining time when paused
      setPausedTimeLeft(status.duration.endTime);
    }
  };

  const resumeTimer = () => {
    if (isPaused && pausedTimeLeft) {
      status.isChargingInitialized = true;
      // Calculate new end time based on remaining time
      const newEndTime = Date.now() + (pausedTimeLeft - Date.now());
      setIsPaused(false);
      setPausedTimeLeft(newEndTime);
    }
  };

  const resetTimer = () => {
    setIsPaused(false);
    setPausedTimeLeft(null);
    setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
    resetChargingStatus();
  };

  return {
    timeLeft,
    isPaused,
    pauseTimer,
    resumeTimer,
    resetTimer,
  };
};
