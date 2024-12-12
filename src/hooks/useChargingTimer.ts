// hooks/useChargingTimer.ts
import { useState, useEffect } from "react";
import { useChargingStatus } from "./useChargingStatus";
import { useRouter } from "next/navigation";

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
  pauseTimerOnly: () => void;
}

export const useChargingTimer = (): ChargingTimerReturn => {
  const router = useRouter();
  const { status, resetChargingStatus, updateChargingStatus } =
    useChargingStatus();
  const [isPaused, setIsPaused] = useState(false);
  const [pausedTimeLeft, setPausedTimeLeft] = useState<number | null>(null);
  const [pauseTimestamp, setPauseTimestamp] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Effect to initialize timeLeft when status changes
  useEffect(() => {
    if (status?.duration?.endTime && !isPaused) {
      const updateTime = () => {
        const now = Date.now();
        const difference = status.duration.endTime! - now;

        if (difference > 0) {
          const hours = Math.floor(difference / (1000 * 60 * 60));
          const minutes = Math.floor(
            (difference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((difference % (1000 * 60)) / 1000);
          setTimeLeft({ hours, minutes, seconds });
        }
      };

      // Update immediately
      updateTime();

      // Set up interval for continuous updates
      const interval = setInterval(updateTime, 1000);

      return () => clearInterval(interval);
    }
  }, [status?.duration?.endTime, isPaused]);

  const pauseTimer = () => {
    if (!isPaused && status?.duration?.endTime) {
      setIsPaused(true);
      const now = Date.now();
      setPauseTimestamp(now);
      const remainingTime = status.duration.endTime - now;
      setPausedTimeLeft(remainingTime);

      // Update Firebase
      updateChargingStatus(false, {
        hours: Math.floor(remainingTime / (1000 * 60 * 60)),
        minutes: Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60)),
        endTime: status.duration.endTime,
      });
    }
  };

  const pauseTimerOnly = () => {
    if (!isPaused && status?.duration?.endTime) {
      setIsPaused(true);
      const now = Date.now();
      setPauseTimestamp(now);
      const remainingTime = status.duration.endTime - now;
      setPausedTimeLeft(remainingTime);

      // When paused, immediately update the displayed time
      const hours = Math.floor(remainingTime / (1000 * 60 * 60));
      const minutes = Math.floor(
        (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
      );
      const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });

      // Update Firebase to reflect paused state with the exact remaining time and current end time
      updateChargingStatus(true, {
        hours: Math.floor(remainingTime / (1000 * 60 * 60)),
        minutes: Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60)),
        endTime: status.duration.endTime,
      });
    }
  };

  const resumeTimer = () => {
    if (isPaused && pausedTimeLeft && pauseTimestamp) {
      const now = Date.now();
      const newEndTime = now + pausedTimeLeft;

      updateChargingStatus(true, {
        hours: Math.floor(pausedTimeLeft / (1000 * 60 * 60)),
        minutes: Math.floor((pausedTimeLeft % (1000 * 60 * 60)) / (1000 * 60)),
        endTime: newEndTime,
      });

      setPausedTimeLeft(null);
      setPauseTimestamp(null);
      setIsPaused(false);
    }
  };

  const resetTimer = () => {
    setIsPaused(false);
    setPausedTimeLeft(null);
    setPauseTimestamp(null);
    setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
    resetChargingStatus();
  };

  return {
    timeLeft,
    isPaused,
    pauseTimer,
    resumeTimer,
    resetTimer,
    pauseTimerOnly,
  };
};
