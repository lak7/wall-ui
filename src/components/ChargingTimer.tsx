"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Timer, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ChargingTimer() {
  const [step, setStep] = useState<"hours" | "minutes">("hours");
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

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

  return (
    <Card className="w-full max-w-md bg-neutral-900 border-none">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-8">
          <div className="flex items-center space-x-2 text-credyan-500">
            <Timer className="w-6 h-6 text-white" />
            <span className="text-lg font-medium text-white">
              Set Charging Duration
            </span>
          </div>

          <div className="flex items-center justify-center w-full space-x-8">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-neutral-800"
              onClick={() => decrementValue(step)}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>

            <div className="flex items-baseline space-x-2">
              <div
                className={`text-6xl font-bold transition-colors duration-200 ${
                  step === "hours" ? "text-red-500" : "text-white"
                }`}
              >
                {formatNumber(hours)}
              </div>
              <div className="text-6xl font-bold text-white">:</div>
              <div
                className={`text-6xl font-bold transition-colors duration-200 ${
                  step === "minutes" ? "text-red-500" : "text-white"
                }`}
              >
                {formatNumber(minutes)}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={() => incrementValue(step)}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          </div>

          <div className="flex justify-center space-x-4 w-full">
            {step === "minutes" && (
              <Button
                variant="outline"
                className="w-32 border-neutral-700 text-gray-300 hover:bg-neutral-800 hover:text-white"
                onClick={handleBack}
              >
                Back
              </Button>
            )}
            {step === "hours" ? (
              <Button
                className="w-32 bg-red-500 hover:bg-red-600 text-black"
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <Button
                className="w-32 bg-red-500 hover:bg-red-600 text-black"
                onClick={() => console.log(`Set timer for ${hours}:${minutes}`)}
              >
                <Zap className="w-4 h-4 mr-2" />
                Initialize
              </Button>
            )}
          </div>

          <div className="text-sm text-neutral-400">
            {step === "hours" ? "Select Hours" : "Select Minutes"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
