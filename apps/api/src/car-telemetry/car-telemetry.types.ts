/**
 * Local copies of shared telemetry realtime contracts.
 * Prefer these inside the API car-telemetry module so typed ESLint does not
 * treat `@fuel-carrier/shared-types` re-exports as error types.
 */

export type TankResistanceReadings = {
  tankToGround: number;
  tankToNozzle: number;
  groundToVehicle: number;
};

export type CarTelemetry = {
  carId: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
  speed?: number;
  remainFuel?: number;
  fuelAmount?: number;
  resistance?: TankResistanceReadings;
};

export type CarTelemetryMarker = CarTelemetry & {
  name: string | null;
  licensePlate: string;
  companyId: string;
  companyName?: string;
};

export const CarTelemetrySocketEvents = {
  TELEMETRY_UPDATED: 'telemetry.updated',
  TELEMETRY_REMOVED: 'telemetry.removed',
} as const;

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
