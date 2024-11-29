"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useChargingStatus } from "@/hooks/useChargingStatus";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const { updateChargingStatus, status } = useChargingStatus();
  const [step, setStep] = useState<"hours" | "minutes">("hours");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  const incrementValue = (type: "hours" | "minutes") => {
    if (type === "hours") {
      setHours((prev) => (prev < 23 ? prev + 1 : 0));
    } else {
      setMinutes((prev) => (prev < 55 ? prev + 5 : 0));
    }
  };

  const decrementValue = (type: "hours" | "minutes") => {
    if (type === "hours") {
      setHours((prev) => (prev > 0 ? prev - 1 : 23));
    } else {
      setMinutes((prev) => (prev > 0 ? prev - 5 : 55));
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

  const handleSelect = async () => {
    if (hours === 0 && minutes === 0) {
      toast.error("Please select a valid charging duration");
      return;
    }

    setIsLoading(true);
    try {
      const success = await updateChargingStatus(true, { hours, minutes });
      if (success) {
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

  return (
    <div
      className="w-[768px] h-[1024px] overflow-hidden bg-[#2A2D32] font-sans pt-7"
      style={{
        backgroundImage: "url(/main-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex justify-center items-center p-1 pt-40 w-full px-8">
        <Card className="w-full max-w-md bg-neutral-900/90 border-none backdrop-blur-sm shadow-xl">
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-10">
              <div className="flex items-center space-x-3 text-credyan-500">
                <Timer className="w-8 h-8 text-red-500" />
                <span className="text-xl font-semibold text-white">
                  Set Charging Duration
                </span>
              </div>

              <div className="flex items-center justify-center w-full space-x-8">
                <Button
                  variant="outline"
                  className="text-black hover:text-white hover:bg-neutral-950 transition-all duration-200 transform hover:scale-110"
                  onClick={() => decrementValue(step)}
                >
                  <ChevronLeft className="w-28 h-28 stroke-2 " />
                </Button>

                <div className="flex items-baseline space-x-3">
                  <div
                    className={`text-7xl font-bold transition-all duration-300 ${
                      step === "hours"
                        ? "text-red-500 scale-110"
                        : "text-white scale-100"
                    }`}
                  >
                    {formatNumber(hours)}
                  </div>
                  <div className="text-7xl font-bold text-white">:</div>
                  <div
                    className={`text-7xl font-bold transition-all duration-300 ${
                      step === "minutes"
                        ? "text-red-500 scale-110"
                        : "text-white scale-100"
                    }`}
                  >
                    {formatNumber(minutes)}
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="text-black hover:text-white hover:bg-neutral-950 transition-all duration-200 transform hover:scale-110"
                  onClick={() => incrementValue(step)}
                >
                  <ChevronRight className="w-27 h-27 stroke-2" />
                </Button>
              </div>

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
                    className="w-40 h-12 text-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-all duration-200 hover:scale-105"
                    onClick={handleSelect}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Initialize
                  </Button>
                )}
              </div>

              <div className="text-base text-neutral-400 font-medium">
                {step === "hours" ? "Select Hours" : "Select Minutes"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
