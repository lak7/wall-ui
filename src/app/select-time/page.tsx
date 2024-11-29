"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Timer, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChargingStatus } from "@/hooks/useChargingStatus";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useBMSData } from "@/hooks/useBMSData";
import { onValue, ref } from "firebase/database";
import { database } from "@/config/firebase";

export default function Page() {
  const router = useRouter();
  const { updateChargingStatus, status } = useChargingStatus();
  const [isScootyParked, setIsScootyParked] = useState(true);
  const [step, setStep] = useState<"hours" | "minutes">("hours");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { voltage, current, SOC, isReceiverCoilDetected, loading, error } =
    useBMSData();

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  const getTotalMinutes = () => hours * 60 + minutes;

  const incrementValue = (type: "hours" | "minutes") => {
    if (type === "hours") {
      setHours((prev) => (prev < 23 ? prev + 1 : 0));
    } else {
      setMinutes((prev) => (prev < 60 ? prev + 1 : 0));
    }
  };

  const decrementValue = (type: "hours" | "minutes") => {
    if (type === "hours") {
      setHours((prev) => (prev > 0 ? prev - 1 : 23));
    } else {
      setMinutes((prev) => (prev > 0 ? prev - 1 : 60));
    }
  };

  const handleNext = () => {
    if (step === "hours") {
      setStep("minutes");
    }
  };

  const handleBack = () => {
    if (step === "minutes") {
      setStep("hours");
    }
  };

  const handleQuickSelect = (totalMinutes: number) => {
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    setHours(hrs);
    setMinutes(mins);
  };

  const handleSelect = async () => {
    if (hours === 0 && minutes === 0) {
      toast.error("Please select a valid charging duration");
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateChargingStatus(true, { hours, minutes });
      if (success) {
        toast.success(`Charging scheduled for ${hours}h ${minutes}m`);
        router.push("/charge");
      } else {
        toast.error("Failed to initialize charging");
      }
    } catch (error) {
      console.error("Error initializing charging:", error);
      toast.error("Failed to initialize charging");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status?.isChargingInitialized && status?.duration?.endTime) {
      const checkInterval = setInterval(() => {
        const now = Date.now();
        if (now >= status.duration.endTime!) {
          updateChargingStatus(false);
          clearInterval(checkInterval);
        }
      }, 1000);

      return () => clearInterval(checkInterval);
    }
  }, [
    status?.isChargingInitialized,
    status?.duration?.endTime,
    updateChargingStatus,
  ]);

  useEffect(() => {
    try {
      // Create references to both paths using the imported database instance
      const coilRef = ref(database, "IsReceiverCoilDetected");
      const fodRef = ref(database, "Is_FOD_Present");

      let unsubscribeFod: (() => void) | undefined;

      // Set up listeners for both values
      const unsubscribeCoil = onValue(coilRef, (coilSnapshot) => {
        if (unsubscribeFod) {
          unsubscribeFod(); // Clean up previous FOD listener if it exists
        }

        // Set up new FOD listener
        unsubscribeFod = onValue(fodRef, (fodSnapshot) => {
          const isCoilDetected = coilSnapshot.val();
          const isFodPresent = fodSnapshot.val();

          setIsScootyParked(isCoilDetected);

          console.log("Coil Detection:", isCoilDetected);
          console.log("FOD Present:", isFodPresent);

          // Update isParked based on both conditions
        });
      });

      // Clean up listeners on component unmount
      return () => {
        unsubscribeCoil();
        if (unsubscribeFod) {
          unsubscribeFod();
        }
      };
    } catch (error) {
      console.error("Error setting up Firebase listeners:", error);
    }
  }, []);

  if (isScootyParked === false) {
    router.push("/park");
  }

  return (
    <div
      className="w-[768px] h-[1024px] overflow-hidden bg-transparent font-sans pt-7"
      style={{
        backgroundImage: "url(/main-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex justify-center items-center p-1 pt-40 w-full px-8">
        <Card className="w-full max-w-md bg-transparent border-none">
          <CardContent className="border-none p-8">
            <div className="flex flex-col items-center space-y-8">
              {/* Header */}
              <div className="flex items-center space-x-3">
                <Timer className="w-8 h-8 text-red-500" />
                <span className="text-xl font-semibold text-white">
                  Set Charging Duration
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-5 h-5 text-neutral-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select how long you want to charge your vehicle</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {/* Quick Select Buttons */}
              <div className="flex gap-2 w-full justify-center">
                {[1, 5, 20, 60].map((mins) => (
                  <Button
                    key={mins}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickSelect(mins)}
                    className={`px-3 py-1 text-sm ${
                      getTotalMinutes() === mins
                        ? "bg-red-500 text-white border-red-500"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {mins >= 60 ? `${Math.floor(mins / 60)}h` : `${mins}m`}
                  </Button>
                ))}
              </div>

              {/* Time Selection */}
              <div className="flex items-center justify-center w-full space-x-8">
                <Button
                  variant="outline"
                  className="text-black hover:text-white hover:bg-neutral-950 transition-all duration-200 transform hover:scale-110"
                  onClick={() => decrementValue(step)}
                >
                  <ChevronLeft className="w-24 h-24 stroke-2" />
                </Button>

                <div className="flex items-baseline space-x-3">
                  <div
                    className={`text-7xl font-bold transition-all duration-300 cursor-pointer
                      ${
                        step === "hours"
                          ? "text-red-500 scale-110"
                          : "text-white scale-100 hover:text-red-400"
                      }`}
                    onClick={() => setStep("hours")}
                  >
                    {formatNumber(hours)}
                  </div>
                  <div className="text-7xl font-bold text-white">:</div>
                  <div
                    className={`text-7xl font-bold transition-all duration-300 cursor-pointer
                      ${
                        step === "minutes"
                          ? "text-red-500 scale-110"
                          : "text-white scale-100 hover:text-red-400"
                      }`}
                    onClick={() => setStep("minutes")}
                  >
                    {formatNumber(minutes)}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="text-black hover:text-white hover:bg-neutral-950 transition-all duration-200 transform hover:scale-110"
                  onClick={() => incrementValue(step)}
                >
                  <ChevronRight className="w-24 h-24 stroke-2" />
                </Button>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-center space-x-4 w-full">
                {step === "minutes" && (
                  <Button
                    variant="outline"
                    className="w-32 h-12 text-lg border-neutral-700 text-neutral-900 hover:bg-neutral-800 hover:text-white transition-colors duration-200"
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                )}
                {step === "hours" ? (
                  <Button
                    className="w-32 h-12 text-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-200 hover:scale-105"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    className="w-40 h-12 text-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50"
                    onClick={handleSelect}
                    disabled={isLoading || (hours === 0 && minutes === 0)}
                  >
                    {isLoading ? (
                      "Loading..."
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-2" />
                        Initialize
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Helper Text */}
              <div className="flex flex-col items-center space-y-2">
                <div className="text-base text-neutral-400 font-medium">
                  {step === "hours" ? "Select Hours" : "Select Minutes"}
                </div>
                <div className="text-sm text-neutral-500">
                  Total Duration: {hours}h {minutes}m
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
