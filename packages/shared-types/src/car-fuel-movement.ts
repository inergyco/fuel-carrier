import type { CarTelemetry } from "./car-telemetry";

/**
 * One completed load or dispense.
 * Sampled when a telemetry `transactionId` increases past the previous sample.
 */
export type CarFuelMovement = {
  id: string;
  carId: string;
  /** Device time of the sample whose transaction id increased. */
  recordedAt: string;
  mode: CarTelemetry["mode"];
  /** Liters moved on that sample (`fuel.fuelAmount`). */
  liters?: number;
  /** `fuel.pricePerLiter` from the same sample. */
  pricePerLiter?: number;
  /** `fuel.wage` from the same sample. */
  wage?: number;
  transactionId: number;
};
