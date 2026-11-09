/** Resistance probes reported by the industrial telemetry packet. */
export type TankResistanceReadings = {
  tankToGround: number;
  tankToNozzle: number;
  groundToVehicle: number;
};

/** Ohms strictly below this read as normal on the fleet UI. */
export const RESISTANCE_OK_MAX_OHMS = 5;

/**
 * Ohms above this are an error on the fleet UI and open a company
 * browser notification. Values from this threshold down to
 * {@link RESISTANCE_OK_MAX_OHMS} stay in the warning band.
 */
export const RESISTANCE_ALERT_THRESHOLD_OHMS = 10;

/**
 * Device sentinel for a disconnected bonding probe.
 * The meter reports uint16 max (`0xFFFF`) instead of an ohm reading.
 */
export const RESISTANCE_OPEN_LINE_OHMS = 0xffff;

export const ResistanceProbeKeys = {
  TANK_TO_GROUND: "tankToGround",
  TANK_TO_NOZZLE: "tankToNozzle",
  GROUND_TO_VEHICLE: "groundToVehicle",
} as const;

export type ResistanceProbeKey =
  (typeof ResistanceProbeKeys)[keyof typeof ResistanceProbeKeys];

export const RESISTANCE_PROBE_KEYS = [
  ResistanceProbeKeys.TANK_TO_GROUND,
  ResistanceProbeKeys.TANK_TO_NOZZLE,
  ResistanceProbeKeys.GROUND_TO_VEHICLE,
] as const;

export const isResistanceAboveAlertThreshold = (value: number): boolean =>
  value > RESISTANCE_ALERT_THRESHOLD_OHMS;

export const isResistanceOpenLine = (value: number): boolean =>
  value === RESISTANCE_OPEN_LINE_OHMS;

/** Latest device telemetry for a car (served from Redis). */
export type CarTelemetry = {
  carId: string;
  latitude: number;
  longitude: number;
  /** Device sample time (ISO). History points use this as the trail timestamp. */
  updatedAt: string;
  /** Server ingest time (ISO). Live markers use this for online/offline. */
  createdAt?: string;
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
  licensePlate: string;
  companyId: string;
  companyName?: string;
  hasHighGrade: boolean;
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
