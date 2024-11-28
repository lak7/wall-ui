// src/types/sensors.ts
export interface SensorData {
  thermal: number;
  current: number;
  voltage: number;
  timestamp: number;
}

export interface SensorState extends SensorData {
  loading: boolean;
  error: string | null;
}
