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
  pauseTimerOnly: () => void;
}

export const useChargingTimer = (): ChargingTimerReturn => {
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
    if (status?.duration?.endTime) {
      const now = Date.now();
      const difference = status.duration.endTime - now;

      if (difference > 0) {
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }
  }, [status?.duration?.endTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      status?.isChargingInitialized &&
      status?.duration?.endTime &&
      !isPaused
    ) {
      interval = setInterval(() => {
        const now = Date.now();
        const endTime = status.duration.endTime!;
        const difference = endTime - now;

        if (difference <= 0) {
          clearInterval(interval);
          resetChargingStatus();
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          setPausedTimeLeft(null);
          setPauseTimestamp(null);
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
  ]);

  const pauseTimer = () => {
    if (!isPaused && status?.duration?.endTime) {
      setIsPaused(true);
      const now = Date.now();
      setPauseTimestamp(now);
      // Store the exact remaining time when paused
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
      // Store the exact remaining time when paused
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
      // Calculate new end time by adding the exact remaining time to current time
      const newEndTime = now + pausedTimeLeft;

      const remainingHours = Math.floor(pausedTimeLeft / (1000 * 60 * 60));
      const remainingMinutes = Math.floor(
        (pausedTimeLeft % (1000 * 60 * 60)) / (1000 * 60)
      );

      // Update Firebase with the new end time explicitly
      updateChargingStatus(true, {
        hours: remainingHours,
        minutes: remainingMinutes,
        endTime: newEndTime, // Set the new end time explicitly
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
