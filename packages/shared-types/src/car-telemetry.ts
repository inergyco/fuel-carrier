/** Resistance probes reported by the industrial telemetry packet. */
export type TankResistanceReadings = {
  tankToGround: number;
  tankToNozzle: number;
  groundToVehicle: number;
};

/** Latest device telemetry for a car (served from Redis). */
export type CarTelemetry = {
  carId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
  /** Ground speed from device telemetry (km/h when provided). */
  speed?: number;
  /** Remaining fuel volume in liters (`fuel.remainFuel` from device packet). */
  remainFuel?: number;
  /** Last dispensed amount in liters (`fuel.fuelAmount`). */
  fuelAmount?: number;
  /** Insulation / bonding resistances from the device packet (ohms). */
  resistance?: TankResistanceReadings;
};

/** Map marker payload: latest telemetry joined with car identity. */
export type CarTelemetryMarker = CarTelemetry & {
  name: string | null;
  licensePlate: string;
  companyId: string;
  companyName?: string;
};

/** Socket.IO / Redis fan-out event names for live telemetry updates. */
export const CarTelemetrySocketEvents = {
  TELEMETRY_UPDATED: 'telemetry.updated',
  TELEMETRY_REMOVED: 'telemetry.removed',
} as const;

export type CarTelemetrySocketEventName =
  (typeof CarTelemetrySocketEvents)[keyof typeof CarTelemetrySocketEvents];

/** Published to Redis and pushed to company WebSocket rooms. */
export type CarTelemetryRealtimeEvent =
  | {
      type: typeof CarTelemetrySocketEvents.TELEMETRY_UPDATED;
      companyId: string;
      marker: CarTelemetryMarker;
    }
  | {
      type: typeof CarTelemetrySocketEvents.TELEMETRY_REMOVED;
      companyId: string;
      carId: string;
    };
