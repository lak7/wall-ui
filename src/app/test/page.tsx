// src/app/page.tsx
"use client";
import React from "react";
import { useBMSData } from "@/hooks/useBMSData";

const Test = () => {
  const { voltage, current, SOC, loading, error } = useBMSData();

  if (loading) {
    return <div>Loading BMS data...</div>;
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
          <h2 className="text-2xl font-bold text-white">
            Battery Management System Data
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg bg-gray-800 border-gray-700">
              <h3 className="font-semibold text-gray-200">Voltage</h3>
              <p className="text-2xl text-cyan-400">{voltage}</p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-800 border-gray-700">
              <h3 className="font-semibold text-gray-200">Current</h3>
              <p className="text-2xl text-cyan-400">{current}</p>
            </div>
            <div className="p-4 border rounded-lg bg-gray-800 border-gray-700">
              <h3 className="font-semibold text-gray-200">State of Charge</h3>
              <p className="text-2xl text-cyan-400">{SOC}%</p>
            </div>
          </div>
          <div className="text-sm text-gray-400">Real-time BMS Data</div>
        </div>
      </div>
    </div>
  );
};

export default Test;
