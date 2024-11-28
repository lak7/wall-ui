"use client";
import React from "react";
import { useSensorData } from "@/hooks/useSensorData";

const Test = () => {
  const { thermal, current, voltage, timestamp, loading, error } =
    useSensorData();

  if (loading) {
    return <div>Loading sensor data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <div
      className="w-[768px] h-[1024px] overflow-hidden bg-[#2A2D32] font-sans pt-7"
      style={{
        backgroundImage: "url(/main-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mt-20">
        <div className="p-4 space-y-4">
          <h2 className="text-2xl font-bold">Sensor Readings</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Thermal</h3>
              <p>{thermal}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Current</h3>
              <p>{current}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold">Voltage</h3>
              <p>{voltage}</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(timestamp).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;
